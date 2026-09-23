import { useState } from 'react'
import { StandaloneHeader } from '../components/StandaloneHeader'
import { ScrollWipeKaira } from '../components/ScrollWipeKaira'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'

export function ContactPage() {
  const [sent, setSent] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderId: '',
    subject: 'order_inquiry',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-24">
      <StandaloneHeader title="Help & Contact" />

      <main className="kaira-container max-w-4xl pt-10 sm:pt-16 space-y-16">
        {/* Editorial Split Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pb-12 border-b border-black/10">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-3.5 py-1 text-xs font-semibold text-black">
              <span>Customer Concierge</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black leading-[1.08]">
              We Are Here to Assist.
            </h1>
            <p className="text-base sm:text-lg text-black/75 font-medium leading-relaxed">
              Have questions regarding orders, tailoring fit, or personal styling? Our dedicated concierge desk responds within 2 business hours.
            </p>
          </div>

          {/* Form */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {sent ? (
              <div className="space-y-4 py-4 animate-fade-in-up">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-black">Message Dispatched!</h3>
                  <p className="text-sm text-black/70 font-medium leading-relaxed mt-2">
                    Thank you, {formData.name || 'there'}. Ticket #KR-CARE-928 has been assigned and an apparel specialist will reply directly to your email shortly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="rounded-full bg-black px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-black/60 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full border-b-2 border-black/20 bg-transparent py-2.5 px-1 text-sm sm:text-base font-semibold text-black placeholder:text-black/30 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-black/60 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rahul@example.com"
                      className="w-full border-b-2 border-black/20 bg-transparent py-2.5 px-1 text-sm sm:text-base font-semibold text-black placeholder:text-black/30 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-black/60 mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full border-b-2 border-black/20 bg-transparent py-2.5 px-1 text-sm sm:text-base font-semibold text-black placeholder:text-black/30 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-black/60 mb-1.5">
                      Order ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      placeholder="KR-84920"
                      className="w-full border-b-2 border-black/20 bg-transparent py-2.5 px-1 text-sm sm:text-base font-semibold text-black placeholder:text-black/30 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-black/60 mb-1.5">
                    Topic *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full border-b-2 border-black/20 bg-transparent py-2.5 px-1 text-sm font-semibold text-black focus:border-black focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="order_inquiry">Order Status / Delivery Enquiry</option>
                    <option value="exchange_return">Return or Size Exchange Assistance</option>
                    <option value="styling_sizing">Fit Recommendation & Sizing Help</option>
                    <option value="bulk_corporate">Bulk / Studio Ordering</option>
                    <option value="feedback">Product Feedback & Suggestions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-black/60 mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe how our support team can assist you..."
                    className="w-full border-b-2 border-black/20 bg-transparent py-2.5 px-1 text-sm sm:text-base font-semibold text-black placeholder:text-black/30 focus:border-black focus:outline-none transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto rounded-full bg-black px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer shadow-md"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* 3 Channels Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          <div className="space-y-1.5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-black/40">Direct Inbox</span>
            <h4 className="text-xl font-black text-black">Email Support</h4>
            <p className="text-sm text-black/70 font-medium">care@kairaapparel.com</p>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-black/40">Instant Chat</span>
            <h4 className="text-xl font-black text-black">WhatsApp Line</h4>
            <p className="text-sm text-emerald-800 font-bold">+91 91520 44890</p>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-black/40">Studio Hours</span>
            <h4 className="text-xl font-black text-black">Operations</h4>
            <p className="text-sm text-black/70 font-medium">Monday to Saturday • 10:00 AM – 7:30 PM IST</p>
          </div>
        </div>
      </main>

      {/* Smooth Scroll Wipe Out KAIRA Text */}
      <ScrollWipeKaira subtitle="Dedicated concierge team ready to assist with bespoke fit and orders." />
    </div>
  )
}
