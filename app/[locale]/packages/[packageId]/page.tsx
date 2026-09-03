import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import { CalendarDays, MapPin, SignalHigh, Banknote, CheckCircle2, ArrowRight, Star } from "lucide-react";
import MobileBookingBar from "@/app/components/packageComponents/MobileBookingBar";
import BookNowButton from "@/app/components/packageComponents/BookNowButton";
import { getPackageBySlug } from "@/lib/actions/packages";
import { getPackageReviewsAction } from "@/lib/actions/reviews";
import { localisePackage, getImageUrl } from "@/lib/package-utils";
import { getSiteUrl } from "@/lib/site-url";
import { fromMinor } from "@/lib/payments/money";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; packageId: string }>;
}): Promise<Metadata> {
  const { locale, packageId } = await params;
  const raw = await getPackageBySlug(packageId);
  if (!raw) return {};

  const pkg = localisePackage(raw, locale);
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/${locale}/packages/${pkg.slug}`;
  const description = pkg.description.slice(0, 160);
  const ogImage = getImageUrl(pkg.imagePath);

  return {
    title: `${pkg.title} | Wonderlust Expeditions`,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${siteUrl}/${l}/packages/${pkg.slug}`])
      ),
    },
    openGraph: {
      title: pkg.title,
      description,
      url: canonicalUrl,
      images: [{ url: ogImage }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pkg.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PackageDetails({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const { packageId } = await params;

  const [raw, locale] = await Promise.all([
    getPackageBySlug(packageId),
    getLocale(),
  ]);

  if (!raw) notFound();

  const pkg = localisePackage(raw, locale);
  const reviews = await getPackageReviewsAction(pkg.id);
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.description,
    image: getImageUrl(pkg.imagePath),
    offers: {
      "@type": "Offer",
      price: fromMinor(pkg.priceFromMinor, pkg.currency).toFixed(2),
      priceCurrency: pkg.currency,
      availability: pkg.active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${getSiteUrl()}/${locale}/packages/${pkg.slug}`,
    },
    ...(averageRating != null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating.toFixed(1),
            reviewCount: reviews.length,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <Image
          src={pkg.imagePath}
          alt={pkg.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-6 text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              {pkg.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-6 text-lg opacity-90 font-medium">
              <span className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-cyan-400" />
                {pkg.durationDisplay}
              </span>
              <span className="flex items-center gap-2">
                <SignalHigh className="w-5 h-5 text-cyan-400" />
                {pkg.difficulty}
              </span>
              {pkg.altitudeDisplay && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  {pkg.altitudeDisplay}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-neutral-900">
                About this Expedition
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed">
                {pkg.description}
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-8 text-neutral-900">
                Expedition Highlights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pkg.highlights?.map((highlight: string, index: number) => (
                  <div

                    key={index}
                    className="flex items-start gap-3 p-4 bg-white rounded-2xl shadow-sm border border-neutral-100"
                  >
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 mt-0.5" />
                    <span className="text-neutral-700 font-medium">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {reviews.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="text-3xl font-bold text-neutral-900">Traveller Reviews</h2>
                  {averageRating != null && (
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      {averageRating.toFixed(1)}
                      <span className="text-neutral-400 font-normal">({reviews.length})</span>
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-4 bg-white rounded-2xl shadow-sm border border-neutral-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-neutral-900">
                          {[review.user.firstName, review.user.lastName].filter(Boolean).join(" ") ||
                            "Wonderlust traveller"}
                        </span>
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`}
                            />
                          ))}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-neutral-600 text-sm leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-white rounded-3xl p-8 shadow-xl border border-neutral-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-sm text-neutral-500 uppercase tracking-wider font-semibold">
                    Total Price
                  </p>
                  <p className="text-3xl font-bold text-cyan-600">
                    {pkg.priceDisplay}
                  </p>
                </div>
                <div className="p-3 bg-cyan-50 rounded-2xl">
                  <Banknote className="w-8 h-8 text-cyan-600" />
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-neutral-500">Duration</span>
                  <span className="font-semibold">{pkg.durationDisplay}</span>
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

              <BookNowButton
                packageId={pkg.id}
                className="w-full h-14 rounded-full bg-cyan-600 hover:bg-cyan-500 text-lg font-bold group"
              >
                Book Expedition
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </BookNowButton>

              <p className="mt-4 text-center text-sm text-neutral-400">
                Secure your spot with only a 20% deposit.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <MobileBookingBar
        packageId={pkg.id}
        price={pkg.priceDisplay}
        duration={pkg.durationDisplay}
      />
    </div>
    </>
  );
}
