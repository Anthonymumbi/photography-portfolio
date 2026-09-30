'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '~/lib/utils'
import type { SiteConfig } from '~/config/site'
import { Icons } from '~/components/ui/icons'
import { MenuIcon, ChevronDownIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { getNavigationGalleries } from '~/lib/actions/gallery/gallery'
import { isStoreEnabledClient } from '~/lib/store-utils'

interface MainNavProps {
  isAdmin?: boolean
  siteConfig: SiteConfig
}

interface NavItemsProps {
  pathname: string | null
  galleries: { id: string; title: string; slug: string }[]
  isAdmin?: boolean
  onLinkClick?: () => void
}

const MainNavItems = ({ pathname, galleries, isAdmin }: NavItemsProps) => (
  <nav className="flex items-center gap-6 text-sm">
    <Link
      href="/blog"
      className={cn(
        'transition-colors hover:text-white',
        pathname === '/blog' ? 'text-white' : 'text-white/60',
      )}
    >
      Blog
    </Link>
    <Link
      href="/about"
      className={cn(
        'text-white/60 transition-colors hover:text-white',
      )}
    >
      About
    </Link>
    {isStoreEnabledClient() && (
      <Link
        href="/store"
        className={cn(
          'text-white/60 transition-colors hover:text-white',
        )}
      >
        Store
      </Link>
    )}
    {galleries.length > 0 && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'h-auto p-0 text-sm font-normal text-white/60 transition-colors hover:bg-transparent hover:text-white',
              pathname?.startsWith('/g/')
                ? 'text-white'
                : 'text-white/60',
            )}
          >
            Galleries
            <ChevronDownIcon className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {galleries.map((gallery) => (
            <DropdownMenuItem key={gallery.id} asChild>
              <Link href={`/g/${gallery.slug}`}>{gallery.title}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )}
    {isAdmin && (
      <Link
        href="/admin"
        className={cn(
          'text-white/60 transition-colors hover:text-white',
          pathname?.startsWith('/admin')
            ? 'text-white'
            : 'text-white/60',
        )}
      >
        Admin
      </Link>
    )}
  </nav>
)

const SheetNavItems = ({
  pathname,
  galleries,
  isAdmin,
  onLinkClick,
}: NavItemsProps) => (
  <nav className="flex flex-col items-start gap-4 text-sm">
    <Link
      href="/blog"
      className={cn(
        'transition-colors hover:text-white',
        pathname === '/blog' ? 'text-white' : 'text-white/60',
      )}
      onClick={onLinkClick}
    >
      Blog
    </Link>
    <Link
      href="/about"
      className={cn(
        'text-white/60 transition-colors hover:text-white',
      )}
      onClick={onLinkClick}
    >
      About
    </Link>
    {isStoreEnabledClient() && (
      <Link
        href="/store"
        className={cn(
          'text-white/60 transition-colors hover:text-white',
        )}
        onClick={onLinkClick}
      >
        Store
      </Link>
    )}
    {galleries.length > 0 && (
      <div className="flex flex-col gap-2">
        <span className="text-foreground/60 font-medium">Galleries</span>
        {galleries.map((gallery) => (
          <Link
            key={gallery.id}
            href={`/g/${gallery.slug}`}
            className={cn(
              'text-foreground/60 hover:text-foreground/80 pl-4 transition-colors',
              pathname === `/g/${gallery.slug}`
                ? 'text-white'
                : 'text-white/60',
            )}
            onClick={onLinkClick}
          >
            {gallery.title}
          </Link>
        ))}
      </div>
    )}
    {isAdmin && (
      <Link
        href="/admin"
        className={cn(
          'text-white/60 transition-colors hover:text-white',
          pathname?.startsWith('/admin')
            ? 'text-white'
            : 'text-white/60',
        )}
        onClick={onLinkClick}
      >
        Admin
      </Link>
    )}
  </nav>
)

export function MainNav({ isAdmin, siteConfig }: MainNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [galleries, setGalleries] = React.useState<
    { id: string; title: string; slug: string }[]
  >([])
  // siteConfig is now passed as a prop, eliminating hydration issues

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  React.useEffect(() => {
    const loadGalleries = async () => {
      try {
        const navGalleries = await getNavigationGalleries()
        setGalleries(navGalleries)
      } catch (error) {
        console.error('Failed to load navigation galleries:', error)
      }
    }

    loadGalleries()
  }, [])

  return (
    <div className="flex items-center">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[180px] pr-0">
          <div className="px-4">
            <Link
              href="/"
              className="flex items-center space-x-2"
              onClick={() => setOpen(false)}
            >
              <Icons.logo className="h-6 w-6" />
              <span className="font-serif text-lg font-semibold">
                {siteConfig.ownerName === 'Photographer Name'
                  ? siteConfig.title
                  : siteConfig.ownerName}
              </span>
            </Link>
          </div>
          <div className="mt-6 flex flex-col space-y-4 px-4">
            <SheetNavItems
              pathname={pathname}
              galleries={galleries}
              isAdmin={isAdmin}
              onLinkClick={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
      <div className="hidden md:flex">
        <Link href="/" className="mr-8 flex items-center space-x-2 text-white">
          <Icons.logo className="h-6 w-6" />
          <span className="font-serif text-lg font-semibold tracking-wide">
            {siteConfig.ownerName === 'Photographer Name'
              ? siteConfig.title
              : siteConfig.ownerName}
          </span>
        </Link>
        <MainNavItems
          pathname={pathname}
          galleries={galleries}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  )
}
