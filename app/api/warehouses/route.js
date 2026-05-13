import { createServerClient } from '@/app/lib/supabase'
import { NextResponse } from 'next/server'


export async function GET() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[GET /api/warehouses]', error)
    return NextResponse.json({ error: 'Failed to fetch warehouses' }, { status: 500 })
  }

  return NextResponse.json(data)
}
