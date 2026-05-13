import { createServerClient } from '@/app/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createServerClient()

  const { data, error } = await supabase.rpc(
    'expire_pending_reservations'
  )

  if (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    expired: data
  })
}