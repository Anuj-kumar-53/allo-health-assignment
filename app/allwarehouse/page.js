'use client'

import { useEffect, useState } from 'react'

export default function AllWarehousePage() {
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/allwarehouse')
      .then(res => res.json())
      .then(data => {
        setWarehouses(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8 text-gray-500">Loading warehouses...</div>

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">All Warehouses</h1>
    
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouses.map(w => (
          <div key={w.id} className="bg-white border rounded-lg p-5 hover:border-blue-300 transition-colors">
            <h2 className="font-bold text-lg text-gray-900">{w.name}</h2>
            <p className="text-gray-500 text-sm">{w.location}</p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[10px] font-mono text-gray-300 uppercase">Warehouse ID</span>
              <span className="text-[10px] font-mono text-gray-400">{w.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
