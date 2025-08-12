'use client'

import { useState, useCallback } from 'react'

interface Color {
  hex: string
  name: string
}

export default function ColorPaletteGenerator() {
  const [palette, setPalette] = useState<Color[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

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

  const generateRandomColor = (): Color => {
    // Generate a random color using a simple method
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D5DBDB',
      '#FF7675', '#74B9FF', '#0984E3', '#00B894', '#FDCB6E',
      '#E17055', '#81ECEC', '#FD79A8', '#A29BFE', '#6C5CE7'
    ]
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    
    return {
      hex: randomColor,
      name: `Color ${Math.random().toString(36).substring(2, 5).toUpperCase()}`
    }
  }

  const generatePalette = useCallback(() => {
    const newPalette = Array.from({ length: 5 }, () => generateRandomColor())
    console.log('Generated palette:', newPalette) // Debug log
    setPalette(newPalette)
  }, [])

  const copyToClipboard = async (hex: string, index: number) => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const generateSingleColor = (index: number) => {
    const newPalette = [...palette]
    newPalette[index] = generateRandomColor()
    setPalette(newPalette)
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Color Palette Generator
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
            Generate beautiful color schemes for your next design project
          </p>
          <button
            onClick={generatePalette}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            aria-label="Generate a new color palette with 5 random colors"
          >
            Generate New Palette
          </button>
        </header>

        {/* Color Palette */}
        {palette.length > 0 && (
          <main className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8" role="main" aria-label="Generated color palette">
            {palette.map((color, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {/* Color Display */}
                <div
                  className="h-48 md:h-64 cursor-pointer relative"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyToClipboard(color.hex, index)}
                >
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-semibold">
                      {copiedIndex === index ? '✓ Copied!' : 'Click to Copy'}
                    </div>
                  </div>
                  
                  {/* Regenerate Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      generateSingleColor(index)
                    }}
                    className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                
                {/* Color Info */}
                <div className="bg-white dark:bg-gray-800 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">
                        {color.hex}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {color.name}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(color.hex, index)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      {copiedIndex === index ? (
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </main>
        )}

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16" aria-label="App features">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Random Generation</h2>
            <p className="text-gray-600 dark:text-gray-400">Generate endless color combinations with one click</p>
          </div>
          
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Easy Copy</h2>
            <p className="text-gray-600 dark:text-gray-400">Click any color to copy hex codes instantly</p>
          </div>
          
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Mobile Friendly</h2>
            <p className="text-gray-600 dark:text-gray-400">Fully responsive design works on all devices</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center mt-16 py-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            Built with Next.js and Tailwind CSS
          </p>
        </footer>
      </div>
      </div>
    </>
  )
}