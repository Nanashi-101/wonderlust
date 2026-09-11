export type Region = "north" | "west" | "south" | "east" | "northeast" | "central";

export const REGIONS: Region[] = ["north", "west", "south", "east", "northeast", "central"];

export type Place = { name: string; region: Region | null; image?: string };

/**
 * Destinations offered in the planner. `image` is an R2 key (see lib/static-images)
 * or a full images.unsplash.com URL (allowed in next.config.ts). Every photo here
 * was checked to actually show that place — places without one get region artwork
 * on the trip ticket rather than a wrong photo. To add one, upload it to R2 (e.g.
 * destination/goa.jpg) or use an Unsplash photo you've opened and confirmed.
 */
const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=1200`;

export const PLACES: Place[] = [
  { name: "Kashmir", region: "north", image: unsplash("photo-1595815771614-ade9d652a65d") },
  { name: "Gulmarg", region: "north", image: "gallery/kashmir_gulmarg.png" },
  { name: "Pahalgam", region: "north", image: "gallery/kashmir_pahalgam.png" },
  { name: "Ladakh", region: "north", image: unsplash("photo-1581793745862-99fde7fa73d2") },
  { name: "Manali", region: "north", image: "destination/manali.png" },
  { name: "Shimla", region: "north" },
  { name: "Spiti Valley", region: "north" },
  { name: "Dharamshala", region: "north" },
  { name: "Rishikesh", region: "north", image: "destination/rishikesh.png" },
  { name: "Nainital", region: "north" },
  { name: "Auli", region: "north" },
  { name: "Amritsar", region: "north", image: unsplash("photo-1514222134-b57cbb8ce073") },
  { name: "Delhi", region: "north", image: unsplash("photo-1587474260584-136574528ed5") },
  { name: "Agra", region: "north", image: unsplash("photo-1564507592333-c60657eea523") },
  { name: "Varanasi", region: "north" },
  { name: "Jaipur", region: "west", image: unsplash("photo-1599661046289-e31897846e41") },
  { name: "Udaipur", region: "west", image: unsplash("photo-1615836245337-f5b9b2303f10") },
  { name: "Jaisalmer", region: "west" },
  { name: "Jodhpur", region: "west" },
  { name: "Goa", region: "west", image: unsplash("photo-1512343879784-a960bf40e7f2") },
  { name: "Mumbai", region: "west", image: unsplash("photo-1570168007204-dfb528c6958f") },
  { name: "Rann of Kutch", region: "west" },
  { name: "Kerala", region: "south", image: unsplash("photo-1602216056096-3b40cc0c9944") },
  { name: "Munnar", region: "south" },
  { name: "Alleppey", region: "south", image: unsplash("photo-1593693397690-362cb9666fc2") },
  { name: "Coorg", region: "south" },
  { name: "Hampi", region: "south" },
  { name: "Ooty", region: "south" },
  { name: "Pondicherry", region: "south" },
  { name: "Madurai", region: "south", image: unsplash("photo-1582510003544-4d00b7f74220") },
  { name: "Andaman Islands", region: "south" },
  { name: "Darjeeling", region: "east" },
  { name: "Kolkata", region: "east", image: unsplash("photo-1558431382-27e303142255") },
  { name: "Puri", region: "east", image: "destination/puri.png" },
  { name: "Sundarbans", region: "east" },
  { name: "Sikkim", region: "northeast" },
  { name: "Meghalaya", region: "northeast" },
  { name: "Tawang", region: "northeast" },
  { name: "Kaziranga", region: "northeast" },
  { name: "Khajuraho", region: "central" },
  { name: "Kanha National Park", region: "central" },
  { name: "Pachmarhi", region: "central" },
];

/** Ticket artwork for places without a photo: [light, dark] per region. */
export const REGION_ART: Record<Region | "custom", [string, string]> = {
  north: ["#0c4a6e", "#0f172a"],
  west: ["#a16207", "#422006"],
  south: ["#047857", "#022c22"],
  east: ["#4338ca", "#1e1b4b"],
  northeast: ["#166534", "#052e16"],
  central: ["#4d7c0f", "#1a2e05"],
  custom: ["#0e7490", "#083344"],
};

export type GroupType = "solo" | "couple" | "family" | "friends";
export const GROUP_TYPES: GroupType[] = ["solo", "couple", "family", "friends"];

export type BudgetTier = "budget" | "comfort" | "premium" | "luxury" | "unsure";

/** Per-person INR bands; `hint` is what's sent to the model as budgetINR. */
export const BUDGET_TIERS: Array<{ id: BudgetTier; min?: number; max?: number; hint?: number }> = [
  { id: "budget", max: 20000, hint: 20000 },
  { id: "comfort", min: 20000, max: 50000, hint: 50000 },
  { id: "premium", min: 50000, max: 100000, hint: 100000 },
  { id: "luxury", min: 100000, hint: 200000 },
  { id: "unsure" },
];

// Sent to the model as-is, so the ids stay English regardless of locale.
export const INTERESTS = [
  "trekking",
  "culture",
  "adventure",
  "relaxation",
  "photography",
  "spiritual",
  "food",
  "wildlife",
] as const;
export type Interest = (typeof INTERESTS)[number];

export const DAY_PICKS = [3, 5, 7, 10, 14];

export type Season = "winter" | "summer" | "monsoon" | "postMonsoon";

/** Indian travel seasons by 0-based month. */
export function seasonOf(month: number): Season {
  if (month === 11 || month <= 1) return "winter";
  if (month <= 4) return "summer";
  if (month <= 8) return "monsoon";
  return "postMonsoon";
}

export type TripAnswers = {
  place?: Place | "surprise";
  days?: number;
  groupType?: GroupType;
  groupSize?: number;
  budget?: BudgetTier;
  /** 0-based month, or "any". */
  month?: number | "any";
  interests?: Interest[];
  notes?: string;
};

/** Loose match so "Kerala" in the catalog lights up "Kerala" and "Alleppey, Kerala". */
export function hasPackageFor(
  place: TripAnswers["place"] | Place,
  packages: Array<{ destination: string }>
): boolean {
  if (!place || place === "surprise") return false;
  const name = place.name.toLowerCase();
  return packages.some((pkg) => {
    const destination = pkg.destination.toLowerCase();
    return destination.includes(name) || name.includes(destination);
  });
}
