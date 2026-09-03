import { PrismaClient, PackageCategory, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// Seed Data
// Migrated from app/lib/utils.ts — all 5 existing packages.
// Prices stored in minor units (paise) — see CLAUDE.md M2. Images reference /public paths.
// ─────────────────────────────────────────────────────────────────────────────

const packages = [
  {
    slug: "ladakh-expedition",
    destination: "ladakh",
    category: PackageCategory.Expedition,
    imagePath: "/destination/Ladakh.png",
    durationDays: 8,
    durationNights: 7,
    difficulty: Difficulty.Advanced,
    maxAltitudeFt: 17582,
    priceFromMinor: 4299900,
    featured: true,
    active: true,
    title: "Ladakh High-Altitude Expedition",
    description:
      "An unforgettable high-altitude journey across Ladakh's dramatic landscapes. Traverse mountain passes, ancient monasteries, and remote Himalayan villages while experiencing the raw beauty of India's northern frontier.",
    highlights: [
      "Khardung La Pass",
      "Pangong Lake Sunrise",
      "Nubra Valley Desert",
      "Monastery Exploration",
      "Leh Local Sightseeing",
    ],
  },
  {
    slug: "kashmir-retreat",
    destination: "kashmir",
    category: PackageCategory.Retreat,
    imagePath: "/destination/kashmir.png",
    durationDays: 13,
    durationNights: 12,
    difficulty: Difficulty.Moderate,
    maxAltitudeFt: 9000,
    priceFromMinor: 2299900,
    featured: true,
    active: true,
    title: "Kashmir Alpine Retreat",
    description:
      "Experience the tranquil alpine charm of Kashmir. From serene Dal Lake shikara rides to snow-dusted valleys and pine forests, this retreat blends nature, culture, and peaceful mountain living.",
    highlights: [
      "Dal Lake Houseboat Stay",
      "Gulmarg Gondola Ride",
      "Pahalgam Valleys",
      "Local Kashmiri Cuisine",
      "Sonamarg Meadow Trip",
    ],
  },
  {
    slug: "manali-adventure",
    destination: "manali",
    category: PackageCategory.Adventure,
    imagePath: "/destination/manali.png",
    durationDays: 5,
    durationNights: 4,
    difficulty: Difficulty.Intermediate,
    maxAltitudeFt: 13050,
    priceFromMinor: 2449900,
    featured: true,
    active: true,
    title: "Manali Adventure Circuit",
    description:
      "Designed for thrill seekers, this adventure circuit takes you through Solang Valley, Rohtang Pass, and hidden Himalayan trails. A perfect mix of adrenaline and scenic beauty.",
    highlights: [
      "Rohtang Pass Drive",
      "Solang Valley Adventure Sports",
      "Old Manali Exploration",
      "Mountain Trekking Trails",
      "River Rafting in Beas",
    ],
  },
  {
    slug: "puri-divine",
    destination: "puri",
    category: PackageCategory.Spiritual,
    imagePath: "/destination/puri.png",
    durationDays: 6,
    durationNights: 5,
    difficulty: Difficulty.Easy,
    maxAltitudeFt: null,
    priceFromMinor: 1111100,
    featured: true,
    active: true,
    title: "Puri Divine and Coastal",
    description:
      "Discover the divine charm of Puri, where spirituality meets the sea. From sacred temples to serene beaches — your perfect escape awaits.",
    highlights: [
      "Jagannath Temple Visit",
      "Golden Beach Relaxation",
      "Konark Sun Temple Trip",
      "Chilika Lake Excursion",
      "Local Odia Cuisine",
    ],
  },
  {
    slug: "rishikesh-spiritual",
    destination: "rishikesh",
    category: PackageCategory.Spiritual,
    imagePath: "/destination/rishikesh.png",
    durationDays: 5,
    durationNights: 4,
    difficulty: Difficulty.Easy,
    maxAltitudeFt: null,
    priceFromMinor: 1899900,
    featured: true,
    active: true,
    title: "Rishikesh Spiritual Sanctuary",
    description:
      "Reconnect with yourself on the sacred banks of the Ganges. Daily yoga, meditation, Ganga Aarti, and peaceful mountain walks in the yoga capital of the world.",
    highlights: [
      "Evening Ganga Aarti",
      "Riverside Yoga & Meditation",
      "Beatles Ashram Visit",
      "Neer Garh Waterfall Hike",
      "Ayurvedic Spa Treatment",
    ],
  },
  {
    slug: "kashmir-women-alpine-trek",
    destination: "kashmir",
    category: PackageCategory.WomensOnly,
    imagePath: "/destination/kashmir.png",
    durationDays: 6,
    durationNights: 5,
    difficulty: Difficulty.Moderate,
    maxAltitudeFt: 11200,
    priceFromMinor: 2899900,
    featured: true,
    active: true,
    title: "Kashmir All-Women Himalayan Escape",
    description:
      "A women-led alpine expedition through Kashmir's pristine meadows, private glamping sites, and alpine lakes, designed for empowerment and shared adventure.",
    highlights: [
      "100% All-Women Group & Guides",
      "Pahalgam Glamping & Bonfire",
      "Alpine Lakes Trek",
      "Cultural Handicrafts Workshop",
    ],
  },
];

async function main() {
  console.log("🌱 Seeding packages...");

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: pkg,
      create: pkg,
    });
    console.log(`  ✓ ${pkg.title}`);
  }

  console.log(`\n✅ Seeded ${packages.length} packages successfully.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
