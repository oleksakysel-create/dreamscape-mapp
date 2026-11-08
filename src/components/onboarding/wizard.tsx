"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand";
import { GoalsForm, type GoalsValues } from "@/components/goals-form";
import { SphereIcon } from "@/components/icons";
import { PrioritySorter } from "@/components/priority-sorter";
import { SphereRatingList } from "@/components/sphere-rating";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { Progress, Skeleton } from "@/components/ui/misc";
import { track } from "@/lib/analytics";
import { getSphere, MAX_FOCUS, type PriorityTier, type SphereId } from "@/lib/data/spheres";
import { defaultScores, focusSpheres, latestScores } from "@/lib/selectors";
import { firstOfMonthISO } from "@/lib/store/initial";
import { useJourney } from "@/lib/store/journey-store";
import { AGE_RANGES, IDENTITIES, type AgeRange, type Identity, type Scores } from "@/lib/store/types";
import { useHydrated } from "@/lib/store/use-hydrated";
import { cn } from "@/lib/utils";

const STEPS = ["Name", "Identity", "Age", "Life spheres", "Priorities", "Goals", "Ready"] as const;

const IDENTITY_BLURB: Record<Identity, string> = {
  Explorer: "Curious, drawn to the new",
  Creator: "Making things brings me alive",
  Caregiver: "I pour into the people I love",
  Builder: "I like steady progress",
  Learner: "Always growing, always asking",
  Dreamer: "Imagination is my compass",
};

export function OnboardingWizard() {
  const hydrated = useHydrated();
  const router = useRouter();
  const store = useJourney();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [age, setAge] = useState<AgeRange | null>(null);
  const [scores, setScores] = useState<Scores>(defaultScores);
  const [priorities, setPriorities] = useState<Partial<Record<SphereId, PriorityTier>>>({});
  const [error, setError] = useState<string | null>(null);

  // Restore any draft progress once storage is ready.
  useEffect(() => {
    if (!hydrated) return;
    const s = useJourney.getState();
    if (s.onboardedAt) {
      router.replace("/journey");
      return;
    }
    if (!s.mode) s.startJourney("guest");
    if (s.profile) {
      setName(s.profile.name);
      setPronouns(s.profile.pronouns);
      setIdentity(s.profile.identity);
      setAge(s.profile.ageRange);
    }
    const latest = latestScores(s);
    if (latest) setScores(latest);
    if (Object.keys(s.priorities).length) setPriorities(s.priorities);
  }, [hydrated, router]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const go = (next: number) => {
    setError(null);
    setDir(next > step ? 1 : -1);
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveProfile = () =>
    store.saveProfile({
      name: name.trim(),
      pronouns: pronouns.trim(),
      identity: identity ?? "Explorer",
      ageRange: age ?? "25–34",
      journeyStart: store.profile?.journeyStart ?? firstOfMonthISO(),
    });

  const next = () => {
    if (step === 0 && name.trim().length < 1) return setError("What should we call you?");
    if (step === 1 && !identity) return setError("Choose the one that feels closest — you can change it later.");
    if (step === 2 && !age) return setError("Pick an age range.");
    if (step <= 2) saveProfile();
    if (step === 3) {
      store.saveAssessment(scores, { replaceLatest: store.assessments.length > 0 });
    }
    if (step === 4) {
      const focus = Object.values(priorities).filter((t) => t === "focus").length;
      if (focus < 1) return setError("Choose at least one sphere to focus on.");
      store.setPriorities(priorities);
    }
    track("onboarding_step_completed", { step: step + 1 });
    go(step + 1);
  };

  const onGoals = (v: GoalsValues) => {
    store.saveGoals(v.goals.map((g) => ({ ...g, sphereId: g.sphereId as SphereId })));
    track("onboarding_step_completed", { step: 6 });
    go(6);
  };

  const finish = () => {
    store.completeOnboarding();
    router.push("/journey");
  };

  const focus = focusSpheres({ priorities });

  return (
    <div className="paper-grain min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 pb-32 pt-5 sm:px-6">
        <header className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <Logo />
            <span className="text-sm font-semibold text-muted" data-testid="onboarding-step">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
          <Progress value={(step + 1) / STEPS.length} label="Onboarding progress" />
          <ol className="hidden justify-between text-xs text-muted sm:flex">
            {STEPS.map((s, i) => (
              <li key={s} className={cn(i === step && "font-bold text-ink", i < step && "text-primary")}>
                {s}
              </li>
            ))}
          </ol>
        </header>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.section
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -32 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex-1"
          >
            {step === 0 && (
              <StepFrame title="Hello. What should we call you?" lead="This is your story, so let's start with its author.">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">First name or nickname</Label>
                    <Input id="name" autoFocus autoComplete="given-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && next()} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pronouns" className="font-medium text-muted">Pronouns (optional)</Label>
                    <Input id="pronouns" placeholder="e.g. she/her, they/them" value={pronouns} maxLength={40} onChange={(e) => setPronouns(e.target.value)} />
                  </div>
                </div>
              </StepFrame>
            )}

            {step === 1 && (
              <StepFrame title={`Nice to meet you, ${name.trim()}.`} lead="Which word feels most like you right now? There's no wrong answer.">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Identity">
                  {IDENTITIES.map((id) => (
                    <ChoiceCard key={id} selected={identity === id} onClick={() => setIdentity(id)} title={id} text={IDENTITY_BLURB[id]} />
                  ))}
                </div>
              </StepFrame>
            )}

            {step === 2 && (
              <StepFrame title="Which season of life are you in?" lead="This helps us tune prompts gently. It's never shared.">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup" aria-label="Age range">
                  {AGE_RANGES.map((a) => (
                    <ChoiceCard key={a} selected={age === a} onClick={() => setAge(a)} title={a} />
                  ))}
                </div>
              </StepFrame>
            )}

            {step === 3 && (
              <StepFrame title="How does each part of life feel today?" lead="1 is struggling, 10 is thriving. This is a snapshot, not a grade — you can revisit it anytime.">
                <SphereRatingList scores={scores} onChange={(id, v) => setScores((s) => ({ ...s, [id]: v }))} />
              </StepFrame>
            )}

            {step === 4 && (
              <StepFrame title="Where will your energy go this year?" lead={`Pick up to ${MAX_FOCUS} spheres to focus on. Everything else can be maintained or rest for later — that's not neglect, it's intention.`}>
                <PrioritySorter value={priorities} onChange={setPriorities} scores={scores} />
              </StepFrame>
            )}

            {step === 5 && (
              <StepFrame title="Dream a little: your 12-month goals" lead="One gentle goal per focus sphere. Write it like a wish, not a deadline.">
                <GoalsForm formId="goals-form" spheres={focus} existing={store.goals} onSubmit={onGoals} />
              </StepFrame>
            )}

            {step === 6 && (
              <StepFrame title={`Your story begins, ${name.trim()}.`} lead="Twelve chapters await. Each month brings a reflection, a small intentional action, and a coloring page to unwind with.">
                <div className="space-y-3 rounded-3xl border border-line bg-surface p-5 shadow-soft">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Your focus</p>
                  <ul className="space-y-3">
                    {focus.map((id) => (
                      <li key={id} className="flex items-start gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl" style={{ background: `${getSphere(id).color}22`, color: getSphere(id).color }}>
                          <SphereIcon id={id} className="size-[18px]" />
                        </span>
                        <div>
                          <p className="font-semibold">{getSphere(id).name}</p>
                          <p className="text-sm text-muted">{store.goals[id]?.title}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </StepFrame>
            )}
          </motion.section>
        </AnimatePresence>

        <FieldError>{error}</FieldError>
      </div>

      <footer className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-line bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Button variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}>
            <ArrowLeft /> Back
          </Button>
          {step < 5 && (
            <Button onClick={next} data-testid="onboarding-next">
              Continue <ArrowRight />
            </Button>
          )}
          {step === 5 && (
            <Button type="submit" form="goals-form" data-testid="onboarding-next">
              Save my goals <ArrowRight />
            </Button>
          )}
          {step === 6 && (
            <Button onClick={finish} data-testid="onboarding-finish">
              <Sparkles /> Open my journey map
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

function StepFrame({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="max-w-xl text-muted">{lead}</p>
      </div>
      {children}
    </div>
  );
}

function ChoiceCard({ selected, onClick, title, text }: { selected: boolean; onClick: () => void; title: string; text?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "rounded-2xl border bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft",
        selected ? "border-primary bg-primary-soft/60 shadow-soft ring-2 ring-primary/30" : "border-line",
      )}
    >
      <p className="font-display text-lg font-semibold">{title}</p>
      {text && <p className="mt-0.5 text-xs text-muted">{text}</p>}
    </button>
  );
}
