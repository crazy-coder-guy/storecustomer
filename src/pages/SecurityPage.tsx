import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { HugeiconsIcon } from '@hugeicons/react'
import { SecurityCheckIcon, ShieldKeyIcon, LockKeyIcon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'

export function SecurityPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 py-10 lg:py-16">
        <div className="kaira-container max-w-4xl">
          {/* Header */}
          <div className="space-y-4 pb-8 border-b border-black/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-xs font-black uppercase tracking-wider text-black">
              <HugeiconsIcon icon={SecurityCheckIcon} size={14} />
              <span>Trust & Safety</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight uppercase">
              Store Security
            </h1>
            <p className="text-sm font-semibold text-black/60">
              How we protect your payments, account data, and shopping experience
            </p>
          </div>

          {/* Grid of Security Features */}
          <div className="py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-50 border border-black/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center">
                <HugeiconsIcon icon={LockKeyIcon} size={20} />
              </div>
              <h3 className="text-base font-black text-black">256-Bit SSL Encryption</h3>
              <p className="text-xs font-medium text-black/70 leading-relaxed">
                All network communications between your browser and our servers are encrypted with TLS 1.3 AES-256 bit encryption.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 border border-black/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center">
                <HugeiconsIcon icon={ShieldKeyIcon} size={20} />
              </div>
              <h3 className="text-base font-black text-black">PCI-DSS Compliant Payments</h3>
              <p className="text-xs font-medium text-black/70 leading-relaxed">
                We never store raw credit/debit card numbers on our servers. All transactions are securely processed via PCI-DSS Level 1 payment gateways.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 border border-black/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />
              </div>
              <h3 className="text-base font-black text-black">OTP & Account Protection</h3>
              <p className="text-xs font-medium text-black/70 leading-relaxed">
                COD verification via one-time passcodes (OTP) ensures authorized deliveries and prevents fraudulent order placement.
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="pb-10 space-y-8 text-sm text-black/80 font-medium leading-relaxed border-t border-black/10 pt-10">
            <section className="space-y-3">
              <h2 className="text-lg font-black text-black uppercase tracking-wider">
                Vulnerability Reporting
              </h2>
              <p>
                If you are a security researcher or customer and discover a potential security flaw in our website, please report it directly to our engineering security team at <a href="mailto:security@kaiiraapparel.com" className="font-bold underline text-black">security@kaiiraapparel.com</a>. We take all security disclosures with extreme urgency.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
