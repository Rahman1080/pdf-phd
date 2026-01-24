// Stamps & Reusable Assets Library
import React, { useState, useEffect } from 'react';
import {
    X, Plus, Trash2, Star, Clock, Search, Upload,
    Stamp, FileSignature, Type, Image, Package
} from 'lucide-react';
import { generateId } from '../utils/helpers';

interface Asset {
    id: string;
    type: 'stamp' | 'signature' | 'text' | 'image';
    name: string;
    content: string; // Base64 for images, text for text blocks
    createdAt: Date;
    favorite?: boolean;
}

interface StampsLibraryProps {
    onClose: () => void;
    onSelectAsset: (asset: Asset) => void;
}

const DEFAULT_STAMPS = [
    { id: 'approved', name: 'APPROVED', text: 'APPROVED', color: '#22c55e' },
    { id: 'rejected', name: 'REJECTED', text: 'REJECTED', color: '#ef4444' },
    { id: 'draft', name: 'DRAFT', text: 'DRAFT', color: '#f59e0b' },
    { id: 'confidential', name: 'CONFIDENTIAL', text: 'CONFIDENTIAL', color: '#ef4444' },
    { id: 'final', name: 'FINAL', text: 'FINAL', color: '#22c55e' },
    { id: 'copy', name: 'COPY', text: 'COPY', color: '#3b82f6' },
    { id: 'void', name: 'VOID', text: 'VOID', color: '#6b7280' },
    { id: 'paid', name: 'PAID', text: 'PAID', color: '#22c55e' },
    { id: 'received', name: 'RECEIVED', text: 'RECEIVED', color: '#8b5cf6' },
    { id: 'urgent', name: 'URGENT', text: 'URGENT', color: '#ef4444' },
    { id: 'review', name: 'FOR REVIEW', text: 'FOR REVIEW', color: '#f59e0b' },
    { id: 'notarized', name: 'NOTARIZED', text: 'NOTARIZED', color: '#0ea5e9' },
];

const STORAGE_KEY = 'pdf-studio-assets';

export function StampsLibrary({ onClose, onSelectAsset }: StampsLibraryProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'stamps' | 'saved'>('stamps');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAssetName, setNewAssetName] = useState('');
    const [newAssetType, setNewAssetType] = useState<'text' | 'image'>('text');
    const [newAssetContent, setNewAssetContent] = useState('');

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !showAddModal) {
                onClose();
            } else if (e.key === 'Escape' && showAddModal) {
                setShowAddModal(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, showAddModal]);

    // Load saved assets from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setAssets(parsed.map((a: any) => ({ ...a, createdAt: new Date(a.createdAt) })));
            } catch (e) {
                console.error('Failed to load assets:', e);
            }
        }
    }, []);

    // Save to localStorage when assets change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
    }, [assets]);

    const addAsset = () => {
        if (!newAssetName.trim() || !newAssetContent.trim()) return;

        const newAsset: Asset = {
            id: generateId(),
            type: newAssetType,
            name: newAssetName,
            content: newAssetContent,
            createdAt: new Date(),
        };

        setAssets(prev => [newAsset, ...prev]);
        setShowAddModal(false);
        setNewAssetName('');
        setNewAssetContent('');
    };

    const deleteAsset = (id: string) => {
        setAssets(prev => prev.filter(a => a.id !== id));
    };

    const toggleFavorite = (id: string) => {
        setAssets(prev => prev.map(a =>
            a.id === id ? { ...a, favorite: !a.favorite } : a
        ));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setNewAssetContent(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectStamp = (stamp: typeof DEFAULT_STAMPS[0]) => {
        onSelectAsset({
            id: stamp.id,
            type: 'stamp',
            name: stamp.name,
            content: stamp.text,
            createdAt: new Date(),
        });
        onClose();
    };

    const filteredAssets = assets.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase())
    );

    const favoriteAssets = filteredAssets.filter(a => a.favorite);
    const recentAssets = filteredAssets.slice(0, 5);

    return (
        <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={onClose}>
            <div
                className="modal !max-w-3xl h-[600px] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Stamps & Assets</h2>
                            <p className="text-surface-400 text-sm">Reusable elements for quick insertion</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add New
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-surface-400" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab('stamps')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'stamps' ? 'bg-amber-500 text-white' : 'bg-white/5 text-surface-400 hover:bg-white/10'
                            }`}
                    >
                        <Stamp className="w-4 h-4" />
                        Standard Stamps
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'saved' ? 'bg-amber-500 text-white' : 'bg-white/5 text-surface-400 hover:bg-white/10'
                            }`}
                    >
                        <Star className="w-4 h-4" />
                        My Saved ({assets.length})
                    </button>
                </div>

                {/* Search */}
                {activeTab === 'saved' && (
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                        <input
                            type="text"
                            placeholder="Search saved assets..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto pr-2">
                    {activeTab === 'stamps' ? (
                        <div className="grid grid-cols-4 gap-3">
                            {DEFAULT_STAMPS.map(stamp => (
                                <button
                                    key={stamp.id}
                                    onClick={() => handleSelectStamp(stamp)}
                                    className="group p-4 bg-white/5 border border-white/10 rounded-xl hover:border-amber-500/30 hover:bg-white/[0.08] transition-all"
                                >
                                    <div
                                        className="px-3 py-2 rounded-lg border-2 border-dashed text-center font-bold text-sm uppercase tracking-wider mb-2"
                                        style={{ borderColor: stamp.color, color: stamp.color }}
                                    >
                                        {stamp.text}
                                    </div>
                                    <p className="text-xs text-surface-500 text-center">{stamp.name}</p>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Favorites */}
                            {favoriteAssets.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                                        <Star className="w-4 h-4" /> Favorites
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {favoriteAssets.map(asset => (
                                            <AssetCard
                                                key={asset.id}
                                                asset={asset}
                                                onSelect={() => { onSelectAsset(asset); onClose(); }}
                                                onDelete={() => deleteAsset(asset.id)}
                                                onToggleFavorite={() => toggleFavorite(asset.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent */}
                            {recentAssets.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-3 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Recent
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {recentAssets.map(asset => (
                                            <AssetCard
                                                key={asset.id}
                                                asset={asset}
                                                onSelect={() => { onSelectAsset(asset); onClose(); }}
                                                onDelete={() => deleteAsset(asset.id)}
                                                onToggleFavorite={() => toggleFavorite(asset.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All */}
                            {filteredAssets.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-3">
                                        All Assets ({filteredAssets.length})
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {filteredAssets.map(asset => (
                                            <AssetCard
                                                key={asset.id}
                                                asset={asset}
                                                onSelect={() => { onSelectAsset(asset); onClose(); }}
                                                onDelete={() => deleteAsset(asset.id)}
                                                onToggleFavorite={() => toggleFavorite(asset.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {assets.length === 0 && (
                                <div className="text-center py-12">
                                    <Package className="w-12 h-12 text-surface-600 mx-auto mb-3" />
                                    <p className="text-surface-400">No saved assets yet</p>
                                    <p className="text-surface-500 text-sm">Click "Add New" to create your first reusable asset</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Add Modal */}
                {showAddModal && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-8" onClick={() => setShowAddModal(false)}>
                        <div className="bg-surface-900 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-bold text-white mb-4">Add New Asset</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2 block">Name</label>
                                    <input
                                        type="text"
                                        value={newAssetName}
                                        onChange={e => setNewAssetName(e.target.value)}
                                        placeholder="e.g., Company Logo"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2 block">Type</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setNewAssetType('text')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${newAssetType === 'text' ? 'bg-primary-500 text-white' : 'bg-white/5 text-surface-400'
                                                }`}
                                        >
                                            <Type className="w-4 h-4" /> Text
                                        </button>
                                        <button
                                            onClick={() => setNewAssetType('image')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${newAssetType === 'image' ? 'bg-primary-500 text-white' : 'bg-white/5 text-surface-400'
                                                }`}
                                        >
                                            <Image className="w-4 h-4" /> Image
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2 block">Content</label>
                                    {newAssetType === 'text' ? (
                                        <textarea
                                            value={newAssetContent}
                                            onChange={e => setNewAssetContent(e.target.value)}
                                            placeholder="Enter text content..."
                                            rows={4}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50 resize-none"
                                        />
                                    ) : (
                                        <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center">
                                            {newAssetContent ? (
                                                <img src={newAssetContent} alt="Preview" className="max-h-32 mx-auto" />
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 text-surface-500 mx-auto mb-2" />
                                                    <p className="text-surface-400 text-sm">Click to upload image</p>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-surface-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={addAsset}
                                    disabled={!newAssetName.trim() || !newAssetContent.trim()}
                                    className="px-6 py-2 bg-primary-500 hover:bg-primary-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Save Asset
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function AssetCard({ asset, onSelect, onDelete, onToggleFavorite }: {
    asset: Asset;
    onSelect: () => void;
    onDelete: () => void;
    onToggleFavorite: () => void;
}) {
    const icons = {
        stamp: <Stamp className="w-5 h-5" />,
        signature: <FileSignature className="w-5 h-5" />,
        text: <Type className="w-5 h-5" />,
        image: <Image className="w-5 h-5" />,
    };

    return (
        <div className="group relative p-4 bg-white/5 border border-white/10 rounded-xl hover:border-primary-500/30 transition-all">
            {/* Actions */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={e => { e.stopPropagation(); onToggleFavorite(); }}
                    className={`p-1.5 rounded-lg transition-colors ${asset.favorite ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-surface-400 hover:text-white'}`}
                >
                    <Star className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={e => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            <button onClick={onSelect} className="w-full text-left">
                <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center text-primary-400 mb-3">
                    {icons[asset.type]}
                </div>
                <h4 className="text-sm font-semibold text-white truncate">{asset.name}</h4>
                <p className="text-xs text-surface-500 capitalize">{asset.type}</p>
            </button>
        </div>
    );
}

export default StampsLibrary;
