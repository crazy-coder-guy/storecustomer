interface VelocityScrollProps {
  text?: string
  className?: string
}

export function VelocityScroll({
  text = 'KAIIRA • MODERN ESSENTIALS • NEW SEASON COLLECTION • PREMIUM QUALITY • MINIMALIST APPAREL • EXPRESS SHIPPING •',
  className = '',
}: VelocityScrollProps) {
  const repeatedText = `${text} ${text} `

  return (
    <div className={`relative w-full overflow-hidden bg-black py-4 text-white select-none ${className}`}>
      <div className="flex w-max animate-marquee space-x-6">
        <span className="text-2xl sm:text-4xl font-black uppercase tracking-widest whitespace-nowrap">
          {repeatedText}
        </span>
        <span className="text-2xl sm:text-4xl font-black uppercase tracking-widest whitespace-nowrap" aria-hidden="true">
          {repeatedText}
        </span>
      </div>
    </div>
  )
}
