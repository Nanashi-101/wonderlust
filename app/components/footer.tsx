import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations('Footer');
  
  return (
    <footer className="bg-cyan-500 text-white py-20">
      <div className="container mx-auto px-8 max-w-6xl">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              {t('brand')}
            </h3>
            <p className="mt-6 text-sm text-cyan-100 leading-relaxed">
              {t('brandDescription')}
            </p>
            <p className="mt-6 text-sm text-cyan-100 leading-relaxed">
              {t('brandAddress')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-medium tracking-wide mb-6">{t('explore')}</h4>
            <ul className="space-y-3 text-cyan-100 text-sm">
              <li>
                <a href="#destinations" className="hover:text-white transition">
                  {t('destinations')}
                </a>
              </li>
              <li>
                <a href="#packages" className="hover:text-white transition">
                  {t('packages')}
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition">
                  {t('contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-medium tracking-wide mb-6">{t('contactHeading')}</h4>
            <ul className="space-y-3 text-cyan-100 text-sm">
              <li>journeyswanderlust5@gmail.com</li>
              <li>+91 93304 24772</li>
              <li>Leh • Manali • Srinagar</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-medium tracking-wide mb-6">
              {t('stayInspired')}
            </h4>
            <div className="flex border-b border-cyan-300 pb-2">
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="bg-transparent placeholder-cyan-200 text-white w-full focus:outline-none"
              />
              <button className="ml-4 text-sm">→</button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-20 border-t border-cyan-400 pt-8 text-sm text-cyan-100 flex flex-col md:flex-row justify-between">
          <span>© {new Date().getFullYear()} {t('copyright')}</span>
          <span>{t('tagline')}</span>
        </div>
      </div>
    </footer>
  );
}
