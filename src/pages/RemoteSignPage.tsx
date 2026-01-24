// Remote Signature Page - Allows signing from any device via QR/Link
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, PenLine, Trash2, CheckCircle, XCircle, Loader2, Upload, Camera, Smartphone, Globe } from 'lucide-react';
import * as SignatureService from '../services/signatureService';

type SignMode = 'draw' | 'type' | 'upload' | 'camera';

export default function RemoteSignPage() {
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

    // Peer connection state
    const [remoteSigner, setRemoteSigner] = useState<{ sendSignature: (data: string, name?: string) => void, disconnect: () => void } | null>(null);
    const [isPeerConnected, setIsPeerConnected] = useState(false);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const signatureFonts = [
        { name: 'Homemade Apple', style: 'font-signature1' },
        { name: 'Dancing Script', style: 'font-signature2' },
        { name: 'Pacifico', style: 'font-signature3' },
        { name: 'Great Vibes', style: 'font-signature4' },
    ];

    // Load session and connect to Peer
    useEffect(() => {
        if (sessionId) {
            const loadedSession = SignatureService.getSignatureSession(sessionId);

            if (!loadedSession) {
                // If not in local storage (different device), we still try to connect to the peer
                setStatus('ready');
            } else {
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

            // Connect to host device via PeerJS
            console.log('[RemoteSign] Attempting to connect to host via PeerJS...');
            const signer = SignatureService.connectAsSigner(sessionId, () => {
                setIsPeerConnected(true);
                console.log('[RemoteSign] ✅ Successfully connected to host device via PeerJS');
            });

            if (signer) {
                setRemoteSigner(signer);
            }

            return () => {
                if (signer) signer.disconnect();
            };
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
        setHasSignature(false);
    }, [canvasSize, signMode, isMobile]);

    const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / (rect.width * window.devicePixelRatio);
        const scaleY = canvas.height / (rect.height * window.devicePixelRatio);

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
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
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

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    // Type mode font cycle
    const cycleFont = () => {
        setSelectedFont((prev) => (prev + 1) % signatureFonts.length);
    };

    const generateTypedSignature = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        ctx.clearRect(0, 0, 600, 150);
        ctx.fillStyle = '#000';
        ctx.font = `64px "${signatureFonts[selectedFont].name}", cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName || signerName, canvas.width / 2, canvas.height / 2);

        return canvas.toDataURL('image/png');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target?.result as string);
                setHasSignature(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        setIsCameraActive(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setIsCameraActive(false);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                setUploadedImage(canvas.toDataURL('image/png'));
                setHasSignature(true);
                const stream = videoRef.current.srcObject as MediaStream;
                if (stream) stream.getTracks().forEach(track => track.stop());
                setIsCameraActive(false);
            }
        }
    };

    const submitSignature = async () => {
        if (!signerName) {
            alert('Please enter your name');
            return;
        }

        setStatus('signing');
        let signatureDataUrl = '';

        try {
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

            if (!signatureDataUrl || signatureDataUrl === 'data:,') {
                alert('Signature is empty. Please draw something first.');
                setStatus('ready');
                return;
            }

            // Send via PeerJS if connected
            if (remoteSigner) {
                console.log('[RemoteSign] Sending signature via PeerJS...');
                remoteSigner.sendSignature(signatureDataUrl, signerName);
            }

            // ALWAYS try local completion as well (fallback + same-browser support)
            SignatureService.completeSignatureSession(sessionId!, signatureDataUrl, signerName);

            setStatus('success');
        } catch (err) {
            console.error('Failed to submit signature:', err);
            setStatus('ready');
            alert('Error submitting signature. Please try again.');
        }
    };

    const canSubmit = () => {
        if (!signerName) return false;
        if (signMode === 'draw') return hasSignature;
        if (signMode === 'type') return typedName.length > 0;
        return !!uploadedImage;
    };

    // Error states
    if (status === 'error') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Session</h2>
                    <p className="text-gray-600 mb-6 font-medium">This signature link is invalid, expired, or has already been used.</p>
                    <button onClick={() => navigate('/')} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-tight active:scale-95 transition-all">Go to Homepage</button>
                </div>
            </div>
        );
    }

    if (status === 'expired') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Link Expired</h2>
                    <p className="text-gray-600 mb-6 font-medium">This signing link has expired for security reasons.</p>
                    <button onClick={() => navigate('/')} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-tight active:scale-95 transition-all">Go to Homepage</button>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
                <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Success!</h2>
                    <p className="text-gray-500 mb-8 font-medium">Your signature has been securely transmitted. You can now close this window.</p>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Signed as</p>
                        <p className="text-lg font-bold text-gray-800">{signerName}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <PenLine className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-gray-900 uppercase tracking-tight">Secure E-Sign</h1>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${isPeerConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                {isPeerConnected ? 'Connected Live' : 'Connecting...'}
                            </p>
                        </div>
                    </div>
                </div>
                {session?.documentName && (
                    <div className="hidden md:block px-4 py-1.5 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
                        {session.documentName}
                    </div>
                )}
            </div>

            {/* Main Interface */}
            <div className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-8">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full">
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-gray-100">
                        <div
                            className="h-full bg-indigo-600 transition-all duration-500"
                            style={{ width: signerName && canSubmit() ? '100%' : signerName ? '50%' : '10%' }}
                        />
                    </div>

                    <div className="p-6 sm:p-10 flex-1 flex flex-col">
                        <div className="mb-8">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Your Full Name</label>
                            <input
                                type="text"
                                value={signerName}
                                onChange={(e) => {
                                    setSignerName(e.target.value);
                                    if (signMode === 'type' && !typedName) setTypedName(e.target.value);
                                }}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg font-bold text-gray-800 placeholder:text-gray-300"
                                placeholder="Enter your name for the signature"
                            />
                        </div>

                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Signature</label>
                                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                                    {(['draw', 'type', 'upload', 'camera'] as SignMode[]).map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setSignMode(mode)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${signMode === mode ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 min-h-[250px] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 relative group overflow-hidden transition-colors hover:border-indigo-300">
                                {signMode === 'draw' && (
                                    <div className="absolute inset-0 flex flex-col" ref={containerRef}>
                                        <canvas
                                            ref={canvasRef}
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchMove={draw}
                                            onTouchEnd={stopDrawing}
                                            className="flex-1 cursor-crosshair touch-none"
                                        />
                                        <div className="p-4 flex justify-between items-center bg-white/50 backdrop-blur-sm border-t border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Draw in the box above</p>
                                            <button onClick={clearCanvas} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {signMode === 'camera' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                        {isCameraActive ? (
                                            <div className="w-full h-full flex flex-col gap-4">
                                                <div className="flex-1 bg-black rounded-2xl overflow-hidden relative">
                                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                                </div>
                                                <button
                                                    onClick={capturePhoto}
                                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-tight"
                                                >
                                                    Capture Photo
                                                </button>
                                            </div>
                                        ) : uploadedImage ? (
                                            <div className="relative group">
                                                <img src={uploadedImage} alt="Captured" className="max-h-[180px] object-contain" />
                                                <button onClick={() => setUploadedImage(null)} className="absolute -top-4 -right-4 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-500">
                                                    <Camera className="w-8 h-8" />
                                                </div>
                                                <button onClick={startCamera} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest">Start Camera</button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {signMode === 'type' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                                        <input
                                            type="text"
                                            value={typedName}
                                            onChange={(e) => setTypedName(e.target.value)}
                                            className="w-full text-center bg-transparent border-none outline-none text-4xl mb-8 placeholder:text-gray-200"
                                            style={{ fontFamily: signatureFonts[selectedFont].name }}
                                            placeholder="Your Signature"
                                        />
                                        <button
                                            onClick={cycleFont}
                                            className="px-6 py-2 bg-white rounded-full shadow-md border border-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                                        >
                                            Change Style
                                        </button>
                                        <style>{`
                                            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script&family=Great+Vibes&family=Pacifico&family=Homemade+Apple&display=swap');
                                        `}</style>
                                    </div>
                                )}

                                {signMode === 'upload' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                                        {uploadedImage ? (
                                            <div className="relative group">
                                                <img src={uploadedImage} alt="Signature" className="max-h-[180px] object-contain" />
                                                <button
                                                    onClick={() => setUploadedImage(null)}
                                                    className="absolute -top-4 -right-4 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-500">
                                                    <Upload className="w-8 h-8" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-600 mb-4">Upload an image of your signature</p>
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all"
                                                >
                                                    Select Image
                                                </button>
                                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-10 bg-gray-50 border-t border-gray-100 flex flex-col items-center gap-6">
                        <button
                            onClick={submitSignature}
                            disabled={!canSubmit() || status === 'signing'}
                            className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-tight flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] ${canSubmit() && status !== 'signing' ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                        >
                            {status === 'signing' ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="w-6 h-6" />
                                    <span>Complete Signing</span>
                                </>
                            )}
                        </button>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-gray-400" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile Ready</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-gray-400" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secure Sync</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
