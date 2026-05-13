import { createServerClient } from '@/app/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  const { id } = await params
  const supabase = createServerClient()


  const { data: res, error: resErr } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', id)
    .single()

  if (resErr || !res) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (res.status !== 'PENDING') return NextResponse.json({ error: 'Not pending' }, { status: 400 })
  if (new Date(res.expires_at) < new Date()) return NextResponse.json({ error: 'Expired' }, { status: 410 })

  
  const { data: inv } = await supabase
    .from('inventory')
    .select('total_stock, reserved_stock')
    .eq('product_id', res.product_id)
    .eq('warehouse_id', res.warehouse_id)
    .single()

  await supabase
    .from('inventory')
    .update({
      total_stock: inv.total_stock - res.quantity,
      reserved_stock: inv.reserved_stock - res.quantity
    })
    .eq('product_id', res.product_id)
    .eq('warehouse_id', res.warehouse_id)


  await supabase.from('reservations').update({ status: 'CONFIRMED' }).eq('id', id)

  return NextResponse.json({ message: 'Confirmed' })
}
