// Remote Signature Page - Allows signing from any device via QR/Link
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, PenLine, Trash2, CheckCircle, XCircle, Loader2, Upload, Camera } from 'lucide-react';
import * as SignatureService from '../services/signatureService';

type SignMode = 'draw' | 'type' | 'upload' | 'camera';

export function RemoteSignPage() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();

    const [session, setSession] = useState<SignatureService.SignatureSession | null>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'signing' | 'success' | 'error' | 'expired'>('loading');
    const [signMode, setSignMode] = useState<SignMode>('draw');
    const [signerName, setSignerName] = useState('');

    // Drawing state
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 350, height: 150 });

    // Type state
    const [typedName, setTypedName] = useState('');
    const [selectedFont, setSelectedFont] = useState(0);

    // Upload/Camera state
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const signatureFonts = [
        { name: 'Homemade Apple', style: 'font-signature1' },
        { name: 'Dancing Script', style: 'font-signature2' },
        { name: 'Pacifico', style: 'font-signature3' },
        { name: 'Great Vibes', style: 'font-signature4' },
    ];

    // Load session
    useEffect(() => {
        if (sessionId) {
            const loadedSession = SignatureService.getSignatureSession(sessionId);

            if (!loadedSession) {
                setStatus('error');
                return;
            }

            if (loadedSession.status === 'expired' || new Date(loadedSession.expiresAt) < new Date()) {
                setStatus('expired');
                return;
            }

            if (loadedSession.status === 'signed') {
                setStatus('success');
                return;
            }

            setSession(loadedSession);
            setStatus('ready');
        }
    }, [sessionId]);

    // Canvas sizing
    useEffect(() => {
        if (signMode === 'draw' && containerRef.current) {
            const updateSize = () => {
                const width = Math.min(containerRef.current!.clientWidth - 8, 500);
                setCanvasSize({ width, height: Math.min(width / 2.5, 180) });
            };
            updateSize();
            window.addEventListener('resize', updateSize);
            return () => window.removeEventListener('resize', updateSize);
        }
    }, [signMode]);

    // Initialize canvas
    useEffect(() => {
        if (signMode !== 'draw') return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvasSize.width * dpr;
        canvas.height = canvasSize.height * dpr;
        canvas.style.width = `${canvasSize.width}px`;
        canvas.style.height = `${canvasSize.height}px`;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = isMobile ? 4 : 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, [canvasSize, signMode, isMobile]);

    // Drawing handlers
    const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvasSize.width / rect.width;
        const scaleY = canvasSize.height / rect.height;
        if ('touches' in e) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const { x, y } = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
        setHasSignature(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        e.preventDefault();
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const { x, y } = getCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => setIsDrawing(false);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        setHasSignature(false);
    };

    // Generate typed signature
    const generateTypedSignature = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';
        ctx.clearRect(0, 0, 500, 150);
        ctx.fillStyle = '#000000';
        ctx.font = `48px "${signatureFonts[selectedFont].name}", cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName || 'Your Signature', 250, 75);
        return canvas.toDataURL('image/png');
    };

    // File upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setUploadedImage(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    // Camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: isMobile ? 'environment' : 'user' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraActive(true);
            }
        } catch (err) {
            console.error('Camera error:', err);
            alert('Camera access denied');
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            setIsCameraActive(false);
        }
    };

    const captureFromCamera = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            setUploadedImage(canvas.toDataURL('image/png'));
            stopCamera();
        }
    };

    // Submit signature
    const submitSignature = async () => {
        if (!sessionId) return;

        setStatus('signing');

        let signatureDataUrl = '';

        switch (signMode) {
            case 'draw':
                signatureDataUrl = canvasRef.current?.toDataURL('image/png') || '';
                break;
            case 'type':
                signatureDataUrl = generateTypedSignature();
                break;
            case 'upload':
            case 'camera':
                signatureDataUrl = uploadedImage || '';
                break;
        }

        if (!signatureDataUrl) {
            setStatus('ready');
            return;
        }

        try {
            const success = SignatureService.completeSignatureSession(sessionId, signatureDataUrl, signerName);
            if (success) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error('Failed to submit signature:', err);
            setStatus('error');
        }
    };

    const canSubmit = () => {
        switch (signMode) {
            case 'draw': return hasSignature;
            case 'type': return typedName.trim().length > 0;
            case 'upload':
            case 'camera': return !!uploadedImage;
            default: return false;
        }
    };

    const modes = [
        { id: 'draw' as const, icon: PenLine, label: 'Draw' },
        { id: 'type' as const, icon: PenLine, label: 'Type' },
        { id: 'upload' as const, icon: Upload, label: 'Upload' },
        { id: 'camera' as const, icon: Camera, label: 'Camera' },
    ];

    // Loading state
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading signature request...</p>
                </div>
            </div>
        );
    }

    // Error/Expired state
    if (status === 'error' || status === 'expired') {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {status === 'expired' ? 'Link Expired' : 'Invalid Request'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {status === 'expired'
                            ? 'This signature link has expired. Please request a new link.'
                            : 'This signature link is invalid or has already been used.'}
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium"
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
        );
    }

    // Success state
    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Signature Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        Your signature has been successfully submitted. You can close this window.
                    </p>
                    <button
                        onClick={() => window.close()}
                        className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    // Signing state
    if (status === 'signing') {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Submitting your signature...</p>
                </div>
            </div>
        );
    }

    // Ready - main signing interface
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:py-8">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Homemade+Apple&family=Pacifico&display=swap');
                .font-signature1 { font-family: 'Homemade Apple', cursive; }
                .font-signature2 { font-family: 'Dancing Script', cursive; }
                .font-signature3 { font-family: 'Pacifico', cursive; }
                .font-signature4 { font-family: 'Great Vibes', cursive; }
            `}</style>

            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <PenLine className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-900">PDF PhD</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign Document</h1>
                    {session?.documentName && (
                        <p className="text-gray-600">Document: {session.documentName}</p>
                    )}
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Name Input */}
                    <div className="p-4 border-b border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                        <input
                            type="text"
                            value={signerName}
                            onChange={(e) => setSignerName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex border-b border-gray-100">
                        {modes.map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => setSignMode(mode.id)}
                                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-all ${signMode === mode.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500'
                                    }`}
                            >
                                <mode.icon className="w-4 h-4" />
                                {mode.label}
                            </button>
                        ))}
                    </div>

                    {/* Signature Area */}
                    <div className="p-4">
                        {signMode === 'draw' && (
                            <>
                                <div
                                    ref={containerRef}
                                    className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50"
                                >
                                    <canvas
                                        ref={canvasRef}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                        className="w-full cursor-crosshair touch-none rounded-xl"
                                        style={{ touchAction: 'none' }}
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs text-gray-400">Draw your signature above</p>
                                    <button onClick={clearCanvas} className="text-xs text-red-500 flex items-center gap-1">
                                        <Trash2 className="w-3 h-3" /> Clear
                                    </button>
                                </div>
                            </>
                        )}

                        {signMode === 'type' && (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={typedName}
                                    onChange={(e) => setTypedName(e.target.value)}
                                    placeholder="Type your signature"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                />
                                <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50 text-center min-h-[100px] flex items-center justify-center">
                                    <span className={`text-3xl ${signatureFonts[selectedFont].style}`}>
                                        {typedName || 'Your Signature'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedFont((p) => (p + 1) % signatureFonts.length)}
                                    className="text-sm text-blue-500"
                                >
                                    Change style
                                </button>
                            </div>
                        )}

                        {signMode === 'upload' && (
                            <>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                {uploadedImage ? (
                                    <div className="text-center space-y-4">
                                        <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                                            <img src={uploadedImage} alt="Signature" className="max-h-32 mx-auto" />
                                        </div>
                                        <button onClick={() => setUploadedImage(null)} className="text-sm text-red-500">
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-blue-400"
                                    >
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-600">Upload signature image</p>
                                    </button>
                                )}
                            </>
                        )}

                        {signMode === 'camera' && (
                            <>
                                {uploadedImage ? (
                                    <div className="text-center space-y-4">
                                        <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                                            <img src={uploadedImage} alt="Captured" className="max-h-32 mx-auto rounded" />
                                        </div>
                                        <button onClick={() => { setUploadedImage(null); startCamera(); }} className="text-sm text-blue-500">
                                            Retake
                                        </button>
                                    </div>
                                ) : isCameraActive ? (
                                    <div className="space-y-4">
                                        <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-black">
                                            <video ref={videoRef} autoPlay playsInline className="w-full" />
                                        </div>
                                        <div className="flex gap-3 justify-center">
                                            <button onClick={stopCamera} className="px-4 py-2 bg-gray-100 rounded-xl text-sm">Cancel</button>
                                            <button onClick={captureFromCamera} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm">Capture</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={startCamera} className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl text-center">
                                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-600">Capture with camera</p>
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={submitSignature}
                            disabled={!canSubmit()}
                            className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <Check className="w-5 h-5" />
                            Submit Signature
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Your signature is securely transmitted. By signing, you agree to the document terms.
                </p>
            </div>
        </div>
    );
}

export default RemoteSignPage;
