import Image from "next/image"

export function Logo() {
  return (
    <Image
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11.JPG-4yFchKhT77p5qgKeTkKtzefMQepX1u.jpeg"
      alt="Friends Solar Energy Logo"
      width={100}
      height={50}
      className="w-auto h-8 print:h-6"
      priority
    />
  )
}

