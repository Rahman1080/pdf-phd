// Add Fillable Fields Panel - Compact Professional Field Insertion System
import React, { useState } from 'react';
import {
    Type, Calendar, User, Hash, ChevronDown, CheckSquare, Circle,
    X, Trash2, Sigma, Mail, Building, Briefcase, MapPin, DollarSign,
    Sparkles, Search
} from 'lucide-react';

export interface FieldType {
    id: string;
    type: 'text' | 'date' | 'name' | 'number' | 'dropdown' | 'checkbox' | 'radio' | 'formula' | 'email' | 'company' | 'title' | 'zipcode' | 'currency';
    label: string;
    icon: React.ReactNode;
    color: string;
}

export interface FormField {
    id: string;
    type: FieldType['type'];
    x: number;
    y: number;
    width: number;
    height: number;
    value: string;
    placeholder?: string;
    required?: boolean;
    readOnly?: boolean;
    options?: string[]; // For dropdown/radio
    label?: string;
    helpText?: string;
    fontSize?: number;
}

interface AddFieldsPanelProps {
    onAddField: (field: FormField) => void;
    onClose: () => void;
    selectedField?: FormField | null;
    onUpdateField?: (field: FormField) => void;
    onDeleteField?: (fieldId: string) => void;
}

const FIELD_TYPES: FieldType[] = [
    { id: 'text', type: 'text', label: 'Text', icon: <Type className="w-4 h-4" />, color: '#3b82f6' },
    { id: 'date', type: 'date', label: 'Date', icon: <Calendar className="w-4 h-4" />, color: '#22c55e' },
    { id: 'name', type: 'name', label: 'Name', icon: <User className="w-4 h-4" />, color: '#8b5cf6' },
    { id: 'number', type: 'number', label: 'Number', icon: <Hash className="w-4 h-4" />, color: '#f59e0b' },
    { id: 'email', type: 'email', label: 'Email', icon: <Mail className="w-4 h-4" />, color: '#ef4444' },
    { id: 'dropdown', type: 'dropdown', label: 'Dropdown', icon: <ChevronDown className="w-4 h-4" />, color: '#06b6d4' },
    { id: 'checkbox', type: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="w-4 h-4" />, color: '#10b981' },
    { id: 'radio', type: 'radio', label: 'Radio', icon: <Circle className="w-4 h-4" />, color: '#ec4899' },
    { id: 'company', type: 'company', label: 'Company', icon: <Building className="w-4 h-4" />, color: '#64748b' },
    { id: 'title', type: 'title', label: 'Title', icon: <Briefcase className="w-4 h-4" />, color: '#a855f7' },
    { id: 'zipcode', type: 'zipcode', label: 'ZIP', icon: <MapPin className="w-4 h-4" />, color: '#f97316' },
    { id: 'currency', type: 'currency', label: 'Currency', icon: <DollarSign className="w-4 h-4" />, color: '#22d3ee' },
    { id: 'formula', type: 'formula', label: 'Formula', icon: <Sigma className="w-4 h-4" />, color: '#14b8a6' },
];

export function AddFieldsPanel({
    onAddField,
    onClose,
    selectedField,
    onUpdateField,
    onDeleteField
}: AddFieldsPanelProps) {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter fields based on search
    const filteredFields = FIELD_TYPES.filter(f =>
        f.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Create a new field with default properties
    const handleAddField = (fieldType: FieldType) => {
        const newField: FormField = {
            id: `field-${Date.now()}`,
            type: fieldType.type,
            x: 100,
            y: 100,
            width: fieldType.type === 'checkbox' || fieldType.type === 'radio' ? 24 : 200,
            height: fieldType.type === 'checkbox' || fieldType.type === 'radio' ? 24 : 32,
            value: '',
            placeholder: getDefaultPlaceholder(fieldType.type),
            required: false,
            readOnly: false,
            fontSize: 14,
        };

        // Add default options for dropdown/radio
        if (fieldType.type === 'dropdown' || fieldType.type === 'radio') {
            newField.options = ['Option 1', 'Option 2', 'Option 3'];
        }

        onAddField(newField);
    };

    const getDefaultPlaceholder = (type: FieldType['type']): string => {
        switch (type) {
            case 'text': return 'Enter text...';
            case 'date': return 'MM/DD/YYYY';
            case 'name': return 'Full Name';
            case 'number': return '0';
            case 'email': return 'email@example.com';
            case 'company': return 'Company Name';
            case 'title': return 'Job Title';
            case 'zipcode': return '00000';
            case 'currency': return '$0.00';
            case 'formula': return '=SUM()';
            default: return '';
        }
    };

    return (
        <div className="w-[360px] bg-[#0f0f13]/98 backdrop-blur-2xl border-r border-white/5 flex flex-col h-full overflow-hidden shadow-2xl relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="p-5 border-b border-white/5 relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-orange-500/10 rounded-xl">
                            <Sparkles className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white tracking-tight">Form Fields</h3>
                            <p className="text-[10px] text-gray-500">Click to add to PDF</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all group">
                        <X className="w-4 h-4 text-white/40 group-hover:text-white" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search fields..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-orange-500/40 transition-all"
                    />
                </div>
            </div>

            {/* Compact Field Grid */}
            <div className="flex-1 overflow-y-auto p-4 relative z-10">
                <div className="grid grid-cols-4 gap-2">
                    {filteredFields.map(field => (
                        <button
                            key={field.id}
                            onClick={() => handleAddField(field)}
                            className="flex flex-col items-center gap-1.5 p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-orange-500/30 rounded-xl transition-all group active:scale-95"
                            title={field.label}
                        >
                            <div
                                className="p-2.5 rounded-lg transition-all group-hover:scale-110"
                                style={{
                                    backgroundColor: `${field.color}15`,
                                    border: `1px solid ${field.color}20`
                                }}
                            >
                                <div style={{ color: field.color }}>
                                    {field.icon}
                                </div>
                            </div>
                            <span className="text-[9px] text-gray-500 group-hover:text-white font-semibold transition-colors text-center leading-tight">
                                {field.label}
                            </span>
                        </button>
                    ))}
                </div>

                {filteredFields.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-xs text-gray-500">No fields match "{searchTerm}"</p>
                    </div>
                )}
            </div>

            {/* Properties Panel (when field selected) */}
            {selectedField && (
                <div className="border-t border-white/5 p-5 bg-[#0a0a0e]/95 backdrop-blur-xl relative z-20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Properties</h4>
                        </div>
                        <button
                            onClick={() => onDeleteField?.(selectedField.id)}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/30 hover:text-red-400 transition-all"
                            title="Delete field"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Label */}
                        <div>
                            <label className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Label</label>
                            <input
                                type="text"
                                value={selectedField.label || ''}
                                onChange={(e) => onUpdateField?.({ ...selectedField, label: e.target.value })}
                                className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500/40 transition-all"
                                placeholder="Field Label"
                            />
                        </div>

                        {/* Placeholder */}
                        <div>
                            <label className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Placeholder</label>
                            <input
                                type="text"
                                value={selectedField.placeholder || ''}
                                onChange={(e) => onUpdateField?.({ ...selectedField, placeholder: e.target.value })}
                                className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500/40 transition-all"
                                placeholder="..."
                            />
                        </div>

                        {/* Toggles */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => onUpdateField?.({ ...selectedField, required: !selectedField.required })}
                                className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-bold transition-all border ${selectedField.required ? 'bg-orange-500/10 border-orange-500/40 text-orange-400' : 'bg-white/[0.02] border-white/5 text-gray-500'}`}
                            >
                                Required
                            </button>
                            <button
                                onClick={() => onUpdateField?.({ ...selectedField, readOnly: !selectedField.readOnly })}
                                className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-bold transition-all border ${selectedField.readOnly ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' : 'bg-white/[0.02] border-white/5 text-gray-500'}`}
                            >
                                Read-Only
                            </button>
                        </div>

                        {/* Dropdown Options */}
                        {(selectedField.type === 'dropdown' || selectedField.type === 'radio') && (
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Options</label>
                                <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                                    {(selectedField.options || []).map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 group/opt">
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => {
                                                    const newOptions = [...(selectedField.options || [])];
                                                    newOptions[idx] = e.target.value;
                                                    onUpdateField?.({ ...selectedField, options: newOptions });
                                                }}
                                                className="flex-1 px-2.5 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-[10px] text-white focus:outline-none focus:border-orange-500/20 transition-all"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newOptions = (selectedField.options || []).filter((_, i) => i !== idx);
                                                    onUpdateField?.({ ...selectedField, options: newOptions });
                                                }}
                                                className="p-1 opacity-0 group-hover/opt:opacity-100 hover:bg-red-500/10 rounded text-red-400/50 hover:text-red-400 transition-all"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        const newOptions = [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`];
                                        onUpdateField?.({ ...selectedField, options: newOptions });
                                    }}
                                    className="w-full mt-2 py-2 border border-dashed border-white/10 rounded-lg text-[10px] text-gray-500 hover:text-orange-400 hover:border-orange-500/40 transition-all font-bold"
                                >
                                    + Add Option
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddFieldsPanel;
