import Link from 'next/link'
import { Instagram, Facebook, ArrowUpRight } from 'lucide-react'
import { siteConfig } from '~/config/site'

export function SiteFooter() {
  const brandName =
    siteConfig.ownerName === 'Photographer Name'
      ? siteConfig.title
      : siteConfig.ownerName

  return (
    <footer className="border-t border-white/10 bg-[#0d0d0c] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_0.6fr_0.6fr]">
          <div>
            <Link href="/" className="font-serif text-3xl tracking-tight">
              {brandName}
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/45">
              Thoughtful photography for people, celebrations and brands —
              created with a documentary eye and an editorial finish.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/35">
              Explore
            </p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/65">
              <Link href="/" className="transition hover:text-white">Portfolio</Link>
              <Link href="/book" className="transition hover:text-white">About</Link>
              <Link href="/blog" className="transition hover:text-white">Journal</Link>
              {siteConfig.features.storeEnabled && (
                <Link href="/store" className="transition hover:text-white">Print store</Link>
              )}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/35">
              Connect
            </p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/65">
              {siteConfig.links.instagram && (
                <Link
                  href={siteConfig.links.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition hover:text-white"
                >
                  <Instagram className="h-4 w-4" /> Instagram
                </Link>
              )}
              {siteConfig.links.facebook && (
                <Link
                  href={siteConfig.links.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition hover:text-white"
                >
                  <Facebook className="h-4 w-4" /> Facebook
                </Link>
              )}
              <Link
                href="/book"
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                Enquire <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.18em] text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {brandName}</span>
          <span>Photography • Film • Stories</span>
        </div>
      </div>
    </footer>
  )
}
