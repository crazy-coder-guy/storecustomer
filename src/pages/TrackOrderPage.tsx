import { useState } from 'react'
import { StandaloneHeader } from '../components/StandaloneHeader'
import { ScrollWipeKaira } from '../components/ScrollWipeKaira'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PackageIcon,
  Search01Icon,
  CheckmarkCircle02Icon,
  SecurityCheckIcon,
} from '@hugeicons/core-free-icons'

interface TrackingStep {
  status: string
  date: string
  location: string
  completed: boolean
  current?: boolean
}

export function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phoneOrEmail, setPhoneOrEmail] = useState('')
  const [tracked, setTracked] = useState(false)
  const [loading, setLoading] = useState(false)

  const mockSteps: TrackingStep[] = [
    {
      status: 'Order Placed & Confirmed',
      date: '21 Sep 2026, 04:30 PM',
      location: 'KAIRA Central Studio, Surat',
      completed: true,
    },
    {
      status: 'Quality Inspection & Packed',
      date: '22 Sep 2026, 11:15 AM',
      location: 'Hub 04, Surat Logistics Facility',
      completed: true,
    },
    {
      status: 'In Transit with Express Courier (Delhivery)',
      date: '23 Sep 2026, 08:45 AM',
      location: 'En route to Destination Hub',
      completed: true,
      current: true,
    },
    {
      status: 'Out for Delivery',
      date: 'Expected Tomorrow',
      location: 'Local Delivery Center',
      completed: false,
    },
    {
      status: 'Delivered',
      date: 'Expected by 24 Sep 2026',
      location: 'Doorstep',
      completed: false,
    },
  ]

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setTracked(true)
    }, 400)
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-24">
      <StandaloneHeader title="Order Tracking" />

      <main className="kaira-container max-w-4xl pt-10 sm:pt-16">
        {/* Editorial Split Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pb-12 border-b border-black/10">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-black/15 bg-white px-3.5 py-1 text-xs font-semibold text-black">
              <span>Real-Time Logistics</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black leading-[1.08]">
              Track Your Order
            </h1>
            <p className="text-base sm:text-lg text-black/75 font-medium leading-relaxed">
              Enter your order number and registered contact details to inspect live courier transit milestones.
            </p>
          </div>

          {/* Clean Borderless Form */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-black/60 mb-2">
                  Order ID or AWB Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. KR-94812"
                    className="w-full border-b-2 border-black/20 bg-transparent py-3 pl-8 pr-4 text-base font-semibold text-black placeholder:text-black/30 focus:border-black focus:outline-none transition-colors"
                  />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none">
                    <HugeiconsIcon icon={PackageIcon} size={18} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-black/60 mb-2">
                  Phone Number or Email
                </label>
                <input
                  type="text"
                  required
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="+91 98765 43210 or name@example.com"
                  className="w-full border-b-2 border-black/20 bg-transparent py-3 px-1 text-base font-semibold text-black placeholder:text-black/30 focus:border-black focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto rounded-2xl bg-black px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer shadow-md inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Checking Records...</span>
                  ) : (
                    <>
                      <HugeiconsIcon icon={Search01Icon} size={16} />
                      <span>Track Shipment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Live Tracking Result - Clean Editorial View */}
        {tracked ? (
          <div className="pt-12 space-y-10 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-black/10">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-black/40 block">Shipment Status</span>
                <h3 className="text-3xl font-black text-black tracking-tight mt-1">{orderNumber || 'KR-94812'}</h3>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-black bg-black px-4 py-1.5 text-xs font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span>In Transit • On Schedule</span>
              </div>
            </div>

            {/* Courier Meta Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-b border-black/5 text-sm">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-black/45 block">Courier Partner</span>
                <span className="font-black text-black mt-1 block">Delhivery Express</span>
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-black/45 block">Estimated Delivery</span>
                <span className="font-black text-black mt-1 block">Tomorrow, by 8:00 PM</span>
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-black/45 block">Service Mode</span>
                <span className="font-black text-black mt-1 block">Air Priority Express</span>
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-black/45 block">Destination</span>
                <span className="font-black text-black mt-1 block">Registered Address</span>
              </div>
            </div>

            {/* Timeline Stream */}
            <div className="max-w-2xl py-4 space-y-8">
              {mockSteps.map((step, idx) => (
                <div key={idx} className="relative flex gap-5">
                  {idx < mockSteps.length - 1 && (
                    <div
                      className={`absolute left-3.5 top-8 bottom-0 w-0.5 ${
                        step.completed ? 'bg-black' : 'bg-black/15'
                      }`}
                    />
                  )}

                  <div
                    className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                      step.current
                        ? 'border-2 border-black bg-black text-white ring-4 ring-black/10'
                        : step.completed
                        ? 'bg-black text-white'
                        : 'border border-black/30 bg-white text-black/30'
                    }`}
                  >
                    {step.completed ? (
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-black/40" />
                    )}
                  </div>

                  <div className="flex-1 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <h4 className={`text-base font-extrabold ${step.current ? 'text-black font-black' : 'text-black/85'}`}>
                        {step.status}
                      </h4>
                      <span className="text-xs font-bold text-black/45">{step.date}</span>
                    </div>
                    <p className="text-sm text-black/60 font-medium mt-1">{step.location}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-2 text-xs font-medium text-black/60 border-t border-black/10">
              <HugeiconsIcon icon={SecurityCheckIcon} size={18} className="text-black shrink-0" />
              <span>A secure delivery verification PIN will be sent via SMS before doorstep delivery.</span>
            </div>
          </div>
        ) : (
          <div className="pt-16 pb-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-black/40">Dispatch Speed</span>
              <h4 className="text-lg font-black text-black">Same-Day Dispatch</h4>
              <p className="text-sm text-black/70 font-medium leading-relaxed">
                All confirmed orders placed before 1:00 PM are handed over to our express linehaul the very same afternoon.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-black/40">Verified Transit</span>
              <h4 className="text-lg font-black text-black">Air Surface Linehaul</h4>
              <p className="text-sm text-black/70 font-medium leading-relaxed">
                Continuous telemetry tracking across Delhivery and BlueDart airline transit routes.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-black/40">Customer Support</span>
              <h4 className="text-lg font-black text-black">Need Direct Help?</h4>
              <p className="text-sm text-black/70 font-medium leading-relaxed">
                Reach our concierge desk directly at <span className="font-bold text-black">care@kairaapparel.com</span> for manual order lookups.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Smooth Scroll Wipe Out KAIRA Text */}
      <ScrollWipeKaira subtitle="Seamless tracking and rapid dispatch across all domestic pin codes." />
    </div>
  )
}

