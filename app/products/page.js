'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function WarehouseRow({ wh, selected, onSelect }) {
  const available = wh.available_stock

  const isOut = available === 0



  return (
    <button
      disabled={isOut}
      onClick={() => onSelect(wh)}
      className={`w-full flex items-center justify-between border p-2 text-sm
        ${
          isOut
            ? 'opacity-50 cursor-not-allowed bg-gray-100'
            : 'hover:bg-gray-50'
        }
        ${
          selected
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white'
        }
      `}
    >
      <div className="flex items-center gap-2 text-left">


        <div>
          <p className="font-medium">
            {wh.warehouse_name}
          </p>

          <p className="text-xs text-gray-500">
            {wh.warehouse_location}
          </p>
        </div>
      </div>

      <span
        className={`text-xs ${
          isOut
            ? 'text-red-600'
            : 'text-green-600'
        }`}
      >
        {isOut
          ? 'Out of stock'
          : `${available} left`}
      </span>
    </button>
  )
}

function ProductCard({ product }) {
  const [selectedWarehouse, setSelectedWarehouse] =
    useState(null)

  const [quantity, setQuantity] = useState(1)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState(null)

  useEffect(() => {
    const first = product.warehouse_stock?.find(
      (w) => w.available_stock > 0
    )

    if (first) setSelectedWarehouse(first)
  }, [product])

  const maxQty =
    selectedWarehouse?.available_stock ?? 1

  const hasStock = product.total_available > 0

  async function handleReserve() {
    if (!selectedWarehouse) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          warehouse_id:
            selectedWarehouse.warehouse_id,
          quantity,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(
          data.error ||
            'Reservation failed.'
        )

        return
      }

      window.location.href = `/reservations/${data.id}`
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border bg-white p-4 space-y-4">

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {product.name}
          </h2>

          <p className="text-blue-600 font-medium mt-1">
            Rs. {Number(product.price).toFixed(2)}
          </p>
        </div>

        {!hasStock && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 border border-red-300">
            Sold Out
          </span>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Warehouse Stock
        </p>

        <div className="space-y-2">
          {product.warehouse_stock.map((wh) => (
            <WarehouseRow
              key={wh.warehouse_id}
              wh={wh}
              selected={
                selectedWarehouse?.warehouse_id ===
                wh.warehouse_id
              }
              onSelect={setSelectedWarehouse}
            />
          ))}
        </div>
      </div>

      {hasStock && (
        <>
          <div className="border-t border-gray-300 pt-4">

            <div className="flex items-center justify-between gap-3">

              <div className="flex items-center border border-gray-300">

                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.max(1, q - 1)
                    )
                  }
                  disabled={quantity <= 1}
                  className="px-3 py-1 border-r bg-gray-100"
                >
                  -
                </button>

                <span className="px-4 text-sm">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(maxQty, q + 1)
                    )
                  }
                  disabled={quantity >= maxQty}
                  className="px-3 py-1 border-l bg-gray-100"
                >
                  +
                </button>

              </div>

              <button
                onClick={handleReserve}
                disabled={
                  loading || !selectedWarehouse
                }
                className="flex-1 bg-blue-600 text-white py-2 text-sm"
              >
                {loading
                  ? 'Reserving...'
                  : 'Reserve'}
              </button>

            </div>
          </div>

          {error && (
            <p className="border border-red-300 bg-red-100 text-red-700 text-sm p-2">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])

  const [loading, setLoading] = useState(true)

  const [fetchError, setFetchError] =
    useState(null)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')

      if (!res.ok)
        throw new Error('Failed to load products')

      const data = await res.json()

      setProducts(data)
      setFetchError(null)
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()

    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory',
        },
        fetchProducts
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchProducts])

  return (
    <div className="max-w-6xl mx-auto p-6">

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Inventory
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Find and reserve products across warehouses.
          </p>
        </div>

       
      </div>

      {fetchError && (
        <div className="border border-red-300 bg-red-100 text-red-700 p-3 mb-6 text-sm flex justify-between">
          <span>{fetchError}</span>

          <button
            onClick={fetchProducts}
            className="underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="border bg-white p-4 space-y-3"
            >
              <div className="h-4 bg-gray-200 w-3/4"></div>

              <div className="h-3 bg-gray-200 w-1/3"></div>

              <div className="h-20 bg-gray-200"></div>

              <div className="h-9 bg-gray-200"></div>
            </div>
          ))}

        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p>No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>
      )}
    </div>
  )
}