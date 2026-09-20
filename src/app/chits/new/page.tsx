'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, UploadCloud, Save, X, RefreshCcw, ScanLine, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createChit } from '@/lib/actions/chit-actions';
import { invoke } from '@tauri-apps/api/tauri';
import Tesseract from 'tesseract.js';

export default function NewChitPage() {
  const router = useRouter();
  const [useWebcam, setUseWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form state
  const [chitNumber, setChitNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [issuingOfficer, setIssuingOfficer] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [rawOcrText, setRawOcrText] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);

  useEffect(() => {
    if (useWebcam && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('Error accessing webcam', err);
          alert('Could not access webcam.');
          setUseWebcam(false);
        });
    } else {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    }
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [useWebcam]);

  const processOcr = async (imageUrl: string) => {
    setIsProcessingOcr(true);
    try {
      const result = await Tesseract.recognize(imageUrl, 'eng');
      const text = result.data.text;
      setRawOcrText(text);
      
      // Simple heuristic for amount (e.g. "Total: 1500" or just finding big numbers)
      const amountMatch = text.match(/(?:Rs|RS|Total|Amount)[\s\:\.\-]*([\d\,]+\.?\d*)/i);
      if (amountMatch && amountMatch[1]) {
        const cleanNumber = amountMatch[1].replace(/,/g, '');
        if (!isNaN(parseFloat(cleanNumber))) {
            setTotalAmount(cleanNumber);
        }
      }
      
      // Simple heuristic for Client Name
      if (text.toLowerCase().includes('secretariat')) {
        setIssuingOfficer('Secretariat Office');
      } else if (text.toLowerCase().includes('gpo')) {
        setIssuingOfficer('GPO');
      }
      
    } catch (err) {
      console.error('OCR failed', err);
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const handleHardwareScan = async () => {
    try {
      setIsProcessingOcr(true);
      // Call Tauri command
      const base64Image = await invoke('scan_from_hardware');
      setCapturedImage(base64Image as string);
      processOcr(base64Image as string);
    } catch (err: any) {
      console.error(err);
      alert(err || 'Scanner failed to connect. Ensure your printer/scanner is powered on and connected via USB or Network.');
      setIsProcessingOcr(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        setUseWebcam(false);
        processOcr(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCapturedImage(dataUrl);
        processOcr(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let savedImagePath = null;
      if (capturedImage && typeof window !== 'undefined' && (window as any).__TAURI_IPC__) {
        try {
          savedImagePath = await invoke('save_chit_image', { base64: capturedImage, chitId: chitNumber });
        } catch (err) {
          console.warn('Tauri IPC failed to save image', err);
        }
      }

      await createChit({
        chitNumber,
        clientId: clientId || 'dummy-client-id-for-now',
        issuingOfficer,
        totalAmount: parseFloat(totalAmount),
        imagePath: savedImagePath,
        rawOcrText,
        items: [], 
      });
      
      router.push('/chits');
    } catch (error) {
      console.error(error);
      alert('Failed to save Chit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Capture New Chit</h1>
          <p className="text-gray-500 text-sm">Digitize physical order slips securely</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          {capturedImage ? (
            <div className="relative w-full h-full min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capturedImage} alt="Scanned Chit" className="object-contain w-full h-full rounded-lg" />
              <button
                type="button"
                onClick={() => { setCapturedImage(null); setRawOcrText(''); }}
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : useWebcam ? (
            <div className="flex flex-col items-center w-full">
              <video ref={videoRef} autoPlay playsInline className="w-full bg-black rounded-lg mirror" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="mt-4 flex gap-4">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-blue-700"
                >
                  Capture
                </button>
                <button
                  type="button"
                  onClick={() => setUseWebcam(false)}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-bold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 w-full">
              <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Camera className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Scan physical slip</h3>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={handleHardwareScan}
                  className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Printer className="h-4 w-4" /> Scan from Hardware
                </button>
                <button
                  type="button"
                  onClick={() => setUseWebcam(true)}
                  className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2"
                >
                  <Camera className="h-4 w-4" /> Start WebCam
                </button>
                <label className="w-full bg-white border-2 border-dashed border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition cursor-pointer flex items-center justify-center gap-2">
                  <UploadCloud className="h-4 w-4" /> Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          )}
          
          {isProcessingOcr && (
            <div className="mt-4 w-full bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center gap-3 text-blue-700">
               <RefreshCcw className="h-5 w-5 animate-spin" />
               <span className="text-sm font-medium">Extracting text via OCR...</span>
            </div>
          )}
          {rawOcrText && !isProcessingOcr && (
            <div className="mt-4 w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 h-24 overflow-y-auto">
              <strong>OCR Raw Data:</strong><br/>
              {rawOcrText}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chit Reference #</label>
              <input
                type="text"
                required
                value={chitNumber}
                onChange={(e) => setChitNumber(e.target.value)}
                placeholder="e.g. CHIT-2024-001"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client ID / Office</label>
              <input
                type="text"
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Type Client UUID (simplified for now)"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Officer / Hint</label>
              <input
                type="text"
                required
                value={issuingOfficer}
                onChange={(e) => setIssuingOfficer(e.target.value)}
                placeholder="e.g. Mr. Tariq"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (PKR)</label>
              <div className="relative">
                  <input
                    type="number"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {rawOcrText && (
                    <span title="Amount extracted from OCR" className="absolute right-3 top-1/2 -translate-y-1/2">
                      <ScanLine className="h-4 w-4 text-emerald-500" />
                    </span>
                  )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting || !capturedImage}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Save Securely to Vault
              </button>
              {!capturedImage && (
                <p className="text-xs text-center text-rose-500 mt-2 font-medium">
                  * You must scan or attach a physical chit image before saving.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}