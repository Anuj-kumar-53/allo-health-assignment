import { createServerClient } from '@/app/lib/supabase'
import { NextResponse } from 'next/server'


export async function GET() {
  const supabase = createServerClient()

  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true })

  if (pErr) {
    console.error('[GET /api/products] products query:', pErr)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }


  const { data: inventory, error: iErr } = await supabase
    .from('inventory')
    .select(`
      id,
      product_id,
      total_stock,
      reserved_stock,
      warehouse:warehouses ( id, name, location )
    `)

  if (iErr) {
    console.error('[GET /api/products] inventory query:', iErr)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }


  const result = products.map((product) => {
    const warehouseStock = inventory
      .filter((inv) => inv.product_id === product.id)
      .map((inv) => ({
        inventory_id: inv.id,
        warehouse_id: inv.warehouse.id,
        warehouse_name: inv.warehouse.name,
        warehouse_location: inv.warehouse.location,
        total_stock: inv.total_stock,
        reserved_stock: inv.reserved_stock,
        available_stock: inv.total_stock - inv.reserved_stock,
      }))

    const total_available = warehouseStock.reduce(
      (sum, w) => sum + w.available_stock,
      0
    )

    return {
      ...product,
      warehouse_stock: warehouseStock,
      total_available,
    }
  })

  return NextResponse.json(result)
}
