import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import heavyweightTeeImg from '../assets/Heavyweight T-Shirts.png'
import oversizedTeeImg from '../assets/Oversized.png'
import minimalGraphicTeeImg from '../assets/Minimal Graphic Tees.png'
import hoodiesImg from '../assets/hoodies.png'
import { useCategories } from '../hooks/queries'

// The backend does not provide category imagery, so a small rotating set of
// local placeholder banners is used, cycling by position for however many
// real categories come back from the API.
const CATEGORY_FALLBACK_IMAGES = [heavyweightTeeImg, oversizedTeeImg, minimalGraphicTeeImg, hoodiesImg]

export function CategoriesSection() {
  const { data, isLoading, isError } = useCategories({ status: 'ACTIVE', limit: 50 })
  const categories = data?.items ?? []

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
        {isError ? (
          <p className="text-center text-sm font-semibold text-black/50">
            Unable to load categories right now.
          </p>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/3.3] rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? null : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {categories.map((category, idx) => (
              <a
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gray-50 border border-black/10 transition-all duration-500 hover:shadow-2xl hover:border-black cursor-pointer text-center"
              >
                {/* Card Image Box */}
                <div className="relative aspect-[4/2.2] w-full overflow-hidden bg-gray-100">
                  {category.badge && (
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-black px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                      {category.badge}
                    </span>
                  )}
                  <img
                    src={CATEGORY_FALLBACK_IMAGES[idx % CATEGORY_FALLBACK_IMAGES.length]}
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
                      {category.description || 'Explore this curated collection of modern essentials.'}
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
        )}
      </div>
    </section>
  )
}
