'use server'

import { asc, eq, sql } from 'drizzle-orm'
import { fallbackBookingPackages } from '~/config/booking'
import type { PublicBookingPackage } from '~/config/booking'
import { revalidatePath } from 'next/cache'
import { getSession } from '~/lib/auth/auth'
import { db } from '~/server/db'
import { photographyPackages } from '~/server/db/schema'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') throw new Error('Unauthorized')
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function getPhotographyPackages() {
  await requireAdmin()
  return db
    .select()
    .from(photographyPackages)
    .orderBy(asc(photographyPackages.sortOrder), asc(photographyPackages.name))
}

export async function createPhotographyPackage(formData: FormData): Promise<void> {
  await requireAdmin()

  const name = String(formData.get('name') || '').trim()
  const serviceType = String(formData.get('serviceType') || '').trim()
  const description = String(formData.get('description') || '').trim()

  if (!name || !serviceType || !description) {
    throw new Error('Name, service type and description are required')
  }

  const durationValue = Number(formData.get('durationHours') || 0)
  const priceValue = Number(formData.get('basePriceZmw') || 0)
  const depositValue = Number(formData.get('depositPercent') || 30)
  const sortOrderValue = Number(formData.get('sortOrder') || 0)

  await db.insert(photographyPackages).values({
    name,
    slug: slugify(name),
    serviceType,
    description,
    durationHours: durationValue > 0 ? durationValue : null,
    basePriceZmw: Math.max(0, Math.round(priceValue)),
    depositPercent: Math.min(100, Math.max(0, Math.round(depositValue))),
    deliverables: String(formData.get('deliverables') || '').trim() || null,
    active: formData.get('active') === 'on',
    featured: formData.get('featured') === 'on',
    sortOrder: Math.round(sortOrderValue),
  })

  revalidatePath('/admin/packages')
  revalidatePath('/book')
}

export async function updatePhotographyPackage(
  packageId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin()

  const name = String(formData.get('name') || '').trim()
  const serviceType = String(formData.get('serviceType') || '').trim()
  const description = String(formData.get('description') || '').trim()

  if (!name || !serviceType || !description) {
    throw new Error('Name, service type and description are required')
  }

  const durationValue = Number(formData.get('durationHours') || 0)
  const priceValue = Number(formData.get('basePriceZmw') || 0)
  const depositValue = Number(formData.get('depositPercent') || 30)
  const sortOrderValue = Number(formData.get('sortOrder') || 0)

  await db
    .update(photographyPackages)
    .set({
      name,
      slug: slugify(name),
      serviceType,
      description,
      durationHours: durationValue > 0 ? durationValue : null,
      basePriceZmw: Math.max(0, Math.round(priceValue)),
      depositPercent: Math.min(100, Math.max(0, Math.round(depositValue))),
      deliverables: String(formData.get('deliverables') || '').trim() || null,
      active: formData.get('active') === 'on',
      featured: formData.get('featured') === 'on',
      sortOrder: Math.round(sortOrderValue),
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(photographyPackages.id, packageId))

  revalidatePath('/admin/packages')
  revalidatePath('/book')
}


export async function getPublicPhotographyPackages(): Promise<PublicBookingPackage[]> {
  try {
    const rows = await db
      .select()
      .from(photographyPackages)
      .where(eq(photographyPackages.active, true))
      .orderBy(
        asc(photographyPackages.sortOrder),
        asc(photographyPackages.name),
      )

    if (rows.length === 0) return fallbackBookingPackages

    return rows.map((item) => ({
      id: item.id,
      name: item.name,
      serviceType: item.serviceType,
      description: item.description,
      basePriceZmw: item.basePriceZmw,
      depositPercent: item.depositPercent,
      durationHours: item.durationHours,
      deliverables: item.deliverables,
    }))
  } catch (error) {
    console.warn('[Packages] Falling back to default booking packages', error)
    return fallbackBookingPackages
  }
}
