import Image from "next/image"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { img: "w-8 h-8", text: "text-base", subtext: "text-xs" },
    md: { img: "w-12 h-12", text: "text-xl", subtext: "text-xs" },
    lg: { img: "w-20 h-20", text: "text-3xl", subtext: "text-sm" },
  }

  const currentSize = sizes[size]

  if (!showText) {
    return (
      <img 
        src="/k2-logo.svg" 
        alt="K² Enterprise" 
        className={`${currentSize.img} ${className}`}
      />
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/k2-logo.svg" 
        alt="K² Enterprise" 
        className={currentSize.img}
      />
      <div>
        <h1 className={`${currentSize.text} font-bold text-foreground leading-tight`}>
          K² Enterprise
        </h1>
        <p className={`${currentSize.subtext} text-muted-foreground`}>
          Equipment Services
        </p>
      </div>
    </div>
  )
}

