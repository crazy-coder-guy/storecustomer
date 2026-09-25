import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Cancel01Icon,
  StarIcon,
  ImageAdd01Icon,
  Video01Icon,
  Delete02Icon,
} from '@hugeicons/core-free-icons'
import { submitReview } from '../services/review.service'
import { getErrorMessage } from '../services/api'

const MAX_IMAGES = 5
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_VIDEO_SIZE = 20 * 1024 * 1024

const RATING_LABELS: Record<number, string> = {
  1: 'Disappointing',
  2: 'Could be better',
  3: 'Average / Fair',
  4: 'Great quality',
  5: 'Exceptional — Loved it!',
}

interface WriteReviewModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  orderId: string
  productName: string
  productImage?: string | null
}

export function WriteReviewModal({
  isOpen,
  onClose,
  productId,
  orderId,
  productName,
  productImage,
}: WriteReviewModalProps) {
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setRating(0)
      setHoverRating(0)
      setComment('')
      setImages([])
      setVideo(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    const oversized = files.find((f) => f.size > MAX_IMAGE_SIZE)
    if (oversized) {
      toast.error('Each photo must be under 5MB')
      return
    }
    setImages((prev) => [...prev, ...files].slice(0, MAX_IMAGES))
  }

  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_VIDEO_SIZE) {
      toast.error('Video must be under 20MB')
      return
    }
    setVideo(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating < 1) {
      toast.error('Please select a star rating')
      return
    }
    if (comment.trim().length < 1) {
      toast.error('Please write a short review')
      return
    }

    setIsSubmitting(true)
    try {
      await submitReview({ productId, orderId, rating, comment: comment.trim(), images, video })
      toast.success('Your review has been posted')
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] })
      queryClient.invalidateQueries({ queryKey: ['reviewable-products'] })
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeStarCount = hoverRating || rating

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="write-review-title"
      className="fixed inset-0 z-[999] overflow-hidden font-sans"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
      />

      {/* Right-Side Drawer Container */}
      <div className="fixed inset-y-0 right-0 z-10 flex h-full max-h-screen max-w-full pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full max-h-screen animate-drawer-slide-in">
          {/* Sticky Header */}
          <div className="shrink-0 flex items-center justify-between border-b border-black/10 px-5 sm:px-6 py-4.5 bg-white/95 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3 min-w-0">
              {productImage ? (
                <div className="h-11 w-9 rounded-xl overflow-hidden bg-neutral-100 border border-black/10 shrink-0">
                  <img
                    src={productImage}
                    alt={productName}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-black shrink-0">
                  <HugeiconsIcon icon={StarIcon} size={18} strokeWidth={2} />
                </span>
              )}
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-black/45 block">
                  Write Review
                </span>
                <h2 id="write-review-title" className="text-sm sm:text-base font-black tracking-tight text-black leading-tight truncate">
                  {productName}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 hover:bg-black hover:text-white transition-all text-black/70 cursor-pointer shrink-0"
              aria-label="Close Review Drawer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>
          </div>

          {/* Scrollable Form Body - Clean Editorial List Flow */}
          <form id="write-review-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 scrollbar-none divide-y divide-black/10">
            {/* 1. Star Rating */}
            <div className="pb-6 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-black">
                  Your Rating <span className="text-red-500">*</span>
                </label>
                {activeStarCount > 0 && (
                  <span className="text-xs font-bold text-black/70 animate-fade-in">
                    {RATING_LABELS[activeStarCount]}
                  </span>
                )}
              </div>

              <div
                className="flex items-center gap-2 pt-0.5"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = activeStarCount >= star
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className="tap-press cursor-pointer p-0.5 transition-transform hover:scale-115 active:scale-95"
                      aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    >
                      <HugeiconsIcon
                        icon={StarIcon}
                        size={32}
                        strokeWidth={1.8}
                        className={`transition-colors duration-200 ${
                          isActive ? 'text-amber-400' : 'text-neutral-200 hover:text-amber-200'
                        }`}
                        fill={isActive ? 'currentColor' : 'none'}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Review Textarea */}
            <div className="py-6 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="review-comment" className="text-xs font-black uppercase tracking-wider text-black">
                  Detailed Review <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-black/40">
                  {comment.length}/2000
                </span>
              </div>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={4}
                maxLength={2000}
                placeholder="Describe the fit, fabric heavyweight texture, comfort, and how it holds up..."
                className="w-full rounded-2xl border border-black/15 bg-neutral-50/50 focus:bg-white p-3.5 text-sm font-medium text-black placeholder:text-black/35 focus:border-black focus:outline-none transition-colors resize-none shadow-2xs leading-relaxed"
              />
            </div>

            {/* 3. Photos Attachment */}
            <div className="py-6 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-black">
                  Product Photos <span className="font-semibold normal-case text-black/40">({images.length}/{MAX_IMAGES})</span>
                </label>
                <span className="text-[11px] font-semibold text-black/40">Max 5MB each</span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {images.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative h-18 w-18 rounded-xl overflow-hidden border border-black/10 bg-neutral-100 group shrink-0"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="h-full w-full object-cover object-center"
                    />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 hover:bg-red-600 text-white transition-colors cursor-pointer"
                      aria-label="Remove photo"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={11} />
                    </button>
                  </div>
                ))}

                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex h-18 w-18 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-black/25 hover:border-black text-black/50 hover:text-black transition-colors cursor-pointer shrink-0"
                  >
                    <HugeiconsIcon icon={ImageAdd01Icon} size={18} strokeWidth={2} />
                    <span className="text-[9px] font-bold">Add</span>
                  </button>
                )}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* 4. Video Attachment */}
            <div className="pt-6 space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-black block">
                Garment Video <span className="font-semibold normal-case text-black/40">(optional, max 20MB)</span>
              </label>

              {video ? (
                <div className="flex items-center justify-between gap-2.5 rounded-xl border border-black/10 bg-neutral-50 p-3">
                  <span className="flex items-center gap-2 text-xs font-bold text-black truncate">
                    <HugeiconsIcon icon={Video01Icon} size={16} />
                    <span className="truncate">{video.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setVideo(null)}
                    className="text-black/50 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                    aria-label="Remove video"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={15} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-black/25 px-4 py-2 text-xs font-bold text-black/60 hover:border-black hover:text-black transition-colors cursor-pointer"
                >
                  <HugeiconsIcon icon={Video01Icon} size={15} />
                  <span>Upload Video</span>
                </button>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
            </div>
          </form>

          {/* Sticky Bottom Action Bar with Submit Button */}
          <div className="shrink-0 p-4 sm:p-5 border-t border-black/10 bg-white">
            <button
              form="write-review-form"
              type="submit"
              disabled={isSubmitting || rating === 0 || comment.trim().length === 0}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black py-3.5 px-5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-900 transition-all cursor-pointer shadow-sm active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting Review…' : 'Submit Review'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
