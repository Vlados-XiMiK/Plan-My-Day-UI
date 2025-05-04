import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  size?: number; // Define the size prop in the component's props type
}

export default function Logo({ size = 100 }: LogoProps) {
  return (
    <Link href="/" className="flex items-center gap-4">
      <Image
        src="/logo.png"
        alt="Plan My Day Logo"
        width={size}  // Use size for width
        height={size} // Use size for height
        className="object-contain w-auto h-auto"
        priority
      />
      <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400">
        Plan My Day
      </span>
    </Link>
  )
}