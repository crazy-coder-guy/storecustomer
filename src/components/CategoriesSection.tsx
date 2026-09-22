import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import heavyweightTeeImg from '../assets/Heavyweight T-Shirts.png'
import oversizedTeeImg from '../assets/Oversized.png'
import minimalGraphicTeeImg from '../assets/Minimal Graphic Tees.png'
import hoodiesImg from '../assets/hoodies.png'

export interface CategoryItem {
  id: string
  slug: string
  name: string
  description: string
  itemCount: string
  image: string
  tag?: string
  href: string
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-1',
    slug: 'heavyweight-t-shirts',
    name: 'Heavyweight T-Shirts',
    description: '240+ GSM organic cotton tailored for structured, relaxed drape.',
    itemCount: '24 Products',
    image: heavyweightTeeImg,
    tag: 'Core Collection',
    href: '/category/heavyweight-t-shirts',
  },
  {
    id: 'cat-2',
    slug: 'oversized-drop-shoulder',
    name: 'Oversized & Drop-Shoulder',
    description: 'Relaxed proportions with exaggerated drop shoulders and wide sleeves.',
    itemCount: '18 Products',
    image: oversizedTeeImg,
    tag: 'Trending Fit',
    href: '/category/oversized-drop-shoulder',
  },
  {
    id: 'cat-3',
    slug: 'minimal-graphic-tees',
    name: 'Minimal Graphic Tees',
    description: 'Subtle monochrome line art and screen prints on premium ring-spun cotton.',
    itemCount: '15 Products',
    image: minimalGraphicTeeImg,
    tag: 'New Art Drop',
    href: '/category/minimal-graphic-tees',
  },
  {
    id: 'cat-4',
    slug: 'hoodies-outerwear',
    name: 'Hoodies & Outerwear',
    description: 'French terry crewnecks and fleece hoodies for modular layering.',
    itemCount: '12 Products',
    image: hoodiesImg,
    tag: 'Winter Essentials',
    href: '/category/hoodies-outerwear',
  },
]

export function CategoriesSection() {
  return (
    <section id="categories" className="py-20 sm:py-28 bg-white border-t border-black/5">
      <div className="kaira-container">
        {/* Centered Section Header */}
        <div className="flex flex-col items-center justify-center text-center mb-12 sm:mb-16 max-w-2xl mx-auto space-y-3 border-b border-black/5 pb-8">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-black tracking-tight">
            Shop By Category
          </h2>
          <p className="text-base sm:text-lg font-medium text-black/60">
            Thoughtfully designed categories focused on silhouette, weight, and minimalist aesthetics.
          </p>
        </div>

        {/* Categories Grid - Clean Minimalist Centered Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {CATEGORIES.map((category) => (
            <a
              key={category.id}
              href={category.href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gray-50 border border-black/10 transition-all duration-500 hover:shadow-2xl hover:border-black cursor-pointer text-center"
            >
              {/* Card Image Box */}
              <div className="relative aspect-[4/2.2] w-full overflow-hidden bg-gray-100">
                {/* Floating Tag */}
                {category.tag && (
                  <span className="absolute left-4 top-4 z-10 rounded-full bg-black px-3.5 py-1 text-[11px] font-extrabold text-white uppercase tracking-wider shadow-sm">
                    {category.tag}
                  </span>
                )}

                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Subtle Linear Fade Out at bottom of image */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gray-50 via-gray-50/60 to-transparent" />
              </div>

              {/* Centered Details Below Image */}
              <div className="p-6 pt-2 flex flex-col justify-between flex-1 bg-gray-50 space-y-4 text-center">
                <div className="space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-tight group-hover:text-black/80 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-black/65 font-medium leading-relaxed line-clamp-2 pt-1">
                    {category.description}
                  </p>
                </div>

                {/* Centered Liquid Button Action Link */}
                <div className="pt-2">
                  <div className="group/btn relative flex w-full items-center justify-between overflow-hidden rounded-full border border-black bg-black px-5 py-2.5 transition-all duration-300 shadow-sm cursor-pointer">
                    {/* Liquid Fill Overlay */}
                    <span className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/btn:translate-y-0" />

                    {/* Button Content */}
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-white transition-all duration-300 group-hover/btn:text-black group-hover/btn:-translate-x-1">
                        Explore Category
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black transition-all duration-300 group-hover/btn:bg-black group-hover/btn:text-white">
                        <HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={2.4} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
