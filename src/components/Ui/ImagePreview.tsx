import { useState } from "react"

export function ImagePreview({ src }: { src?: string }) {
    const [err, setErr] = useState(false)
    if (!src || err) {
        return (
            <div className="w-full h-44 rounded-sm bg-neutral-100 border border-neutral-200
                flex flex-col items-center justify-center gap-2 text-neutral-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,200V172l52-52,44,44,20-20,40,40.07L196.07,216H40A0,0,0,0,1,40,200Z" />
                </svg>
                <span className="text-xs">Gambar tidak tersedia</span>
            </div>
        )
    }
    return (
        <div className="w-full rounded-sm overflow-hidden border border-neutral-200 bg-neutral-100">
            <img src={src} alt="preview" className="w-full max-h-56 object-contain" onError={() => setErr(true)} />
        </div>
    )
}