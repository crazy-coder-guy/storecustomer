import { useNavigate } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'

interface StandaloneHeaderProps {
  title?: string
}

export function StandaloneHeader({ title }: StandaloneHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    // If opened in new tab/window and there's no history, or window can close
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      window.close()
      // Fallback if window.close was blocked by browser
      window.location.href = '/'
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-black/10 py-3.5 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="group flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-black/15 bg-neutral-100 text-black hover:bg-black hover:text-white active:scale-95 transition-all duration-200 cursor-pointer shadow-2xs"
          aria-label="Go Back"
          title="Go Back"
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={22}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
        </button>

        {title && (
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-black/70 truncate max-w-[200px] sm:max-w-xs">
            {title}
          </span>
        )}

        <div className="w-10 sm:w-11" aria-hidden="true" />
      </div>
    </header>
  )
}
