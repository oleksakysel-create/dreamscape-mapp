import { expect, test } from "@playwright/test";
import { readStore, tapRegion, watchConsole } from "./helpers";

test.describe("Core user journey", () => {
  test("landing → onboarding → chapter → coloring → progress → settings", async ({ page }) => {
    const errors = watchConsole(page);

    // 1. Landing
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /your life is a story/i })).toBeVisible();
    await page.getByTestId("cta-begin").click();

    // 2. Onboarding: name, identity, age
    await expect(page).toHaveURL(/\/onboarding/);
    await page.getByLabel("First name or nickname").fill("Maya");
    await page.getByTestId("onboarding-next").click();
    await expect(page.getByRole("heading", { name: "Nice to meet you, Maya." })).toBeVisible();
    await page.getByRole("radio", { name: /Creator/ }).click();
    await page.getByTestId("onboarding-next").click();
    await page.getByRole("radio", { name: "25–34" }).click();
    await page.getByTestId("onboarding-next").click();

    // 3. Rate 12 spheres with real keyboard-driven sliders
    await expect(page.getByTestId("onboarding-step")).toHaveText("Step 4 of 7");
    const health = page.getByRole("slider", { name: "Health & Energy rating" });
    await health.focus();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("score-health")).toHaveText("3");
    const fun = page.getByRole("slider", { name: "Joy & Play rating" });
    await fun.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("score-fun")).toHaveText("6");
    await page.getByTestId("onboarding-next").click();

    // 4. Priorities (focus limit enforced at 3)
    await page.getByTestId("onboarding-next").click();
    await expect(page.getByText("Choose at least one sphere to focus on.")).toBeVisible();
    await page.getByTestId("tier-health-focus").click();
    await page.getByTestId("tier-growth-focus").click();
    await page.getByTestId("tier-fun-focus").click();
    await expect(page.getByTestId("tier-career-focus")).toBeDisabled();
    await page.getByTestId("tier-finances-backlog").click();
    await page.getByTestId("onboarding-next").click();

    // 5. Goals (zod validation, then valid)
    await expect(page.getByTestId("goal-title-health")).toBeVisible();
    await page.getByTestId("onboarding-next").click();
    await expect(page.getByText("Give your goal a few words.").first()).toBeVisible();
    await page.getByTestId("goal-title-health").fill("Move my body three times a week");
    await page.getByTestId("goal-title-fun").fill("Paint every Sunday morning");
    await page.getByTestId("goal-title-growth").fill("Read twelve books");
    await page.getByTestId("onboarding-next").click();
    await expect(page.getByRole("heading", { name: "Your story begins, Maya." })).toBeVisible();
    await page.getByTestId("onboarding-finish").click();

    // 6. Journey map
    await expect(page).toHaveURL(/\/journey$/);
    for (let m = 1; m <= 12; m++) await expect(page.getByTestId(`chapter-card-${m}`)).toBeVisible();
    await page.getByTestId("chapter-card-1").click();
    await expect(page.getByRole("heading", { level: 1, name: "Awakening" })).toBeVisible();

    // 7. Personalized reflection
    await expect(page.getByText("Maya, what is quietly asking for your attention right now?")).toBeVisible();
    await expect(page.getByText(/If (Health & Energy|Learning & Growth|Joy & Play) felt 10% lighter/)).toBeVisible();
    await page.getByTestId("answer-m1-q1").fill("I want more rest and to feel proud of small things.");
    await expect(page.getByTestId("draft-saved")).toBeVisible();
    await page.getByTestId("answer-m1-q2").fill("I would walk every morning and sleep earlier.");
    await page.getByTestId("scale-m1-q3-8").click();
    await page.getByTestId("complete-reflection").click();
    await expect(page.getByTestId("reflection-summary")).toBeVisible();

    // 8. Planned action with date, time and reminder
    await page.getByTestId("action-title").fill("Sunrise walk without my phone");
    await page.getByTestId("action-date").fill("2030-05-14");
    await page.getByTestId("action-time").fill("07:15");
    await expect(page.getByTestId("action-reminder")).toBeChecked();
    await page.getByTestId("add-action").click();
    await expect(page.getByTestId("action-list")).toContainText("Sunrise walk without my phone");

    // 9. Choose exactly one illustration from the curated gallery
    await page.getByTestId("gallery-nature-dawn").click();
    await page.getByTestId("choose-illustration").click();
    await expect(page.getByTestId("chosen-illustration")).toHaveText("Mountain Dawn");
    await page.getByTestId("open-studio").click();

    // 10. Coloring Studio: fill, undo/redo, autosave, zoom, completion
    await expect(page).toHaveURL(/\/studio\/1$/);
    const regions = page.locator("[data-region]");
    const total = await regions.count();
    expect(total).toBeGreaterThan(10);
    await page.locator('[data-color="#E07A5F"]').click();
    await tapRegion(page, "r1");
    await tapRegion(page, "r2");
    await page.locator('[data-color="#F5CD8E"]').click();
    await tapRegion(page, "r3");
    await expect(page.getByTestId("coloring-progress")).toContainText(`3/${total}`);
    await expect(page.locator('[data-region="r1"]')).toHaveAttribute("fill", "#E07A5F");

    await page.getByRole("button", { name: "Undo" }).click();
    await expect(page.getByTestId("coloring-progress")).toContainText(`2/${total}`);
    await page.getByRole("button", { name: "Redo" }).click();
    await expect(page.getByTestId("coloring-progress")).toContainText(`3/${total}`);
    await page.keyboard.press("Control+z");
    await expect(page.getByTestId("coloring-progress")).toContainText(`2/${total}`);
    await page.keyboard.press("Control+Shift+z");
    await expect(page.getByTestId("coloring-progress")).toContainText(`3/${total}`);

    await expect(page.getByTestId("save-state")).toHaveAttribute("data-state", "saved");
    await page.reload();
    await expect(page.getByTestId("coloring-progress")).toContainText(`3/${total}`);
    await expect(page.locator('[data-region="r3"]')).toHaveAttribute("fill", "#F5CD8E");

    await page.getByRole("button", { name: "Zoom in" }).click();
    await expect(page.getByTestId("coloring-canvas")).not.toHaveAttribute("data-zoom", "1.00");
    await page.getByRole("button", { name: "Reset view" }).click();
    await expect(page.getByTestId("coloring-canvas")).toHaveAttribute("data-zoom", "1.00");

    const palette = ["#F6C6A8", "#EFA48B", "#FADDE1", "#E9B949", "#FBE3D3"];
    let i = 0;
    for (const id of await page.locator('[data-region][data-filled="false"]').evaluateAll((els) => els.map((e) => e.getAttribute("data-region")!))) {
      if (i % 4 === 0) await page.locator(`[data-color="${palette[(i / 4) % palette.length]}"]`).click();
      await tapRegion(page, id);
      i++;
    }
    await expect(page.getByTestId("coloring-progress")).toContainText(`${total}/${total}`);
    await expect(page.getByRole("heading", { name: "Your Awakening page is complete" })).toBeVisible();
    await page.getByRole("link", { name: "View my collection" }).click();

    // 11. Achievements & progress
    await expect(page).toHaveURL(/\/progress$/);
    for (const id of ["first-step", "self-aware", "compass", "north-star", "first-reflection", "planner", "first-stroke", "masterpiece"]) {
      await expect(page.getByTestId(`achievement-${id}`)).toHaveAttribute("data-unlocked", "true");
    }
    await expect(page.getByTestId("achievement-full-circle")).toHaveAttribute("data-unlocked", "false");
    await expect(page.getByTestId("collection").locator("li")).toHaveCount(1);
    await expect(page.getByRole("img", { name: "Wheel of life chart" })).toBeVisible();
    await page.getByTestId("reassess").click();
    const dialogHealth = page.getByRole("dialog").getByRole("slider", { name: "Health & Energy rating" });
    await dialogHealth.focus();
    for (let k = 0; k < 4; k++) await page.keyboard.press("ArrowRight");
    await page.getByTestId("save-assessment").click();
    await expect(page.getByText("Where you began")).toBeVisible();

    // 12. Change priorities in Settings without data loss
    await page.goto("/settings");
    await page.getByTestId("tier-fun-maintain").click();
    await page.getByTestId("tier-mind-focus").click();
    await page.getByTestId("save-priorities").click();
    await page.getByTestId("goal-title-mind").fill("Ten quiet minutes each evening");
    await page.getByTestId("save-new-goals").click();
    await expect(page.getByTestId("priorities-saved")).toBeVisible();

    const state = await readStore(page);
    expect(state.priorities.fun).toBe("maintain");
    expect(state.priorities.mind).toBe("focus");
    expect(state.goals.fun.title).toBe("Paint every Sunday morning"); // kept, not deleted
    expect(state.goals.mind.title).toBe("Ten quiet minutes each evening");
    expect(state.reflections["1"].completedAt).toBeTruthy();
    expect(state.colorings["1"].completedAt).toBeTruthy();
    expect(state.actions).toHaveLength(1);
    expect(state.assessments).toHaveLength(2);
    expect(state.achievements.evolving).toBeTruthy();

    expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
  });

  test("demo mode loads a populated journey instantly", async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto("/");
    await page.getByTestId("cta-demo").click();
    await expect(page).toHaveURL(/\/journey$/);
    await expect(page.getByRole("main").getByText("Alex's year")).toBeVisible();
    await expect(page.getByTestId("chapter-card-1")).toContainText("Complete");
    await page.goto("/progress");
    await expect(page.getByTestId("collection").locator("li")).toHaveCount(3);
    await expect(page.getByTestId("achievement-masterpiece")).toHaveAttribute("data-unlocked", "true");
    await page.goto("/studio/3");
    await expect(page.getByTestId("coloring-progress")).not.toContainText("0%");
    expect(errors).toEqual([]);
  });

  test("unknown chapter shows a friendly not-found page", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("cta-demo").click();
    await expect(page).toHaveURL(/\/journey$/);
    await page.goto("/journey/42");
    await expect(page.getByText("This page wandered off the map")).toBeVisible();
  });
});

test.describe("Mobile @mobile", () => {
  test("bottom navigation and touch coloring work on a phone @mobile", async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto("/");
    await page.getByTestId("cta-demo").click();
    await expect(page).toHaveURL(/\/journey$/);
    const nav = page.getByRole("navigation", { name: "Main" }).last();
    await expect(nav).toBeVisible();
    await nav.getByRole("link", { name: "Progress" }).click();
    await expect(page).toHaveURL(/\/progress$/);
    await page.goto("/studio/3");
    const before = await page.getByTestId("coloring-progress").textContent();
    const target = await page.locator('[data-region][data-filled="false"]').first().getAttribute("data-region");
    await tapRegion(page, target!);
    await expect(page.getByTestId("coloring-progress")).not.toHaveText(before!);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
    const box = await page.getByTestId("coloring-canvas").boundingBox();
    const vw = page.viewportSize()!.width;
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(vw);
    expect(errors).toEqual([]);
  });
});
