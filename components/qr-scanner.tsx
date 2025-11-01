"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Scan, X } from "lucide-react"

interface QRScannerProps {
  onScan: (result: string) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function QRScanner({ onScan, isOpen, onOpenChange }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const startScanning = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsScanning(true)
          setError(null)
          scanQRCode()
        }
      } catch (err) {
        console.error("[v0] Error accessing camera:", err)
        setError("No se pudo acceder a la cámara. Por favor, verifica los permisos.")
        setIsScanning(false)
      }
    }

    startScanning()

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [isOpen])

  const scanQRCode = () => {
    const canvas = canvasRef.current
    const video = videoRef.current

    if (!canvas || !video) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Simple QR detection - in production, use a library like jsQR
        // For now, we'll just extract the token from the URL
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        // This is a placeholder - implement actual QR decoding with jsQR library
      }

      if (isScanning) {
        requestAnimationFrame(scan)
      }
    }

    scan()
  }

  const handleClose = () => {
    setIsScanning(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Escanear Código QR
          </DialogTitle>
          <DialogDescription>Apunta la cámara al código QR de la sesión</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <Card className="border-destructive">
              <CardContent className="pt-6 text-center text-sm text-destructive">{error}</CardContent>
            </Card>
          ) : (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 border-2 border-accent rounded-lg pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-accent rounded-lg"></div>
              </div>
            </div>
          )}

          <Button variant="outline" onClick={handleClose} className="w-full bg-transparent">
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
