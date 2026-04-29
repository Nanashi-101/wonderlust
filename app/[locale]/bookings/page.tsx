import { Link } from "@/i18n/navigation";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import { CalendarDays } from "lucide-react";

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-6 py-32 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-cyan-100 text-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <CalendarDays className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">My Bookings</h1>
          <p className="text-lg text-neutral-600">
            You don't have any active bookings yet. Start exploring our expeditions to begin your journey!
          </p>
          <div className="pt-8">
            <Link href="/packages" className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition-colors">
              Explore Packages
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
