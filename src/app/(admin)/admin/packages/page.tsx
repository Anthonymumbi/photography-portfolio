import type { Metadata } from 'next'
import type { InputHTMLAttributes } from 'react'
import {
  createPhotographyPackage,
  getPhotographyPackages,
  updatePhotographyPackage,
} from '~/lib/actions/package-actions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Photography Packages',
  description: 'Manage session packages, pricing and deposits',
}

export default async function PackagesAdminPage() {
  const packages = await getPhotographyPackages()

  return (
    <div className="space-y-8 pb-12">
      <div>
        <p className="text-sm text-muted-foreground">Commercial setup</p>
        <h1 className="text-3xl font-bold tracking-tight">Photography Packages</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Control what clients see on the booking page, including starting price,
          deposit percentage, duration and deliverables.
        </p>
      </div>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Add package</h2>
        <form action={createPhotographyPackage} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input name="name" label="Package name" placeholder="Wedding Essential" required />
          <Input name="serviceType" label="Service type" placeholder="wedding" required />
          <Input name="basePriceZmw" label="Starting price (ZMW)" type="number" min="0" defaultValue="0" />
          <Input name="depositPercent" label="Deposit %" type="number" min="0" max="100" defaultValue="30" />
          <Input name="durationHours" label="Duration hours" type="number" min="0" />
          <Input name="sortOrder" label="Sort order" type="number" defaultValue="0" />
          <label className="md:col-span-2 xl:col-span-4">
            <span className="mb-2 block text-sm font-medium">Description</span>
            <textarea name="description" required rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="md:col-span-2 xl:col-span-4">
            <span className="mb-2 block text-sm font-medium">Deliverables</span>
            <textarea name="deliverables" rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="e.g. 150+ edited images, online gallery, 10 previews within 48 hours" />
          </label>
          <div className="flex items-center gap-6 md:col-span-2">
            <Check name="active" label="Active" defaultChecked />
            <Check name="featured" label="Featured" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
              Add package
            </button>
          </div>
        </form>
      </section>

      <div className="space-y-4">
        {packages.map((item) => (
          <form
            key={item.id}
            action={updatePhotographyPackage.bind(null, item.id)}
            className="rounded-xl border bg-card p-6"
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Input name="name" label="Package name" defaultValue={item.name} required />
              <Input name="serviceType" label="Service type" defaultValue={item.serviceType} required />
              <Input name="basePriceZmw" label="Starting price (ZMW)" type="number" min="0" defaultValue={item.basePriceZmw} />
              <Input name="depositPercent" label="Deposit %" type="number" min="0" max="100" defaultValue={item.depositPercent} />
              <Input name="durationHours" label="Duration hours" type="number" min="0" defaultValue={item.durationHours ?? ''} />
              <Input name="sortOrder" label="Sort order" type="number" defaultValue={item.sortOrder} />
              <label className="md:col-span-2 xl:col-span-4">
                <span className="mb-2 block text-sm font-medium">Description</span>
                <textarea name="description" required rows={3} defaultValue={item.description} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </label>
              <label className="md:col-span-2 xl:col-span-4">
                <span className="mb-2 block text-sm font-medium">Deliverables</span>
                <textarea name="deliverables" rows={2} defaultValue={item.deliverables ?? ''} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </label>
              <div className="flex items-center gap-6 md:col-span-2">
                <Check name="active" label="Active" defaultChecked={item.active} />
                <Check name="featured" label="Featured" defaultChecked={item.featured} />
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-3">
                <span className="text-xs text-muted-foreground">
                  {item.basePriceZmw > 0
                    ? `From K${item.basePriceZmw.toLocaleString()}`
                    : 'Custom quote'}
                </span>
                <button className="rounded-md border bg-background px-5 py-2.5 text-sm font-medium">
                  Save changes
                </button>
              </div>
            </div>
          </form>
        ))}

        {packages.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No custom packages yet. Add your first package above.
          </div>
        )}
      </div>
    </div>
  )
}

function Input(props: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...inputProps } = props
  return (
    <label>
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input {...inputProps} className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
    </label>
  )
}

function Check({
  name,
  label,
  defaultChecked = false,
}: {
  name: string
  label: string
  defaultChecked?: boolean
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4" />
      {label}
    </label>
  )
}
