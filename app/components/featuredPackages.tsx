import { getFeaturedPackages } from "@/lib/actions/packages";
import { localisePackage } from "@/lib/package-utils";
import FeaturedPackagesClient from "./featuredPackagesClient";
import { getLocale } from "next-intl/server";

// Server component — fetches featured packages from DB and passes them
// to the client component which handles GSAP animations.
export default async function FeaturedPackages() {
  const [packages, locale] = await Promise.all([
    getFeaturedPackages(),
    getLocale(),
  ]);

  const localised = packages.map((pkg) => localisePackage(pkg, locale));

  return <FeaturedPackagesClient packages={localised} />;
}
