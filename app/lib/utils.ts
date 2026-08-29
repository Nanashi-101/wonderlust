import Ladakh from "@/public/destination/Ladakh.png";
import Kashmir from "@/public/destination/kashmir.png";
import Manali from "@/public/destination/manali.png";
import Rishikesh from "@/public/destination/rishikesh.png";
import Puri from "@/public/destination/puri.png";

/* ===================== */
/* TYPES */
/* ===================== */

export type PackageCategory =
  | "Adventure"
  | "Spiritual"
  | "Expedition"
  | "Retreat";

export interface TravelPackage {
  id: string;
  tKey: string; // Translation key
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any;
  category: PackageCategory;
  duration: string;
  difficulty: string;
  altitude: string;
  price: string;
  description: string;
  highlights: string[];
}

/* ===================== */
/* DATA */
/* ===================== */

export const Images = {
  Ladakh,
  Kashmir,
  Manali,
  Rishikesh,
};

export const packages: TravelPackage[] = [
  {
    id: "ladakh-expedition",
    tKey: "ladakhExpedition",
    title: "Ladakh High-Altitude Expedition",
    image: Ladakh,
    category: "Expedition",
    duration: "8 Days · 7 Nights",
    difficulty: "Advanced",
    altitude: "Max Altitude: 17,582 ft",
    price: "Starting ₹42,999",
    description:
      "An unforgettable high-altitude journey across Ladakh’s dramatic landscapes. Traverse mountain passes, ancient monasteries, and remote Himalayan villages while experiencing the raw beauty of India’s northern frontier.",
    highlights: [
      "Khardung La Pass",
      "Pangong Lake Sunrise",
      "Nubra Valley Desert",
      "Monastery Exploration",
      "Leh Local Sightseeing",
    ],
  },
  {
    id: "kashmir-retreat",
    tKey: "kashmirRetreat",
    title: "Kashmir Alpine Retreat",
    image: Kashmir,
    category: "Retreat",
    duration: "13 Days · 12 Nights",
    difficulty: "Moderate",
    altitude: "Max Altitude: 9,000 ft",
    price: "Starting ₹22,999",
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
    id: "manali-adventure",
    tKey: "manaliAdventure",
    title: "Manali Adventure Circuit",
    image: Manali,
    category: "Adventure",
    duration: "5 Days · 4 Nights",
    difficulty: "Intermediate",
    altitude: "Max Altitude: 13,050 ft",
    price: "Starting ₹24,499",
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
    id: "puri-divine",
    tKey: "puriDivine",
    title: "Puri Divine and Coastal",
    image: Puri,
    category: "Spiritual",
    duration: "6 Days · 5 Nights",
    difficulty: "Easy",
    altitude: "Max Altitude: 1,200 ft",
    price: "Starting ₹11,111",
    description:
      "Discover the divine charm of Puri, where spirituality meets the sea. From sacred temples to serene beaches—your perfect escape awaits.",
    highlights: [
      "Jagannath Temple Visit",
      "Golden Beach Relaxation",
      "Konark Sun Temple Trip",
      "Chilika Lake Excursion",
      "Local Odia Cuisine",
    ],
  },
  {
    id: "rishikesh-spiritual",
    tKey: "rishikeshSpiritual",
    title: "Rishikesh Spiritual Escape",
    image: Rishikesh,
    category: "Spiritual",
    duration: "4 Days · 3 Nights",
    difficulty: "Easy",
    altitude: "Max Altitude: 1,200 ft",
    price: "Starting ₹18,999",
    description:
      "A rejuvenating journey into the spiritual heart of India. Explore sacred ghats, attend evening Ganga Aarti, and unwind with yoga sessions overlooking the Himalayas.",
    highlights: [
      "Ganga Aarti Ceremony",
      "Yoga & Meditation Session",
      "River Rafting",
      "Temple & Ashram Tours",
      "Beatles Ashram Visit",
    ],
  },
];

/* ===================== */
/* FILTER OPTIONS */
/* ===================== */

export const packageCategories: (PackageCategory | "All")[] = [
  "All",
  "Adventure",
  "Spiritual",
  "Expedition",
  "Retreat",
];
