import Link from 'next/link'
import { getSession } from '~/lib/auth/auth'
import { logout } from '~/lib/auth/userActions'
import { getServerSiteConfig } from '~/config/site'
import { cn } from '~/lib/utils'
import { MainNav } from '~/components/main-nav'
import { buttonVariants } from '~/components/ui/button'
import { Button } from '~/components/ui/button'
import { Instagram, User, Settings, Shield, ArrowUpRight } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { LogoutForm } from '~/components/logout-form'

export async function SiteHeader() {
  const session = await getSession()
  const isAdmin = session?.role === 'admin'
  const siteConfig = getServerSiteConfig()

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/55 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-12">
        <MainNav isAdmin={isAdmin} siteConfig={siteConfig} />

        <nav className="flex items-center gap-1">
          {siteConfig.links.instagram && (
            <Link
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 w-9 items-center justify-center text-white/60 transition hover:text-white sm:inline-flex"
            >
              <Instagram className="h-4 w-4" />
              <span className="sr-only">Instagram</span>
            </Link>
          )}

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-9 px-0 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <User className="h-4 w-4" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {session.email}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {session.role === 'admin' ? 'Administrator' : 'User'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <LogoutForm logout={logout} />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/signin"
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'hidden px-3 text-xs uppercase tracking-[0.15em] text-white/60 hover:bg-white/10 hover:text-white sm:inline-flex',
              )}
            >
              Client login
            </Link>
          )}

          <Link
            href="/about"
            className="ml-2 inline-flex items-center gap-2 border border-white/25 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white hover:text-black sm:px-5"
          >
            Enquire
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
