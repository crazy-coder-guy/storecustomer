import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Cancel01Icon,
  Copy01Icon,
  CheckmarkCircle02Icon,
  StarIcon,
} from '@hugeicons/core-free-icons'

interface ColorItem {
  id?: string
  name: string
  hex: string
}

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  url?: string
  imageUrl?: string
  price?: number
  mrp?: number
  discountPercent?: number | null
  rating?: number | string
  reviewsCount?: number
  colors?: ColorItem[]
}

export function ShareModal({
  isOpen,
  onClose,
  title,
  url,
  imageUrl,
  price,
  mrp,
  discountPercent,
  rating,
  reviewsCount,
  colors = [],
}: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || window.location.href

  useEffect(() => {
    if (isOpen) {
      setCopied(false)
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        const input = document.createElement('input')
        input.value = shareUrl
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
      }
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => {
        setCopied(false)
        onClose()
      }, 1200)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedText = encodeURIComponent(`Check out ${title} on KAIIRA:`)

  const shareApps = [
    {
      name: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      iconBg: '#25D366',
      icon: (
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 2C6.5 2 2 6.5 2 12.031c0 1.906.531 3.703 1.516 5.25L2 22l4.891-1.484A9.97 9.97 0 0 0 12.03 22c5.532 0 10.032-4.5 10.032-10.031C22.063 6.5 17.563 2 12.031 2zm0 18.25c-1.672 0-3.266-.469-4.656-1.312l-.328-.203-3.14.953.953-3.078-.219-.344a8.21 8.21 0 0 1-1.39-4.484c0-4.547 3.703-8.25 8.25-8.25s8.25 3.703 8.25 8.25-3.703 8.25-8.25 8.25zm4.516-6.188c-.25-.125-1.469-.719-1.703-.812-.234-.078-.406-.125-.578.125s-.672.828-.828 1c-.141.172-.297.188-.547.063s-1.047-.391-1.984-1.234c-.734-.656-1.234-1.469-1.375-1.719-.141-.25 0-.375.109-.5.109-.109.25-.281.375-.422.125-.141.172-.25.25-.422.078-.172.047-.328-.016-.453s-.578-1.391-.797-1.906c-.219-.516-.438-.438-.594-.453-.156-.016-.328-.016-.5-.016s-.453.063-.7.328c-.234.25-.906.891-.906 2.172s.922 2.516 1.047 2.688c.125.172 1.813 2.766 4.391 3.875.609.266 1.094.422 1.469.547.625.203 1.188.172 1.641.109.5-.078 1.469-.609 1.672-1.203.203-.594.203-1.094.141-1.203-.063-.109-.234-.172-.484-.297z" />
        </svg>
      ),
    },
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      iconBg: '#000000',
      icon: (
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      iconBg: '#229ED9',
      icon: (
        <svg className="w-5.5 h-5.5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      iconBg: '#1877F2',
      icon: (
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'Email',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}%20${encodedUrl}`,
      iconBg: '#4b5563',
      icon: (
        <svg className="w-5.5 h-5.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
  ]

  const displayDiscount =
    discountPercent && discountPercent > 0
      ? discountPercent
      : mrp && price && mrp > price
      ? Math.round(((mrp - price) / mrp) * 100)
      : null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center sm:p-4"
    >
      {/* Native Sheet Dimmed Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-200 animate-fade-in"
      />

      {/* iOS/Android Style Minimal Clean Bottom Sheet */}
      <div
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 pt-3 sm:pt-5 shadow-2xl z-10 select-none animate-pill-float-up border-t sm:border border-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Drag Indicator Handle (mobile only) */}
        <div className="mx-auto h-1.5 w-10 rounded-full bg-neutral-300 sm:hidden mb-3" />

        {/* Product Snapshot Bar with Image, Title, Price, Offer %, Rating & Color Swatches */}
        <div className="pb-3.5 border-b border-neutral-100 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={title}
                  className="h-16 w-13 rounded-xl object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                />
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <h4 id="sheet-title" className="text-sm font-bold text-neutral-900 truncate leading-snug">
                  {title}
                </h4>

                {/* Price + MRP + Offer % */}
                <div className="flex items-center gap-2 flex-wrap">
                  {price !== undefined && (
                    <span className="text-sm font-black text-black">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                  )}
                  {mrp !== undefined && price !== undefined && mrp > price && (
                    <span className="text-xs font-semibold text-neutral-400 line-through">
                      ₹{mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                  {displayDiscount && (
                    <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md">
                      {displayDiscount}% OFF
                    </span>
                  )}
                </div>

                {/* Rating & Reviews (only when the product actually has reviews) */}
                {rating !== undefined && reviewsCount !== undefined && reviewsCount > 0 && (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-800">
                      <HugeiconsIcon icon={StarIcon} size={12} className="text-amber-500 fill-amber-500" />
                      <span>{rating}</span>
                    </div>
                    <span className="text-neutral-300 text-[10px]">•</span>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      {reviewsCount} reviews
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:text-black cursor-pointer shrink-0"
              aria-label="Close"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} />
            </button>
          </div>

          {/* Color Palette Swatches */}
          {colors && colors.length > 0 && (
            <div className="flex items-center gap-2 pt-1 border-t border-neutral-50">
              <span className="text-[11px] font-semibold text-neutral-500">
                Available Colors:
              </span>
              <div className="flex items-center gap-1.5">
                {colors.map((c, i) => (
                  <span
                    key={c.id || i}
                    className="h-3.5 w-3.5 rounded-full border border-black/20 shadow-2xs"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
                <span className="text-[10px] font-bold text-neutral-400">
                  ({colors.length})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Clean Native App Icons Row */}
        <div className="py-4">
          <div className="flex items-center justify-around gap-1 text-center">
            {shareApps.map((app) => (
              <a
                key={app.name}
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onClose()}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs group-hover:scale-105 active:scale-95 transition-transform"
                  style={{ backgroundColor: app.iconBg }}
                >
                  {app.icon}
                </div>
                <span className="text-[11px] font-medium text-neutral-700">
                  {app.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Clean "Copy Link" Action Row */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900'
            }`}
          >
            <HugeiconsIcon
              icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
              size={16}
            />
            <span>{copied ? 'Copied to Clipboard' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
