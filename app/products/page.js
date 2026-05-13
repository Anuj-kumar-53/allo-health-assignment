'use client'

import { useEffect, useState } from 'react'

function ProductCard({ product }) {
  return (
    <div className="border bg-white p-4 space-y-2">
      <h2 className="text-lg font-semibold">
        {product.name}
      </h2>

      <p className="text-blue-600 font-medium">
        ${Number(product.price).toFixed(2)}
      </p>

      <p className="text-sm text-gray-600">
        Total Available: {product.total_available ?? 0}
      </p>
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
        Products
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