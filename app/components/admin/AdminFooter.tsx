export default function AdminFooter() {
  return (
    <footer className="bg-cyan-500 text-white py-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-medium text-white">
            Wonderlust Creator Studio &copy; {new Date().getFullYear()}
          </p>
          <p className="text-white text-[11px] mt-0.5">
            Tour & Expedition Management Console
          </p>
        </div>

        <div className="flex items-center gap-6 text-white">
          <a href="/en" className="hover:text-cyan-600 transition-colors">
            Main Site
          </a>
          <a href="/en/packages" className="hover:text-cyan-600 transition-colors">
            Tour Catalog
          </a>
          <a href="/en/bookings" className="hover:text-cyan-600 transition-colors">
            Bookings
          </a>
        </div>
      </div>
    </footer>
  );
}
