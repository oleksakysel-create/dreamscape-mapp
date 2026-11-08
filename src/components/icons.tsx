import {
  Brain, Briefcase, CalendarCheck, Compass, Crown, Flower2, GraduationCap, HandHeart, Heart, HeartPulse,
  House, Mountain, Paintbrush, Palette, PartyPopper, PenLine, RefreshCw, Sparkles, Sprout, Star, Sun,
  Target, Trees, Users, Wallet, type LucideIcon, type LucideProps,
} from "lucide-react";
import type { AchievementIconName } from "@/lib/data/achievements";
import { getSphere, type SphereIconName, type SphereId } from "@/lib/data/spheres";

const SPHERE_ICONS: Record<SphereIconName, LucideIcon> = {
  HeartPulse, Brain, Users, House, Heart, Briefcase, Wallet, GraduationCap, PartyPopper, Trees, HandHeart, Sparkles,
};

const ACHIEVEMENT_ICONS: Record<AchievementIconName, LucideIcon> = {
  Sprout, Compass, Target, Star, PenLine, CalendarCheck, Paintbrush, Palette, Flower2, Mountain, Sun, Crown, RefreshCw,
};

export function SphereIcon({ id, ...props }: { id: SphereId } & LucideProps) {
  const Icon = SPHERE_ICONS[getSphere(id).icon];
  return <Icon aria-hidden {...props} />;
}

export function AchievementIcon({ name, ...props }: { name: AchievementIconName } & LucideProps) {
  const Icon = ACHIEVEMENT_ICONS[name];
  return <Icon aria-hidden {...props} />;
}
