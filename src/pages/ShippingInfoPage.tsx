import { StandaloneHeader } from '../components/StandaloneHeader'
import { ScrollWipeKaira } from '../components/ScrollWipeKaira'

export function ShippingInfoPage() {
  const policies = [
    {
      num: '01',
      title: 'Express Standard Delivery',
      time: '3 - 5 Business Days across India',
      cost: 'FREE on orders over ₹1,999 • Flat ₹19 on all others',
      desc: 'Partnered with premier express couriers (Delhivery, BlueDart, Bluedart Air). Metro cities receive priority delivery within 48 to 72 hours with end-to-end milestone notifications.',
    },
    {
      num: '02',
      title: 'Same-Day City Dispatch',
      time: '1 - 2 Business Days',
      cost: 'Available across Mumbai, Bengaluru, Surat & Delhi NCR',
      desc: 'Orders placed before 1:00 PM on working days are packed, quality checked, and handed over to courier hubs on the very same evening.',
    },
    {
      num: '03',
      title: 'Cash on Delivery (COD)',
      time: 'Available pan-India across 27,000+ pin codes',
      cost: 'Zero Extra Surcharges',
      desc: 'Pay cash or scan UPI QR code on the spot at your doorstep when the parcel arrives safely in tamper-proof security packaging.',
    },
  ]

  const faqs = [
    {
      q: 'How do I know when my package has been shipped?',
      a: 'As soon as your package is dispatched from our fulfilment center, an automated notification containing your live Delhivery tracking link and AWB number is sent via SMS and WhatsApp.',
    },
    {
      q: 'Do you ship to remote pin codes and North-East India?',
      a: 'Yes, we service 27,000+ pin codes across India through partnerships with Delhivery Express, Ecom Express, and India Post Speed Post.',
    },
    {
      q: 'What if I am unavailable during delivery attempts?',
      a: 'Our delivery partners make up to 3 doorstep delivery attempts. You can also reschedule or provide alternative drop instructions directly via the courier tracking portal.',
    },
  ]

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-24">
      <StandaloneHeader title="Shipping & Delivery" />

      <main className="kaira-container max-w-4xl pt-10 sm:pt-16 space-y-16">
        {/* Editorial Hero */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-3.5 py-1 text-xs font-semibold text-black">
            <span>Fulfilment Standards</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black leading-[1.08]">
            Fast, Reliable Delivery Nationwide.
          </h1>
          <p className="text-base sm:text-xl text-black/75 font-medium leading-relaxed">
            Transparent transit timelines, express courier partners, and zero hidden shipping costs.
          </p>
        </div>

        {/* Clean Editorial Delivery Tiers (No nested cards) */}
        <div className="divide-y divide-black/10 border-y border-black/10">
          {policies.map((p) => (
            <div key={p.num} className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-2">
                <span className="text-3xl sm:text-4xl font-black text-black/20 block">{p.num}</span>
              </div>
              <div className="md:col-span-5 space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-black">{p.title}</h3>
                <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-black/50">
                  {p.time}
                </div>
                <div className="text-xs sm:text-sm font-bold text-emerald-800">
                  {p.cost}
                </div>
              </div>
              <div className="md:col-span-5">
                <p className="text-sm sm:text-base text-black/75 font-normal leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Packaging Standards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-black/40">Packaging Guarantee</span>
            <h4 className="text-lg font-black text-black">Tamper-Proof Box</h4>
            <p className="text-sm text-black/70 font-medium leading-relaxed">
              Every parcel is sealed inside heavy recycled corrugated boxes with high-security reinforced tape.
            </p>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-black/40">Garment Care</span>
            <h4 className="text-lg font-black text-black">Double Quality Inspection</h4>
            <p className="text-sm text-black/70 font-medium leading-relaxed">
              Garments are steamed, thread-trimmed, and barcode inspected before leaving our studio floor.
            </p>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-black/40">Sustainability</span>
            <h4 className="text-lg font-black text-black">100% Compostable Poly</h4>
            <p className="text-sm text-black/70 font-medium leading-relaxed">
              We exclusively use plant-starch biodegradable protective sleeves to protect the garments.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="pt-8 border-t border-black/10 space-y-8">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-black/40">Common Queries</span>
            <h2 className="text-2xl sm:text-3xl font-black text-black">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6 divide-y divide-black/10">
            {faqs.map((f, i) => (
              <div key={i} className="pt-6 first:pt-0 space-y-2">
                <h4 className="text-base sm:text-lg font-black text-black">{f.q}</h4>
                <p className="text-sm sm:text-base text-black/70 font-normal leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Smooth Scroll Wipe Out KAIRA Text */}
      <ScrollWipeKaira subtitle="Worldwide standards. Sustainable zero-plastic packaging on all shipments." />
    </div>
  )
}
