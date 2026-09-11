import { getActiveAdvertisements } from "@/lib/actions/advertisements";
import AdvertisementsGalleryClient from "./advertisementsGalleryClient";

// Server component — fetches active advertisements from the DB and hands
// them to the client component that handles the scroll interaction.
// Renders nothing until the client has uploaded at least one advertisement.
export default async function AdvertisementsGallery() {
  const ads = await getActiveAdvertisements();

  if (ads.length === 0) return null;

  return <AdvertisementsGalleryClient ads={ads.map((ad) => ({ id: ad.id, imageUrl: ad.imageUrl }))} />;
}
