import { packages } from "@/app/lib/utils";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import { CalendarDays, MapPin, SignalHigh, Banknote, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileBookingBar from "@/app/components/packageComponents/MobileBookingBar";

export default async function PackageDetails({ params }: { params: Promise<{ packageId: string }> }) {
  const { packageId } = await params;
  const pkg = packages.find((p) => p.id === packageId);

  if (!pkg) notFound();

  const t_data = await getTranslations("PackagesData");
  const t_ui = await getTranslations("PackageGrid");

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <Image
          src={pkg.image}
          alt={t_data(`${pkg.tKey}.title`)}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-6 text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              {t_data(`${pkg.tKey}.title`)}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-6 text-lg opacity-90 font-medium">
              <span className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-cyan-400" />
                {t_data(`${pkg.tKey}.duration`)}
              </span>
              <span className="flex items-center gap-2">
                <SignalHigh className="w-5 h-5 text-cyan-400" />
                {t_data(`${pkg.tKey}.difficulty`)}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                {pkg.altitude}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left Column: Description and Highlights */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-neutral-900">About this Expedition</h2>
              <p className="text-lg text-neutral-600 leading-relaxed">
                {t_data(`${pkg.tKey}.description`)}
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-8 text-neutral-900">Expedition Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pkg.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-2xl shadow-sm border border-neutral-100">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 mt-0.5" />
                    <span className="text-neutral-700 font-medium">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-white rounded-3xl p-8 shadow-xl border border-neutral-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-sm text-neutral-500 uppercase tracking-wider font-semibold">Total Price</p>
                  <p className="text-3xl font-bold text-cyan-600">{t_data(`${pkg.tKey}.price`)}</p>
                </div>
                <div className="p-3 bg-cyan-50 rounded-2xl">
                  <Banknote className="w-8 h-8 text-cyan-600" />
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-neutral-500">Duration</span>
                  <span className="font-semibold">{t_data(`${pkg.tKey}.duration`)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-neutral-500">Group Size</span>
                  <span className="font-semibold">Max 12 People</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-neutral-500">Meals Included</span>
                  <span className="font-semibold text-green-600">Yes</span>
                </div>
              </div>

              <Button className="w-full h-14 rounded-full bg-cyan-600 hover:bg-cyan-500 text-lg font-bold group">
                Book Expedition
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="mt-4 text-center text-sm text-neutral-400">
                Secure your spot with only a 20% deposit.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <MobileBookingBar 
        price={t_data(`${pkg.tKey}.price`)} 
        duration={t_data(`${pkg.tKey}.duration`)} 
      />
    </div>
  );
}
