import { getPackages } from "@/lib/actions/packages";
import { localisePackage } from "@/lib/package-utils";
import PackageGridClient from "./packageGridClient";
import { getLocale } from "next-intl/server";

// Server component — fetches all packages from DB and passes to the
// client component which handles category filtering and animations.
export default async function PackageGrid() {
  const [packages, locale] = await Promise.all([
    getPackages(),
    getLocale(),
  ]);

  const localised = packages.map((pkg) => localisePackage(pkg, locale));

  return <PackageGridClient packages={localised} />;
}
