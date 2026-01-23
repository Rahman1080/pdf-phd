import React from 'react';
import {
    X, Search, MoreHorizontal, EyeOff
} from 'lucide-react';

interface MaterialGalleryProps {
    onClose: () => void;
    onSelect: (type: string, data?: any) => void;
    initialCategory?: string;
}

const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'brands', label: 'Brands' },
    { id: 'stamps', label: 'Stamps' },
    { id: 'stickers', label: 'Stickers' },
    { id: 'emojis', label: 'Emojis' },
    { id: 'symbols', label: 'Symbols' },
    { id: 'redaction', label: 'Privacy' },
];

const ASSETS = [
    // Brands (Authentic Logos)
    {
        id: 'b1', cat: 'brands', name: 'Google',
        svgString: `<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b2', cat: 'brands', name: 'Meta',
        svgString: `<svg viewBox="0 0 24 24" fill="#0668E1"><path d="M17.458 5.613c-2.327 0-3.951 1.037-5.451 2.816-.902 1.07-1.464 2.14-1.977 3.208-.512-1.07-1.074-2.14-1.977-3.209C6.551 6.632 4.928 5.594 2.6 5.594-.158 5.594-2.2 7.708-2.2 11.235c0 3.75 2.408 7.152 7.03 7.152a6.38 6.38 0 0 0 3.17-.834 6.38 6.38 0 0 0 3.17.834c4.622 0 7.03-3.402 7.03-7.152 0-3.527-2.042-5.641-5.142-5.641l.244.019Zm-7.796 5.622c.48.97.973 1.944 1.705 2.943a5.9 5.9 0 0 0-.258 1.488c-.015.353-.1.688-.235 1.006a3.84 3.84 0 0 1-2.924-4.516c.414-.307.94-.616 1.57-.914l.142-.007Zm8.818.156c.717 3.167-1.42 6.075-4.503 6.075-1.048 0-1.898-.344-2.528-.9a6.34 6.34 0 0 0 .54-2.232c0-1.01-.522-2.023-1.41-3.085.545-1.127 1.155-2.253 2.144-3.431 1.253-1.49 2.455-2.31 4.144-2.31 2.251 0 3.528 1.55 3.528 4.2h-1.915Z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b3', cat: 'brands', name: 'Apple',
        svgString: `<svg viewBox="0 0 24 24" fill="#000000"><path d="M17.05 20.28c-.98.95-2.05 1.88-3.32 1.88-1.25 0-1.63-.78-3.13-.78-1.48 0-1.94.75-3.12.78-1.25.04-2.48-1-3.45-2.02-1.98-2.07-3.41-5.83-1.37-9.33 1.02-1.72 2.76-2.82 4.67-2.85 1.45-.02 2.82.98 3.7.98.86 0 2.53-1.21 4.26-1.04 1.74.06 3.03.69 3.86 1.9-3.52 2.13-3 6.33.62 8.41-.65 1.62-1.5 3.14-2.72 4.37zM12.03 4.88c.76-.98 1.28-2.35 1.14-3.71-1.14.05-2.52.78-3.33 1.76-.74.88-1.38 2.26-1.21 3.58 1.28.1 2.57-.65 3.4-1.63z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b4', cat: 'brands', name: 'Microsoft',
        svgString: `<svg viewBox="0 0 24 24"><path fill="#f35323" d="M1 1h10v10H1z" /><path fill="#80bb03" d="M13 1h10v10H13z" /><path fill="#05a6f0" d="M1 13h10v10H1z" /><path fill="#ffba08" d="M13 13h10v10H13z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b5', cat: 'brands', name: 'Amazon',
        svgString: `<svg viewBox="0 0 24 24" fill="#FF9900"><path d="M15.072 11.26c-1.74-.734-3.447-1.1-5.115-1.1-2.613 0-4.673 1.11-4.673 3.826 0 2.6 1.93 3.65 3.743 3.65 1.742 0 3.065-.89 3.844-2.22l.067-.116v1.785l1.94 1.94-.015-7.765H15l.072z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b6', cat: 'brands', name: 'Netflix',
        svgString: `<svg viewBox="0 0 24 24" fill="#E50914"><path d="M4 2v20h3V10l3.5 12h3.5l3.5-12v12h3V2h-3l-5 14-5-14H4z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b11', cat: 'brands', name: 'Twitter',
        svgString: `<svg viewBox="0 0 24 24" fill="#1DA1F2"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b12', cat: 'brands', name: 'Instagram',
        svgString: `<svg viewBox="0 0 24 24" fill="#E4405F"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b13', cat: 'brands', name: 'YouTube',
        svgString: `<svg viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 12.403c0 .822-.67 1.489-1.488 1.489H2.13a1.49 1.49 0 01-1.49-1.49v-7.29c0-.82.67-1.49 1.49-1.49h19.88c.82 0 1.488.67 1.488 1.49v7.29zM9.936 11.39l6.32-3.65-6.32-3.65v7.3z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b14', cat: 'brands', name: 'PayPal',
        svgString: `<svg viewBox="0 0 24 24" fill="#003087"><path d="M20.067 6.947c.496 3.16-1.53 6.134-4.522 6.635-1.01.17-2.02.17-3.03.17h-1.515l-.505 3.03h-3.03l2.02-12.12h4.545c3.03-.505 5.555 1.144 6.037 2.285zm-1.515 9.09h-3.03l-.505 3.03h3.03l.505-3.03zM7.947 18.067h3.03l.505-3.03h-3.03l-.505 3.03z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b15', cat: 'brands', name: 'TikTok',
        svgString: `<svg viewBox="0 0 24 24" fill="#000000"><path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.33-.74.49-1.13 1.33-1.14 2.22 0 .1 0 .2.01.3.15 1.64 2.25 2.34 3.33 1.1.4-.4.58-1.1.58-1.66.01-3.13.01-6.26.01-9.39-.02-1.33-.02-2.65-.02-3.98z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b16', cat: 'brands', name: 'Spotify',
        svgString: `<svg viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.306c-.215.353-.674.464-1.027.249-2.843-1.737-6.422-2.13-10.635-1.168-.403.093-.81-.157-.903-.56s.157-.81.56-.903c4.603-1.052 8.548-.598 11.756 1.362.353.215.464.674.249 1.027zm1.468-3.256c-.271.44-.844.582-1.284.311-3.252-1.998-8.21-2.582-12.054-1.416-.497.151-1.02-.132-1.171-.629s.132-1.02.629-1.171c4.394-1.334 9.87-.674 13.57 1.601.44.271.583.844.31 1.284zm.126-3.414C15.247 8.24 8.293 8 4.29 9.215c-.568.172-1.171-.151-1.343-.719-.172-.568.151-1.171.719-1.343 4.542-1.378 12.213-1.11 16.711 1.561.512.304.678.966.374 1.478-.304.512-.966.678-1.478.374z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b17', cat: 'brands', name: 'Visa',
        svgString: `<svg viewBox="0 0 24 24" fill="#1A1F71"><path d="M10.7 15.6l1.2-4.5 2.1 4.5h-3.3zm6.3-4.5h-1.6c-.5 0-.9.3-1 .8l-3.3 8.2h2.2l.4-1.2h2.7l.3 1.2h2l-1.7-9zm-13.6 0l-.1.8c1.3.3 2.1 1.2 2.4 2.1l2.5 6.3 2.3-9.2H8.3zm-3.4 0L1 15c.3 1.1.9 2.1 1.8 2.8s2.2 1.1 3.4 1l.5-1.9c-.8 0-1.6-.3-2.2-.8s-1-.2-1.5-1z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b18', cat: 'brands', name: 'Mastercard',
        svgString: `<svg viewBox="0 0 24 24"><circle cx="8" cy="12" r="7" fill="#EB001B" opacity="0.8" /><circle cx="16" cy="12" r="7" fill="#F79E1B" opacity="0.8" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b19', cat: 'brands', name: 'Disney',
        svgString: `<svg viewBox="0 0 24 24" fill="#113CCF"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /><circle cx="12" cy="12" r="5" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b20', cat: 'brands', name: 'Starbucks',
        svgString: `<svg viewBox="0 0 24 24" fill="#00704A"><circle cx="12" cy="12" r="10" /><path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 14a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b21', cat: 'brands', name: 'Oracle',
        svgString: `<svg viewBox="0 0 24 24" fill="#F80000"><path d="M16.143 4.286c-4.414 0-8 3.586-8 8s3.586 8 8 8 8-3.586 8-8-3.586-8-8-8zm0 13.143c-2.836 0-5.143-2.307-5.143-5.143s2.307-5.143 5.143-5.143 5.143 2.307 5.143 5.143-2.307 5.143-5.143 5.143zM3.429 20h3.143v-1.143c0-2 1.143-3.143 3.143-3.143H12V12.571H9.714c-3.143 0-6.286 2.571-6.286 6.286V20z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b22', cat: 'brands', name: 'Intel',
        svgString: `<svg viewBox="0 0 24 24" fill="#0071C5"><path d="M21.5 5.5v13h-19v-13zm2-2h-23v17h23zm-17 11.5v-7h-1.5v7zm6.5-7h-1.5l-3 4-1.5-4h-1.5l2.5 7h1.5zm6.5 0h-1.5v4.5l-2.5-4.5h-1.5v7h1.5v-4.5l2.5 4.5h1.5z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b24', cat: 'brands', name: 'IBM',
        svgString: `<svg viewBox="0 0 24 24" fill="#006699"><path d="M22 6h-20v1h20v-1zm0 2h-20v1h20v-1zm0 2h-20v1h20v-1zm0 2h-20v1h20v-1zm0 2h-20v1h20v-1zm0 2h-20v1h20v-1zm0 2h-20v1h20v-1z" /></svg>`,
        type: 'sticker'
    },
    {
        id: 'b25', cat: 'brands', name: 'Cisco',
        svgString: `<svg viewBox="0 0 24 24" fill="#049FD9"><path d="M7 16h1v4H7zm4-4h1v8h-1zm4-4h1v12h-1zm4-4h1v16h-1zm-12 0h1v16h-1zm-4 4h1v12h-1zm-4 4h1v8h-1z" /></svg>`,
        type: 'sticker'
    },

    // Primary Stickers (High Utility)
    { id: 'st-s1', cat: 'stickers', name: 'Verified', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>`, type: 'sticker' },
    { id: 'st-s2', cat: 'stickers', name: 'Caution', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>`, type: 'sticker' },
    { id: 'st-s3', cat: 'stickers', name: 'Vault', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>`, type: 'sticker' },
    { id: 'st-s11', cat: 'stickers', name: 'Flag', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>`, type: 'sticker' },
    { id: 'st-s13', cat: 'stickers', name: 'Victory', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16s0-2 1-3 3-1 3-1V5l2-2 2 2v7s0 0 3 1 1 3 1 3v2H5v-2z" /><path d="M15 14s2 0 2-2V7l-2-2" /></svg>`, type: 'sticker' },
    { id: 'st-s14', cat: 'stickers', name: 'Launch', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.71-2.13 0-2.97a2.121 2.121 0 0 0-3 0z" /><path d="M8 10l5 5" /><path d="M7 11l5 5" /><path d="M16 3s-1 5-7 5l-7 7L13 22l7-7s4-4 4-10c0 0-4 1-8 1z" /></svg>`, type: 'sticker' },
    { id: 'st-5', cat: 'stamps', name: 'COMPLETED', color: '#22c55e', type: 'stamp' },
    { id: 'st-6', cat: 'stamps', name: 'IMPORTANT', color: '#ef4444', type: 'stamp' },
    { id: 'st-7', cat: 'stamps', name: 'REJECTED', color: '#ef4444', type: 'stamp' },
    { id: 'st-8', cat: 'stamps', name: 'ORIGINAL', color: '#6366f1', type: 'stamp' },
    { id: 'st-9', cat: 'stamps', name: 'EXPIRED', color: '#94a3b8', type: 'stamp' },
    { id: 'st-10', cat: 'stamps', name: 'TOP SECRET', color: '#000000', type: 'stamp' },

    // Emojis (Expanded significantly)
    { id: 'e1', cat: 'emojis', name: 'Grinning', content: '😀', type: 'emoji' },
    { id: 'e2', cat: 'emojis', name: 'Smile', content: '😊', type: 'emoji' },
    { id: 'e3', cat: 'emojis', name: 'Love', content: '😍', type: 'emoji' },
    { id: 'e4', cat: 'emojis', name: 'Sunglasses', content: '😎', type: 'emoji' },
    { id: 'e5', cat: 'emojis', name: 'Star Eyes', content: '🤩', type: 'emoji' },
    { id: 'e6', cat: 'emojis', name: 'Mind Blown', content: '🤯', type: 'emoji' },
    { id: 'e7', cat: 'emojis', name: 'Think', content: '🤔', type: 'emoji' },
    { id: 'e8', cat: 'emojis', name: 'Rocket', content: '🚀', type: 'emoji' },
    { id: 'e9', cat: 'emojis', name: 'Fire', content: '🔥', type: 'emoji' },
    { id: 'e10', cat: 'emojis', name: 'Target', content: '🎯', type: 'emoji' },
    { id: 'e11', cat: 'emojis', name: '100', content: '💯', type: 'emoji' },
    { id: 'e12', cat: 'emojis', name: 'Sparkles', content: '✨', type: 'emoji' },
    { id: 'e13', cat: 'emojis', name: 'Gem', content: '💎', type: 'emoji' },
    { id: 'e14', cat: 'emojis', name: 'Idea', content: '💡', type: 'emoji' },
    { id: 'e15', cat: 'emojis', name: 'Top', content: '🔝', type: 'emoji' },
    { id: 'e16', cat: 'emojis', name: 'Check', content: '✅', type: 'emoji' },
    { id: 'e17', cat: 'emojis', name: 'Thumbs Up', content: '👍', type: 'emoji' },
    { id: 'e18', cat: 'emojis', name: 'Heart', content: '❤️', type: 'emoji' },
    { id: 'e19', cat: 'emojis', name: 'Party', content: '🎉', type: 'emoji' },
    { id: 'e20', cat: 'emojis', name: 'Money', content: '💰', type: 'emoji' },
    { id: 'e21', cat: 'emojis', name: 'Globe', content: '🌐', type: 'emoji' },
    { id: 'e22', cat: 'emojis', name: 'Mail', content: '📧', type: 'emoji' },
    { id: 'e23', cat: 'emojis', name: 'Calendar', content: '📅', type: 'emoji' },
    { id: 'e24', cat: 'emojis', name: 'Clock', content: '⏰', type: 'emoji' },
    { id: 'e25', cat: 'emojis', name: 'Wink', content: '😉', type: 'emoji' },
    { id: 'e26', cat: 'emojis', name: 'Strong', content: '💪', type: 'emoji' },
    { id: 'e27', cat: 'emojis', name: 'Crown', content: '👑', type: 'emoji' },
    { id: 'e28', cat: 'emojis', name: 'Bell', content: '🔔', type: 'emoji' },
    { id: 'e29', cat: 'emojis', name: 'Laptop', content: '💻', type: 'emoji' },
    { id: 'e30', cat: 'emojis', name: 'Phone', content: '📱', type: 'emoji' },
    { id: 'e31', cat: 'emojis', name: 'Camera', content: '📷', type: 'emoji' },
    { id: 'e32', cat: 'emojis', name: 'Book', content: '📚', type: 'emoji' },
    { id: 'e33', cat: 'emojis', name: 'Briefcase', content: '💼', type: 'emoji' },
    { id: 'e34', cat: 'emojis', name: 'File', content: '📁', type: 'emoji' },
    { id: 'e35', cat: 'emojis', name: 'Hand Point', content: '👉', type: 'emoji' },
    { id: 'e36', cat: 'emojis', name: 'Hand Wave', content: '👋', type: 'emoji' },
    { id: 'e37', cat: 'emojis', name: 'Sun', content: '☀️', type: 'emoji' },
    { id: 'e38', cat: 'emojis', name: 'Moon', content: '🌙', type: 'emoji' },
    { id: 'e39', cat: 'emojis', name: 'Cloud', content: '☁️', type: 'emoji' },
    { id: 'e40', cat: 'emojis', name: 'Bolt', content: '⚡', type: 'emoji' },

    // Symbols (Expanded)
    { id: 'sy1', cat: 'symbols', name: 'Copyright', content: '©', type: 'emoji' },
    { id: 'sy2', cat: 'symbols', name: 'Registered', content: '®', type: 'emoji' },
    { id: 'sy3', cat: 'symbols', name: 'Trademark', content: '™', type: 'emoji' },
    { id: 'sy4', cat: 'symbols', name: 'Checkmark', content: '✓', type: 'emoji' },
    { id: 'sy5', cat: 'symbols', name: 'Bullet', content: '•', type: 'emoji' },
    { id: 'sy6', cat: 'symbols', name: 'Arrow Right', content: '→', type: 'emoji' },
    { id: 'sy7', cat: 'symbols', name: 'Arrow Left', content: '←', type: 'emoji' },
    { id: 'sy8', cat: 'symbols', name: 'Arrow Up', content: '↑', type: 'emoji' },
    { id: 'sy9', cat: 'symbols', name: 'Arrow Down', content: '↓', type: 'emoji' },
    { id: 'sy10', cat: 'symbols', name: 'Degree', content: '°', type: 'emoji' },
    { id: 'sy11', cat: 'symbols', name: 'Plus Minus', content: '±', type: 'emoji' },
    { id: 'sy12', cat: 'symbols', name: 'Infinity', content: '∞', type: 'emoji' },
    { id: 'sy13', cat: 'symbols', name: 'Sum', content: 'Σ', type: 'emoji' },
    { id: 'sy14', cat: 'symbols', name: 'Pi', content: 'π', type: 'emoji' },
    { id: 'sy15', cat: 'symbols', name: 'Euro', content: '€', type: 'emoji' },
    { id: 'sy16', cat: 'symbols', name: 'Pound', content: '£', type: 'emoji' },
    { id: 'sy17', cat: 'symbols', name: 'Justice', content: '⚖️', type: 'emoji' },
    { id: 'sy18', cat: 'symbols', name: 'Section', content: '§', type: 'emoji' },
    { id: 'sy19', cat: 'symbols', name: 'Divide', content: '÷', type: 'emoji' },
    { id: 'sy20', cat: 'symbols', name: 'Dot', content: '·', type: 'emoji' },
    { id: 'sy21', cat: 'symbols', name: 'Integral', content: '∫', type: 'emoji' },
    { id: 'sy22', cat: 'symbols', name: 'Delta', content: 'Δ', type: 'emoji' },
    { id: 'sy23', cat: 'symbols', name: 'Approx', content: '≈', type: 'emoji' },
    { id: 'sy24', cat: 'symbols', name: 'Not Equal', content: '≠', type: 'emoji' },
    { id: 'sy25', cat: 'symbols', name: 'Arrow Heavy', content: '➔', type: 'emoji' },
    { id: 'sy26', cat: 'symbols', name: 'Diamond Symbol', content: '♦', type: 'emoji' },
    { id: 'sy27', cat: 'symbols', name: 'Club Symbol', content: '♣', type: 'emoji' },
    { id: 'sy28', cat: 'symbols', name: 'Heart Symbol', content: '♥', type: 'emoji' },
    { id: 'sy29', cat: 'symbols', name: 'Spade Symbol', content: '♠', type: 'emoji' },
    { id: 'sy30', cat: 'symbols', name: 'Music Sharp', content: '♯', type: 'emoji' },

    // Primary Stickers (High Utility)
    { id: 'st-v1', cat: 'stickers', name: 'Verified', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>`, type: 'sticker' },
    { id: 'st-v2', cat: 'stickers', name: 'Caution', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>`, type: 'sticker' },
    { id: 'st-v3', cat: 'stickers', name: 'Vault', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>`, type: 'sticker' },
    { id: 'st-v4', cat: 'stickers', name: 'Info Point', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>`, type: 'sticker' },
    { id: 'st-v5', cat: 'stickers', name: 'Insight', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.674" /><path d="M10 20h4" /><path d="M12 2v1" /><path d="M4.929 4.929l.707.707" /><path d="M21 12h-1" /><path d="M18.364 18.364l-.707-.707" /><path d="M12 22v-1" /><path d="M5.636 18.364l.707-.707" /><path d="M3 12h1" /><path d="M4.929 19.071l.707-.707" /><path d="M12 13a5 5 0 1 0-5-5" /></svg>`, type: 'sticker' },
    { id: 'st-v6', cat: 'stickers', name: 'Love it', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>`, type: 'sticker' },
    { id: 'st-v11', cat: 'stickers', name: 'Flag', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>`, type: 'sticker' },
    { id: 'st-v13', cat: 'stickers', name: 'Victory', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2z" /></svg>`, type: 'sticker' },
    { id: 'st-v14', cat: 'stickers', name: 'Launch', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.71-2.13 0-2.97a2.121 2.121 0 0 0-3 0z" /><path d="M8 10l5 5" /><path d="M7 11l5 5" /><path d="M16 3s-1 5-7 5l-7 7L13 22l7-7s4-4 4-10c0 0-4 1-8 1z" /></svg>`, type: 'sticker' },
    { id: 'st-v21', cat: 'stickers', name: 'Hot', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>`, type: 'sticker' },
    { id: 'st-v22', cat: 'stickers', name: 'Star', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>`, type: 'sticker' },
    { id: 'st-v23', cat: 'stickers', name: 'Lock', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>`, type: 'sticker' },
    { id: 'st-v24', cat: 'stickers', name: 'Unlock', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>`, type: 'sticker' },
    { id: 'st-v25', cat: 'stickers', name: 'Clock', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>`, type: 'sticker' },
    { id: 'st-v26', cat: 'stickers', name: 'Eye', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>`, type: 'sticker' },
    { id: 'st-v27', cat: 'stickers', name: 'Ban', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>`, type: 'sticker' },
    { id: 'st-v28', cat: 'stickers', name: 'Check Circle', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>`, type: 'sticker' },
    { id: 'st-v29', cat: 'stickers', name: 'X Circle', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>`, type: 'sticker' },
    { id: 'st-v30', cat: 'stickers', name: 'Pin', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>`, type: 'sticker' },
    { id: 'st-v31', cat: 'stickers', name: 'Bookmark', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>`, type: 'sticker' },
    { id: 'st-v32', cat: 'stickers', name: 'Link', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>`, type: 'sticker' },
    { id: 'st-v33', cat: 'stickers', name: 'Settings', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>`, type: 'sticker' },
    { id: 'st-v34', cat: 'stickers', name: 'Download', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>`, type: 'sticker' },
    { id: 'st-v35', cat: 'stickers', name: 'Upload', svgString: `<svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>`, type: 'sticker' },

    // More Brands
    { id: 'b26', cat: 'brands', name: 'LinkedIn', svgString: `<svg viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>`, type: 'sticker' },
    { id: 'b27', cat: 'brands', name: 'Slack', svgString: `<svg viewBox="0 0 24 24"><path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" /><path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" /><path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" /><path fill="#ECB22E" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" /></svg>`, type: 'sticker' },
    { id: 'b28', cat: 'brands', name: 'GitHub', svgString: `<svg viewBox="0 0 24 24" fill="#181717"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>`, type: 'sticker' },
    { id: 'b29', cat: 'brands', name: 'Dropbox', svgString: `<svg viewBox="0 0 24 24" fill="#0061FF"><path d="M12 6.134L6.069 9.797 12 13.459l5.931-3.662L12 6.134zM6.069 14.072L0 10.407v3.661l6.069 3.67L12 14.072v-.001-3.662l-5.931 3.663zm11.862-3.663L12 14.072v3.662l6.069 3.666 6.069-3.666v-3.661l-6.207-3.664zM0 10.407l6.069 3.665L12 10.409V6.134L6.069 2.471 0 6.134v4.273zM12 6.134l5.931 3.663L24 6.134 17.931 2.471 12 6.134z" /></svg>`, type: 'sticker' },
    { id: 'b30', cat: 'brands', name: 'Zoom', svgString: `<svg viewBox="0 0 24 24" fill="#2D8CFF"><path d="M4.513 12.77l11.974-7.64v5.19l3.6-2.52A.5.5 0 0 1 21 8.19v7.62a.5.5 0 0 1-.913.39l-3.6-2.52v5.19L4.513 11.23a.5.5 0 0 1 0-.77z" /></svg>`, type: 'sticker' },

    // Legal & Business Stamps
    { id: 's11', cat: 'stamps', name: 'NOTARIZED', color: '#1e40af', type: 'stamp' },
    { id: 's12', cat: 'stamps', name: 'CERTIFIED', color: '#059669', type: 'stamp' },
    { id: 's13', cat: 'stamps', name: 'RECEIVED', color: '#7c3aed', type: 'stamp' },
    { id: 's14', cat: 'stamps', name: 'PENDING', color: '#f59e0b', type: 'stamp' },
    { id: 's15', cat: 'stamps', name: 'CANCELED', color: '#dc2626', type: 'stamp' },
    { id: 's16', cat: 'stamps', name: 'AMENDED', color: '#0891b2', type: 'stamp' },
    { id: 's17', cat: 'stamps', name: 'DUPLICATE', color: '#6b7280', type: 'stamp' },
    { id: 's18', cat: 'stamps', name: 'SUBMITTED', color: '#2563eb', type: 'stamp' },
    { id: 's19', cat: 'stamps', name: 'VERIFIED', color: '#16a34a', type: 'stamp' },
    { id: 's20', cat: 'stamps', name: 'PRELIMINARY', color: '#ca8a04', type: 'stamp' },
    { id: 's21', cat: 'stamps', name: 'REVISED', color: '#9333ea', type: 'stamp' },
    { id: 's22', cat: 'stamps', name: 'FOR REVIEW', color: '#0284c7', type: 'stamp' },
    { id: 's23', cat: 'stamps', name: 'NOT VALID', color: '#b91c1c', type: 'stamp' },
    { id: 's24', cat: 'stamps', name: 'SCANNED', color: '#4b5563', type: 'stamp' },
    { id: 's25', cat: 'stamps', name: 'EXECUTED', color: '#15803d', type: 'stamp' },

    // More Emojis - Business & Office
    { id: 'e41', cat: 'emojis', name: 'Chart Up', content: '📈', type: 'emoji' },
    { id: 'e42', cat: 'emojis', name: 'Chart Down', content: '📉', type: 'emoji' },
    { id: 'e43', cat: 'emojis', name: 'Graph', content: '📊', type: 'emoji' },
    { id: 'e44', cat: 'emojis', name: 'Clipboard', content: '📋', type: 'emoji' },
    { id: 'e45', cat: 'emojis', name: 'Pushpin', content: '📌', type: 'emoji' },
    { id: 'e46', cat: 'emojis', name: 'Paperclip', content: '📎', type: 'emoji' },
    { id: 'e47', cat: 'emojis', name: 'Memo', content: '📝', type: 'emoji' },
    { id: 'e48', cat: 'emojis', name: 'Inbox', content: '📥', type: 'emoji' },
    { id: 'e49', cat: 'emojis', name: 'Outbox', content: '📤', type: 'emoji' },
    { id: 'e50', cat: 'emojis', name: 'Key', content: '🔑', type: 'emoji' },
    { id: 'e51', cat: 'emojis', name: 'Magnify', content: '🔍', type: 'emoji' },
    { id: 'e52', cat: 'emojis', name: 'Lock', content: '🔒', type: 'emoji' },
    { id: 'e53', cat: 'emojis', name: 'Unlock', content: '🔓', type: 'emoji' },
    { id: 'e54', cat: 'emojis', name: 'Light Bulb', content: '💡', type: 'emoji' },
    { id: 'e55', cat: 'emojis', name: 'Hammer', content: '🔨', type: 'emoji' },
    { id: 'e56', cat: 'emojis', name: 'Wrench', content: '🔧', type: 'emoji' },
    { id: 'e57', cat: 'emojis', name: 'Gear', content: '⚙️', type: 'emoji' },
    { id: 'e58', cat: 'emojis', name: 'Link', content: '🔗', type: 'emoji' },
    { id: 'e59', cat: 'emojis', name: 'Hourglass', content: '⏳', type: 'emoji' },
    { id: 'e60', cat: 'emojis', name: 'Alarm', content: '⏰', type: 'emoji' },

    // Travel & Location
    { id: 'e61', cat: 'emojis', name: 'Airplane', content: '✈️', type: 'emoji' },
    { id: 'e62', cat: 'emojis', name: 'Car', content: '🚗', type: 'emoji' },
    { id: 'e63', cat: 'emojis', name: 'Bus', content: '🚌', type: 'emoji' },
    { id: 'e64', cat: 'emojis', name: 'Train', content: '🚆', type: 'emoji' },
    { id: 'e65', cat: 'emojis', name: 'Ship', content: '🚢', type: 'emoji' },
    { id: 'e66', cat: 'emojis', name: 'House', content: '🏠', type: 'emoji' },
    { id: 'e67', cat: 'emojis', name: 'Office', content: '🏢', type: 'emoji' },
    { id: 'e68', cat: 'emojis', name: 'Hospital', content: '🏥', type: 'emoji' },
    { id: 'e69', cat: 'emojis', name: 'Bank', content: '🏦', type: 'emoji' },
    { id: 'e70', cat: 'emojis', name: 'School', content: '🏫', type: 'emoji' },

    // More Symbols
    { id: 'sy31', cat: 'symbols', name: 'Asterisk', content: '✱', type: 'emoji' },
    { id: 'sy32', cat: 'symbols', name: 'Dagger', content: '†', type: 'emoji' },
    { id: 'sy33', cat: 'symbols', name: 'Double Dagger', content: '‡', type: 'emoji' },
    { id: 'sy34', cat: 'symbols', name: 'Paragraph', content: '¶', type: 'emoji' },
    { id: 'sy35', cat: 'symbols', name: 'Quote Left', content: '«', type: 'emoji' },
    { id: 'sy36', cat: 'symbols', name: 'Quote Right', content: '»', type: 'emoji' },
    { id: 'sy37', cat: 'symbols', name: 'Ellipsis', content: '…', type: 'emoji' },
    { id: 'sy38', cat: 'symbols', name: 'Em Dash', content: '—', type: 'emoji' },
    { id: 'sy39', cat: 'symbols', name: 'En Dash', content: '–', type: 'emoji' },
    { id: 'sy40', cat: 'symbols', name: 'Yen', content: '¥', type: 'emoji' },
    { id: 'sy41', cat: 'symbols', name: 'Cent', content: '¢', type: 'emoji' },
    { id: 'sy42', cat: 'symbols', name: 'Per Mille', content: '‰', type: 'emoji' },
    { id: 'sy43', cat: 'symbols', name: 'Number Sign', content: '#', type: 'emoji' },
    { id: 'sy44', cat: 'symbols', name: 'At Sign', content: '@', type: 'emoji' },
    { id: 'sy45', cat: 'symbols', name: 'Ampersand', content: '&', type: 'emoji' },

    // Redaction
    { id: 'r1', cat: 'redaction', name: 'Secure Blackout', type: 'redact', color: '#000000' },
    { id: 'r2', cat: 'redaction', name: 'Clean Whiteout', type: 'redact', color: '#ffffff' },
    { id: 'r3', cat: 'redaction', name: 'Gray Cover', type: 'redact', color: '#6b7280' },
    { id: 'r4', cat: 'redaction', name: 'Blue Mask', type: 'redact', color: '#1e40af' },
];

export function MaterialGallery({ onClose, onSelect, initialCategory }: MaterialGalleryProps) {
    const [activeCat, setActiveCat] = React.useState(initialCategory || 'all');
    const [search, setSearch] = React.useState('');

    const filtered = ASSETS.filter(a => {
        const matchesCat = activeCat === 'all' || a.cat === activeCat;
        const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
            <div className="modal !max-w-4xl h-[650px] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Editing Materials</h2>
                        <p className="text-surface-400 text-sm italic">High-quality assets for your PDF workspace</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-surface-400" />
                    </button>
                </div>

                {/* Categories & Search */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex bg-surface-800 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCat(cat.id)}
                                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeCat === cat.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-surface-400 hover:text-white'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                        <input
                            type="text"
                            placeholder="Search assets (e.g. 'rocket', 'approved', 'copyright')..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input !pl-12 !py-3.5 !rounded-2xl !bg-surface-800/50 !border-white/5 focus:!border-primary-500/50"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto scrollbar-thin pr-4 -mr-4">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-4">
                        {filtered.map(asset => (
                            <button
                                key={asset.id}
                                onClick={() => {
                                    onSelect(asset.type || 'sticker', asset);
                                }}
                                className="group relative bg-surface-800/40 hover:bg-primary-500/10 border border-white/5 
                           hover:border-primary-500/40 rounded-3xl p-4 transition-all duration-300
                           flex flex-col items-center justify-center gap-3"
                            >
                                <div className="w-14 h-14 flex items-center justify-center bg-surface-900/80 rounded-2xl 
                                group-hover:scale-110 transition-transform duration-500 shadow-inner group-hover:shadow-primary-500/10">
                                    {asset.svgString ? (
                                        <div className="w-10 h-10 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: asset.svgString }} />
                                    ) : asset.type === 'stamp' ? (
                                        <div className="border-2 rounded px-1 text-[7px] font-black leading-tight" style={{ borderColor: asset.color, color: asset.color }}>
                                            {asset.name}
                                        </div>
                                    ) : asset.type === 'emoji' ? (
                                        <div className="text-3xl select-none filter drop-shadow-sm">{asset.content}</div>
                                    ) : (
                                        <EyeOff className="w-7 h-7" style={{ color: (asset as any).color }} />
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-surface-400 uppercase tracking-tighter group-hover:text-white transition-colors truncate w-full text-center">
                                    {asset.name}
                                </span>

                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 rounded-3xl blur-xl transition-opacity pointer-events-none" />
                            </button>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-24">
                            <MoreHorizontal className="w-16 h-16 text-surface-800 mx-auto mb-4 animate-pulse" />
                            <p className="text-surface-500 text-lg font-medium italic">No matches found in this universe...</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-surface-500">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                        <span className="text-xs font-medium">Assets are added to the center of your page view</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button className="text-xs hover:text-white transition-colors underline underline-offset-4 decoration-primary-500/30">Missing something?</button>
                        <button onClick={onClose} className="btn-secondary !py-2 !px-6 !rounded-xl !text-sm !font-bold">Done Editing</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
