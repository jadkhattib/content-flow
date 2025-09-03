import React from 'react'

interface BotIconProps {
  className?: string
  size?: number
}

export default function BotIcon({ className = "w-8 h-8", size = 32 }: BotIconProps) {
  return (
    <div className={`${className} rounded-full bg-[#2d2d2d] flex items-center justify-center overflow-hidden border-2 border-gray-200`}>
      <svg 
        width={size * 0.6} 
        height={size * 0.6} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="50"
          y="65"
          fontSize="60"
          fontFamily="Google Sans, sans-serif"
          fontWeight="300"
          textAnchor="middle"
          fill="white"
        >
          .m
        </text>
      </svg>
    </div>
  )
} 