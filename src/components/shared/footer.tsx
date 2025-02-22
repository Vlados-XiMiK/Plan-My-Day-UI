import Link from "next/link"
import { Twitter, Facebook, Instagram } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import en from "@/translations/en.json"
import uk from "@/translations/uk.json"

export default function Footer() {
  const { language } = useLanguage()
  const t = language === "uk" ? uk : en

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="/terms" className="text-gray-400 hover:text-gray-500 text-sm">
            {t.footer.terms}
          </Link>
          <Link href="/privacy" className="text-gray-400 hover:text-gray-500 text-sm">
            {t.footer.privacy}
          </Link>
          <div className="flex items-center space-x-4 ml-4">
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Plan My Day. {t.footer.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  )
}

