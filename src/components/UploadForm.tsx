'use client'

import { useState, useRef } from 'react'
import { Upload, FileImage, Shield, Brain, CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react'

export default function UploadForm() {
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState('')
    const [error, setError] = useState('')
    const [result, setResult] = useState<any>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    async function handleAnalyze() {
        const file = fileInputRef.current?.files?.[0]
        if (!file) {
            setError('Please select an image file')
            return
        }

        setLoading(true)
        setError('')
        setStep('Uploading image...')

        try {
            const fd = new FormData()
            fd.append('file', file)

            // 1. Upload
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
            if (!uploadRes.ok) {
                const err = await uploadRes.text()
                throw new Error(`Upload failed: ${err}`)
            }
            const img = await uploadRes.json()

            // 2. Create analysis
            setStep('Creating analysis record...')
            const analysisRes = await fetch('/api/analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(img)
            })
            if (!analysisRes.ok) {
                const err = await analysisRes.text()
                throw new Error(`Analysis failed: ${err}`)
            }
            const analysis = await analysisRes.json()

            // 3. Force decode
            setStep('Force decoding steganography...')
            const forceRes = await fetch('/api/force-decode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysis_id: analysis.id,
                    image_url: img.url
                })
            })
            if (!forceRes.ok) {
                const err = await forceRes.text()
                throw new Error(`Force decode failed: ${err}`)
            }
            const force = await forceRes.json()

            // 4. AI interpretation
            setStep('AI is analyzing the decoded text... (this may take 10-15 seconds)')
            const aiRes = await fetch('/api/ai-interpretation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    force_decode_id: force.id,
                    decoded_raw: force.decoded_raw
                })
            })
            if (!aiRes.ok) {
                const err = await aiRes.text()
                throw new Error(`AI interpretation failed: ${err}`)
            }
            const aiResult = await aiRes.json()

            setResult({ ...force, ...aiResult })
            setStep('')

        } catch (err: any) {
            setError(err.message)
            setStep('')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px 20px'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', color: 'white', marginBottom: '40px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px'
                    }}>
                        <Shield size={40} />
                        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
                            Steganalysis Force Decode
                        </h1>
                    </div>
                    <p style={{
                        fontSize: '16px',
                        opacity: 0.9,
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Deteksi penyisipan data tersembunyi pada gambar menggunakan teknik LSB steganalysis dengan AI interpretation
                    </p>
                </div>

                {/* Upload Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        border: '2px dashed #cbd5e0',
                        borderRadius: '12px',
                        padding: '40px',
                        textAlign: 'center',
                        background: '#f7fafc'
                    }}>
                        <FileImage size={48} style={{ margin: '0 auto 16px', color: '#667eea' }} />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            disabled={loading}
                            style={{
                                display: 'block',
                                margin: '0 auto 12px',
                                padding: '8px',
                                fontSize: '14px'
                            }}
                        />
                        <p style={{ color: '#718096', fontSize: '14px', margin: 0 }}>
                            Pilih gambar PNG/JPG (Max 5MB)
                        </p>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        style={{
                            width: '100%',
                            marginTop: '20px',
                            padding: '14px',
                            background: loading ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Upload size={20} />
                                Analyze Image
                            </>
                        )}
                    </button>

                    {/* Loading Progress */}
                    {loading && step && (
                        <div style={{
                            marginTop: '24px',
                            padding: '16px',
                            background: '#edf2f7',
                            borderRadius: '8px',
                            borderLeft: '4px solid #667eea'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Loader2 size={20} className="animate-spin" style={{ color: '#667eea' }} />
                                <span style={{ color: '#2d3748', fontWeight: '500' }}>{step}</span>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{
                            marginTop: '20px',
                            padding: '16px',
                            background: '#fff5f5',
                            border: '1px solid #fc8181',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '12px'
                        }}>
                            <AlertCircle size={20} style={{ color: '#e53e3e' }} />
                            <div>
                                <strong style={{ color: '#c53030', display: 'block', marginBottom: '4px' }}>Error</strong>
                                <span style={{ color: '#742a2a', fontSize: '14px' }}>{error}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results */}
                {result && (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '28px',
                            paddingBottom: '20px',
                            borderBottom: '2px solid #e2e8f0'
                        }}>
                            <CheckCircle size={28} style={{ color: '#48bb78' }} />
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#2d3748',
                                margin: 0
                            }}>Analysis Complete</h2>
                        </div>

                        {/* Decoded Text */}
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '12px'
                            }}>
                                <FileImage size={20} style={{ color: '#667eea' }} />
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#2d3748',
                                    margin: 0
                                }}>Decoded Text</h3>
                            </div>
                            <div style={{
                                background: '#f7fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '20px',
                                maxHeight: '300px',
                                overflow: 'auto',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: '#4a5568',
                                fontFamily: 'monospace',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}>
                                {result.decoded_raw || '(No hidden data detected)'}
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '8px',
                                fontSize: '13px',
                                color: '#718096'
                            }}>
                                <Info size={14} />
                                <span>Extracted using LSB force-decode algorithm</span>
                            </div>
                        </div>

                        {/* AI Interpretation */}
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '12px'
                            }}>
                                <Brain size={20} style={{ color: '#764ba2' }} />
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#2d3748',
                                    margin: 0
                                }}>AI Interpretation</h3>
                            </div>
                            <div style={{
                                background: 'linear-gradient(135deg, #f0f4ff 0%, #f8f0ff 100%)',
                                border: '1px solid #e9d8fd',
                                borderRadius: '8px',
                                padding: '20px',
                                fontSize: '14px',
                                lineHeight: '1.8',
                                color: '#2d3748',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {result.interpretation || '(No interpretation available)'}
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '8px',
                                fontSize: '13px',
                                color: '#718096'
                            }}>
                                <Info size={14} />
                                <span>Powered by Gemini 1.5 Flash AI</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            marginTop: '24px',
                            paddingTop: '24px',
                            borderTop: '1px solid #e2e8f0'
                        }}>
                            <button
                                onClick={() => {
                                    setResult(null)
                                    if (fileInputRef.current) fileInputRef.current.value = ''
                                }}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    color: 'white',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Analyze Another Image
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div style={{
                    textAlign: 'center',
                    color: 'white',
                    opacity: 0.8,
                    fontSize: '14px',
                    marginTop: '32px'
                }}>
                    <p>🔒 Your files are processed securely and not stored permanently</p>
                </div>
            </div>
        </div>
    )
}