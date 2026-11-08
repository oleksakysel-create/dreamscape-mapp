"use client";

import { Bell, Download, LogIn, LogOut, Save, Shield, Trash2, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/app/actions/auth";
import { GoalsForm, type GoalsValues } from "@/components/goals-form";
import { PrioritySorter } from "@/components/priority-sorter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { FieldError, Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/misc";
import { setAnalyticsEnabled } from "@/lib/analytics";
import type { PriorityTier, SphereId } from "@/lib/data/spheres";
import { requestNotificationPermission } from "@/lib/reminders";
import { focusSpheres, latestScores } from "@/lib/selectors";
import { selectData, useJourney } from "@/lib/store/journey-store";
import { IDENTITIES, type Identity } from "@/lib/store/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const data = useJourney();
  const router = useRouter();
  const [name, setName] = useState(data.profile!.name);
  const [pronouns, setPronouns] = useState(data.profile!.pronouns);
  const [identity, setIdentity] = useState<Identity>(data.profile!.identity);
  const [profileSaved, setProfileSaved] = useState(false);
  const [priorities, setPriorities] = useState<Partial<Record<SphereId, PriorityTier>>>(data.priorities);
  const [priorityState, setPriorityState] = useState<"idle" | "goals" | "saved">("idle");
  const [priorityError, setPriorityError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const dirty = JSON.stringify(priorities) !== JSON.stringify(data.priorities);
  const newFocus = focusSpheres({ priorities });
  const needsGoals = newFocus.filter((id) => !data.goals[id]?.title);

  const saveProfile = () => {
    if (!name.trim()) return;
    data.saveProfile({ ...data.profile!, name: name.trim(), pronouns: pronouns.trim(), identity });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const savePriorities = () => {
    if (newFocus.length < 1) return setPriorityError("Keep at least one sphere in focus.");
    setPriorityError(null);
    if (needsGoals.length) return setPriorityState("goals");
    data.setPriorities(priorities, { isUpdate: true });
    setPriorityState("saved");
  };

  const onNewGoals = (v: GoalsValues) => {
    data.saveGoals(v.goals.map((g) => ({ ...g, sphereId: g.sphereId as SphereId })));
    data.setPriorities(priorities, { isUpdate: true });
    setPriorityState("saved");
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(selectData(useJourney.getState()), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dreamscape-journey.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const signOut = async () => {
    await signOutAction();
    data.reset();
    router.push("/");
  };

  const resetAll = () => {
    data.reset();
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader eyebrow="Settings" title="Make it yours" description="Change anything, anytime. Your reflections, goals and colorings are always kept." />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-5 text-primary" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="s-name">Name</Label>
              <Input id="s-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-pronouns">Pronouns</Label>
              <Input id="s-pronouns" value={pronouns} maxLength={40} onChange={(e) => setPronouns(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Identity">
            {IDENTITIES.map((id) => (
              <button
                key={id}
                role="radio"
                aria-checked={identity === id}
                onClick={() => setIdentity(id)}
                className={cn("rounded-full border px-3.5 py-1.5 text-sm font-semibold transition", identity === id ? "border-primary bg-primary-soft" : "border-line text-muted hover:text-ink")}
              >
                {id}
              </button>
            ))}
          </div>
          <Button onClick={saveProfile} size="sm">
            <Save /> {profileSaved ? "Saved" : "Save profile"}
          </Button>
        </CardContent>
      </Card>

      <Card id="priorities">
        <CardHeader>
          <CardTitle>Priorities</CardTitle>
          <CardDescription>Life changes and so can your focus. Goals for spheres you step back from are kept safe — bring them back anytime.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PrioritySorter
            value={priorities}
            onChange={(v) => {
              setPriorities(v);
              setPriorityState("idle");
            }}
            scores={latestScores(data)}
          />
          <FieldError>{priorityError}</FieldError>
          {priorityState === "goals" ? (
            <div className="space-y-3 rounded-3xl bg-surface-2/70 p-4">
              <p className="font-semibold">Add a goal for your new focus {needsGoals.length > 1 ? "areas" : "area"}</p>
              <GoalsForm formId="settings-goals" spheres={needsGoals} existing={data.goals} onSubmit={onNewGoals} />
              <Button type="submit" form="settings-goals" data-testid="save-new-goals">
                Save goals & priorities
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button onClick={savePriorities} disabled={!dirty} data-testid="save-priorities">
                <Save /> Save priorities
              </Button>
              {priorityState === "saved" && !dirty && (
                <span className="text-sm text-sage" data-testid="priorities-saved">
                  Priorities updated — nothing was lost.
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5 text-sage" /> Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Toggle
            label="Gentle reminders"
            description="Browser notifications for actions you plan. Never for missed days."
            checked={data.settings.reminders}
            onChange={async (v) => {
              if (v) await requestNotificationPermission();
              data.updateSettings({ reminders: v });
            }}
          />
          <Toggle
            label="Share anonymous usage analytics"
            description="Helps us improve. Only counts like “a reflection was completed” — never your words, names or goals."
            checked={data.settings.analytics}
            onChange={(v) => {
              data.updateSettings({ analytics: v });
              setAnalyticsEnabled(v);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5 text-lavender" /> Account & data
          </CardTitle>
          <CardDescription>
            {data.mode === "account" ? "Signed in — your journey syncs securely." : data.mode === "demo" ? "You're exploring the demo journey on this device." : "You're a guest — your journey lives only on this device."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {data.mode === "account" ? (
            <Button variant="secondary" onClick={signOut}>
              <LogOut /> Sign out
            </Button>
          ) : (
            isSupabaseConfigured && (
              <Button asChild variant="secondary">
                <Link href="/register">
                  <LogIn /> Save to an account
                </Link>
              </Button>
            )
          )}
          <Button variant="secondary" onClick={exportData}>
            <Download /> Export my data
          </Button>
          <Button variant="ghost" className="text-danger" onClick={() => setResetOpen(true)}>
            <Trash2 /> {data.mode === "demo" ? "Leave demo" : "Erase journey"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogTitle>{data.mode === "demo" ? "Leave the demo?" : "Erase this journey?"}</DialogTitle>
          <DialogDescription className="mt-2">
            {data.mode === "demo"
              ? "The demo data will be cleared from this device so you can begin your own story."
              : "This permanently removes your journey from this device. Consider exporting first."}
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={resetAll}>
              {data.mode === "demo" ? "Leave demo" : "Erase"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl p-2 hover:bg-surface-2/60">
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-sm text-muted">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn("relative mt-1 h-7 w-12 shrink-0 rounded-full transition", checked ? "bg-sage" : "bg-line")}
      >
        <span className={cn("absolute top-1 size-5 rounded-full bg-white shadow transition-all", checked ? "left-6" : "left-1")} />
      </button>
    </label>
  );
}
