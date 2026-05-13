'use client'

import { useEffect } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {

  useEffect(() => {
    testConnection()
  }, [])

  async function testConnection() {
    const { data, error } = await supabase
      .from('test')
      .select('*')

    console.log(data)
    console.log(error)
  }

  return (
    <div>
      <h1>Supabase Connected</h1>
    </div>
  )
}
