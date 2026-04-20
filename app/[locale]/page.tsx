import About from "../components/about";
import Contact from "../components/contact";
import Destinations from "../components/destination";
import ExperiencePause from "../components/experiencePause";
import FeaturedPackages from "../components/featuredPackages";
import Footer from "../components/footer";
import Hero from "../components/hero";
import Navbar from "../components/navbar";
import Partners from "../components/partners";

export default function Home() {
  return (
    <div>
      <Navbar/>
      <Hero/>
      <Partners/>
      <About/>
      <Destinations/>
      <ExperiencePause/>
      <FeaturedPackages/>
      <Contact/>
      <Footer/>
    </div>
  );
}
