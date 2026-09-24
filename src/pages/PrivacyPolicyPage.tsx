import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { HugeiconsIcon } from '@hugeicons/react'
import { SecurityCheckIcon } from '@hugeicons/core-free-icons'

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 py-10 lg:py-16">
        <div className="kaira-container max-w-4xl">
          {/* Header */}
          <div className="space-y-4 pb-8 border-b border-black/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-xs font-black uppercase tracking-wider text-black">
              <HugeiconsIcon icon={SecurityCheckIcon} size={14} />
              <span>Legal & Transparency</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight uppercase">
              Privacy Policy
            </h1>
            <p className="text-sm font-semibold text-black/60">
              Last updated: September 2026 • Effective for all KAIRA Apparel users
            </p>
          </div>

          {/* Body Content */}
          <div className="py-10 space-y-10 text-sm text-black/80 font-medium leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-black text-black uppercase tracking-wider">
                1. Information We Collect
              </h2>
              <p>
                At KAIRA Apparel, we respect your privacy and are committed to protecting your personal data. When you visit our website, place an order, or create an account, we may collect the following information:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-black/70">
                <li>Personal identification details (Name, Email Address, Phone Number).</li>
                <li>Shipping and billing addresses required for order fulfillment.</li>
                <li>Payment details processed securely through PCI-DSS compliant payment gateways.</li>
                <li>Device information and IP addresses to improve site security and performance.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-black text-black uppercase tracking-wider">
                2. How We Use Your Data
              </h2>
              <p>
                We use the collected information strictly for legitimate business operations, including:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-black/70">
                <li>Processing, packing, and dispatching your orders.</li>
                <li>Sending real-time order updates, tracking numbers, and delivery SMS notifications.</li>
                <li>Providing customer support and handling returns or exchanges.</li>
                <li>Improving our store catalog and personalized shopping experiences.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-black text-black uppercase tracking-wider">
                3. Data Sharing & Third Parties
              </h2>
              <p>
                We value your trust and **never sell or rent your personal information** to third-party marketers. We only share necessary data with trusted service providers who assist in operating our store:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-black/70">
                <li>Logistics and courier partners (for doorstep order delivery).</li>
                <li>Encrypted payment gateway providers (Razorpay, Stripe, UPI processors).</li>
                <li>Analytics providers to monitor and prevent store fraud.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-black text-black uppercase tracking-wider">
                4. Cookies & Tracking Technologies
              </h2>
              <p>
                We use essential session cookies to remember items in your shopping bag, save your active session state, and ensure seamless navigation across our store.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-black text-black uppercase tracking-wider">
                5. Your Rights & Control
              </h2>
              <p>
                You have the right to inspect, update, or request the deletion of your personal data at any time. If you wish to delete your account or opt out of promotional emails, please contact us at <a href="mailto:privacy@kairaapparel.com" className="font-bold underline text-black">privacy@kairaapparel.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
