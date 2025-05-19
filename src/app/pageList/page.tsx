'use client'

import { useEffect, useState } from 'react'
import MapBlock from '@/components/ui/MapBlock'

/**
 * @file pageList/page.tsx
 * @description This file essentially takes care of the formating and filtering of the listings page. It utilizes the listing
 * component and displays them along with porting that information over to the map component that is referenced. 
 */

interface Listing {
  id: string
  address: string
  city: string | null
  state: string | null
  price: number
  bedrooms: number | null
  bathrooms: number | null
  squareFeet: number | null
  propertyType: string
  photoUrls: string[]
  status: string
  createdAt: string
  latitude?: number | null
  longitude?: number | null
  isAssumable?: boolean
  lotSizeSquareFeet?: number | null,
}

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1000000)
  const [minBedrooms, setMinBedrooms] = useState(0)
  const [minBathrooms, setMinBathrooms] = useState(0)
  const [isAssumable, setIsAssumable] = useState(false)
  const [minLotSize, setMinLotSize] = useState(0)

  useEffect(() => {
    fetchRecentListings()
  }, [])

  useEffect(() => {
    const filtered = listings.filter((l) =>
      l.price >= minPrice &&
      l.price <= maxPrice &&
      (l.bedrooms ?? 0) >= minBedrooms &&
      (l.bathrooms ?? 0) >= minBathrooms &&
      (!isAssumable || l.isAssumable) &&
      (l.lotSizeSquareFeet ?? 0) >= minLotSize
    )
    setFilteredListings(filtered)
  }, [minPrice, maxPrice, minBedrooms, minBathrooms, isAssumable, minLotSize, listings])

  const fetchRecentListings = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/listings/recent')
      if (!response.ok) throw new Error('Failed to fetch listings')
      const data = await response.json()
      setListings(data)
      setFilteredListings(data)
      resetFilters()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setMinPrice(0)
    setMaxPrice(1000000)
    setMinBedrooms(0)
    setMinBathrooms(0)
    setIsAssumable(false)
    setMinLotSize(0)
  }

  const validMapListings = filteredListings.filter((l) => l.latitude && l.longitude).map((l) => ({
    id: l.id,
    latitude: l.latitude as number,
    longitude: l.longitude as number,
    price: l.price,
    address: l.address,
    photoUrls: l.photoUrls,
  }))

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col items-center px-6 py-12">
      <div className="w-full max-w-6xl flex flex-col items-center text-center gap-10">
        <h1 className="text-4xl font-extrabold text-black tracking-tight uppercase"> </h1>

        {/* FILTERING ELEMENTS, CAN DO SO BY PRICE, BEDS, BATHS, ETC */}
        <div className="w-full bg-[#f3fceb] text-black border-2 border-black p-6 rounded-xl shadow-[6px_6px_0px_#000] flex flex-wrap gap-6 justify-center items-center">
          <div className="flex flex-col items-center">
            <label className="font-bold">Min Price</label>
            <input type="range" min={0} max={2000000} step={10000} value={minPrice} onChange={(e) => setMinPrice(parseInt(e.target.value))} className="w-36" />
            <span className="text-sm">${minPrice.toLocaleString()}</span>
          </div>

          <div className="flex flex-col items-center">
            <label className="font-bold">Max Price</label>
            <input type="range" min={0} max={2000000} step={10000} value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-36" />
            <span className="text-sm">${maxPrice.toLocaleString()}</span>
          </div>

          <div className="flex flex-col items-center">
            <label className="font-bold">Bedrooms (min)</label>
            <select value={minBedrooms} onChange={(e) => setMinBedrooms(Number(e.target.value))} className="border border-black px-2 py-1">
              {[0, 1, 2, 3, 4, 5].map((val) => (<option key={val} value={val}>{val}+</option>))}
            </select>
          </div>

          <div className="flex flex-col items-center">
            <label className="font-bold">Bathrooms (min)</label>
            <select value={minBathrooms} onChange={(e) => setMinBathrooms(Number(e.target.value))} className="border border-black px-2 py-1">
              {[0, 1, 2, 3].map((val) => (<option key={val} value={val}>{val}+</option>))}
            </select>
          </div>

          <div className="flex flex-col items-center">
            <label className="font-bold">Lot Size (min sqft)</label>
            <input type="range" min={0} max={20000} step={100} value={minLotSize} onChange={(e) => setMinLotSize(parseInt(e.target.value))} className="w-36" />
            <span className="text-sm">{minLotSize.toLocaleString()} sqft</span>
          </div>

          <div className="flex flex-col items-center">
            <label className="font-bold">Only show assumable</label>
            <input type="checkbox" checked={isAssumable} onChange={(e) => setIsAssumable(e.target.checked)} className="mt-2" />
          </div>

          <div className="flex justify-center">
            <button onClick={resetFilters} className="bg-lime-100 hover:bg-lime-200 text-black font-bold text-sm px-3 py-2 border-2 border-black shadow-[4px_4px_0px_#140] rounded-full transition-all duration-300">
              Reset Listings
            </button>
          </div>
        </div>

        {error && <p className="text-red-600 font-semibold">{error}</p>}

        {validMapListings.length > 0 && (
          <div className="w-full rounded-2xl overflow-hidden shadow-[6px_6px_0px_#000] border-2 border-black">
            <MapBlock listings={validMapListings} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="bg-[#e4e4e4] text-black border-2 border-black p-4 shadow-[6px_6px_0px_#000] transition-transform hover:scale-[1.02] rounded-xl">
              {listing.photoUrls[0] && (
                <img src={listing.photoUrls[0]} alt={listing.address} className="w-full h-48 object-cover border border-black rounded-md" />
              )}
              <div className="mt-4 space-y-2 text-center font-[Arial,Helvetica,sans-serif]">
                <p className="text-2xl font-extrabold">${listing.price.toLocaleString()}</p>
                <p className="text-base font-semibold">{listing.address}</p>
                {listing.city && listing.state && (
                  <p className="text-sm font-medium">{listing.city}, {listing.state}</p>
                )}
                <p className="text-sm font-normal">
                  {listing.bedrooms && `${listing.bedrooms} beds`}
                  {listing.bathrooms && ` • ${listing.bathrooms} baths`}
                  {listing.squareFeet && ` • ${listing.squareFeet} sqft`}
                </p>
                <p className="text-sm font-medium uppercase">{listing.propertyType}</p>
                <p className="text-sm font-bold text-blue-700">{listing.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}