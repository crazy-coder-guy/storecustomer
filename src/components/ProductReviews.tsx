import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { StarIcon, CheckmarkCircle02Icon, UserIcon } from '@hugeicons/core-free-icons'
import { useAuth } from '../context/AuthContext'
import { useProductReviews, useReviewableProducts } from '../hooks/queries'
import { formatDate } from '../utils/formatDate'
import { WriteReviewModal } from './WriteReviewModal'
import type { Review } from '../types'

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <HugeiconsIcon
          key={star}
          icon={StarIcon}
          size={size}
          className={star <= Math.round(rating) ? 'text-amber-500' : 'text-neutral-200'}
          fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <div className="py-5 border-b border-black/10 last:border-b-0">
      <div className="flex items-center justify-between gap-3 pb-1.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-black/50 shrink-0">
            {review.reviewerPhoto ? (
              <img src={review.reviewerPhoto} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              <HugeiconsIcon icon={UserIcon} size={15} />
            )}
          </div>
          <div>
            <p className="text-xs font-extrabold text-black">{review.reviewerName}</p>
            <p className="text-[10px] font-semibold text-black/45">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>

      {review.verifiedPurchase && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mb-2">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
          Verified Purchase
        </span>
      )}

      <p className="text-sm text-black/80 font-medium leading-relaxed">{review.comment}</p>

      {(review.images.length > 0 || review.video) && (
        <div className="flex flex-wrap gap-2 pt-3">
          {review.images.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setLightbox(url)}
              className="h-16 w-16 rounded-xl overflow-hidden border border-black/10 cursor-pointer shrink-0"
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
          {review.video && (
            <video
              src={review.video}
              controls
              className="h-16 w-24 rounded-xl border border-black/10 object-cover shrink-0"
            />
          )}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-h-[85vh] w-auto max-w-full object-contain rounded-xl" />
        </div>
      )}
    </div>
  )
}

export function ProductReviews({
  productId,
  productName,
  productImage,
}: {
  productId: string
  productName: string
  productImage?: string | null
}) {
  const { user } = useAuth()
  const [visibleCount, setVisibleCount] = useState(5)
  const [isWriteOpen, setIsWriteOpen] = useState(false)
  const { data, isLoading } = useProductReviews(productId, visibleCount)
  const { data: reviewable = [] } = useReviewableProducts(Boolean(user))

  const eligible = reviewable.find((r) => r.productId === productId)
  const summary = data?.summary
  const reviews = data?.items ?? []
  const totalCount = summary?.count ?? 0

  return (
    <section className="pt-6 mt-6 border-t border-black/10">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-black/40">
            Customer Feedback
          </p>
          <h2 className="text-base sm:text-lg font-black text-black tracking-tight">
            Ratings & Reviews
          </h2>
        </div>
        {summary && summary.count > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-black">
              {summary.average.toFixed(1)}
            </span>
            <Stars rating={summary.average} size={13} />
            <span className="text-[11px] font-semibold text-black/45">
              ({totalCount})
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="h-24 rounded-2xl bg-neutral-50 animate-pulse" />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 pb-6 border-b border-black/10">
            <div className="flex flex-col items-center sm:items-start gap-1.5 shrink-0">
              <span className="text-4xl font-black text-black leading-none">
                {summary && summary.count > 0 ? summary.average.toFixed(1) : '—'}
              </span>
              <Stars rating={summary?.average ?? 0} size={15} />
              <span className="text-xs font-semibold text-black/50">
                {totalCount} {totalCount === 1 ? 'rating' : 'ratings'}
              </span>
            </div>

            {summary && summary.count > 0 && (
              <div className="flex-1 space-y-1.5 max-w-sm">
                {([5, 4, 3, 2, 1] as const).map((star) => {
                  const count = summary.breakdown[String(star) as '1' | '2' | '3' | '4' | '5'] ?? 0
                  const pct = totalCount > 0 ? (count / totalCount) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs font-bold text-black/60">
                      <span className="w-3">{star}</span>
                      <HugeiconsIcon icon={StarIcon} size={11} className="text-amber-500" fill="currentColor" />
                      <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-right text-black/40">{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {eligible && (
            <div className="py-5 border-b border-black/10">
              <button
                type="button"
                onClick={() => setIsWriteOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition-all cursor-pointer active:scale-95"
              >
                <HugeiconsIcon icon={StarIcon} size={14} />
                <span>Write a Review</span>
              </button>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="py-8 text-sm font-semibold text-black/50 text-center">
              No reviews yet. Be the first to share your experience.
            </p>
          ) : (
            <div>
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
              {totalCount > reviews.length && (
                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((v) => v + 5)}
                    className="text-xs font-extrabold uppercase tracking-wider text-black underline underline-offset-4 cursor-pointer"
                  >
                    Show More Reviews
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {eligible && (
        <WriteReviewModal
          isOpen={isWriteOpen}
          onClose={() => setIsWriteOpen(false)}
          productId={productId}
          orderId={eligible.orderId}
          productName={productName}
          productImage={productImage}
        />
      )}
    </section>
  )
}
