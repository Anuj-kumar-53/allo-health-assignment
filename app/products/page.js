'use client'

import { useEffect, useState } from 'react'

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
      <div>
        <p className="font-medium">{wh.warehouse_name}</p>
        <p className="text-xs text-gray-500">
          {wh.warehouse_location}
        </p>
      </div>

      <span
        className={`text-xs ${
          isOut ? 'text-red-600' : 'text-green-600'
        }`}
      >
        {isOut ? 'Out of stock' : `${available} left`}
      </span>
    </button>
  )
}

function ProductCard({ product }) {
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)

  useEffect(() => {
    const firstAvailable = product.warehouse_stock?.find(
      (w) => w.available_stock > 0
    )

    if (firstAvailable) {
      setSelectedWarehouse(firstAvailable)
    }
  }, [product])

  const hasStock = product.total_available > 0

  return (
    <div className="border bg-white p-4 space-y-4">
      
      {/* Product Info */}
      <div>
        <h2 className="text-lg font-semibold">
          {product.name}
        </h2>

        <p className="text-blue-600 font-medium mt-1">
          ${Number(product.price).toFixed(2)}
        </p>

        {!hasStock && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 border border-red-300 inline-block mt-2">
            Sold Out
          </span>
        )}
      </div>

      {/* Warehouse Stock */}
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
                selectedWarehouse?.warehouse_id === wh.warehouse_id
              }
              onSelect={setSelectedWarehouse}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products')

      if (!res.ok) throw new Error('Failed to load products')

      const data = await res.json()

      setProducts(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-2xl font-semibold mb-6">
        Inventory
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}