'use client'

import { useState } from 'react'

export default function ColorPaletteGenerator() {
  const [colors, setColors] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generateColors = () => {
    const newColors = []
    for (let i = 0; i < 5; i++) {
      const r = Math.floor(Math.random() * 256)
      const g = Math.floor(Math.random() * 256)  
      const b = Math.floor(Math.random() * 256)
      const hex = `rgb(${r}, ${g}, ${b})`
      newColors.push(hex)
    }
    setColors(newColors)
    console.log('Generated colors:', newColors)
  }

  const copyColor = async (color: string, index: number) => {
    // Convert RGB to hex for copying
    const rgbMatch = color.match(/rgb\((\d+), (\d+), (\d+)\)/)
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0')
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0')
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0')
      const hex = `#${r}${g}${b}`
      
      try {
        await navigator.clipboard.writeText(hex)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
      } catch (err) {
        console.error('Copy failed:', err)
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '3rem', 
          color: '#333',
          marginBottom: '2rem'
        }}>
          Color Palette Generator
        </h1>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <button
            onClick={generateColors}
            style={{
              backgroundColor: '#6366f1',
              color: 'white',
              padding: '12px 24px',
              fontSize: '18px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Generate New Palette
          </button>
        </div>

        {colors.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '3rem'
          }}>
            {colors.map((color, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer'
                }}
                onClick={() => copyColor(color, index)}
              >
                <div
                  style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: color,
                    border: 'none'
                  }}
                />
                <div style={{
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    margin: '0',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: 'monospace'
                  }}>
                    {color}
                  </p>
                  {copiedIndex === index && (
                    <p style={{ 
                      margin: '8px 0 0 0', 
                      fontSize: '12px', 
                      color: '#22c55e',
                      fontWeight: 'bold'
                    }}>
                      ✓ Copied!
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', color: '#666' }}>
          <p>Click on any color to copy its hex code</p>
        </div>
      </div>
    </div>
  )
}