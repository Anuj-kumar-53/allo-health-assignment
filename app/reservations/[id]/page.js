'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

function useCountdown(expiresAt) {
  const [secondsLeft, setSecondsLeft] = useState(null)

  useEffect(() => {
    if (!expiresAt) return

    function tick() {
      setSecondsLeft(
        Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000))
      )
    }

    tick()
    const id = setInterval(tick, 1000)

    return () => clearInterval(id)
  }, [expiresAt])

  return secondsLeft
}

function formatTime(seconds) {
  if (seconds === null) return '--:--'

  const m = Math.floor(seconds / 60)
  const s = seconds % 60

  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function CountdownTimer({ expiresAt }) {
  const secondsLeft = useCountdown(expiresAt)
  const isUrgent = secondsLeft !== null && secondsLeft <= 60

  if (secondsLeft === 0) {
    return (
      <p className="text-sm text-red-600 font-medium">
        Reservation expired.
      </p>
    )
  }

  return (
    <p className={`text-sm ${isUrgent ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
      Time remaining:{' '}
      <span className="font-mono font-semibold">{formatTime(secondsLeft)}</span>
      {isUrgent && ' — confirm now!'}
    </p>
  )
}

export default function ReservationPage() {
  const { id } = useParams()

  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const [alert, setAlert] = useState(null)

  const fetchReservation = useCallback(async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        product:products(id,name,price),
        warehouse:warehouses(id,name,location)
      `)
      .eq('id', id)
      .single()

    if (error) {
      setFetchError('Reservation not found.')
    } else {
      setReservation(data)
    }

    setLoading(false)
  }, [id])

  useEffect(() => {
    if (!id) return

    fetchReservation()

    const channel = supabase
      .channel(`res-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reservations',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setReservation((prev) =>
            prev ? { ...prev, ...payload.new } : prev
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, fetchReservation])

  const secondsLeft = useCountdown(reservation?.expires_at)

  useEffect(() => {
    if (
      secondsLeft === 0 &&
      reservation?.status === 'PENDING'
    ) {
      setReservation((prev) =>
        prev ? { ...prev, status: 'RELEASED' } : prev
      )

      setAlert({
        type: 'error',
        msg: 'Reservation expired.',
      })
    }
  }, [secondsLeft, reservation?.status])

  async function handleConfirm() {
    setActionLoading('confirm')
    setAlert(null)

    const res = await fetch(
      `/api/reservations/${id}/confirm`,
      {
        method: 'POST',
      }
    )

    const data = await res.json()

    setActionLoading(null)

    if (res.status === 410) {
      setAlert({
        type: 'error',
        msg: 'Reservation expired.',
      })

      setReservation((prev) =>
        prev ? { ...prev, status: 'RELEASED' } : prev
      )

      return
    }

    if (!res.ok) {
      setAlert({
        type: 'error',
        msg: data.error || 'Confirmation failed.',
      })

      return
    }

    setReservation((prev) =>
      prev ? { ...prev, status: 'CONFIRMED' } : prev
    )

    setAlert({
      type: 'success',
      msg: 'Purchase confirmed.',
    })
  }

  async function handleRelease() {
    if (!confirm('Cancel reservation?')) return

    setActionLoading('release')
    setAlert(null)

    const res = await fetch(
      `/api/reservations/${id}/release`,
      {
        method: 'POST',
      }
    )

    const data = await res.json()

    setActionLoading(null)

    if (!res.ok) {
      setAlert({
        type: 'error',
        msg: data.error || 'Release failed.',
      })

      return
    }

    setReservation((prev) =>
      prev ? { ...prev, status: 'RELEASED' } : prev
    )

    setAlert({
      type: 'info',
      msg: 'Reservation cancelled.',
    })
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="border bg-white p-5 space-y-4">
          <div className="h-5 w-40 bg-gray-200"></div>
          <div className="h-4 w-60 bg-gray-200"></div>
          <div className="h-20 bg-gray-200"></div>
          <div className="h-10 bg-gray-200"></div>
        </div>
      </div>
    )
  }

  if (fetchError || !reservation) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="border border-red-300 bg-red-100 p-4 text-red-700">
          {fetchError || 'Reservation not found.'}
        </div>

        <a
          href="/products"
          className="mt-4 inline-block text-sm text-blue-600"
        >
          Back to Products
        </a>
      </div>
    )
  }

  const isPending = reservation.status === 'PENDING'
  const isConfirmed = reservation.status === 'CONFIRMED'
  const isReleased = reservation.status === 'RELEASED'

  const totalCost =
    Number(reservation.product?.price ?? 0) *
    reservation.quantity

  const statusStyles = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    RELEASED: 'bg-gray-200 text-gray-700',
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white border p-5 space-y-4">

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Checkout
          </h1>

          <span
            className={`text-xs px-2 py-1 rounded ${statusStyles[reservation.status]}`}
          >
            {reservation.status}
          </span>
        </div>

        <p className="text-sm text-gray-600">
          Reservation ID:{' '}
          <span className="font-mono">
            {reservation.id}
          </span>
        </p>

        <div className="border-t border-gray-300"></div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Order Summary
          </p>

          {[
            ['Product', reservation.product?.name],
            [
              'Warehouse',
              `${reservation.warehouse?.name} - ${reservation.warehouse?.location}`,
            ],
            [
              'Unit Price',
              `Rs. ${Number(
                reservation.product?.price
              ).toFixed(2)}`,
            ],
            ['Quantity', reservation.quantity],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between text-sm"
            >
              <span className="text-gray-600">
                {label}
              </span>

              <span className="font-medium">
                {value}
              </span>
            </div>
          ))}

          <div className="border-t border-gray-300 pt-3 flex justify-between">
            <span className="text-sm font-medium">
              Total
            </span>

            <span className="text-lg font-semibold">
              Rs. {totalCost.toFixed(2)}
            </span>
          </div>
        </div>

        {isPending && (
          <CountdownTimer
            expiresAt={reservation.expires_at}
          />
        )}

        {alert && (
          <div
            className={`border p-3 text-sm ${
              alert.type === 'success'
                ? 'bg-green-100 border-green-300 text-green-700'
                : ''
            } ${
              alert.type === 'error'
                ? 'bg-red-100 border-red-300 text-red-700'
                : ''
            } ${
              alert.type === 'info'
                ? 'bg-gray-100 border-gray-300 text-gray-700'
                : ''
            }`}
          >
            <div className="flex justify-between">
              <span>{alert.msg}</span>

              <button
                onClick={() => setAlert(null)}
                className="ml-3"
              >
                X
              </button>
            </div>
          </div>
        )}

        {isPending && secondsLeft !== 0 && (
          <div className="space-y-2">
            <button
              onClick={handleConfirm}
              disabled={!!actionLoading}
              className="w-full bg-green-600 text-white py-2 border"
            >
              {actionLoading === 'confirm'
                ? 'Processing...'
                : 'Confirm Purchase'}
            </button>

            <button
              onClick={handleRelease}
              disabled={!!actionLoading}
              className="w-full border border-gray-400 bg-white py-2 text-sm hover:bg-gray-100"
            >
              {actionLoading === 'release'
                ? 'Cancelling...'
                : 'Cancel Reservation'}
            </button>
          </div>
        )}

        {isConfirmed && (
          <div className="space-y-3">
            <div className="bg-green-100 border border-green-300 text-green-700 p-3 text-sm">
              Purchase confirmed successfully.
            </div>

            <a
              href="/products"
              className="text-sm text-blue-600"
            >
              Browse More Products
            </a>
          </div>
        )}

        {isReleased && (
          <div className="space-y-3">
            {!alert && (
              <div className="bg-gray-100 border text-gray-700 p-3 text-sm">
                Reservation released.
              </div>
            )}

            <a
              href="/products"
              className="block bg-blue-600 text-white text-center py-2"
            >
              Reserve Again
            </a>
          </div>
        )}

        <div className="border-t border-gray-300 pt-3 space-y-1">
          <p className="text-sm text-gray-500">
            Reserved:{' '}
            {new Date(
              reservation.created_at
            ).toLocaleString()}
          </p>

          <p className="text-sm text-gray-500">
            Expires:{' '}
            {new Date(
              reservation.expires_at
            ).toLocaleString()}
          </p>
        </div>

      </div>
    </div>
  )
}