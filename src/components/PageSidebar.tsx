// PDF Studio - Page Thumbnails Sidebar

import { useState } from 'react';
import {
    Plus,
    RotateCw,
    Trash2,
    Copy,
    GripVertical,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import type { PDFPage } from '../types';

interface PageSidebarProps {
    pages: PDFPage[];
    onRotatePage: (index: number) => void;
    onDeletePage: (index: number) => void;
    onDuplicatePage: (index: number) => void;
    onAddPage: () => void;
}

export function PageSidebar({
    pages,
    onRotatePage,
    onDeletePage,
    onDuplicatePage,
    onAddPage
}: PageSidebarProps) {
    const { state, setCurrentPage } = useEditor();
    const [collapsed, setCollapsed] = useState(false);
    const [hoveredPage, setHoveredPage] = useState<number | null>(null);

    if (collapsed) {
        return (
            <div className="w-12 bg-surface-900/80 backdrop-blur-xl border-r border-white/5 
                      flex flex-col items-center py-4">
                <button
                    onClick={() => setCollapsed(false)}
                    className="btn-icon"
                    title="Expand sidebar"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                <div className="mt-4 text-sm text-surface-500 font-medium">
                    {pages.length}
                </div>
            </div>
        );
    }

    return (
        <div className="w-48 bg-surface-900/80 backdrop-blur-xl border-r border-white/5 
                    flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/5">
                <h3 className="text-sm font-semibold text-surface-300">Pages</h3>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onAddPage}
                        className="btn-icon !p-1.5"
                        title="Add blank page"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setCollapsed(true)}
                        className="btn-icon !p-1.5"
                        title="Collapse sidebar"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Page List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-2">
                {pages.map((page, index) => (
                    <div
                        key={page.index}
                        className={`page-thumbnail group ${state.currentPage === index ? 'active' : ''}`}
                        onClick={() => setCurrentPage(index)}
                        onMouseEnter={() => setHoveredPage(index)}
                        onMouseLeave={() => setHoveredPage(null)}
                    >
                        {/* Drag handle */}
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 
                            transition-opacity cursor-grab">
                            <GripVertical className="w-3 h-3 text-surface-500" />
                        </div>

                        {/* Thumbnail */}
                        <div className="aspect-[3/4] bg-white rounded overflow-hidden">
                            {page.thumbnail ? (
                                <img
                                    src={page.thumbnail}
                                    alt={`Page ${index + 1}`}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-surface-800">
                                    <div className="w-8 h-8 rounded-lg bg-surface-700 shimmer" />
                                </div>
                            )}
                        </div>

                        {/* Page number */}
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-xs font-medium
                            bg-surface-900/80 text-surface-300">
                            {index + 1}
                        </div>

                        {/* Action buttons on hover */}
                        {hoveredPage === index && (
                            <div className="absolute top-1 right-1 flex gap-1 animate-fade-in">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRotatePage(index);
                                    }}
                                    className="p-1 rounded bg-surface-800/90 text-surface-300 hover:text-white
                             transition-colors"
                                    title="Rotate"
                                >
                                    <RotateCw className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDuplicatePage(index);
                                    }}
                                    className="p-1 rounded bg-surface-800/90 text-surface-300 hover:text-white
                             transition-colors"
                                    title="Duplicate"
                                >
                                    <Copy className="w-3 h-3" />
                                </button>
                                {pages.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeletePage(index);
                                        }}
                                        className="p-1 rounded bg-surface-800/90 text-red-400 hover:text-red-300
                               transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer info */}
            <div className="p-3 border-t border-white/5 text-center">
                <span className="text-xs text-surface-500">
                    {pages.length} page{pages.length !== 1 ? 's' : ''}
                </span>
            </div>
        </div>
    );
}

export default PageSidebar;
