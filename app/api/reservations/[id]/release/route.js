import { createServerClient } from '@/app/lib/supabase'
import { NextResponse } from 'next/server'


export async function POST(request, { params }) {
  const { id } = await params
  const supabase = createServerClient()

  const { data, error } = await supabase.rpc('release_reservation', {
    p_reservation_id: id,
  })

  if (error) {
    console.error('[POST /api/reservations/:id/release] rpc error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  const result = data?.[0]

  if (!result) {
    return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
  }

  if (!result.success) {
    switch (result.message) {
      case 'NOT_FOUND':
        return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
      case 'CONFIRMED':
        return NextResponse.json(
          { error: 'Cannot release a confirmed reservation.' },
          { status: 409 }
        )
      case 'RELEASED':
        return NextResponse.json(
          { error: 'Reservation is already released.' },
          { status: 409 }
        )
      default:
        return NextResponse.json({ error: result.message }, { status: 400 })
    }
  }

  return NextResponse.json({ message: 'Reservation released successfully.' })
}
