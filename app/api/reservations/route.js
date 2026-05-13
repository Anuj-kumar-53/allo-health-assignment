import { createServerClient } from '@/app/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { product_id, warehouse_id, quantity } = body

  if (!product_id || !warehouse_id || !quantity || quantity <= 0) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 })
  }

  const supabase = createServerClient()


  const { data: inventory, error: invError } = await supabase
    .from('inventory')
    .select('total_stock, reserved_stock')
    .eq('product_id', product_id)
    .eq('warehouse_id', warehouse_id)
    .single()

  if (invError || !inventory) {
    return NextResponse.json({ error: 'Inventory not found' }, { status: 404 })
  }

  const available = inventory.total_stock - inventory.reserved_stock
  if (available < quantity) {
    return NextResponse.json({ error: 'Not enough stock' }, { status: 409 })
  }

  
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  const { data: reservation, error: resError } = await supabase
    .from('reservations')
    .insert({
      product_id,
      warehouse_id,
      quantity,
      expires_at: expiresAt,
      status: 'PENDING'
    })
    .select(`
      *,
      product:products(id, name, price),
      warehouse:warehouses(id, name, location)
    `)
    .single()

  if (resError) return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 })

  
  await supabase
    .from('inventory')
    .update({ reserved_stock: inventory.reserved_stock + quantity })
    .eq('product_id', product_id)
    .eq('warehouse_id', warehouse_id)

  return NextResponse.json(reservation, { status: 201 })
}
