// Table Creator Component - Word-like Table Insertion
import { useState, useCallback, useEffect } from 'react';
import { X, Table, Plus, Minus, Check } from 'lucide-react';

interface TableCreatorProps {
    onInsert: (tableData: TableData) => void;
    onClose: () => void;
}

export interface TableData {
    rows: number;
    cols: number;
    cellWidth: number;
    cellHeight: number;
    borderColor: string;
    borderWidth: number;
    headerBg: string;
    cellBg: string;
    cells: string[][];
}



export function TableCreator({ onInsert, onClose }: TableCreatorProps) {
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);
    const [cellWidth] = useState(100);
    const [cellHeight] = useState(32);
    const borderColor = '#d1d5db';
    const borderWidth = 1;
    const headerBg = '#f3f4f6';
    const cellBg = '#ffffff';
    const [cellTexts, setCellTexts] = useState<string[][]>(
        Array(rows).fill(null).map(() => Array(cols).fill(''))
    );

    // Helper to determine text color based on background luminance
    const getContrastColor = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#1f2937' : '#ffffff';
    };

    // Initialize/Sync cell texts when rows/cols change
    useEffect(() => {
        setCellTexts(prev => {
            const newTexts = Array(rows).fill(null).map((_, r) =>
                Array(cols).fill(null).map((_, c) => prev[r]?.[c] || '')
            );
            return newTexts;
        });
    }, [rows, cols]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);



    const handleInsert = useCallback(() => {
        onInsert({
            rows,
            cols,
            cellWidth,
            cellHeight,
            borderColor,
            borderWidth,
            headerBg,
            cellBg,
            cells: cellTexts
        });
    }, [rows, cols, cellWidth, cellHeight, borderColor, borderWidth, headerBg, cellBg, cellTexts, onInsert]);

    return (
        <div className="bg-[#1a1a24] rounded-2xl w-full overflow-hidden border border-white/5">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Table className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Insert Table</h2>
                        <p className="text-xs text-white/50">Create a table with customizable rows and columns</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-white/50" />
                </button>
            </div>

            {/* Mode Tabs Removed */}

            {/* Content */}
            <div className="p-5">
                <div className="space-y-4">
                    {/* Row/Column Controls - Keep these to set initial size */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Rows</label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setRows(Math.max(1, rows - 1))}
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/5"
                                >
                                    <Minus className="w-4 h-4 text-white" />
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={rows}
                                    onChange={(e) => setRows(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-center text-white text-sm focus:border-blue-500/50 outline-none"
                                />
                                <button
                                    onClick={() => setRows(Math.min(50, rows + 1))}
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/5"
                                >
                                    <Plus className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Columns</label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCols(Math.max(1, cols - 1))}
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/5"
                                >
                                    <Minus className="w-4 h-4 text-white" />
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={cols}
                                    onChange={(e) => setCols(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-center text-white text-sm focus:border-blue-500/50 outline-none"
                                />
                                <button
                                    onClick={() => setCols(Math.min(20, cols + 1))}
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/5"
                                >
                                    <Plus className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 animate-fade-in pt-4 border-t border-white/5">
                    <label className="text-xs text-white/50 uppercase tracking-wide block">
                        Edit Table Content
                    </label>
                    <div className="overflow-auto max-h-[300px] border border-white/10 rounded-xl bg-black/20 p-4">
                        <table
                            className="mx-auto"
                            style={{
                                borderCollapse: 'separate',
                                borderSpacing: '2px',
                                width: 'max-content'
                            }}
                        >
                            <tbody>
                                {cellTexts.map((row, rowIdx) => (
                                    <tr key={rowIdx}>
                                        {row.map((text, colIdx) => (
                                            <td
                                                key={colIdx}
                                                style={{
                                                    width: Math.max(80, cellWidth / 2),
                                                    height: Math.max(32, cellHeight),
                                                    backgroundColor: rowIdx === 0 ? headerBg : cellBg,
                                                    border: `1px solid ${borderColor}`,
                                                    borderRadius: '4px',
                                                    padding: 0
                                                }}
                                            >
                                                <input
                                                    type="text"
                                                    value={text}
                                                    placeholder={rowIdx === 0 ? `Header ${colIdx + 1}` : ''}
                                                    onChange={(e) => {
                                                        const newTexts = [...cellTexts];
                                                        newTexts[rowIdx] = [...newTexts[rowIdx]];
                                                        newTexts[rowIdx][colIdx] = e.target.value;
                                                        setCellTexts(newTexts);
                                                    }}
                                                    className="w-full h-full bg-transparent border-0 text-center focus:outline-none px-2 text-sm font-medium"
                                                    style={{
                                                        color: getContrastColor(rowIdx === 0 ? headerBg : cellBg),
                                                    }}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                >
                    Cancel
                </button>
                <button
                    onClick={handleInsert}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm font-medium flex items-center gap-2"
                >
                    <Check className="w-4 h-4" />
                    Insert {rows} × {cols} Table
                </button>
            </div>
        </div>
    );
}

export default TableCreator;
