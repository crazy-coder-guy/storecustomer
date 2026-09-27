import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, Alert02Icon, ImageAdd01Icon, Delete02Icon } from '@hugeicons/core-free-icons'
import { submitExchangeRequest } from '../services/exchange.service'
import { getErrorMessage } from '../services/api'
import type { ExchangeReason } from '../types'

const MAX_IMAGES = 5
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const REASON_OPTIONS: { value: ExchangeReason; label: string }[] = [
  { value: 'DAMAGED', label: 'Item arrived damaged' },
  { value: 'DEFECTIVE', label: 'Item is defective / faulty' },
  { value: 'WRONG_ITEM', label: 'Received the wrong item' },
  { value: 'SIZE_FIT', label: 'Size / fit issue' },
  { value: 'OTHER', label: 'Something else' },
]

interface RequestExchangeModalProps {
  isOpen: boolean
  onClose: () => void
  orderItemId: string
  productName: string
  productImage?: string | null
}

export function RequestExchangeModal({
  isOpen,
  onClose,
  orderItemId,
  productName,
  productImage,
}: RequestExchangeModalProps) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState<ExchangeReason>('DAMAGED')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setReason('DAMAGED')
      setDescription('')
      setImages([])
    }
  }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
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

  function handleReasonSelect(value: ExchangeReason) {
    setReason(value)
    if (value !== 'OTHER') setDescription('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (reason === 'OTHER' && description.trim().length < 1) {
      toast.error('Please describe the issue')
      return
    }
    if (images.length === 0) {
      toast.error('Please attach at least one photo of the issue')
      return
    }

    setIsSubmitting(true)
    try {
      await submitExchangeRequest({ orderItemId, reason, description: description.trim(), images })
      toast.success('Exchange request submitted — we will review it shortly')
      queryClient.invalidateQueries({ queryKey: ['exchange-eligible-items'] })
      queryClient.invalidateQueries({ queryKey: ['my-exchange-requests'] })
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-exchange-title"
      className="fixed inset-0 z-[999] overflow-hidden font-sans"
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 z-10 flex h-full max-h-screen max-w-full pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full max-h-screen animate-drawer-slide-in">
          <div className="shrink-0 flex items-center justify-between border-b border-black/10 px-5 sm:px-6 py-4.5 bg-white/95 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3 min-w-0">
              {productImage ? (
                <div className="h-11 w-9 rounded-xl overflow-hidden bg-neutral-100 border border-black/10 shrink-0">
                  <img src={productImage} alt={productName} className="h-full w-full object-cover object-top" />
                </div>
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-black shrink-0">
                  <HugeiconsIcon icon={Alert02Icon} size={18} strokeWidth={2} />
                </span>
              )}
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-black/45 block">
                  Request Exchange
                </span>
                <h2
                  id="request-exchange-title"
                  className="text-sm sm:text-base font-black tracking-tight text-black leading-tight truncate"
                >
                  {productName}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 hover:bg-black hover:text-white transition-all text-black/70 cursor-pointer shrink-0"
              aria-label="Close Exchange Request Drawer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>
          </div>

          <form
            id="request-exchange-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 scrollbar-none divide-y divide-black/10"
          >
            <div className="pb-6 space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-black">
                What's wrong with this item? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2 pt-0.5">
                {REASON_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleReasonSelect(option.value)}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      reason === option.value
                        ? 'border-black bg-black text-white'
                        : 'border-black/15 text-black/70 hover:border-black/40'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {reason === 'OTHER' && (
              <div className="py-6 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="exchange-description" className="text-xs font-black uppercase tracking-wider text-black">
                    Describe the Issue <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-black/40">{description.length}/2000</span>
                </div>
                <textarea
                  id="exchange-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  maxLength={2000}
                  placeholder="Tell us what happened — e.g. torn fabric, cracked print, wrong size received..."
                  className="w-full rounded-2xl border border-black/15 bg-neutral-50/50 focus:bg-white p-3.5 text-sm font-medium text-black placeholder:text-black/35 focus:border-black focus:outline-none transition-colors resize-none shadow-2xs leading-relaxed"
                />
              </div>
            )}

            <div className="pt-6 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-black">
                  Proof Photos <span className="text-red-500">*</span>{' '}
                  <span className="font-semibold normal-case text-black/40">({images.length}/{MAX_IMAGES})</span>
                </label>
                <span className="text-[11px] font-semibold text-black/40">Max 5MB each</span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {images.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative h-18 w-18 rounded-xl overflow-hidden border border-black/10 bg-neutral-100 group shrink-0"
                  >
                    <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover object-center" />
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
          </form>

          <div className="shrink-0 p-4 sm:p-5 border-t border-black/10 bg-white">
            <button
              form="request-exchange-form"
              type="submit"
              disabled={
                isSubmitting || (reason === 'OTHER' && description.trim().length === 0) || images.length === 0
              }
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black py-3.5 px-5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-900 transition-all cursor-pointer shadow-sm active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting Request…' : 'Submit Exchange Request'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
