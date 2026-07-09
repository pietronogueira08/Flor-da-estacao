'use client'

import { useState, useRef, MouseEvent } from 'react'
import Link from 'next/link'

export function MagneticInstagram({ text }: { text: string }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLAnchorElement>(null)

  const handleMouse = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return
    const { clientX, clientY } = e
    const { height, width, left, top } = ref.current.getBoundingClientRect()
    const middleX = clientX - (left + width / 2)
    const middleY = clientY - (top + height / 2)
    // Fator de força magnética (0.3 significa que move 30% da distância do centro)
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 })
  }

  const reset = () => {
    setPosition({ x: 0, y: 0 })
    setIsHovered(false)
  }

  return (
    <Link
      ref={ref}
      href="https://www.instagram.com/zaya_loja/"
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={reset}
      className={`font-bodoni text-4xl md:text-5xl italic mb-6 inline-block transition-transform duration-100 ease-out`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        backgroundImage: isHovered 
          ? 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' 
          : 'none',
        WebkitBackgroundClip: isHovered ? 'text' : 'border-box',
        WebkitTextFillColor: isHovered ? 'transparent' : 'inherit',
        color: isHovered ? 'transparent' : 'inherit',
      }}
    >
      {text}
    </Link>
  )
}
