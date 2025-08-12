'use client'

import { useState } from 'react'

export default function ColorPaletteGenerator() {
  const [colors, setColors] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Color Palette Generator",
    "applicationCategory": "DesignApplication",
    "description": "Generate beautiful color palettes for your design projects. Copy hex codes instantly and create stunning color combinations.",
    "url": "https://colorpalette.vercel.app",
    "operatingSystem": "All",
    "permissions": "browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Generate random color palettes",
      "Copy hex codes to clipboard", 
      "Individual color regeneration",
      "Mobile responsive design",
      "Dark mode support"
    ],
    "creator": {
      "@type": "Organization",
      "name": "Color Palette Generator"
    }
  }

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

  const generateSingleColor = (index: number) => {
    const newColors = [...colors]
    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)  
    const b = Math.floor(Math.random() * 256)
    newColors[index] = `rgb(${r}, ${g}, ${b})`
    setColors(newColors)
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <header style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            margin: '0 0 20px 0',
            background: 'linear-gradient(45deg, #fff, #e0e7ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Color Palette Generator
          </h1>
          
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            margin: '0 0 40px 0',
            opacity: '0.9',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6'
          }}>
            Generate beautiful color schemes for your next design project
          </p>
          
          <button
            onClick={generateColors}
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
              color: 'white',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)'
            }}
            aria-label="Generate a new color palette with 5 random colors"
          >
            🎨 Generate New Palette
          </button>
        </header>

        {/* Color Palette */}
        {colors.length > 0 && (
          <main style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px 60px 20px'
          }} role="main" aria-label="Generated color palette">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              marginBottom: '60px'
            }}>
              {colors.map((color, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.25)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)'
                  }}
                  onClick={() => copyColor(color, index)}
                >
                  {/* Regenerate Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      generateSingleColor(index)
                    }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      zIndex: 10,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'white'
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.9)'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                    title="Generate new color"
                  >
                    🔄
                  </button>

                  {/* Color Display */}
                  <div
                    style={{
                      width: '100%',
                      height: '240px',
                      backgroundColor: color,
                      border: 'none',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {/* Hover Overlay */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '0'}
                    >
                      {copiedIndex === index ? '✅ Copied!' : '📋 Click to Copy'}
                    </div>
                  </div>
                  
                  {/* Color Info */}
                  <div style={{
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <p style={{ 
                      margin: '0',
                      fontSize: '16px',
                      color: '#333',
                      fontFamily: 'Monaco, Consolas, monospace',
                      fontWeight: '600',
                      letterSpacing: '0.5px'
                    }}>
                      {(() => {
                        const rgbMatch = color.match(/rgb\((\d+), (\d+), (\d+)\)/)
                        if (rgbMatch) {
                          const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0')
                          const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0')
                          const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0')
                          return `#${r}${g}${b}`.toUpperCase()
                        }
                        return color
                      })()}
                    </p>
                    {copiedIndex === index && (
                      <p style={{ 
                        margin: '8px 0 0 0', 
                        fontSize: '14px', 
                        color: '#22c55e',
                        fontWeight: '600'
                      }}>
                        ✅ Copied to clipboard!
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* Features Section */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '60px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px'
        }} aria-label="App features">
          {[
            { icon: '🎲', title: 'Random Generation', desc: 'Generate endless color combinations with one click' },
            { icon: '📋', title: 'Easy Copy', desc: 'Click any color to copy hex codes instantly' },
            { icon: '📱', title: 'Mobile Friendly', desc: 'Fully responsive design works on all devices' }
          ].map((feature, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '40px 30px',
              textAlign: 'center',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
              e.currentTarget.style.transform = 'translateY(-5px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            >
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>{feature.icon}</div>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                margin: '0 0 15px 0',
                color: 'white'
              }}>
                {feature.title}
              </h2>
              <p style={{ 
                fontSize: '16px', 
                opacity: '0.9',
                margin: '0',
                lineHeight: '1.6'
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.8)'
        }}>
          <p style={{ margin: '0', fontSize: '16px' }}>
            Built with Next.js • Perfect for designers and developers
          </p>
        </footer>
      </div>
    </>
  )
}