"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Asset {
    id: string
    assetNumber: string
    equipmentName: string
    equipmentType: string | null
    location: string | null
    kodeAlas: string | null
    systemOwner: string | null
    unit: string
}

interface AssetSearchProps {
    unit?: string
    onSelect: (asset: Asset) => void
    selectedAsset?: Asset | null
}

export default function AssetSearchCombobox({ unit = 'CLG', onSelect, selectedAsset }: AssetSearchProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [assets, setAssets] = useState<Asset[]>([])
    const [loading, setLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)

    useEffect(() => {
        if (searchQuery.length < 2) {
            setAssets([])
            return
        }

        const debounce = setTimeout(() => {
            searchAssets()
        }, 300)

        return () => clearTimeout(debounce)
    }, [searchQuery])

    const searchAssets = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/assets/search?q=${encodeURIComponent(searchQuery)}&unit=${unit}`)
            const data = await response.json()
            if (response.ok) {
                setAssets(data.data || [])
                setShowResults(true)
            }
        } catch (err) {
            console.error('Error searching assets:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (asset: Asset) => {
        onSelect(asset)
        setSearchQuery('')
        setShowResults(false)
    }

    const handleClear = () => {
        onSelect(null as any)
        setSearchQuery('')
    }

    if (selectedAsset) {
        return (
            <Card className="border-neon bg-green-50">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-1">✅ Selected Equipment</p>
                            <p className="text-lg font-bold text-dark">{selectedAsset.equipmentName}</p>
                            <div className="mt-3 space-y-1">
                                <p className="text-sm"><span className="font-semibold">Asset:</span> {selectedAsset.assetNumber}</p>
                                {selectedAsset.kodeAlas && (
                                    <p className="text-sm"><span className="font-semibold">Kode Alas:</span> {selectedAsset.kodeAlas}</p>
                                )}
                                {selectedAsset.systemOwner && (
                                    <p className="text-sm"><span className="font-semibold">System Owner:</span> {selectedAsset.systemOwner}</p>
                                )}
                                <p className="text-sm"><span className="font-semibold">Unit:</span> {selectedAsset.unit}</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                        >
                            Change
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="relative">
            <Label htmlFor="asset-search">
                Search Equipment <span className="text-red-500">*</span>
            </Label>
            <Input
                id="asset-search"
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                placeholder="Type equipment description..."
                className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
                Search by description, asset number, PIC
            </p>

            {/* Search Results Dropdown */}
            {showResults && assets.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
                    {loading && (
                        <div className="p-3 text-center text-gray-500">
                            <p className="text-sm">Searching...</p>
                        </div>
                    )}
                    {!loading && assets.map((asset) => (
                        <button
                            key={asset.id}
                            type="button"
                            onClick={() => handleSelect(asset)}
                            className="w-full text-left px-4 py-3 hover:bg-neon hover:text-dark transition-colors border-b last:border-b-0"
                        >
                            <p className="font-semibold text-dark">{asset.equipmentName}</p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Asset: {asset.assetNumber}</span>
                                {asset.kodeAlas && ` • Kode Alas: ${asset.kodeAlas}`}
                            </p>
                        </button>
                    ))}
                </div>
            )}

            {showResults && !loading && searchQuery.length >= 2 && assets.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                    <p className="text-sm text-gray-600 text-center">
                        No equipment found matching "{searchQuery}"
                    </p>
                </div>
            )}
        </div>
    )
}
