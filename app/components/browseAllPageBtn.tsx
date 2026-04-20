import { useTranslations } from 'next-intl'
import Link from 'next/link'

const BrowseAllPageBtn = () => {
  const t = useTranslations('BrowseAll');

  return (
    <Link
    href="/"
    className="inline-flex items-center justify-center px-8 py-4 mt-10 rounded-full 
             bg-white text-cyan-600 font-medium tracking-wide 
             transition-all duration-300 hover:scale-105 hover:shadow-xl"
>
    {t('browseAllPackages')}
</Link>
  )
}

export default BrowseAllPageBtn