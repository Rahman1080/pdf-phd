// Signature Creation Modal - Full Featured with Multiple Options
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
    X, Trash2, Check, PenLine, Upload, Camera, QrCode,
    Link2, Mail, Award, ChevronRight, Palette, Copy, CheckCircle,
    Loader2, ExternalLink, ArrowLeft
} from 'lucide-react';
import * as SignatureService from '../../services/signatureService';

interface SignatureModalProps {
    onSave: (dataUrl: string) => void;
    onClose: () => void;
    documentName?: string;
}

// Signature font styles
const signatureFonts = [
    { name: 'Homemade Apple', style: 'font-signature1' },
    { name: 'Dancing Script', style: 'font-signature2' },
    { name: 'Pacifico', style: 'font-signature3' },
    { name: 'Great Vibes', style: 'font-signature4' },
];

type SignatureTab = 'type' | 'draw' | 'upload' | 'camera';
type AdvancedMode = null | 'qr' | 'link' | 'email' | 'notarize';

export function SignatureModal({ onSave, onClose, documentName }: SignatureModalProps) {
    const [activeTab, setActiveTab] = useState<SignatureTab>('type');
    const [advancedMode, setAdvancedMode] = useState<AdvancedMode>(null);
    const [fullName, setFullName] = useState('');
    const [initials, setInitials] = useState('');
    const [selectedFont, setSelectedFont] = useState(0);
    const [signatureColor, setSignatureColor] = useState('#000000');
    const [showColorPicker, setShowColorPicker] = useState(false);

    // Session state
    const [session, setSession] = useState<SignatureService.SignatureSession | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [linkCopied, setLinkCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Email state
    const [recipientEmail, setRecipientEmail] = useState('');
    const [senderName, setSenderName] = useState('');

    // Drawing state
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 500, height: 150 });

    // Upload state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    // Camera state
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Generate initials from name
    useEffect(() => {
        if (fullName.trim()) {
            const parts = fullName.trim().split(' ').filter(p => p.length > 0);
            const newInitials = parts.map(p => p[0].toUpperCase()).join('');
            setInitials(newInitials.slice(0, 3));
        }
    }, [fullName]);

    // Listen for signature completion from other devices
    // Listen for remote signature
    useEffect(() => {
        if (session && (advancedMode === 'qr' || advancedMode === 'link' || advancedMode === 'email')) {
            // 1. PeerJS for real-time cross-device communication
            const unsubscribePeer = SignatureService.initPeerSession(
                session.id,
                () => {
                    console.log('Remote device connected via PeerJS!');
                },
                (signatureDataUrl, signerName) => {
                    console.log('Signature received via PeerJS!', signerName);
                    onSave(signatureDataUrl);
                    onClose();
                }
            );

            // 2. BroadcastChannel for same-tab communication
            const unsubscribe1 = SignatureService.onSignatureComplete(session.id, (signatureDataUrl, signerName) => {
                console.log('Signature received from remote device!', signerName);
                onSave(signatureDataUrl);
                onClose();
            });

            // 3. Polling as final fallback
            const unsubscribe2 = SignatureService.pollForSignatureCompletion(session.id, (signatureDataUrl, signerName) => {
                console.log('Signature received via polling!', signerName);
                onSave(signatureDataUrl);
                onClose();
            });

            return () => {
                unsubscribePeer();
                unsubscribe1();
                unsubscribe2();
            };
        }
    }, [session, advancedMode, onSave, onClose]);

    // Canvas sizing
    useEffect(() => {
        if (activeTab === 'draw' && !advancedMode) {
            const updateCanvasSize = () => {
                if (containerRef.current) {
                    const containerWidth = containerRef.current.clientWidth - 4;
                    const width = Math.min(containerWidth, 600);
                    const height = Math.min(width / 3, 150);
                    setCanvasSize({ width, height });
                }
            };
            updateCanvasSize();
            window.addEventListener('resize', updateCanvasSize);
            return () => window.removeEventListener('resize', updateCanvasSize);
        }
    }, [activeTab, advancedMode]);

    // Initialize canvas
    useEffect(() => {
        if (activeTab !== 'draw' || advancedMode) return;
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
        ctx.strokeStyle = signatureColor;
        ctx.lineWidth = isMobile ? 4 : 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, [canvasSize, isMobile, activeTab, signatureColor, advancedMode]);

    // Drawing functions
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

    const stopDrawing = () => setIsDrawing(false);

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        setHasSignature(false);
    };

    // Generate typed signature as image
    const generateTypedSignature = useCallback(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        ctx.clearRect(0, 0, 600, 150);
        ctx.fillStyle = signatureColor;
        ctx.font = `56px "${signatureFonts[selectedFont].name}", cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fullName || 'Your Signature', 300, 75);

        return canvas.toDataURL('image/png');
    }, [fullName, selectedFont, signatureColor]);

    // Handle file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Camera functions
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
            console.error('Camera access denied:', err);
            alert('Camera access denied. Please allow camera permissions.');
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
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
            setCapturedImage(canvas.toDataURL('image/png'));
            stopCamera();
        }
    };

    // QR Code signing
    const startQRSigning = async () => {
        setIsLoading(true);
        try {
            const newSession = SignatureService.createSignatureSession(documentName);
            setSession(newSession);
            const qrCode = await SignatureService.generateSigningQRCode(newSession.id);
            setQrCodeUrl(qrCode);
            setAdvancedMode('qr');
        } catch (err) {
            console.error('Failed to start QR signing:', err);
            alert('Failed to generate QR code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Share link
    const startLinkSharing = async () => {
        setIsLoading(true);
        try {
            const newSession = SignatureService.createSignatureSession(documentName);
            setSession(newSession);
            setAdvancedMode('link');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyLink = async () => {
        if (session) {
            const success = await SignatureService.copySigningLink(session.id);
            if (success) {
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 3000);
            }
        }
    };

    const handleShareLink = async () => {
        if (session) {
            await SignatureService.shareSigningLink(session.id, documentName);
        }
    };

    // Email request
    const startEmailRequest = () => {
        const newSession = SignatureService.createSignatureSession(documentName);
        setSession(newSession);
        setAdvancedMode('email');
    };

    const sendEmailRequest = () => {
        if (session && recipientEmail) {
            SignatureService.sendEmailRequest(session.id, recipientEmail, senderName || 'Someone', documentName);
        }
    };

    // Notarize
    const handleNotarize = async () => {
        setAdvancedMode('notarize');
    };

    // Save signature
    const saveSignature = () => {
        let dataUrl = '';

        switch (activeTab) {
            case 'type':
                dataUrl = generateTypedSignature();
                break;
            case 'draw':
                if (canvasRef.current) {
                    dataUrl = canvasRef.current.toDataURL('image/png');
                }
                break;
            case 'upload':
                if (uploadedImage) {
                    dataUrl = uploadedImage;
                }
                break;
            case 'camera':
                if (capturedImage) {
                    dataUrl = capturedImage;
                }
                break;
        }

        if (dataUrl) {
            onSave(dataUrl);
            onClose();
        }
    };

    // Check if save is enabled
    const canSave = () => {
        switch (activeTab) {
            case 'type': return fullName.trim().length > 0;
            case 'draw': return hasSignature;
            case 'upload': return !!uploadedImage;
            case 'camera': return !!capturedImage;
            default: return false;
        }
    };

    const colors = ['#000000', '#1e40af', '#7c3aed', '#dc2626', '#059669'];

    const tabs = [
        { id: 'type' as const, label: 'Type', icon: PenLine },
        { id: 'draw' as const, label: 'Draw', icon: PenLine },
        { id: 'upload' as const, label: 'Upload', icon: Upload },
        { id: 'camera' as const, label: 'Camera', icon: Camera },
    ];

    const additionalOptions = [
        { id: 'qr' as const, icon: QrCode, title: 'Sign via QR', desc: 'Scan & sign on any device', color: 'bg-purple-50 text-purple-600', onClick: startQRSigning },
        { id: 'link' as const, icon: Link2, title: 'Share Link', desc: 'Send link to sign remotely', color: 'bg-blue-50 text-blue-600', onClick: startLinkSharing },
        { id: 'email' as const, icon: Mail, title: 'Email Request', desc: 'Request signature via email', color: 'bg-green-50 text-green-600', onClick: startEmailRequest },
        { id: 'notarize' as const, icon: Award, title: 'Notarize', desc: 'Get document notarized', color: 'bg-amber-50 text-amber-600', onClick: handleNotarize },
    ];

    const renderAdvancedMode = () => {
        if (advancedMode === 'qr') {
            return (
                <div className="text-center py-6">
                    <div className="mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            <QrCode className="w-4 h-4" />
                            Sign via QR Code
                        </div>
                    </div>

                    {qrCodeUrl ? (
                        <>
                            <div className="bg-white p-4 rounded-2xl shadow-lg inline-block mb-4">
                                <img src={qrCodeUrl} alt="Signing QR Code" className="w-48 h-48" />
                            </div>
                            <p className="text-gray-600 mb-2">Scan this QR code with your phone or tablet</p>
                            <p className="text-sm text-gray-400 mb-6">The signature will appear here automatically once completed</p>

                            <div className="flex items-center justify-center gap-2 text-sm text-purple-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Waiting for signature...
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                        </div>
                    )}
                </div>
            );
        }

        if (advancedMode === 'link') {
            const signingUrl = session ? SignatureService.getSigningUrl(session.id) : '';
            return (
                <div className="py-6">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            <Link2 className="w-4 h-4" />
                            Share Signing Link
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <label className="block text-xs font-medium text-gray-500 mb-2">Signing Link</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={signingUrl}
                                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${linkCopied
                                        ? 'bg-green-500 text-white'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                >
                                    {linkCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {linkCopied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        {'share' in navigator && typeof navigator.share === 'function' && (
                            <button
                                onClick={handleShareLink}
                                className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Share via...
                            </button>
                        )}

                        <p className="text-center text-sm text-gray-400">
                            The signature will appear here automatically once the recipient signs
                        </p>

                        <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Waiting for signature...
                        </div>
                    </div>
                </div>
            );
        }

        if (advancedMode === 'email') {
            return (
                <div className="py-6">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <Mail className="w-4 h-4" />
                            Email Signature Request
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Recipient Email</label>
                            <input
                                type="email"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                placeholder="recipient@example.com"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Your Name (optional)</label>
                            <input
                                type="text"
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                                placeholder="Your name"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                            />
                        </div>

                        <button
                            onClick={sendEmailRequest}
                            disabled={!recipientEmail}
                            className="w-full py-3 bg-green-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            Send Email Request
                        </button>

                        <p className="text-center text-sm text-gray-400">
                            Opens your email client with a pre-filled signature request
                        </p>
                    </div>
                </div>
            );
        }

        if (advancedMode === 'notarize') {
            return (
                <div className="py-6">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                            <Award className="w-4 h-4" />
                            Online Notarization
                        </div>
                    </div>

                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center">
                            <Award className="w-10 h-10 text-amber-500" />
                        </div>

                        <h4 className="text-lg font-semibold text-gray-900">Document Notarization</h4>

                        <p className="text-gray-600">
                            Get your document notarized online with a commissioned notary public.
                        </p>

                        <div className="bg-amber-50 p-4 rounded-xl text-left space-y-2">
                            <p className="text-sm text-amber-800 font-medium">Features include:</p>
                            <ul className="text-sm text-amber-700 space-y-1">
                                <li>• Verified identity check</li>
                                <li>• Live video session with notary</li>
                                <li>• Legally binding digital seal</li>
                                <li>• Audit trail & certificate</li>
                            </ul>
                        </div>

                        <p className="text-xs text-gray-400">
                            Online notarization services will be integrated soon. Contact support for immediate notarization needs.
                        </p>

                        <button
                            className="w-full py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
                            onClick={() => window.open('mailto:support@pdfphd.com?subject=Notarization Request', '_blank')}
                        >
                            Contact for Notarization
                        </button>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[200] p-0 sm:p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        {advancedMode && (
                            <button
                                onClick={() => setAdvancedMode(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-500" />
                            </button>
                        )}
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                            {advancedMode ? additionalOptions.find(o => o.id === advancedMode)?.title : 'Create Signature & Initials'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {advancedMode ? (
                    <div className="px-4 sm:px-5">
                        {renderAdvancedMode()}
                    </div>
                ) : (
                    <>
                        {/* Tab Buttons */}
                        <div className="flex border-b border-gray-100 px-4 sm:px-5">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-5">
                            {/* Type Tab */}
                            {activeTab === 'type' && (
                                <div className="space-y-5">
                                    {/* Name Inputs */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="Your name"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Initials</label>
                                            <input
                                                type="text"
                                                value={initials}
                                                onChange={(e) => setInitials(e.target.value.toUpperCase())}
                                                placeholder="AB"
                                                maxLength={3}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Signature & Initials Preview */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="border-2 border-gray-200 rounded-xl p-6 flex items-center justify-center min-h-[100px] bg-gray-50">
                                            <style>{`
                                                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Homemade+Apple&family=Pacifico&display=swap');
                                                .font-signature1 { font-family: 'Homemade Apple', cursive; }
                                                .font-signature2 { font-family: 'Dancing Script', cursive; }
                                                .font-signature3 { font-family: 'Pacifico', cursive; }
                                                .font-signature4 { font-family: 'Great Vibes', cursive; }
                                            `}</style>
                                            <span
                                                className={`text-3xl sm:text-4xl ${signatureFonts[selectedFont].style}`}
                                                style={{ color: signatureColor }}
                                            >
                                                {fullName || 'Your Signature'}
                                            </span>
                                        </div>
                                        <div className="border-2 border-gray-200 rounded-xl p-6 flex items-center justify-center min-h-[100px] bg-gray-50">
                                            <span
                                                className={`text-4xl sm:text-5xl ${signatureFonts[selectedFont].style}`}
                                                style={{ color: signatureColor }}
                                            >
                                                {initials || 'AB'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Style & Color Options */}
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => setSelectedFont((prev) => (prev + 1) % signatureFonts.length)}
                                            className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                                        >
                                            Change style
                                        </button>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowColorPicker(!showColorPicker)}
                                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                                            >
                                                <div
                                                    className="w-5 h-5 rounded-full border border-gray-300"
                                                    style={{ backgroundColor: signatureColor }}
                                                />
                                                <Palette className="w-4 h-4" />
                                            </button>
                                            {showColorPicker && (
                                                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl p-3 shadow-xl z-20 flex gap-2">
                                                    {colors.map((color) => (
                                                        <button
                                                            key={color}
                                                            onClick={() => { setSignatureColor(color); setShowColorPicker(false); }}
                                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${signatureColor === color ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-200'
                                                                }`}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Draw Tab */}
                            {activeTab === 'draw' && (
                                <div>
                                    <div
                                        ref={containerRef}
                                        className="border-2 border-gray-200 rounded-xl bg-gray-50 overflow-hidden"
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
                                            className="w-full cursor-crosshair touch-none"
                                            style={{ touchAction: 'none' }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <p className="text-xs text-gray-400">
                                            {isMobile ? 'Use your finger to sign' : 'Use your mouse to draw'}
                                        </p>
                                        <button
                                            onClick={clearSignature}
                                            className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Upload Tab */}
                            {activeTab === 'upload' && (
                                <div className="text-center">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    {uploadedImage ? (
                                        <div className="space-y-4">
                                            <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                                                <img src={uploadedImage} alt="Uploaded signature" className="max-h-32 mx-auto" />
                                            </div>
                                            <button
                                                onClick={() => setUploadedImage(null)}
                                                className="text-sm text-red-500 hover:text-red-600"
                                            >
                                                Remove & upload new
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                                        >
                                            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600 font-medium">Click to upload signature image</p>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Camera Tab */}
                            {activeTab === 'camera' && (
                                <div className="text-center">
                                    {capturedImage ? (
                                        <div className="space-y-4">
                                            <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                                                <img src={capturedImage} alt="Captured signature" className="max-h-40 mx-auto rounded-lg" />
                                            </div>
                                            <button
                                                onClick={() => { setCapturedImage(null); startCamera(); }}
                                                className="text-sm text-blue-500 hover:text-blue-600"
                                            >
                                                Retake photo
                                            </button>
                                        </div>
                                    ) : isCameraActive ? (
                                        <div className="space-y-4">
                                            <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-black">
                                                <video ref={videoRef} autoPlay playsInline className="w-full max-h-48" />
                                            </div>
                                            <div className="flex gap-3 justify-center">
                                                <button
                                                    onClick={stopCamera}
                                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={captureFromCamera}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium"
                                                >
                                                    Capture
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={startCamera}
                                            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                                        >
                                            <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600 font-medium">Capture signature with camera</p>
                                            <p className="text-xs text-gray-400 mt-1">Take a photo of your written signature</p>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* OR Divider */}
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs font-medium text-white bg-green-500 px-3 py-1 rounded-full">OR</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            {/* Additional Options */}
                            <div className="grid grid-cols-2 gap-3">
                                {additionalOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={option.onClick}
                                        disabled={isLoading}
                                        className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all text-left group disabled:opacity-50"
                                    >
                                        <div className={`w-10 h-10 rounded-xl ${option.color} flex items-center justify-center shrink-0`}>
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <option.icon className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm">{option.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400 mt-1 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Action Buttons */}
                <div className="p-4 sm:p-5 pt-0 flex gap-3 border-t border-gray-100 mt-4 sticky bottom-0 bg-white pb-safe">
                    <button
                        onClick={advancedMode ? () => setAdvancedMode(null) : onClose}
                        className="flex-1 px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                    >
                        {advancedMode ? 'Back' : 'Close'}
                    </button>
                    {!advancedMode && (
                        <button
                            onClick={saveSignature}
                            disabled={!canSave()}
                            className="flex-1 px-4 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/25 disabled:shadow-none"
                        >
                            <Check className="w-5 h-5" />
                            Save and initial
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
