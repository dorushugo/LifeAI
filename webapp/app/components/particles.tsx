"use client"

import type React from "react"
import { useRef, useEffect, useCallback } from "react"

class Pixel {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string

  constructor(canvas: HTMLCanvasElement) {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.size = Math.random() * 2 + 1 // Taille entre 1 et 3 pixels
    this.speedX = Math.random() * 0.5 - 0.25
    this.speedY = Math.random() * 0.5 - 0.25
    this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`
  }

  update(canvas: HTMLCanvasElement) {
    this.x += this.speedX
    this.y += this.speedY

    if (this.x > canvas.width) this.x = 0
    else if (this.x < 0) this.x = canvas.width

    if (this.y > canvas.height) this.y = 0
    else if (this.y < 0) this.y = canvas.height
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.size, this.size)
  }
}

const PixelBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pixelsRef = useRef<Pixel[]>([])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      pixelsRef.current.forEach((pixel) => {
        pixel.update(canvas)
        pixel.draw(ctx)
      })
    }

    requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const pixelCount = Math.floor((canvas.width * canvas.height) / 5000) // Augmente le nombre de pixels
      pixelsRef.current = Array(pixelCount)
        .fill(null)
        .map(() => new Pixel(canvas))

      animate()
    }

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        // Recréer les pixels lors du redimensionnement
        const pixelCount = Math.floor((canvas.width * canvas.height) / 5000)
        pixelsRef.current = Array(pixelCount)
          .fill(null)
          .map(() => new Pixel(canvas))
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [animate])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full bg-gray-900" style={{ zIndex: -1 }} />
}

export default PixelBackground