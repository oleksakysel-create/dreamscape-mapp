export const SPHERE_IDS = [
  "health",
  "mind",
  "relationships",
  "family",
  "love",
  "career",
  "finances",
  "growth",
  "fun",
  "home",
  "community",
  "purpose",
] as const;

export type SphereId = (typeof SPHERE_IDS)[number];

export type SphereIconName =
  | "HeartPulse"
  | "Brain"
  | "Users"
  | "House"
  | "Heart"
  | "Briefcase"
  | "Wallet"
  | "GraduationCap"
  | "PartyPopper"
  | "Trees"
  | "HandHeart"
  | "Sparkles";

export interface LifeSphere {
  id: SphereId;
  name: string;
  description: string;
  /** Hex color used for charts and accents. */
  color: string;
  icon: SphereIconName;
  sortOrder: number;
}

export const LIFE_SPHERES: readonly LifeSphere[] = [
  { id: "health", name: "Health & Energy", description: "Sleep, movement, nourishment, and how your body feels day to day.", color: "#E07A5F", icon: "HeartPulse", sortOrder: 1 },
  { id: "mind", name: "Mind & Emotions", description: "Inner calm, emotional resilience, and mental clarity.", color: "#9C89B8", icon: "Brain", sortOrder: 2 },
  { id: "relationships", name: "Friendships", description: "The people who know you, laugh with you, and show up.", color: "#F2A65A", icon: "Users", sortOrder: 3 },
  { id: "family", name: "Family", description: "Bonds with the family you were born into or chose.", color: "#C9805C", icon: "House", sortOrder: 4 },
  { id: "love", name: "Love & Intimacy", description: "Romance, partnership, and closeness — including with yourself.", color: "#D96C8A", icon: "Heart", sortOrder: 5 },
  { id: "career", name: "Career & Craft", description: "Meaningful work, skills, and professional direction.", color: "#5B8E7D", icon: "Briefcase", sortOrder: 6 },
  { id: "finances", name: "Finances", description: "Security, freedom, and a calm relationship with money.", color: "#8AA05B", icon: "Wallet", sortOrder: 7 },
  { id: "growth", name: "Learning & Growth", description: "Curiosity, new skills, and becoming who you want to be.", color: "#4F86A6", icon: "GraduationCap", sortOrder: 8 },
  { id: "fun", name: "Joy & Play", description: "Hobbies, adventure, rest, and the art of doing nothing.", color: "#E9B949", icon: "PartyPopper", sortOrder: 9 },
  { id: "home", name: "Home & Environment", description: "The spaces you live in and how they support you.", color: "#7D9B76", icon: "Trees", sortOrder: 10 },
  { id: "community", name: "Contribution", description: "Giving back, belonging, and your mark on the world.", color: "#C77D58", icon: "HandHeart", sortOrder: 11 },
  { id: "purpose", name: "Purpose & Spirit", description: "Meaning, values, faith, and what makes life feel whole.", color: "#7A6FA8", icon: "Sparkles", sortOrder: 12 },
];

const byId = new Map(LIFE_SPHERES.map((s) => [s.id, s]));

export function getSphere(id: SphereId): LifeSphere {
  const sphere = byId.get(id);
  if (!sphere) throw new Error(`Unknown sphere: ${id}`);
  return sphere;
}

export function isSphereId(value: string): value is SphereId {
  return byId.has(value as SphereId);
}

export type PriorityTier = "focus" | "maintain" | "backlog";
export const MAX_FOCUS = 3;

export const PRIORITY_TIERS: readonly { id: PriorityTier; label: string; description: string }[] = [
  { id: "focus", label: "Top focus", description: `Where your energy goes this year (up to ${MAX_FOCUS}).` },
  { id: "maintain", label: "Maintaining", description: "Keep these steady and nourished." },
  { id: "backlog", label: "Backlog", description: "Resting for now — no pressure." },
];
