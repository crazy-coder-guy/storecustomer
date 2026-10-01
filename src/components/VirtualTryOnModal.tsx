import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Cancel01Icon,
  Camera01Icon,
  ShoppingBag01Icon,
  Download01Icon,
  RefreshIcon,
  UserIcon,
  SparklesIcon,
  Add01Icon,
  MinusSignIcon,
  EyeIcon,
  SlashIcon,
} from '@hugeicons/core-free-icons'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatCurrency'
import { formatSizeCode } from '../utils/formatSize'
import { toast } from 'sonner'
import type { ProductDetail, ProductVariant } from '../types'

interface ColorOption {
  id?: string
  name?: string
  hex?: string
  hexCode?: string
}

interface VirtualTryOnModalProps {
  isOpen?: boolean
  onClose: () => void
  product: ProductDetail
  selectedVariant?: ProductVariant | null
  onSelectVariant?: (variant: ProductVariant) => void
  selectedColor?: ColorOption | null
  selectedSize?: string
  onAddToCart?: (variantId: string, quantity: number) => Promise<void> | void
}

export function VirtualTryOnModal({
  isOpen = true,
  onClose,
  product,
  selectedVariant: propSelectedVariant,
  onSelectVariant,
  selectedColor: propSelectedColor,
  selectedSize: propSelectedSize,
  onAddToCart: propOnAddToCart,
}: VirtualTryOnModalProps) {
  const { addToCart } = useCart()

  // Compute active variant considering props
  const [internalVariant, setInternalVariant] = useState<ProductVariant | null>(null)

  const activeVariant = useMemo(() => {
    if (internalVariant) return internalVariant
    if (propSelectedVariant) return propSelectedVariant
    if (product.variants?.length) {
      if (propSelectedColor || propSelectedSize) {
        const found = product.variants.find((v) => {
          const matchColor = !propSelectedColor || v.color?.hexCode === (propSelectedColor.hex || propSelectedColor.hexCode) || v.color?.name === propSelectedColor.name
          const matchSize = !propSelectedSize || v.size?.code === propSelectedSize
          return matchColor && matchSize
        })
        if (found) return found
      }
      return product.variants[0]
    }
    return null
  }, [internalVariant, propSelectedVariant, propSelectedColor, propSelectedSize, product.variants])

  const selectedVariant = activeVariant
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Camera & Stream states
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [isLoadingCamera, setIsLoadingCamera] = useState(false)

  // Garment overlay adjustment states
  const [scale, setScale] = useState(1.0)
  const [offsetY, setOffsetY] = useState(0) // vertical offset in px
  const [offsetX, setOffsetX] = useState(0) // horizontal offset in px
  const [opacity, setOpacity] = useState(0.92)
  const [showBodyGuide, setShowBodyGuide] = useState(true)
  const [showControls, setShowControls] = useState(true)

  // Dragging state for garment positioning
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Snapshot photo state
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  // Current active garment image
  const primaryImage =
    product.images.find((i) => i.isPrimary)?.imageUrl ||
    product.images[0]?.imageUrl ||
    ''

  const currentGarmentImage = selectedVariant?.color
    ? product.images.find((img) => img.colorId === selectedVariant.colorId)?.imageUrl || primaryImage
    : primaryImage

  // Start Camera Stream with Safari & mobile iOS full compatibility
  const startCamera = useCallback(async () => {
    setIsLoadingCamera(true)

    // Stop existing stream tracks first
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Camera is not supported on this browser or requires HTTPS.')
      setIsLoadingCamera(false)
      return
    }

    let mediaStream: MediaStream | null = null

    // Try optimal resolution first, fall back to simple constraints for iOS Safari
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
    } catch {
      try {
        // Fallback for Safari / mobile browsers that reject strict width/height or exact facingMode
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: facingMode ? { facingMode } : true,
          audio: false,
        })
      } catch (err: any) {
        console.warn('Camera access denied or error:', err)
        const isDenied =
          err?.name === 'NotAllowedError' ||
          err?.name === 'PermissionDeniedError' ||
          err?.name === 'SecurityError'

        if (isDenied) {
          toast.error('Camera permission was denied. Please allow camera in Safari settings.')
        } else {
          toast.error('Could not access camera. Ensure you are on HTTPS or localhost.')
        }
        setIsLoadingCamera(false)
        return
      }
    }

    if (mediaStream) {
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Safari requires explicit call to play() on user gesture or resolved promise
        videoRef.current.play().catch((e) => console.log('Autoplay handled:', e))
      }
    }
    setIsLoadingCamera(false)
  }, [facingMode])

  // Clean up camera stream when modal closes
  useEffect(() => {
    if (isOpen && !capturedPhotoUrl) {
      startCamera()
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [isOpen, facingMode])

  // Prevent background body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  // Toggle Camera Front / Back
  function toggleCameraFacing() {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  // Handle Touch/Mouse Drag to position garment
  function handlePointerDown(e: React.PointerEvent) {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY })
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return
    setOffsetX(e.clientX - dragStart.x)
    setOffsetY(e.clientY - dragStart.y)
  }

  function handlePointerUp() {
    setIsDragging(false)
  }

  // Capture Photo Snapshot
  function captureTryOnPhoto() {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 720
    const height = 960
    canvas.width = width
    canvas.height = height

    // Draw background (video camera stream)
    if (video && video.readyState === 4) {
      // Flip canvas if front facing camera
      ctx.save()
      if (facingMode === 'user') {
        ctx.translate(width, 0)
        ctx.scale(-1, 1)
      }
      ctx.drawImage(video, 0, 0, width, height)
      ctx.restore()
      overlayGarmentAndSave(ctx, width, height)
    } else {
      // Fallback white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      overlayGarmentAndSave(ctx, width, height)
    }
  }

  function overlayGarmentAndSave(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    const garment = new Image()
    garment.crossOrigin = 'anonymous'
    garment.onload = () => {
      const garmentW = canvasWidth * 0.65 * scale
      const garmentH = (garment.height / garment.width) * garmentW
      const posX = canvasWidth / 2 - garmentW / 2 + offsetX
      const posY = canvasHeight * 0.22 + offsetY

      ctx.globalAlpha = opacity
      ctx.drawImage(garment, posX, posY, garmentW, garmentH)
      ctx.globalAlpha = 1.0

      // Add KAIIRA Watermark Stamp at bottom right
      ctx.fillStyle = 'rgba(0,0,0,0.75)'
      ctx.font = 'bold 16px Outfit, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(`KAIIRA VIRTUAL TRY-ON • ${product.name}`, canvasWidth - 24, canvasHeight - 24)

      const snapshot = ctx.canvas.toDataURL('image/png')
      setCapturedPhotoUrl(snapshot)
    }
    garment.src = currentGarmentImage
  }

  // Save Captured Photo to device
  function downloadSnapshot() {
    if (!capturedPhotoUrl) return
    const link = document.createElement('a')
    link.href = capturedPhotoUrl
    link.download = `kaiira-virtual-fit-${product.slug}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Try-on photo saved!')
  }

  // Handle Quick Add to Bag
  async function handleAddToCart() {
    if (!selectedVariant) {
      toast.error('Please select a size first')
      return
    }
    setIsAdding(true)
    try {
      if (propOnAddToCart) {
        await propOnAddToCart(selectedVariant.id, 1)
      } else {
        await addToCart(selectedVariant.id, 1)
      }
      toast.success(`${product.name} (${formatSizeCode(selectedVariant.size?.code)}) added to bag!`)
    } finally {
      setIsAdding(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-fade-in font-sans text-white select-none"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header Controls Bar */}
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-black/80 backdrop-blur-md border-b border-white/10 z-30">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white border border-white/15">
            <HugeiconsIcon icon={SparklesIcon} size={16} className="text-amber-400" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-black tracking-tight text-white leading-tight">
              Virtual Try-On Room
            </h3>
            <p className="text-[11px] font-medium text-white/60 truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Toolbar Controls Button */}
          <button
            type="button"
            onClick={() => setShowControls((v) => !v)}
            className="tap-press flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15"
            title={showControls ? 'Hide Controls' : 'Show Controls'}
          >
            <HugeiconsIcon icon={showControls ? EyeIcon : SlashIcon} size={16} />
          </button>

          {/* Switch Camera Button */}
          <button
            type="button"
            onClick={toggleCameraFacing}
            className="tap-press flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15"
            title="Flip Camera"
          >
            <HugeiconsIcon icon={RefreshIcon} size={16} />
          </button>

          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="tap-press flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white text-white hover:text-black transition-all cursor-pointer"
            aria-label="Close Try-On Room"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-neutral-950">
        <canvas ref={canvasRef} className="hidden" />

        {/* Snapshot Photo Preview Mode */}
        {capturedPhotoUrl ? (
          <div className="relative h-full w-full flex items-center justify-center p-4">
            <img
              src={capturedPhotoUrl}
              alt="Virtual Try-On Snapshot"
              className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl border border-white/15"
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
              <button
                type="button"
                onClick={() => setCapturedPhotoUrl(null)}
                className="tap-press inline-flex items-center gap-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md px-5 py-2.5 text-xs font-bold text-white border border-white/20 transition-all cursor-pointer"
              >
                <HugeiconsIcon icon={RefreshIcon} size={14} />
                <span>Retake Photo</span>
              </button>

              <button
                type="button"
                onClick={downloadSnapshot}
                className="tap-press inline-flex items-center gap-2 rounded-2xl bg-white text-black px-6 py-2.5 text-xs font-black shadow-lg hover:bg-neutral-100 transition-all cursor-pointer"
              >
                <HugeiconsIcon icon={Download01Icon} size={15} />
                <span>Save Look</span>
              </button>
            </div>
          </div>
        ) : (
          /* Live Camera Feed View */
          <div
            className="relative h-full w-full flex items-center justify-center overflow-hidden touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Background Stream (Video Camera Feed) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={(e) => {
                e.currentTarget.play().catch(() => {})
              }}
              className={`h-full w-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Camera Loading Overlay */}
            {isLoadingCamera && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/80 backdrop-blur-xs z-10 space-y-3">
                <span className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <p className="text-xs font-bold text-white/80">Opening live camera…</p>
              </div>
            )}

            {/* Body Pose Outline Silhouette Guide */}
            {showBodyGuide && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10 opacity-30">
                <svg viewBox="0 0 200 300" className="h-[75%] w-auto stroke-white fill-none stroke-[1.5] stroke-dasharray-[4]">
                  {/* Head & Neck Guide */}
                  <circle cx="100" cy="45" r="24" />
                  <path d="M92 68 H108 V82 H92 Z" />
                  {/* Shoulders & Upper Body Guide */}
                  <path d="M40 95 C60 85, 140 85, 160 95 L175 140 L155 150 L145 120 V250 H55 V120 L45 150 L25 140 Z" />
                </svg>
              </div>
            )}

            {/* Garment Drag & Scale Overlay Layer */}
            <div
              className="absolute z-20 cursor-grab active:cursor-grabbing transition-transform duration-75"
              style={{
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
                opacity,
              }}
            >
              <img
                src={currentGarmentImage}
                alt={product.name}
                draggable={false}
                className="w-[280px] sm:w-[340px] h-auto object-contain pointer-events-none drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)]"
              />
            </div>

            {/* Floating Adjustments Toolbar */}
            {showControls && (
              <div className="absolute right-3 top-3 z-30 flex flex-col gap-2 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/15">
                <button
                  type="button"
                  onClick={() => setScale((s) => Math.min(s + 0.08, 1.8))}
                  className="tap-press h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  title="Zoom In Garment"
                >
                  <HugeiconsIcon icon={Add01Icon} size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setScale((s) => Math.max(s - 0.08, 0.5))}
                  className="tap-press h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  title="Zoom Out Garment"
                >
                  <HugeiconsIcon icon={MinusSignIcon} size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setOpacity((o) => (o > 0.85 ? 0.6 : o > 0.55 ? 0.35 : 0.95))}
                  className="tap-press h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-[9px] font-black"
                  title="Toggle Garment Opacity"
                >
                  {Math.round(opacity * 100)}%
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOffsetX(0)
                    setOffsetY(0)
                    setScale(1.0)
                    setOpacity(0.92)
                  }}
                  className="tap-press h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  title="Reset Position"
                >
                  <HugeiconsIcon icon={RefreshIcon} size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowBodyGuide((v) => !v)}
                  className={`tap-press h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                    showBodyGuide ? 'bg-white text-black font-bold' : 'bg-white/10 text-white'
                  }`}
                  title="Toggle Body Outline Guide"
                >
                  <HugeiconsIcon icon={UserIcon} size={15} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls & Purchase Footer Bar */}
      <div className="shrink-0 bg-black/90 backdrop-blur-md border-t border-white/10 px-4 sm:px-6 py-4 space-y-3.5 z-30">
        
        {/* Color & Size Variant Quick Switcher */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
          {/* Colors Selection */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Color:</span>
            {product.variants.map((v) => v.color).filter((c, idx, self) => c && self.findIndex((t) => t?.id === c.id) === idx).map((color) => {
              if (!color) return null
              const isSelected = selectedVariant?.colorId === color.id
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => {
                    const match = product.variants.find((v) => v.colorId === color.id)
                    if (match) {
                      setInternalVariant(match)
                      if (onSelectVariant) onSelectVariant(match)
                    }
                  }}
                  className={`h-6 w-6 rounded-full border transition-transform cursor-pointer ${
                    isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'border-white/20 opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.hexCode }}
                  title={color.name}
                />
              )
            })}
          </div>

          {/* Size Selection */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Size:</span>
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setInternalVariant(v)
                  if (onSelectVariant) onSelectVariant(v)
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all ${
                  selectedVariant?.id === v.id
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {formatSizeCode(v.size?.code || v.size?.name)}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: Snap Photo + Add to Bag */}
        <div className="flex items-center gap-3">
          {/* Snap Try-On Photo */}
          <button
            type="button"
            onClick={captureTryOnPhoto}
            className="tap-press flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 py-3 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer active:scale-95"
          >
            <HugeiconsIcon icon={Camera01Icon} size={16} />
            <span>Snap Photo</span>
          </button>

          {/* Add Selected Garment to Bag */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="tap-press flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-black py-3 text-xs sm:text-sm font-black shadow-lg hover:bg-neutral-100 transition-all cursor-pointer disabled:opacity-60 active:scale-95"
          >
            <HugeiconsIcon icon={ShoppingBag01Icon} size={16} />
            <span>{isAdding ? 'Adding…' : `Buy Now • ${formatCurrency(product.basePrice)}`}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
