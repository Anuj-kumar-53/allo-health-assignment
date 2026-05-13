import { createServerClient } from '@/app/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .order('name')

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch warehouses' }, { status: 500 })
  }

  return NextResponse.json(data)
}
