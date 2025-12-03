'use client'

import { Button } from '@/components/ui/button'

interface DateRangeFilterProps {
  dateRange: { from?: Date; to?: Date }
  onChange: (range: { from?: Date; to?: Date }) => void
}

export function DateRangeFilter({ dateRange, onChange }: DateRangeFilterProps) {
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...dateRange, from: e.target.value ? new Date(e.target.value) : undefined })
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...dateRange, to: e.target.value ? new Date(e.target.value) : undefined })
  }

  const handleClear = () => {
    onChange({})
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Filter by Date Range</label>
      <div className="flex gap-2">
        <input
          type="date"
          value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
          onChange={handleFromChange}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="From"
        />
        <input
          type="date"
          value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
          onChange={handleToChange}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="To"
        />
        {(dateRange.from || dateRange.to) && (
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
