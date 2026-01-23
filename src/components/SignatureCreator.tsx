// E-Signature & Initials Creator Component - PDFfiller Style with Extended Options
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Pen, Upload, X, Camera, ChevronLeft, QrCode, Smartphone, Mail, Shield, Copy, Check, ExternalLink } from 'lucide-react';
import Peer from 'peerjs';

export type CreatorMode = 'draw' | 'type' | 'upload' | 'capture' | 'qrcode' | 'sms' | 'email' | 'notarize';

interface SignatureCreatorProps {
    onSave: (signatureData: string, initialsData: string | null, signatureType: CreatorMode) => void;
    onClose: () => void;
    existingSignature?: string;
}

const SIGNATURE_FONTS = [
    { name: 'Brush Script MT', font: 'Brush Script MT, cursive' },
    { name: 'Lucida Handwriting', font: 'Lucida Handwriting, cursive' },
    { name: 'Segoe Script', font: 'Segoe Script, cursive' },
    { name: 'Dancing Script', font: 'Dancing Script, cursive' },
    { name: 'Pacifico', font: 'Pacifico, cursive' },
    { name: 'Great Vibes', font: 'Great Vibes, cursive' },
];

export function SignatureCreator({
    onSave,
    onClose,
    existingSignature,
}: SignatureCreatorProps) {
    const [creatorMode, setCreatorMode] = useState<CreatorMode>(existingSignature ? 'draw' : 'type');
    const [isDrawing, setIsDrawing] = useState(false);

    // Typed Signature
    const [fullName, setFullName] = useState('');
    const [initials, setInitials] = useState('');
    const [selectedFont, setSelectedFont] = useState(0);
    const strokeColor = '#000000';

    // Uploaded
    const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
    const [uploadedInitials, setUploadedInitials] = useState<string | null>(null);

    // Canvas for drawing and camera capture
    const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
    const initialsCanvasRef = useRef<HTMLCanvasElement>(null);
    const signatureCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const initialsCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    const [activeCanvas, setActiveCanvas] = useState<'signature' | 'initials'>('signature');
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const [_mobilePhone, _setMobilePhone] = useState('');
    const [mobileEmail, setMobileEmail] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [signingLinkSent, setSigningLinkSent] = useState(false);

    const [mobilePeerConnected, setMobilePeerConnected] = useState(false);
    const [signerStatus, setSignerStatus] = useState<'waiting' | 'connected' | 'drawing'>('waiting');
    const [sessionId] = useState(`pdf-sign-${Math.random().toString(36).substr(2, 9)}`);
    const peerRef = useRef<any>(null);

    // Initialize PeerJS for Desktop (sender side)
    useEffect(() => {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        if (!sessionId) return;

        console.log('[SignatureCreator] Creating Peer with session:', sessionId);

        // Set up BroadcastChannel for same-browser tab communication (fast and reliable)
        const channel = new BroadcastChannel(`pdf-sign-${sessionId}`);

        channel.onmessage = (event) => {
            console.log('[SignatureCreator] BroadcastChannel message:', event.data.type);

            if (event.data.type === 'hello' && event.data.from === 'remote') {
                // Remote tab is trying to connect
                console.log('[SignatureCreator] ✅ Remote tab connected via BroadcastChannel!');
                setMobilePeerConnected(true);
                setSignerStatus('connected');
                // Send ping to confirm connection
                channel.postMessage({ type: 'ping' });
            } else if (event.data.type === 'signature' && event.data.data) {
                // Received signature via BroadcastChannel
                console.log('[SignatureCreator] ✅ Signature received via BroadcastChannel!');
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Signature Received!', {
                        body: 'The recipient has signed the document.',
                        icon: '/favicon.png'
                    });
                }
                onSave(event.data.data, null, 'qrcode');
            } else if (event.data.type === 'drawing_status' && event.data.status === 'active') {
                setSignerStatus('drawing');
            }
        };

        // Also set up PeerJS for cross-device communication
        const peer = new Peer(sessionId, {
            debug: 1,
            config: {
                iceServers: [
                    // Google STUN servers
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                    // Open Relay TURN servers (FREE - 20GB/month)
                    {
                        urls: 'stun:stun.relay.metered.ca:80',
                    },
                    {
                        urls: 'turn:global.relay.metered.ca:80',
                        username: 'e8dd65b92f6f118e4ec4f009',
                        credential: 'uWdWNmkhvyqTW1QP',
                    },
                    {
                        urls: 'turn:global.relay.metered.ca:80?transport=tcp',
                        username: 'e8dd65b92f6f118e4ec4f009',
                        credential: 'uWdWNmkhvyqTW1QP',
                    },
                    {
                        urls: 'turn:global.relay.metered.ca:443',
                        username: 'e8dd65b92f6f118e4ec4f009',
                        credential: 'uWdWNmkhvyqTW1QP',
                    },
                    {
                        urls: 'turns:global.relay.metered.ca:443?transport=tcp',
                        username: 'e8dd65b92f6f118e4ec4f009',
                        credential: 'uWdWNmkhvyqTW1QP',
                    },
                ]
            }
        });
        peerRef.current = peer;

        peer.on('open', (id) => {
            console.log('[SignatureCreator] ✅ PeerJS opened with ID:', id);
        });

        peer.on('connection', (conn) => {
            console.log('[SignatureCreator] ✅ Incoming PeerJS connection from remote device');
            setMobilePeerConnected(true);
            setSignerStatus('connected');

            conn.on('data', (payload: any) => {
                console.log('[SignatureCreator] PeerJS received data:', payload.type);
                if (payload.type === 'signature' && payload.data) {
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('Signature Received!', {
                            body: 'The recipient has signed the document.',
                            icon: '/favicon.png'
                        });
                    }
                    onSave(payload.data, null, 'qrcode');
                } else if (payload.type === 'drawing_status' && payload.status === 'active') {
                    setSignerStatus('drawing');
                }
            });

            conn.on('close', () => {
                console.log('[SignatureCreator] PeerJS connection closed');
            });
        });

        peer.on('error', (err: any) => {
            console.error('[SignatureCreator] Peer error:', err.type, err.message);
            // BroadcastChannel still works even if PeerJS fails
        });

        peer.on('disconnected', () => {
            console.log('[SignatureCreator] Disconnected from signaling, reconnecting...');
            if (peerRef.current && !peerRef.current.destroyed) {
                peerRef.current.reconnect();
            }
        });

        return () => {
            console.log('[SignatureCreator] Destroying peer and closing channel');
            peer.destroy();
            channel.close();
        };
    }, [sessionId, onSave]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isCameraActive) {
                    stopCamera();
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, isCameraActive]);

    // Handle video stream binding when camera becomes active
    useEffect(() => {
        if (isCameraActive && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [isCameraActive, stream]);

    // Helper to send link via Email/SMS/System Share
    const handleSendLink = async (method: 'email' | 'sms' | 'share') => {
        const signLink = `${window.location.origin}/remote-sign?session=${sessionId}`;
        const subject = encodeURIComponent('Signature Request - ' + (fullName || 'Document'));
        const body = encodeURIComponent(`Please sign this document using another device by clicking the link below:\n\n${signLink}\n\nThank you!`);

        if (method === 'share' && navigator.share) {
            try {
                await navigator.share({
                    title: 'Sign Document',
                    text: 'Please sign this document:',
                    url: signLink
                });
                setSigningLinkSent(true);
            } catch (err) {
                console.log('Share failed', err);
            }
        } else if (method === 'email') {
            if (!mobileEmail && !navigator.share) {
                alert('Please enter an email address');
                return;
            }
            window.location.href = `mailto:${mobileEmail}?subject=${subject}&body=${body}`;
            setSigningLinkSent(true);
        }
    };

    // Auto-generate initials from full name
    useEffect(() => {
        if (fullName && !initials) {
            const parts = fullName.trim().split(/\s+/);
            const autoInitials = parts.map(p => p[0]?.toUpperCase() || '').join('');
            setInitials(autoInitials);
        }
    }, [fullName]);

    // Initialize canvas
    // Initialize canvas with handling for modal transitions
    useEffect(() => {
        const initCanvas = (canvas: HTMLCanvasElement | null, ctxRef: React.MutableRefObject<CanvasRenderingContext2D | null>) => {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const dpr = window.devicePixelRatio || 1;

            // Only resize if dimensions changed to avoid clearing content
            if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;

                // CRITICAL: Set CSS dimensions to maintain visual size on HiDPI displays
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;

                // Reset transform before scaling to prevent accumulation
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(dpr, dpr);
                ctx.strokeStyle = strokeColor;
                ctx.fillStyle = strokeColor;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // Store context in ref
                ctxRef.current = ctx;
            } else if (!ctxRef.current) {
                // Context not yet stored, store it now
                ctxRef.current = ctx;
            }
        };

        const timer = setTimeout(() => {
            initCanvas(signatureCanvasRef.current, signatureCtxRef);
            initCanvas(initialsCanvasRef.current, initialsCtxRef);
        }, 50);

        // Also observe resizes
        const observer = new ResizeObserver(() => {
            initCanvas(signatureCanvasRef.current, signatureCtxRef);
            initCanvas(initialsCanvasRef.current, initialsCtxRef);
        });

        if (signatureCanvasRef.current) observer.observe(signatureCanvasRef.current);
        if (initialsCanvasRef.current) observer.observe(initialsCanvasRef.current);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [creatorMode, strokeColor]);

    // Camera handlers
    const startCamera = async () => {
        setCreatorMode('capture');
        setIsCameraActive(true);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
        } catch (err) {
            console.error('Camera Error:', err);
            alert('Could not access camera. Please check permissions and ensure no other app is using it.');
            setIsCameraActive(false);
            setCreatorMode('type');
        }
    };

    const captureFromCamera = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/png');

        if (activeCanvas === 'signature') {
            setUploadedSignature(imageData);
        } else {
            setUploadedInitials(imageData);
        }

        stopCamera();
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraActive(false);
    };

    // Drawing handlers
    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent, canvas: 'signature' | 'initials') => {
        e.preventDefault();
        setIsDrawing(true);
        setActiveCanvas(canvas);
        const canvasEl = canvas === 'signature' ? signatureCanvasRef.current : initialsCanvasRef.current;
        const ctx = canvas === 'signature' ? signatureCtxRef.current : initialsCtxRef.current;
        if (!canvasEl || !ctx) return;

        const rect = canvasEl.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
        lastPos.current = { x, y };

        // Draw a dot at start point for visibility
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
    }, []);

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!isDrawing || !lastPos.current) return;

        const canvasEl = activeCanvas === 'signature' ? signatureCanvasRef.current : initialsCanvasRef.current;
        const ctx = activeCanvas === 'signature' ? signatureCtxRef.current : initialsCtxRef.current;
        if (!canvasEl || !ctx) return;

        const rect = canvasEl.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

        // Ensure stroke settings are correct
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        lastPos.current = { x, y };
    }, [isDrawing, activeCanvas, strokeColor]);

    const stopDrawing = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
        if (e) e.preventDefault();
        setIsDrawing(false);
        lastPos.current = null;
    }, []);

    const clearCanvas = (which: 'signature' | 'initials') => {
        const canvasEl = which === 'signature' ? signatureCanvasRef.current : initialsCanvasRef.current;
        const ctx = which === 'signature' ? signatureCtxRef.current : initialsCtxRef.current;
        if (!canvasEl || !ctx) return;

        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        ctx.scale(dpr, dpr);

        // Restore stroke settings
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    };

    // File upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'signature' | 'initials') => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (target === 'signature') {
                setUploadedSignature(event.target?.result as string);
            } else {
                setUploadedInitials(event.target?.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    // Generate typed signature as image
    const generateTypedSignature = (text: string, isInitials: boolean = false): string => {
        const canvas = document.createElement('canvas');
        canvas.width = isInitials ? 200 : 600;
        canvas.height = isInitials ? 100 : 150;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        // ctx.fillStyle = '#ffffff';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = strokeColor;
        ctx.font = `${isInitials ? 48 : 56}px ${SIGNATURE_FONTS[selectedFont].font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        return canvas.toDataURL('image/png');
    };

    // Save handler
    const handleSave = () => {
        let signatureData = '';
        let initialsData = '';

        if (creatorMode === 'draw') {
            signatureData = signatureCanvasRef.current?.toDataURL('image/png') || '';
            initialsData = initialsCanvasRef.current?.toDataURL('image/png') || '';
        } else if (creatorMode === 'type') {
            if (!fullName.trim()) {
                alert('Please enter your full name');
                return;
            }
            signatureData = generateTypedSignature(fullName);
            initialsData = generateTypedSignature(initials, true);
        } else if (creatorMode === 'upload' || creatorMode === 'capture') {
            signatureData = uploadedSignature || '';
            initialsData = uploadedInitials || '';
        }

        onSave(signatureData, initialsData, creatorMode);
    };

    const cycleFont = () => {
        setSelectedFont((prev) => (prev + 1) % SIGNATURE_FONTS.length);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 font-sans">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        {creatorMode !== 'type' && (
                            <button
                                onClick={() => setCreatorMode('type')}
                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                        <h2 className="text-lg font-semibold text-gray-800">Create signature and initials</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-white">
                    {creatorMode === 'type' ? (
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-base font-medium text-gray-700">Type your signature and initials</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Full Name Section */}
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="Abdul Rahman"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900"
                                            />
                                        </div>

                                        <div className="h-24 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center relative group">
                                            <span
                                                className="text-3xl text-gray-800 transition-all"
                                                style={{ fontFamily: SIGNATURE_FONTS[selectedFont].font }}
                                            >
                                                {fullName || 'Your Signature'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <button
                                                onClick={cycleFont}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                            >
                                                Change style
                                            </button>
                                        </div>
                                    </div>

                                    {/* Initials Section */}
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Initials</label>
                                            <input
                                                type="text"
                                                value={initials}
                                                onChange={(e) => setInitials(e.target.value)}
                                                placeholder="AR"
                                                maxLength={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900"
                                            />
                                        </div>

                                        <div className="h-24 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center relative group">
                                            <span
                                                className="text-3xl text-gray-800 transition-all"
                                                style={{ fontFamily: SIGNATURE_FONTS[selectedFont].font }}
                                            >
                                                {initials || 'AR'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <button
                                                onClick={cycleFont}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                            >
                                                Change style
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* OR Divider */}
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-[#2ecc71] px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">OR</span>
                                </div>
                            </div>

                            {/* Option Cards - Row 1 */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <button
                                    onClick={() => setCreatorMode('draw')}
                                    className="flex flex-col items-center p-5 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-orange-500/50 transition-all duration-200 group text-center"
                                >
                                    <div className="w-11 h-11 mb-3 rounded-full bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Pen className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Draw signature</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">Draw your signature using your device.</p>
                                </button>

                                <button
                                    onClick={() => setCreatorMode('upload')}
                                    className="flex flex-col items-center p-5 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-500/50 transition-all duration-200 group text-center"
                                >
                                    <div className="w-11 h-11 mb-3 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Upload className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Upload signature</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">Upload an image of your signature from your device.</p>
                                </button>

                                <button
                                    onClick={() => { setCreatorMode('capture'); startCamera(); }}
                                    className="flex flex-col items-center p-5 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-red-500/50 transition-all duration-200 group text-center"
                                >
                                    <div className="w-11 h-11 mb-3 rounded-full bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Camera className="w-5 h-5 text-red-500" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Capture signature</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">Capture your signature with a web camera.</p>
                                </button>

                                <button
                                    onClick={() => setCreatorMode('qrcode')}
                                    className="flex flex-col items-center p-5 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-purple-500/50 transition-all duration-200 group text-center"
                                >
                                    <div className="w-11 h-11 mb-3 rounded-full bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <QrCode className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Add signature via QR code</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">Scan a QR code and draw a signature on any device.</p>
                                </button>
                            </div>

                            {/* Option Cards - Row 2 */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                <button
                                    onClick={() => setCreatorMode('sms')}
                                    className="flex flex-col items-center p-5 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-green-500/50 transition-all duration-200 group text-center"
                                >
                                    <div className="w-11 h-11 mb-3 rounded-full bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Smartphone className="w-5 h-5 text-green-500" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Share Link</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">Copy a secure link to sign from any device (phone, tablet, or computer).</p>
                                </button>

                                <button
                                    onClick={() => setCreatorMode('email')}
                                    className="flex flex-col items-center p-5 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-teal-500/50 transition-all duration-200 group text-center"
                                >
                                    <div className="w-11 h-11 mb-3 rounded-full bg-teal-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Mail className="w-5 h-5 text-teal-500" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Add signature via email</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">Receive a link via email and sign from any device.</p>
                                </button>

                                <button
                                    onClick={() => setCreatorMode('notarize')}
                                    className="flex flex-col items-center p-5 bg-amber-50 border-2 border-amber-300 rounded-xl hover:shadow-lg hover:border-amber-500 transition-all duration-200 group text-center col-span-2 md:col-span-1"
                                >
                                    <div className="w-11 h-11 mb-3 rounded-full bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Shield className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <h4 className="text-sm font-bold text-amber-900 mb-1">Notarize</h4>
                                    <p className="text-xs text-amber-700 leading-relaxed">Submit a document to notarize it online with a commissioned notary.</p>
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Specific Mode Content
                        <div className="h-full flex flex-col animate-in slide-in-from-right-4 duration-200">
                            {/* Draw Mode */}
                            {creatorMode === 'draw' && (
                                <div className="space-y-6 flex-1 flex flex-col">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
                                        <div className="flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-sm font-semibold text-gray-700">Draw Signature</label>
                                                <button onClick={() => clearCanvas('signature')} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear</button>
                                            </div>
                                            <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 relative hover:border-orange-400 transition-colors">
                                                <canvas
                                                    ref={signatureCanvasRef}
                                                    onMouseDown={(e) => startDrawing(e, 'signature')}
                                                    onMouseMove={draw}
                                                    onMouseUp={stopDrawing}
                                                    onMouseLeave={stopDrawing}
                                                    onTouchStart={(e) => startDrawing(e, 'signature')}
                                                    onTouchMove={draw}
                                                    onTouchEnd={stopDrawing}
                                                    className="absolute inset-0 w-full h-full cursor-crosshair rounded-xl touch-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-sm font-semibold text-gray-700">Draw Initials</label>
                                                <button onClick={() => clearCanvas('initials')} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear</button>
                                            </div>
                                            <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 relative hover:border-orange-400 transition-colors">
                                                <canvas
                                                    ref={initialsCanvasRef}
                                                    onMouseDown={(e) => startDrawing(e, 'initials')}
                                                    onMouseMove={draw}
                                                    onMouseUp={stopDrawing}
                                                    onMouseLeave={stopDrawing}
                                                    onTouchStart={(e) => startDrawing(e, 'initials')}
                                                    onTouchMove={draw}
                                                    onTouchEnd={stopDrawing}
                                                    className="absolute inset-0 w-full h-full cursor-crosshair rounded-xl touch-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-center text-sm text-gray-500">Draw your signature and initials in the boxes above.</p>
                                </div>
                            )}

                            {/* Upload / Capture Inputs */}
                            {(creatorMode === 'upload' || creatorMode === 'capture') && (
                                <div className="space-y-6 flex-1 flex flex-col justify-center">
                                    {isCameraActive ? (
                                        <div className="space-y-4 max-w-lg mx-auto w-full">
                                            <div className="relative rounded-xl overflow-hidden shadow-lg bg-black aspect-video">
                                                <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex gap-4 justify-center">
                                                <button
                                                    onClick={captureFromCamera}
                                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-md active:scale-95"
                                                >
                                                    Capture Photo
                                                </button>
                                                <button
                                                    onClick={stopCamera}
                                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
                                            <div
                                                onClick={() => { setActiveCanvas('signature'); fileInputRef.current?.click(); }}
                                                className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 text-center hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all gap-4 group h-full"
                                            >
                                                {uploadedSignature ? (
                                                    <img src={uploadedSignature} alt="Signature" className="max-h-full max-w-full object-contain" />
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Upload className="w-6 h-6 text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">Upload Signature</p>
                                                            <p className="text-xs text-gray-500 mt-1">Click to browse</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div
                                                onClick={() => { setActiveCanvas('initials'); fileInputRef.current?.click(); }}
                                                className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 text-center hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all gap-4 group h-full"
                                            >
                                                {uploadedInitials ? (
                                                    <img src={uploadedInitials} alt="Initials" className="max-h-full max-w-full object-contain" />
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Upload className="w-6 h-6 text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">Upload Initials</p>
                                                            <p className="text-xs text-gray-500 mt-1">Click to browse</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileUpload(e, activeCanvas)}
                                    />
                                </div>
                            )}

                            {/* QR Code Mode */}
                            {creatorMode === 'qrcode' && (
                                <div className="space-y-6 flex-1 flex flex-col justify-center items-center text-center max-w-md mx-auto">
                                    <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center">
                                        <QrCode className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Scan QR Code to Sign</h3>
                                        <p className="text-sm text-gray-500 mb-6 px-4">Scan this QR code with any device to draw your signature.</p>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg text-left text-sm text-blue-800 mb-4 max-w-xs mx-auto">
                                        <p className="font-bold mb-1">Instructions:</p>
                                        <ul className="list-disc pl-4 space-y-1 text-xs">
                                            <li><strong>Keep this window OPEN</strong> until the recipient completes signing.</li>
                                            <li>Do not refresh or leave this page, or the link will expire.</li>
                                            <li>The signature will automatically appear here once sent.</li>
                                        </ul>
                                    </div>

                                    {/* QR Code Display */}
                                    <div className={`p-4 bg-white border-4 rounded-xl transition-all duration-300 ${mobilePeerConnected ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-gray-100'}`}>
                                        <div className="w-44 h-44 bg-gray-50 rounded flex items-center justify-center relative">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`${window.location.origin}/mobile-sign?session=${sessionId}`)}`}
                                                alt="QR Code"
                                                className={`w-full h-full transition-opacity duration-500 ${mobilePeerConnected ? 'opacity-20' : 'opacity-100'}`}
                                            />
                                            {mobilePeerConnected && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                                                        <Smartphone className="w-6 h-6 text-white" />
                                                    </div>
                                                    <span className="text-xs font-bold text-green-600">CONNECTED</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-3">
                                        <button
                                            onClick={() => {
                                                const link = `${window.location.origin}/remote-sign?session=${sessionId}`;
                                                navigator.clipboard.writeText(link);
                                                setLinkCopied(true);
                                                setTimeout(() => setLinkCopied(false), 2000);
                                            }}
                                            className="flex items-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 transition-all active:scale-95"
                                        >
                                            {linkCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                            {linkCopied ? 'Link Copied!' : 'Copy Signing Link'}
                                        </button>

                                        {mobilePeerConnected ? (
                                            <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${signerStatus === 'drawing' ? 'bg-orange-500 animate-ping' : 'bg-green-500 animate-pulse'}`}></span>
                                                {signerStatus === 'drawing' ? 'Signer is drawing...' : 'Device connected! Waiting for signature...'}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-400">Waiting for connection from remote device...</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Share Link Mode (Replacing SMS) */}
                            {creatorMode === 'sms' && (
                                <div className="space-y-6 flex-1 flex flex-col justify-center max-w-md mx-auto">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                                            <ExternalLink className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Share Signing Link</h3>
                                        <p className="text-sm text-gray-500">Copy this link and send it to the signer. They can sign from any device - phone, tablet, or computer.</p>

                                        <div className="bg-blue-50 p-3 rounded-lg text-left text-sm text-blue-800 mt-2">
                                            <p className="font-bold text-xs mb-1">Important:</p>
                                            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                                                <li>Keep this window <strong>OPEN</strong> until the signer completes the process.</li>
                                                <li>Do not refresh; the session will disconnect.</li>
                                                <li>Once signed, the signature will appear on your document.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Secure Link</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={`${window.location.origin}/remote-sign?session=${sessionId}`}
                                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 focus:outline-none"
                                                />
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/remote-sign?session=${sessionId}`);
                                                        setLinkCopied(true);
                                                        setTimeout(() => setLinkCopied(false), 2000);
                                                    }}
                                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition-colors"
                                                >
                                                    {linkCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleSendLink('share')}
                                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Smartphone className="w-4 h-4" />
                                            Share via System
                                        </button>
                                    </div>

                                    {mobilePeerConnected && (
                                        <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="font-semibold text-sm">Device Connected! You can now draw.</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Email Mode */}
                            {creatorMode === 'email' && (
                                <div className="space-y-6 flex-1 flex flex-col justify-center max-w-md mx-auto">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-100 flex items-center justify-center mb-4">
                                            <Mail className="w-8 h-8 text-teal-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Sign via Email</h3>
                                        <p className="text-sm text-gray-500">Send a secure signing link via email. The recipient can sign from any device - phone, tablet, or computer.</p>

                                        <div className="bg-blue-50 p-3 rounded-lg text-left text-sm text-blue-800 mt-3 mx-4">
                                            <p className="font-bold text-xs mb-1">Instructions:</p>
                                            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                                                <li>Keep this window <strong>OPEN</strong> while waiting for the signature.</li>
                                                <li>Do not refresh or close the browser.</li>
                                                <li>The signature will be added automatically once received.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                value={mobileEmail}
                                                onChange={(e) => setMobileEmail(e.target.value)}
                                                placeholder="your@email.com"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-900"
                                            />
                                        </div>

                                        <button
                                            onClick={() => handleSendLink('email')}
                                            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Mail className="w-4 h-4" />
                                            {signingLinkSent ? 'Open Email App' : 'Send Signing Link'}
                                        </button>
                                    </div>

                                    {signingLinkSent && (
                                        <p className="text-center text-sm text-teal-600">Check your inbox for the signing link!</p>
                                    )}
                                </div>
                            )}

                            {/* Notarize Mode */}
                            {creatorMode === 'notarize' && (
                                <div className="space-y-6 flex-1 flex flex-col justify-center max-w-lg mx-auto">
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                                            <Shield className="w-10 h-10 text-amber-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Online Notarization</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed">Submit your document for online notarization with a commissioned notary. This creates a legally binding notarized document.</p>
                                    </div>

                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                                        <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                                            <Check className="w-4 h-4" /> What You Get
                                        </h4>
                                        <ul className="text-sm text-amber-800 space-y-2">
                                            <li className="flex items-start gap-2">
                                                <Check className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                                                <span>Live video session with a commissioned notary</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                                                <span>Digital notary seal and certificate</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                                                <span>Legally binding in all 50 US states</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                                                <span>Secure document storage and retrieval</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => {
                                            alert('Online notarization would connect you with a commissioned notary service. This feature requires integration with a notarization provider like Notarize.com or NotaryCam.');
                                        }}
                                        className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Start Notarization Process
                                    </button>

                                    <p className="text-center text-xs text-gray-400">Typical notarization takes 5-15 minutes. Fees may apply.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-sm shadow-sm"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-2.5 bg-[#f37021] text-white rounded-lg hover:bg-[#e06018] shadow-lg hover:shadow-orange-500/30 transition-all font-bold text-sm tracking-wide transform active:scale-95 translate-y-0"
                    >
                        Save and initial
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SignatureCreator;
