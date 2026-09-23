import type { SizePreset } from "~lib/types"

interface PresetGridProps {
  presets: SizePreset[]
  onSelect: (preset: SizePreset) => void
  disabled?: boolean
}

export function PresetGrid({ presets, onSelect, disabled }: PresetGridProps) {
  return (
    <div className="preset-grid">
      {presets.map((preset) => (
        <button
          key={preset.id}
          className="preset-button"
          disabled={disabled}
          onClick={() => onSelect(preset)}
          title={`${preset.width} x ${preset.height}`}>
          {preset.label}
        </button>
      ))}
    </div>
  )
}
