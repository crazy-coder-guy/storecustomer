import { useState } from 'react'
import { StandaloneHeader } from '../components/StandaloneHeader'
import { ScrollWipeKaira } from '../components/ScrollWipeKaira'

export function SizeGuidePage() {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches')
  const [activeTab, setActiveTab] = useState<'shirts' | 'tees' | 'hoodies'>('shirts')

  const sizeData = {
    shirts: {
      title: 'Oversized & Casual Shirts',
      fit: 'Relaxed Oversized Drop-Shoulder Fit',
      inches: [
        { size: 'S', chest: '40 - 42', length: '28.5', shoulder: '20.0', sleeve: '9.0' },
        { size: 'M', chest: '42 - 44', length: '29.5', shoulder: '21.0', sleeve: '9.5' },
        { size: 'L', chest: '44 - 46', length: '30.5', shoulder: '22.0', sleeve: '10.0' },
        { size: 'XL', chest: '46 - 48', length: '31.5', shoulder: '23.0', sleeve: '10.5' },
        { size: 'XXL', chest: '48 - 50', length: '32.5', shoulder: '24.0', sleeve: '11.0' },
      ],
      cm: [
        { size: 'S', chest: '102 - 107', length: '72.4', shoulder: '50.8', sleeve: '22.8' },
        { size: 'M', chest: '107 - 112', length: '74.9', shoulder: '53.3', sleeve: '24.1' },
        { size: 'L', chest: '112 - 117', length: '77.5', shoulder: '55.8', sleeve: '25.4' },
        { size: 'XL', chest: '117 - 122', length: '80.0', shoulder: '58.4', sleeve: '26.6' },
        { size: 'XXL', chest: '122 - 127', length: '82.5', shoulder: '60.9', sleeve: '27.9' },
      ],
    },
    tees: {
      title: 'Heavyweight & Graphic Tees',
      fit: 'Boxy Heavyweight Streetwear Fit',
      inches: [
        { size: 'S', chest: '38 - 40', length: '27.5', shoulder: '19.5', sleeve: '8.5' },
        { size: 'M', chest: '40 - 42', length: '28.5', shoulder: '20.5', sleeve: '9.0' },
        { size: 'L', chest: '42 - 44', length: '29.5', shoulder: '21.5', sleeve: '9.5' },
        { size: 'XL', chest: '44 - 46', length: '30.5', shoulder: '22.5', sleeve: '10.0' },
        { size: 'XXL', chest: '46 - 48', length: '31.5', shoulder: '23.5', sleeve: '10.5' },
      ],
      cm: [
        { size: 'S', chest: '96 - 102', length: '69.8', shoulder: '49.5', sleeve: '21.5' },
        { size: 'M', chest: '102 - 107', length: '72.4', shoulder: '52.0', sleeve: '22.8' },
        { size: 'L', chest: '107 - 112', length: '74.9', shoulder: '54.6', sleeve: '24.1' },
        { size: 'XL', chest: '112 - 117', length: '77.5', shoulder: '57.1', sleeve: '25.4' },
        { size: 'XXL', chest: '117 - 122', length: '80.0', shoulder: '59.6', sleeve: '26.6' },
      ],
    },
    hoodies: {
      title: 'Hoodies & French Terry Sweatshirts',
      fit: 'Structured Heavy Silhouette',
      inches: [
        { size: 'S', chest: '42 - 44', length: '27.0', shoulder: '21.0', sleeve: '24.0' },
        { size: 'M', chest: '44 - 46', length: '28.0', shoulder: '22.0', sleeve: '24.5' },
        { size: 'L', chest: '46 - 48', length: '29.0', shoulder: '23.0', sleeve: '25.0' },
        { size: 'XL', chest: '48 - 50', length: '30.0', shoulder: '24.0', sleeve: '25.5' },
        { size: 'XXL', chest: '50 - 52', length: '31.0', shoulder: '25.0', sleeve: '26.0' },
      ],
      cm: [
        { size: 'S', chest: '107 - 112', length: '68.5', shoulder: '53.3', sleeve: '60.9' },
        { size: 'M', chest: '112 - 117', length: '71.1', shoulder: '55.8', sleeve: '62.2' },
        { size: 'L', chest: '117 - 122', length: '73.6', shoulder: '58.4', sleeve: '63.5' },
        { size: 'XL', chest: '122 - 127', length: '76.2', shoulder: '60.9', sleeve: '64.7' },
        { size: 'XXL', chest: '127 - 132', length: '78.7', shoulder: '63.5', sleeve: '66.0' },
      ],
    },
  }

  const activeCategory = sizeData[activeTab]
  const rows = unit === 'inches' ? activeCategory.inches : activeCategory.cm

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-24">
      <StandaloneHeader title="Size & Fit Guide" />

      <main className="kaira-container max-w-4xl pt-10 sm:pt-16 space-y-12">
        {/* Editorial Hero */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-black/15 bg-white px-3.5 py-1 text-xs font-semibold text-black">
            <span>Precision Tailoring</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black leading-[1.08]">
            Size & Fit Matrix.
          </h1>
          <p className="text-base sm:text-xl text-black/75 font-medium leading-relaxed">
            Find your exact tailored silhouette. All garments are crafted with pre-shrunk fabrics for consistent fitting.
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-black/10">
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap">
            {(['shirts', 'tees', 'hoodies'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`text-sm sm:text-base font-black uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'border-black text-black'
                    : 'border-transparent text-black/40 hover:text-black'
                }`}
              >
                {tab === 'shirts' ? 'Shirts' : tab === 'tees' ? 'T-Shirts' : 'Hoodies & Sweatshirts'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border border-black/20 rounded-2xl p-1 text-xs font-extrabold">
            <button
              type="button"
              onClick={() => setUnit('inches')}
              className={`rounded-2xl px-3 py-1 transition-colors cursor-pointer ${
                unit === 'inches' ? 'bg-black text-white' : 'text-black/60 hover:text-black'
              }`}
            >
              Inches
            </button>
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={`rounded-2xl px-3 py-1 transition-colors cursor-pointer ${
                unit === 'cm' ? 'bg-black text-white' : 'text-black/60 hover:text-black'
              }`}
            >
              Centimeters
            </button>
          </div>
        </div>

        {/* Clean Editorial Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-black/50 uppercase tracking-widest">
            <span>{activeCategory.fit}</span>
            <span>All measurements in {unit}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm sm:text-base">
              <thead>
                <tr className="border-b border-black text-xs font-black uppercase tracking-wider text-black">
                  <th className="py-4 pr-4">Size</th>
                  <th className="py-4 px-4">Chest (Circumference)</th>
                  <th className="py-4 px-4">Length</th>
                  <th className="py-4 px-4">Shoulder Width</th>
                  <th className="py-4 pl-4">Sleeve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 font-semibold text-black/85">
                {rows.map((row) => (
                  <tr key={row.size} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-4 pr-4 font-black text-black text-base">{row.size}</td>
                    <td className="py-4 px-4">{row.chest}</td>
                    <td className="py-4 px-4">{row.length}</td>
                    <td className="py-4 px-4">{row.shoulder}</td>
                    <td className="py-4 pl-4">{row.sleeve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Measuring Guide */}
        <div className="pt-10 border-t border-black/10 space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-black/40">Guidelines</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm sm:text-base text-black/75 font-normal leading-relaxed">
            <div>
              <strong className="font-black text-black block mb-1">1. Chest:</strong>
              Measure around the fullest part of your chest, keeping the tape comfortably horizontal.
            </div>
            <div>
              <strong className="font-black text-black block mb-1">2. Garment Length:</strong>
              Measure straight down from the highest point of the shoulder seam to the lower hemline.
            </div>
            <div>
              <strong className="font-black text-black block mb-1">3. Shoulder Width:</strong>
              Measure straight across the back from the edge of one shoulder bone to the opposite.
            </div>
          </div>
        </div>
      </main>

      {/* Smooth Scroll Wipe Out KAIRA Text */}
      <ScrollWipeKaira subtitle="Tailored drape and relaxed boxy silhouettes calculated to flatter every frame." />
    </div>
  )
}
