"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Smartphone, Wifi, AlertCircle, CheckCircle } from "lucide-react"

interface NFCScannerProps {
  onScan: (rollNumber: string) => void
  scanning: boolean
  currentSlot: number | null
}

export function NFCScanner({ onScan, scanning, currentSlot }: NFCScannerProps) {
  const [nfcSupported, setNfcSupported] = useState(true)
  const [error, setError] = useState("")

  const startNFCScan = async () => {
    try {
      // Check if Web NFC is supported
      if (!("NDEFReader" in window)) {
        setNfcSupported(false)
        setError("NFC is not supported on this device/browser")
        return
      }

      // Request NFC permission and start scanning
      const ndef = new (window as any).NDEFReader()

      await ndef.scan()

      ndef.addEventListener("reading", ({ message }: any) => {
        // Parse NFC tag data
        for (const record of message.records) {
          if (record.recordType === "text") {
            const textDecoder = new TextDecoder(record.encoding)
            const rollNumber = textDecoder.decode(record.data)
            onScan(rollNumber)
            break
          }
        }
      })

      ndef.addEventListener("readingerror", () => {
        setError("Failed to read NFC tag")
      })
    } catch (error: any) {
      setError(`NFC Error: ${error.message}`)
      setNfcSupported(false)
    }
  }

  const simulateScan = () => {
    // Simulate NFC scan for demo purposes
    setTimeout(() => {
      onScan("CB.SC.U4CSE24124")
    }, 2000)
  }

  return (
    <Card className="border-2 border-black">
      <CardHeader className="border-b-2 border-black bg-gray-50">
        <CardTitle className="text-black flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          NFC Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert className="mb-4 border-red-600">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {!nfcSupported && (
          <Alert className="mb-4 border-orange-600">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-orange-600">
              NFC not supported. Using simulation mode for demo.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center space-y-4">
          <div className="w-32 h-32 mx-auto border-4 border-dashed border-gray-300 rounded-full flex items-center justify-center">
            {scanning ? (
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
            ) : nfcSupported ? (
              <Wifi className="h-16 w-16 text-gray-400" />
            ) : (
              <Smartphone className="h-16 w-16 text-gray-400" />
            )}
          </div>

          <Button
            onClick={nfcSupported ? startNFCScan : simulateScan}
            disabled={scanning || !currentSlot}
            className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg"
          >
            {scanning ? "Scanning..." : nfcSupported ? "Start NFC Scan" : "Simulate Scan"}
          </Button>

          <p className="text-sm text-gray-600">
            {currentSlot
              ? nfcSupported
                ? "Hold student's NFC tag near the device"
                : "Click to simulate NFC scan (demo mode)"
              : "Scanning is only available during active class slots"}
          </p>

          {nfcSupported && (
            <Alert className="border-blue-600">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-blue-600">
                NFC is supported on this device. Real scanning is available.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
