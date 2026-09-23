import { useState } from 'react'
import { StandaloneHeader } from '../components/StandaloneHeader'
import { ScrollWipeKaira } from '../components/ScrollWipeKaira'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'

export function ReturnsPage() {
  const [returnId, setReturnId] = useState('')
  const [reason, setReason] = useState('size_exchange')
  const [initiated, setInitiated] = useState(false)

  const steps = [
    {
      num: '01',
      title: '7-Day Return Window',
      desc: 'Submit your request using the self-serve form below or email us within 7 days of package delivery.',
    },
    {
      num: '02',
      title: 'Free Reverse Doorstep Pickup',
      desc: 'Our logistics partner collects the parcel from your doorstep. No printing or packaging labels required.',
    },
    {
      num: '03',
      title: 'Instant Exchange or Refund',
      desc: 'Your replacement size is dispatched instantly or the full refund is credited to your bank/UPI within 24 to 48 hours.',
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!returnId.trim()) return
    setInitiated(true)
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-24">
      <StandaloneHeader title="Returns & Exchanges" />

      <main className="kaira-container max-w-4xl pt-10 sm:pt-16 space-y-16">
        {/* Editorial Split Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pb-12 border-b border-black/10">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-3.5 py-1 text-xs font-semibold text-black">
              <span>Hassle-Free Policy</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black leading-[1.08]">
              Easy Returns. Free Exchanges.
            </h1>
            <p className="text-base sm:text-lg text-black/75 font-medium leading-relaxed">
              Every KAIRA purchase comes with a 7-day no-questions-asked return and free size exchange guarantee.
            </p>
          </div>

          {/* Form */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {initiated ? (
              <div className="space-y-4 py-4 animate-fade-in-up">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-black">Return Registered!</h3>
                  <p className="text-sm text-black/70 font-medium leading-relaxed mt-2">
                    Request for Order #{returnId} has been logged. Our carrier partner will arrive for reverse pickup within 24 to 48 hours.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInitiated(false)}
                  className="rounded-full bg-black px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-black/60 mb-2">
                    Order ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={returnId}
                    onChange={(e) => setReturnId(e.target.value)}
                    placeholder="e.g. KR-84920"
                    className="w-full border-b-2 border-black/20 bg-transparent py-3 px-1 text-base font-semibold text-black placeholder:text-black/30 focus:border-black focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-black/60 mb-2">
                    Request Type *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border-b-2 border-black/20 bg-transparent py-3 px-1 text-sm font-semibold text-black focus:border-black focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="size_exchange">Exchange Size (Need Larger / Smaller)</option>
                    <option value="color_exchange">Exchange Color / Style</option>
                    <option value="refund_upi">Return & Refund to UPI / Bank Account</option>
                    <option value="defective">Fabric / Stitch Quality Defect</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto rounded-full bg-black px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer shadow-md"
                  >
                    Request Doorstep Pickup
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* 3 Steps Overview */}
        <div className="divide-y divide-black/10 border-b border-black/10 pb-12">
          {steps.map((s) => (
            <div key={s.num} className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-2">
                <span className="text-3xl font-black text-black/20">{s.num}</span>
              </div>
              <div className="md:col-span-4">
                <h3 className="text-xl font-black text-black">{s.title}</h3>
              </div>
              <div className="md:col-span-6">
                <p className="text-sm sm:text-base text-black/75 font-normal leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Policy Conditions */}
        <div className="space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-black/40">Important Terms</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm sm:text-base text-black/75 font-normal leading-relaxed">
            <p>
              • Garments must be in unworn, unwashed condition with original studio tags and barcodes attached.
            </p>
            <p>
              • Refunds for prepaid orders are credited back to the original payment source within 24-48 hours of pickup.
            </p>
          </div>
        </div>
      </main>

      {/* Smooth Scroll Wipe Out KAIRA Text */}
      <ScrollWipeKaira subtitle="Hassle-free doorstep pickup & quick exchanges on unworn garments." />
    </div>
  )
}
