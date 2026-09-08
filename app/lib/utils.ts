// Destination images served from Cloudflare R2 (see lib/static-images.ts).
import { staticImage } from "@/lib/static-images";

export const DestinationImages = {
  Ladakh: staticImage("destination/Ladakh.png"),
  Kashmir: staticImage("destination/kashmir.png"),
  Manali: staticImage("destination/manali.png"),
  Rishikesh: staticImage("destination/rishikesh.png"),
  Puri: staticImage("destination/puri.png"),
};

export const Images = DestinationImages;
