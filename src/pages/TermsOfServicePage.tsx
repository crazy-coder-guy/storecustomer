import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { HugeiconsIcon } from '@hugeicons/react'
import { SecurityCheckIcon } from '@hugeicons/core-free-icons'

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 py-10 lg:py-16">
        <div className="kaira-container max-w-4xl">
          {/* Header */}
          <div className="space-y-4 pb-8 border-b border-black/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-xs font-black uppercase tracking-wider text-black">
              <HugeiconsIcon icon={SecurityCheckIcon} size={14} />
              <span>Legal Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight uppercase">
              Terms of Service
            </h1>
            <p className="text-sm font-semibold text-black/60">
              Last updated: September 2026 • Agreement governing store usage
            </p>
          </div>

          {/* Body Content */}
          <div className="py-10 space-y-10 text-sm text-black/80 font-medium leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-black text-black uppercase tracking-wider">
                1. Overview & Acceptance
              </h2>
              <p>
                By accessing or purchasing from KAIIRA Apparel, you agree to be bound by the terms and conditions outlined below. Please read these terms carefully before placing an order.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-black text-black uppercase tracking-wider">
                2. Product Descriptions & Availability
              </h2>
              <p>
                We take extreme care to display accurate colors, fabrics, and size specifications for all products in our catalog. However, minor variations in shade or biowash finish may occur due to natural fabric dye batches and monitor displays.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-black text-black uppercase tracking-wider">
                3. Pricing & Payments
              </h2>
              <p>
                All prices listed on our store are in Indian Rupees (₹) and include applicable taxes unless specified otherwise. We reserve the right to correct pricing errors or update discounts prior to order dispatch.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-black text-black uppercase tracking-wider">
                4. Orders & Cancellations
              </h2>
              <p>
                Orders may be canceled prior to dispatch directly from your account or by contacting support. Once an order has been shipped with courier tracking, cancellation is subject to our standard 7-Day Return Policy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-black text-black uppercase tracking-wider">
                5. Intellectual Property
              </h2>
              <p>
                All logos, typography, graphics, product photography, and brand design elements on KAIIRA Apparel are the exclusive property of KAIIRA Apparel Inc. Unauthorized copying or redistribution is strictly prohibited.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
