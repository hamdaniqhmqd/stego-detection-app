// components/Dashboard/ui/ToggleSwitch.tsx
'use client'

interface ToggleSwitchProps {
    checked: boolean
    onChange: (val: boolean) => void
    label: string
}

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
    return (
        <label className="flex items-center gap-2 text-xs text-neutral-500 cursor-pointer select-none">
            <button
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`w-9 h-5 rounded-full relative transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400
                    ${checked ? 'bg-neutral-800' : 'bg-neutral-200'}`}
            >
                <span className={`absolute top-0.5 w-4 h-4 bg-neutral-50 rounded-full shadow-sm transition-transform
                    ${checked ? '-translate-x-4' : 'translate-x-0.5'}`}
                />
            </button>
            {label}
        </label>
    )
}