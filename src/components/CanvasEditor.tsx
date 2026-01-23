// PDF Studio - Canvas Editor Component

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useEditor } from '../context/EditorContext';
import type { PageElement, TextElement, ImageElement, ShapeElement } from '../types';
import { generateId, getRelativeMousePosition, clamp } from '../utils/helpers';

interface CanvasEditorProps {
    pageImage: string | null;
    pageWidth: number;
    pageHeight: number;
    elements: PageElement[];
    onAddElement: (element: PageElement) => void;
}

export function CanvasEditor({
    pageImage,
    pageWidth,
    pageHeight,
    elements,
    onAddElement
}: CanvasEditorProps) {
    const { state, selectElement, updateElement, deleteElement } = useEditor();
    const { zoom, tool, selectedElement, currentPage, showGrid, snapToGrid, gridSize } = state;

    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedElement) return;

            // Delete element
            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                deleteElement(currentPage, selectedElement.id);
            }

            // Move with arrow keys
            const moveAmount = e.shiftKey ? 10 : 1;
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                updateElement(currentPage, { ...selectedElement, y: selectedElement.y - moveAmount });
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                updateElement(currentPage, { ...selectedElement, y: selectedElement.y + moveAmount });
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                updateElement(currentPage, { ...selectedElement, x: selectedElement.x - moveAmount });
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                updateElement(currentPage, { ...selectedElement, x: selectedElement.x + moveAmount });
            }

            // Escape to deselect
            if (e.key === 'Escape') {
                selectElement(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElement, currentPage, deleteElement, updateElement, selectElement]);

    // Snap value to grid if enabled
    const snapToGridValue = useCallback((value: number) => {
        if (!snapToGrid) return value;
        return Math.round(value / gridSize) * gridSize;
    }, [snapToGrid, gridSize]);

    // Handle canvas click for adding elements
    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        if (!containerRef.current) return;

        const pos = getRelativeMousePosition(e, containerRef.current);
        const x = snapToGridValue(pos.x / zoom);
        const y = snapToGridValue(pos.y / zoom);

        // Click on background - deselect
        if (tool === 'select') {
            selectElement(null);
            return;
        }

        // Add text
        if (tool === 'text') {
            const textElement: TextElement = {
                id: generateId(),
                type: 'text',
                x,
                y,
                width: 200,
                height: 40,
                rotation: 0,
                opacity: 1,
                zIndex: elements.length,
                locked: false,
                content: 'Double-click to edit',
                fontSize: 24,
                fontFamily: 'helvetica',
                fontWeight: 400,
                fontStyle: 'normal',
                color: '#000000',
                textAlign: 'left',
                lineHeight: 1.2,
            };
            onAddElement(textElement);
        }

        // Add shape
        if (tool === 'shape') {
            const shapeElement: ShapeElement = {
                id: generateId(),
                type: 'shape',
                x,
                y,
                width: 100,
                height: 100,
                rotation: 0,
                opacity: 1,
                zIndex: elements.length,
                locked: false,
                shapeType: 'rectangle',
                fill: '#3b82f6',
                stroke: '#1e40af',
                strokeWidth: 2,
                borderRadius: 8,
            };
            onAddElement(shapeElement);
        }
    }, [tool, zoom, elements.length, snapToGridValue, selectElement, onAddElement]);

    // Handle element click
    const handleElementClick = useCallback((e: React.MouseEvent, element: PageElement) => {
        e.stopPropagation();
        if (tool === 'select') {
            selectElement(element);
        }
    }, [tool, selectElement]);

    // Handle drag start
    const handleDragStart = useCallback((e: React.MouseEvent, element: PageElement) => {
        if (element.locked) return;
        e.stopPropagation();

        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setElementStart({ x: element.x, y: element.y, width: element.width, height: element.height });
        selectElement(element);
    }, [selectElement]);

    // Handle resize start
    const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
        if (!selectedElement || selectedElement.locked) return;
        e.stopPropagation();

        setIsResizing(true);
        setResizeHandle(handle);
        setDragStart({ x: e.clientX, y: e.clientY });
        setElementStart({
            x: selectedElement.x,
            y: selectedElement.y,
            width: selectedElement.width,
            height: selectedElement.height
        });
    }, [selectedElement]);

    // Handle mouse move
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!selectedElement) return;

        const dx = (e.clientX - dragStart.x) / zoom;
        const dy = (e.clientY - dragStart.y) / zoom;

        if (isDragging) {
            const newX = snapToGridValue(clamp(elementStart.x + dx, 0, pageWidth - selectedElement.width));
            const newY = snapToGridValue(clamp(elementStart.y + dy, 0, pageHeight - selectedElement.height));

            updateElement(currentPage, {
                ...selectedElement,
                x: newX,
                y: newY,
            });
        }

        if (isResizing && resizeHandle) {
            let newX = elementStart.x;
            let newY = elementStart.y;
            let newWidth = elementStart.width;
            let newHeight = elementStart.height;

            if (resizeHandle.includes('e')) {
                newWidth = snapToGridValue(Math.max(20, elementStart.width + dx));
            }
            if (resizeHandle.includes('w')) {
                const widthDelta = snapToGridValue(Math.min(elementStart.width - 20, dx));
                newX = elementStart.x + widthDelta;
                newWidth = elementStart.width - widthDelta;
            }
            if (resizeHandle.includes('s')) {
                newHeight = snapToGridValue(Math.max(20, elementStart.height + dy));
            }
            if (resizeHandle.includes('n')) {
                const heightDelta = snapToGridValue(Math.min(elementStart.height - 20, dy));
                newY = elementStart.y + heightDelta;
                newHeight = elementStart.height - heightDelta;
            }

            updateElement(currentPage, {
                ...selectedElement,
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
            });
        }
    }, [selectedElement, isDragging, isResizing, resizeHandle, dragStart, elementStart, zoom,
        pageWidth, pageHeight, snapToGridValue, currentPage, updateElement]);

    // Handle mouse up
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle(null);
    }, []);

    // Render element
    const renderElement = (element: PageElement) => {
        const isSelected = selectedElement?.id === element.id;

        const style: React.CSSProperties = {
            position: 'absolute',
            left: element.x * zoom,
            top: element.y * zoom,
            width: element.width * zoom,
            height: element.height * zoom,
            transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
            opacity: element.opacity,
            cursor: element.locked ? 'not-allowed' : 'move',
            zIndex: element.zIndex,
        };

        return (
            <div
                key={element.id}
                style={style}
                className={`group ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
                onClick={(e) => handleElementClick(e, element)}
                onMouseDown={(e) => handleDragStart(e, element)}
            >
                {/* Element content */}
                {element.type === 'text' && (
                    <div
                        style={{
                            fontSize: (element as TextElement).fontSize * zoom,
                            fontFamily: (element as TextElement).fontFamily === 'cursive'
                                ? 'cursive'
                                : (element as TextElement).fontFamily,
                            fontWeight: (element as TextElement).fontWeight,
                            fontStyle: (element as TextElement).fontStyle,
                            color: (element as TextElement).color,
                            textAlign: (element as TextElement).textAlign,
                            lineHeight: (element as TextElement).lineHeight,
                            width: '100%',
                            height: '100%',
                            overflow: 'hidden',
                        }}
                    >
                        {(element as TextElement).content}
                    </div>
                )}

                {element.type === 'shape' && (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: (element as ShapeElement).fill,
                            border: `${(element as ShapeElement).strokeWidth}px solid ${(element as ShapeElement).stroke}`,
                            borderRadius: (element as ShapeElement).shapeType === 'circle'
                                ? '50%'
                                : (element as ShapeElement).borderRadius,
                        }}
                    />
                )}

                {element.type === 'image' && (
                    <img
                        src={(element as ImageElement).src}
                        alt=""
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: (element as ImageElement).fit,
                            borderRadius: (element as ImageElement).borderRadius,
                        }}
                        draggable={false}
                    />
                )}

                {element.type === 'signature' && (
                    <img
                        src={element.type === 'signature' ? (element as any).data : ''}
                        alt="Signature"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        }}
                        draggable={false}
                    />
                )}

                {/* Resize handles */}
                {isSelected && !element.locked && (
                    <>
                        {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((handle) => (
                            <div
                                key={handle}
                                className={`absolute w-3 h-3 bg-white border-2 border-primary-500 rounded-sm
                           cursor-${handle}-resize z-50`}
                                style={{
                                    ...getHandlePosition(handle),
                                }}
                                onMouseDown={(e) => handleResizeStart(e, handle)}
                            />
                        ))}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 overflow-auto bg-surface-950 p-8">
            <div
                ref={containerRef}
                className="canvas-container mx-auto relative"
                style={{
                    width: pageWidth * zoom,
                    height: pageHeight * zoom,
                }}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Page background */}
                {pageImage ? (
                    <img
                        src={pageImage}
                        alt="PDF Page"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        draggable={false}
                    />
                ) : (
                    <div className="absolute inset-0 bg-white" />
                )}

                {/* Grid overlay */}
                {showGrid && (
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        style={{ opacity: 0.1 }}
                    >
                        <defs>
                            <pattern
                                id="grid"
                                width={gridSize * zoom}
                                height={gridSize * zoom}
                                patternUnits="userSpaceOnUse"
                            >
                                <path
                                    d={`M ${gridSize * zoom} 0 L 0 0 0 ${gridSize * zoom}`}
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="0.5"
                                />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                )}

                {/* Elements */}
                {elements.map(renderElement)}
            </div>
        </div>
    );
}

// Helper function for resize handle positions
function getHandlePosition(handle: string): React.CSSProperties {
    const positions: Record<string, React.CSSProperties> = {
        nw: { top: -6, left: -6 },
        n: { top: -6, left: '50%', transform: 'translateX(-50%)' },
        ne: { top: -6, right: -6 },
        e: { top: '50%', right: -6, transform: 'translateY(-50%)' },
        se: { bottom: -6, right: -6 },
        s: { bottom: -6, left: '50%', transform: 'translateX(-50%)' },
        sw: { bottom: -6, left: -6 },
        w: { top: '50%', left: -6, transform: 'translateY(-50%)' },
    };
    return positions[handle] || {};
}

export default CanvasEditor;
