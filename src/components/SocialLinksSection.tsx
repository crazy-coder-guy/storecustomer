export function SocialLinksSection() {
  return (
    <div className="pt-6 border-t border-black/10 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-black" />
        <span className="text-xs font-black uppercase tracking-wider text-black">Follow Our Channels:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Instagram */}
        <a
          href="https://www.instagram.com/hello.kaiiraofficial"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-neutral-50 px-3.5 py-2 text-xs font-bold text-black hover:bg-black hover:text-white transition-all cursor-pointer group shadow-2xs"
          title="Instagram"
        >
          <svg className="h-3.5 w-3.5 fill-current text-black group-hover:text-white transition-colors" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span>Instagram</span>
        </a>

        {/* Facebook */}
        <a
          href="https://www.facebook.com/hello.kaiiraofficia"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-neutral-50 px-3.5 py-2 text-xs font-bold text-black hover:bg-black hover:text-white transition-all cursor-pointer group shadow-2xs"
          title="Facebook"
        >
          <svg className="h-3.5 w-3.5 fill-current text-black group-hover:text-white transition-colors" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Facebook</span>
        </a>

        {/* Threads */}
        <a
          href="https://www.threads.com/@hello.kaiiraofficial"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-neutral-50 px-3.5 py-2 text-xs font-bold text-black hover:bg-black hover:text-white transition-all cursor-pointer group shadow-2xs"
          title="Threads"
        >
          <svg className="h-3.5 w-3.5 fill-current text-black group-hover:text-white transition-colors" viewBox="0 0 24 24">
            <path d="M12.186 24c-3.14 0-5.666-.998-7.51-2.969C2.894 19.123 2 16.273 2 12.495c0-3.955.932-6.91 2.77-8.784C6.67 1.767 9.352.75 12.723.75c3.34 0 6.002.977 7.91 2.906 1.83 1.85 2.76 4.67 2.76 8.384 0 3.86-.94 6.84-2.8 8.87C18.77 22.95 16.03 24 12.51 24h-.324zm.19-21.43c-2.73 0-4.82.79-6.21 2.36-1.42 1.6-2.14 4.09-2.14 7.4 0 3.19.72 5.61 2.14 7.2 1.39 1.55 3.44 2.33 6.1 2.33h.27c2.81 0 4.96-.8 6.4-2.38 1.48-1.62 2.22-4.08 2.22-7.3 0-3.11-.74-5.46-2.2-7.01-1.42-1.51-3.47-2.28-6.11-2.28h-.47zm-1.89 13.91c-1.8 0-3.08-.43-3.8-1.28-.73-.85-1.09-2.07-1.09-3.63 0-1.62.37-2.88 1.12-3.77.76-.89 1.95-1.34 3.55-1.34 1.72 0 2.97.47 3.73 1.4.75.92 1.13 2.16 1.13 3.69 0 1.58-.38 2.82-1.13 3.69-.75.87-1.92 1.31-3.51 1.31h-.001zm.19-8.4c-1.12 0-1.93.3-2.42.9-.49.6-.74 1.47-.74 2.62 0 1.12.25 1.97.74 2.54.49.58 1.28.87 2.37.87s1.88-.29 2.37-.87c.49-.57.74-1.42.74-2.54 0-1.15-.25-2.02-.74-2.62-.49-.6-1.3-.9-2.42-.9z"/>
          </svg>
          <span>Threads</span>
        </a>

        {/* YouTube */}
        <a
          href="https://www.youtube.com/@hello.KaiiraOfficial"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-neutral-50 px-3.5 py-2 text-xs font-bold text-black hover:bg-black hover:text-white transition-all cursor-pointer group shadow-2xs"
          title="YouTube"
        >
          <svg className="h-3.5 w-3.5 fill-current text-black group-hover:text-white transition-colors" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span>YouTube</span>
        </a>
      </div>
    </div>
  )
}
