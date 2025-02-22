import Image from "next/image"
import Link from "next/link"

export default function Logo({ size = 100 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-4">
      
        <Image
          src="/logo.png"
          alt="Plan My Day Logo"
          width={120}
          height={90}
          className="object-contain"
          priority
        />
      
      <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400">
        Plan My Day
      </span>
    </Link>
  )
}