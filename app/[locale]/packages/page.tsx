import Footer from "@/app/components/footer";
import PackageHero from "../../components/packageComponents/packageHero";
import PackageGrid from "../../components/packageComponents/packageGrid";
import MembershipSection from "../../components/packageComponents/membershipSection";
import PackagesCTA from "../../components/packageComponents/packageCTA";
import GalleryNavbar from "../gallery/GalleryNavbar";

export default function PackagesPage() {
  return (
    <>
      <GalleryNavbar />
      <PackageHero />
      <PackageGrid/>
      <MembershipSection/>
      <PackagesCTA/>
      <Footer />
    </>
  );
}
