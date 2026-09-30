export const photographyServices = [
  {
    value: 'wedding',
    title: 'Wedding Story',
    description:
      'Full-day or tailored wedding coverage with an editorial, documentary finish.',
    packageName: 'Wedding Story',
  },
  {
    value: 'portrait',
    title: 'Portrait Session',
    description:
      'Personal, graduation, couple and family portraits with relaxed direction.',
    packageName: 'Portrait Session',
  },
  {
    value: 'event',
    title: 'Event Coverage',
    description:
      'Professional photography for private events, launches and celebrations.',
    packageName: 'Event Coverage',
  },
  {
    value: 'brand',
    title: 'Brand & Corporate',
    description:
      'Campaign, team, product and corporate imagery built around your brand.',
    packageName: 'Brand & Corporate',
  },
] as const

export const bookingStatusLabels = {
  requested: 'Requested',
  confirmed: 'Confirmed',
  scheduled: 'Scheduled',
  shoot_completed: 'Shoot completed',
  editing: 'Editing',
  gallery_ready: 'Gallery ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const
