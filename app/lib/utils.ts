// Local destination image imports.
// Used anywhere a static next/image import is needed (gives built-in width/height).
// Note: package components now use string paths from the DB via next/image with fill.
import Ladakh from "@/public/destination/Ladakh.png";
import Kashmir from "@/public/destination/kashmir.png";
import Manali from "@/public/destination/manali.png";
import Rishikesh from "@/public/destination/rishikesh.png";
import Puri from "@/public/destination/puri.png";

export const DestinationImages = {
  Ladakh,
  Kashmir,
  Manali,
  Rishikesh,
  Puri,
};

export const Images = DestinationImages;
