import React, { useRef, useState, useEffect } from 'react';
import { Pen, Check, RotateCcw, Smartphone } from 'lucide-react';
import Peer from 'peerjs';

export default function MobileSign() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [conn, setConn] = useState<any>(null);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'sent' | 'error'>('connecting');
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    const sessionId = new URLSearchParams(window.location.search).get('session');
    const peerRef = useRef<any>(null);
    const connectionRef = useRef<any>(null);
    const channelRef = useRef<BroadcastChannel | null>(null);
    const isConnectedRef = useRef(false);

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            return;
        }

        let connectionTimeout: NodeJS.Timeout;
        let retryCount = 0;
        const maxRetries = 10; // Increased for better cross-device support

        // Create BroadcastChannel ONCE (not on each retry)
        const channel = new BroadcastChannel(`pdf-sign-${sessionId}`);
        channelRef.current = channel;

        const handleChannelConnected = () => {
            if (isConnectedRef.current) return;
            console.log('[RemoteSign] ✅ BroadcastChannel connected!');
            isConnectedRef.current = true;
            clearTimeout(connectionTimeout);
            setStatus('connected');
        };

        channel.onmessage = (event) => {
            console.log('[RemoteSign] BroadcastChannel message:', event.data.type);
            if (event.data.type === 'ping') {
                handleChannelConnected();
                channel.postMessage({ type: 'pong' });
            } else if (event.data.type === 'ack') {
                // Signature was received by sender
                console.log('[RemoteSign] ✅ Signature acknowledged by sender');
            }
        };

        // Send initial hello
        channel.postMessage({ type: 'hello', from: 'remote' });

        // Retry BroadcastChannel connection periodically
        const broadcastRetry = setInterval(() => {
            if (isConnectedRef.current) {
                clearInterval(broadcastRetry);
                return;
            }
            console.log('[RemoteSign] Sending BroadcastChannel hello...');
            channel.postMessage({ type: 'hello', from: 'remote' });
        }, 1000);

        // Also try PeerJS for cross-device communication
        const setupPeerJS = () => {
            if (peerRef.current) {
                peerRef.current.destroy();
            }

            console.log('[RemoteSign] Setting up PeerJS...');

            // Configure PeerJS with STUN + FREE TURN servers
            const newPeer = new Peer({
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
            peerRef.current = newPeer;

            newPeer.on('open', (id) => {
                if (isConnectedRef.current) return; // Already connected via BroadcastChannel

                console.log('[RemoteSign] PeerJS opened with ID:', id);
                console.log('[RemoteSign] Connecting to session:', sessionId);

                const connection = newPeer.connect(sessionId, {
                    reliable: true,
                    serialization: 'json'
                });
                connectionRef.current = connection;
                setConn(connection);

                connection.on('open', () => {
                    if (isConnectedRef.current) return;
                    console.log('[RemoteSign] ✅ PeerJS connection established!');
                    isConnectedRef.current = true;
                    clearTimeout(connectionTimeout);
                    clearInterval(broadcastRetry);
                    setStatus('connected');
                });

                connection.on('close', () => {
                    console.log('[RemoteSign] PeerJS connection closed');
                    // Don't change status to error if we already sent or are connected via BroadcastChannel
                });

                connection.on('error', (err: any) => {
                    console.error('[RemoteSign] PeerJS connection error:', err);
                    // Don't immediately error - BroadcastChannel might still work
                });
            });

            newPeer.on('error', (err: any) => {
                console.error('[RemoteSign] Peer error:', err.type, err.message);
                // Don't set error if BroadcastChannel is connected
                if (isConnectedRef.current) return;

                if (err.type === 'peer-unavailable' && retryCount < maxRetries) {
                    console.log(`[RemoteSign] Sender peer not found, retry ${retryCount + 1}/${maxRetries}...`);
                    retryCount++;
                    // Exponential backoff: wait longer between retries
                    setTimeout(setupPeerJS, 1000 + retryCount * 500);
                } else if (err.type === 'unavailable-id') {
                    // Session ID already taken - try with a slightly modified ID
                    console.log('[RemoteSign] Session ID conflict, retrying...');
                    setTimeout(setupPeerJS, 1500);
                } else if (err.type === 'network' || err.type === 'server-error') {
                    // Network issues - retry
                    console.log('[RemoteSign] Network error, retrying...');
                    if (retryCount < maxRetries) {
                        retryCount++;
                        setTimeout(setupPeerJS, 2000);
                    }
                }
                // For other errors, rely on BroadcastChannel
            });

            newPeer.on('disconnected', () => {
                console.log('[RemoteSign] Disconnected from signaling server');
                // Don't reconnect if already connected via BroadcastChannel
                if (!isConnectedRef.current && peerRef.current && !peerRef.current.destroyed) {
                    setTimeout(() => {
                        if (!isConnectedRef.current && peerRef.current && !peerRef.current.destroyed) {
                            console.log('[RemoteSign] Attempting reconnection...');
                            peerRef.current.reconnect();
                        }
                    }, 1000);
                }
            });
        };

        setupPeerJS();

        // Set overall connection timeout - 30 seconds for cross-network connections
        connectionTimeout = setTimeout(() => {
            if (!isConnectedRef.current) {
                console.log('[RemoteSign] Connection timeout after all retries');
                clearInterval(broadcastRetry);
                setStatus('error');
            }
        }, 30000); // 30 seconds total timeout for better cross-device support

        return () => {
            clearTimeout(connectionTimeout);
            clearInterval(broadcastRetry);
            if (peerRef.current) {
                peerRef.current.destroy();
            }
            // DON'T close the BroadcastChannel here - it needs to stay open
            // for sending the signature. It will be closed when page navigates away.
        };
    }, [sessionId]);

    // Store canvas context in ref to maintain settings
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const ratioRef = useRef<number>(1);
    const setupAttempts = useRef<number>(0);

    // Initialize canvas with proper DPI handling
    // IMPORTANT: Run when status changes to 'connected' because canvas is only rendered then
    useEffect(() => {
        // Only run when status is 'connected' (canvas exists)
        if (status !== 'connected') return;

        const canvas = canvasRef.current;
        if (!canvas) {
            console.log('[Canvas] Canvas ref not available yet, waiting...');
            return;
        }

        const setupCanvas = () => {
            const rect = canvas.getBoundingClientRect();

            // If dimensions are 0, retry after a short delay (DOM not ready)
            if (rect.width === 0 || rect.height === 0) {
                setupAttempts.current++;
                if (setupAttempts.current < 10) {
                    console.log('[Canvas] Dimensions are 0, retrying setup...');
                    requestAnimationFrame(setupCanvas);
                    return;
                }
                console.error('[Canvas] Failed to get canvas dimensions after 10 attempts');
                return;
            }

            const dpr = window.devicePixelRatio || 1;
            ratioRef.current = dpr;

            // Set the canvas internal dimensions scaled by DPI
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            // CRITICAL: Set CSS dimensions to maintain visual size
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            // Get context and scale it
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Reset transform before scaling to prevent accumulation
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);

            // Set drawing styles
            ctx.strokeStyle = '#000000';
            ctx.fillStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctxRef.current = ctx;

            console.log('[Canvas] ✅ Setup complete:', {
                cssSize: `${rect.width}x${rect.height}`,
                canvasSize: `${canvas.width}x${canvas.height}`,
                dpr,
                hasCtx: !!ctx
            });
        };

        // Initial setup with a small delay to ensure DOM is ready
        const timeoutId = setTimeout(() => {
            requestAnimationFrame(setupCanvas);
        }, 100);

        // Handle resize
        const handleResize = () => {
            // Save current drawing
            const canvas = canvasRef.current;
            if (!canvas) return;

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
                tempCtx.drawImage(canvas, 0, 0);
            }

            // Resize
            setupCanvas();

            // Restore drawing
            const ctx = ctxRef.current;
            if (ctx && tempCanvas.width > 0) {
                ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset for drawing
                ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
                ctx.scale(ratioRef.current, ratioRef.current); // Re-apply scale
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
        };
    }, [status]);

    const getPos = (e: React.TouchEvent | React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();

        // Get client coordinates
        let clientX: number, clientY: number;
        if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if ('changedTouches' in e && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault(); // Prevent scrolling on touch devices
        setIsDrawing(true);
        const pos = getPos(e);
        lastPos.current = pos;

        // Draw a dot at the starting point
        const ctx = ctxRef.current;
        if (ctx) {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Notify desktop that user is interacting (via both channels)
        if (channelRef.current) {
            channelRef.current.postMessage({ type: 'drawing_status', status: 'active' });
        }
        if (conn && conn.open) {
            conn.send({ type: 'drawing_status', status: 'active' });
        }
    };

    const draw = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault(); // Prevent scrolling
        if (!isDrawing || !lastPos.current) return;

        const ctx = ctxRef.current;
        if (!ctx) {
            console.warn('[Canvas] No context available for drawing');
            return;
        }

        const pos = getPos(e);

        // Draw line from last position to current
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        lastPos.current = pos;
    };

    const stopDrawing = (e?: React.TouchEvent | React.MouseEvent) => {
        if (e) e.preventDefault();
        setIsDrawing(false);
        lastPos.current = null;
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;

        // Reset transform, clear, then restore scale
        const dpr = ratioRef.current;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(dpr, dpr);

        // Restore drawing styles
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    };

    const sendSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');
        let sent = false;

        // Try BroadcastChannel first (more reliable for same-browser)
        try {
            if (channelRef.current) {
                console.log('[RemoteSign] Sending signature via BroadcastChannel');
                channelRef.current.postMessage({ type: 'signature', data: dataUrl });
                sent = true;
            }
        } catch (e: any) {
            console.error('[RemoteSign] BroadcastChannel send failed:', e.message);
            // Try creating a fresh channel
            try {
                console.log('[RemoteSign] Trying fresh BroadcastChannel...');
                const freshChannel = new BroadcastChannel(`pdf-sign-${sessionId}`);
                freshChannel.postMessage({ type: 'signature', data: dataUrl });
                sent = true;
                channelRef.current = freshChannel; // Update ref
            } catch (e2) {
                console.error('[RemoteSign] Fresh channel also failed:', e2);
            }
        }

        // Also try PeerJS if connected
        try {
            if (conn && conn.open) {
                console.log('[RemoteSign] Sending signature via PeerJS');
                conn.send({ type: 'signature', data: dataUrl });
                sent = true;
            }
        } catch (e) {
            console.error('[RemoteSign] PeerJS send failed:', e);
        }

        if (sent) {
            setStatus('sent');
        } else {
            // No working channel - show error
            alert('Connection lost. Please refresh the page and scan the QR code again.');
            setStatus('error');
        }
    };

    if (status === 'sent') {
        return (
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Check className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Signature Sent!</h1>
                <p className="text-gray-500">You can now close this window. The signature has been sent to the sender's device.</p>
            </div>
        );
    }

    if (status === 'connecting') {
        return (
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Smartphone className="w-10 h-10 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Connecting...</h1>
                <p className="text-gray-500 mb-4">Establishing secure connection to the sender's device.</p>
                <p className="text-xs text-gray-400 mb-4">This may take up to 30 seconds for cross-network connections.</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        );
    }

    if (status === 'error' || !sessionId) {
        return (
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <Smartphone className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Connection Failed</h1>
                <p className="text-gray-500 mb-4 max-w-sm">Could not connect to the sender's device.</p>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-sm text-left">
                    <p className="font-semibold text-amber-800 text-sm mb-2">Troubleshooting:</p>
                    <ul className="text-xs text-amber-700 space-y-1 list-disc pl-4">
                        <li>Make sure the <strong>sender keeps their window open</strong></li>
                        <li>The sender should NOT refresh or close the signature dialog</li>
                        <li>Both devices need internet connection</li>
                        <li>Try using the same WiFi network if possible</li>
                    </ul>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
                >
                    Try Again
                </button>
                <p className="text-xs text-gray-400">Session ID: {sessionId || 'Invalid'}</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-50 flex flex-col h-full touch-none overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-white px-6 py-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Pen className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-gray-900">Remote Sign</h1>
                        <p className="text-[10px] text-green-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Connected to Sender's Device
                        </p>
                    </div>
                </div>
                <button onClick={clear} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>

            {/* Instruction */}
            <div className="px-6 py-4 bg-blue-50/50 text-center">
                <p className="text-xs font-medium text-blue-700">Draw your signature in the box below.</p>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 p-4 flex flex-col">
                <div className="flex-1 bg-white border-2 border-dashed border-gray-200 rounded-2xl relative shadow-inner overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        onTouchCancel={stopDrawing}
                        style={{ touchAction: 'none' }}
                        className="absolute inset-0 w-full h-full cursor-crosshair bg-white"
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white border-t border-gray-100">
                <button
                    onClick={sendSignature}
                    disabled={status !== 'connected'}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${status === 'connected' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-gray-300 cursor-not-allowed'
                        }`}
                >
                    <Check className="w-5 h-5" />
                    Send Signature
                </button>
            </div>
        </div>
    );
}
