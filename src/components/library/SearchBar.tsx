'use client'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Search Content</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by text..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      />
    </div>
  )
}
