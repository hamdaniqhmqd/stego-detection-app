// components/Dashboard/ui/ActionBtn.tsx

'use client'

interface ActionBtnProps {
    icon: React.ReactNode
    label: string
    onClick: () => void
    danger?: boolean
}

export function ActionBtn({ icon, label, onClick, danger }: ActionBtnProps) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs transition-all duration-150
                ${danger
                    ? 'hover:bg-red-200 text-red-600 hover:text-red-900'
                    : 'hover:bg-neutral-200 text-neutral-600 hover:text-neutral-700'
                }`}
        >
            {icon}
        </button>
    )
}