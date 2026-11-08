import { fireEvent, render, screen } from "@testing-library/react";
import { ColoringCanvas } from "@/components/coloring/coloring-canvas";
import { PrioritySorter } from "@/components/priority-sorter";
import { WheelOfLife } from "@/components/wheel-of-life";
import { getIllustration } from "@/lib/coloring/illustrations";
import { defaultScores } from "@/lib/selectors";

describe("ColoringCanvas", () => {
  it("reports the tapped region and renders fills", () => {
    const onTap = vi.fn();
    const ill = getIllustration("geo-honeycomb")!;
    const { container } = render(<ColoringCanvas illustration={ill} fills={{ r2: "#ABCDEF" }} onRegionTap={onTap} />);
    const paths = container.querySelectorAll("[data-region]");
    expect(paths).toHaveLength(ill.regions.length);
    expect(container.querySelector('[data-region="r2"]')).toHaveAttribute("fill", "#ABCDEF");
    fireEvent.click(container.querySelector('[data-region="r5"]')!);
    expect(onTap).toHaveBeenCalledWith("r5");
  });
});

describe("PrioritySorter", () => {
  it("enforces the 3-focus limit", () => {
    const onChange = vi.fn();
    render(<PrioritySorter value={{ health: "focus", mind: "focus", fun: "focus" }} onChange={onChange} scores={defaultScores()} />);
    expect(screen.getByTestId("tier-career-focus")).toBeDisabled();
    fireEvent.click(screen.getByTestId("tier-career-backlog"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ career: "backlog", health: "focus" }));
  });
});

describe("WheelOfLife", () => {
  it("offers an accessible table view", () => {
    render(<WheelOfLife current={{ ...defaultScores(), health: 9 }} baseline={defaultScores()} />);
    expect(screen.getByRole("img", { name: "Wheel of life chart" })).toBeInTheDocument();
    fireEvent.click(screen.getByText("Show table"));
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Health & Energy").closest("tr")).toHaveTextContent("59");
  });
});
