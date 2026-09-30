import React from 'react'
import Link from 'next/link'
import { ArrowUpRight, Camera, Heart, Sparkles } from 'lucide-react'
import { db } from '~/server/db'
import { eq } from 'drizzle-orm'
import { imageData, galleryConfig } from '~/server/db/schema'
import { siteConfig } from '~/config/site'
import { ImageGallery } from '~/components/image-gallery-grid'
import { GetStartedMessage } from '~/components/GetStartedMessage'
import { checkAdminSetupRequiredSafe } from '~/lib/auth/authDatabase'
import { getSession } from '~/lib/auth/auth'
import type { GalleryConfigData } from '~/lib/actions/gallery/gallery-config'

export const revalidate = 3600

const services = [
  {
    title: 'Weddings',
    description:
      'Honest, cinematic coverage for celebrations, quiet moments and everything between.',
    icon: Heart,
  },
  {
    title: 'Portraits',
    description:
      'Editorial portraits with thoughtful direction, natural expression and timeless finishing.',
    icon: Camera,
  },
  {
    title: 'Brand & Events',
    description:
      'High-impact visual stories for businesses, launches, teams and unforgettable gatherings.',
    icon: Sparkles,
  },
]

export default async function Home() {
  const result = await db
    .select({
      id: imageData.id,
      description: imageData.description,
      order: imageData.order,
      fileUrl: imageData.fileUrl,
      name: imageData.name,
    })
    .from(imageData)
    .where(eq(imageData.visible, true))
    .orderBy(imageData.order)

  const imageUrls = result.map((item) => ({
    id: item.id,
    description: item.description,
    order: item.order,
    url: item.fileUrl,
    name: item.name,
  }))

  const getGalleryConfig = async (): Promise<GalleryConfigData> => {
    const defaultConfig: GalleryConfigData = {
      columnsMobile: 1,
      columnsTablet: 2,
      columnsDesktop: 3,
      columnsLarge: 4,
      galleryStyle: 'masonry',
      gapSize: 'medium',
    }

    try {
      const gallery = await db
        .select()
        .from(galleryConfig)
        .where(eq(galleryConfig.id, 1))
        .limit(1)

      if (gallery.length === 0) return defaultConfig

      const config = gallery[0]!
      return {
        columnsMobile: config.columnsMobile,
        columnsTablet: config.columnsTablet,
        columnsDesktop: config.columnsDesktop,
        columnsLarge: config.columnsLarge,
        galleryStyle: config.galleryStyle as 'masonry' | 'grid' | 'justified',
        gapSize: config.gapSize as 'small' | 'medium' | 'large',
      }
    } catch (error) {
      console.error('Failed to fetch gallery config:', error)
      return defaultConfig
    }
  }

  const galleryConfigValue = await getGalleryConfig()
  const isAdminSetupRequired = await checkAdminSetupRequiredSafe()
  const session = await getSession()
  const isUserSignedIn = !!session
  const userRole = session?.role
  const heroImage = imageUrls[0]?.url
  const ownerName =
    siteConfig.ownerName === 'Photographer Name'
      ? 'Independent Photography Studio'
      : siteConfig.ownerName
  const location = [
    siteConfig.seo.location.locality,
    siteConfig.seo.location.region,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <main className="bg-[#f4f1eb] text-[#161512]">
      <section className="relative min-h-[92svh] overflow-hidden bg-[#11100e] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={
            heroImage
              ? { backgroundImage: `url("${heroImage}")` }
              : {
                  backgroundImage:
                    'radial-gradient(circle at 75% 30%, rgba(191,154,104,.35), transparent 32%), linear-gradient(135deg, #29231d 0%, #11100e 52%, #060606 100%)',
                }
          }
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

        <div className="relative mx-auto flex min-h-[92svh] max-w-7xl flex-col justify-end px-6 pb-14 pt-32 sm:px-10 lg:px-12 lg:pb-20">
          <div className="mb-auto flex items-center justify-between pt-6 text-[10px] font-medium uppercase tracking-[0.28em] text-white/65 sm:text-xs">
            <span>Photography • Film • Stories</span>
            <span>{location || 'Available worldwide'}</span>
          </div>

          <div className="max-w-5xl">
            <p className="mb-5 text-xs uppercase tracking-[0.34em] text-[#d8b889] sm:text-sm">
              {ownerName}
            </p>
            <h1 className="max-w-4xl font-serif text-6xl leading-[0.92] tracking-[-0.04em] sm:text-7xl lg:text-[7.5rem]">
              Stories that still feel alive years later.
            </h1>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="#portfolio"
                className="inline-flex items-center justify-center gap-3 bg-white px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-[#e7d3b5]"
              >
                View selected work
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-3 border border-white/35 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
              >
                Start a conversation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-12 lg:py-32">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8c6b43]">
            The approach
          </p>
        </div>
        <div>
          <h2 className="max-w-4xl font-serif text-4xl leading-tight tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            Elegant photographs without making the moment feel staged.
          </h2>
          <p className="mt-7 max-w-2xl text-base leading-8 text-black/60 sm:text-lg">
            We combine documentary instinct with editorial direction to create
            images that feel natural now and valuable decades from now.
          </p>
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#ebe6dd]">
        <div className="mx-auto grid max-w-7xl md:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div
                key={service.title}
                className="border-black/10 px-6 py-14 md:border-r md:px-8 lg:px-12 lg:py-20 [&:last-child]:border-r-0"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs tracking-[0.24em] text-black/40">
                    0{index + 1}
                  </span>
                  <Icon className="h-5 w-5 stroke-[1.4]" />
                </div>
                <h3 className="mt-16 font-serif text-3xl tracking-tight">
                  {service.title}
                </h3>
                <p className="mt-5 max-w-sm text-sm leading-7 text-black/60">
                  {service.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section id="portfolio" className="mx-auto max-w-[1600px] px-4 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto mb-14 flex max-w-7xl flex-col justify-between gap-6 px-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8c6b43]">
              Selected work
            </p>
            <h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] sm:text-6xl">
              A few stories worth keeping.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-black/55">
            Weddings, portraits, people and places — photographed with restraint,
            warmth and attention to the details that make a story personal.
          </p>
        </div>

        {imageUrls.length > 0 ? (
          <ImageGallery images={imageUrls} config={galleryConfigValue} />
        ) : (
          <div className="mx-auto max-w-7xl border border-black/10 bg-white/55 px-6 py-16">
            <GetStartedMessage
              isAdminSetupRequired={isAdminSetupRequired}
              isUserSignedIn={isUserSignedIn}
              userRole={userRole}
            />
          </div>
        )}
      </section>

      <section className="bg-[#171613] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 sm:px-10 lg:grid-cols-2 lg:px-12 lg:py-32">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b889]">
              The experience
            </p>
            <h2 className="mt-5 max-w-xl font-serif text-4xl leading-tight tracking-[-0.03em] sm:text-6xl">
              Calm direction. Beautiful light. No awkward posing.
            </h2>
          </div>
          <div className="grid gap-8 border-white/15 lg:border-l lg:pl-14">
            {[
              ['01', 'Tell us your story', 'Share the date, location, mood and what matters most to you.'],
              ['02', 'Shape the session', 'We plan timing, light, locations and the visual direction together.'],
              ['03', 'Live the moment', 'You stay present while we quietly create the images around you.'],
              ['04', 'Receive your gallery', 'Your final story arrives in a refined private gallery made for sharing.'],
            ].map(([number, title, text]) => (
              <div key={number} className="grid grid-cols-[42px_1fr] gap-5">
                <span className="pt-1 text-xs tracking-[0.2em] text-white/35">
                  {number}
                </span>
                <div>
                  <h3 className="font-serif text-2xl">{title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-7 text-white/55">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 text-center sm:px-10 lg:px-12 lg:py-36">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8c6b43]">
          Your story deserves intention
        </p>
        <h2 className="mx-auto mt-6 max-w-4xl font-serif text-5xl leading-[1.02] tracking-[-0.04em] sm:text-7xl">
          Let&apos;s make photographs you&apos;ll want to return to.
        </h2>
        <Link
          href="/about"
          className="mt-10 inline-flex items-center gap-3 border-b border-black pb-2 text-xs font-semibold uppercase tracking-[0.22em]"
        >
          Begin your enquiry
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  )
}
