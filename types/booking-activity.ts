export type BookingActivity = {
  id: string
  bookingId: string
  type: string
  title: string
  description?: string | null
  actorName?: string | null
  createdAt: string // ISO string
}

