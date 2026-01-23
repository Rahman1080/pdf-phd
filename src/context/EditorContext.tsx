// PDF Studio - Editor Context (Global State Management)

import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type {
    PDFDocument,
    PDFPage,
    PageElement,
    Tool,
    HistoryState,
    EditorState
} from '../types';
import { generateId, deepClone } from '../utils/helpers';

// Initial state
const initialState: EditorState = {
    document: null,
    currentPage: 0,
    zoom: 1,
    tool: 'select',
    selectedElement: null,
    clipboard: null,
    history: [],
    historyIndex: -1,
    isLoading: false,
    isSaving: false,
    showGrid: false,
    snapToGrid: true,
    gridSize: 20,
};

// Action types
type EditorAction =
    | { type: 'SET_DOCUMENT'; payload: PDFDocument }
    | { type: 'CLEAR_DOCUMENT' }
    | { type: 'SET_CURRENT_PAGE'; payload: number }
    | { type: 'SET_ZOOM'; payload: number }
    | { type: 'SET_TOOL'; payload: Tool }
    | { type: 'SELECT_ELEMENT'; payload: PageElement | null }
    | { type: 'ADD_ELEMENT'; payload: { pageIndex: number; element: PageElement } }
    | { type: 'UPDATE_ELEMENT'; payload: { pageIndex: number; element: PageElement } }
    | { type: 'DELETE_ELEMENT'; payload: { pageIndex: number; elementId: string } }
    | { type: 'COPY_ELEMENT' }
    | { type: 'PASTE_ELEMENT'; payload: number }
    | { type: 'MOVE_ELEMENT_LAYER'; payload: { pageIndex: number; elementId: string; direction: 'up' | 'down' | 'top' | 'bottom' } }
    | { type: 'UPDATE_PAGE'; payload: { pageIndex: number; updates: Partial<PDFPage> } }
    | { type: 'REORDER_PAGES'; payload: number[] }
    | { type: 'DELETE_PAGES'; payload: number[] }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_SAVING'; payload: boolean }
    | { type: 'PUSH_HISTORY'; payload: string }
    | { type: 'UNDO' }
    | { type: 'REDO' }
    | { type: 'TOGGLE_GRID' }
    | { type: 'TOGGLE_SNAP' }
    | { type: 'SET_GRID_SIZE'; payload: number }
    | { type: 'SET_MODIFIED'; payload: boolean };

// Reducer
function editorReducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
        case 'SET_DOCUMENT':
            return {
                ...state,
                document: action.payload,
                currentPage: 0,
                history: [],
                historyIndex: -1,
                selectedElement: null,
            };

        case 'CLEAR_DOCUMENT':
            return {
                ...initialState,
            };

        case 'SET_CURRENT_PAGE':
            return {
                ...state,
                currentPage: action.payload,
                selectedElement: null,
            };

        case 'SET_ZOOM':
            return {
                ...state,
                zoom: Math.max(0.25, Math.min(4, action.payload)),
            };

        case 'SET_TOOL':
            return {
                ...state,
                tool: action.payload,
                selectedElement: action.payload !== 'select' ? null : state.selectedElement,
            };

        case 'SELECT_ELEMENT':
            return {
                ...state,
                selectedElement: action.payload,
                tool: action.payload ? 'select' : state.tool,
            };

        case 'ADD_ELEMENT': {
            if (!state.document) return state;
            const newPages = [...state.document.pages];
            const page = { ...newPages[action.payload.pageIndex] };
            page.elements = [...page.elements, action.payload.element];
            newPages[action.payload.pageIndex] = page;

            return {
                ...state,
                document: {
                    ...state.document,
                    pages: newPages,
                    modified: true,
                    updatedAt: new Date(),
                },
                selectedElement: action.payload.element,
            };
        }

        case 'UPDATE_ELEMENT': {
            if (!state.document) return state;
            const newPages = [...state.document.pages];
            const page = { ...newPages[action.payload.pageIndex] };
            page.elements = page.elements.map(el =>
                el.id === action.payload.element.id ? action.payload.element : el
            );
            newPages[action.payload.pageIndex] = page;

            return {
                ...state,
                document: {
                    ...state.document,
                    pages: newPages,
                    modified: true,
                    updatedAt: new Date(),
                },
                selectedElement: action.payload.element,
            };
        }

        case 'DELETE_ELEMENT': {
            if (!state.document) return state;
            const newPages = [...state.document.pages];
            const page = { ...newPages[action.payload.pageIndex] };
            page.elements = page.elements.filter(el => el.id !== action.payload.elementId);
            newPages[action.payload.pageIndex] = page;

            return {
                ...state,
                document: {
                    ...state.document,
                    pages: newPages,
                    modified: true,
                    updatedAt: new Date(),
                },
                selectedElement: state.selectedElement?.id === action.payload.elementId
                    ? null
                    : state.selectedElement,
            };
        }

        case 'COPY_ELEMENT':
            return {
                ...state,
                clipboard: state.selectedElement ? deepClone(state.selectedElement) : null,
            };

        case 'PASTE_ELEMENT': {
            if (!state.document || !state.clipboard) return state;
            const pastedElement = {
                ...deepClone(state.clipboard),
                id: generateId(),
                x: state.clipboard.x + 20,
                y: state.clipboard.y + 20,
            };

            const newPages = [...state.document.pages];
            const page = { ...newPages[action.payload] };
            page.elements = [...page.elements, pastedElement];
            newPages[action.payload] = page;

            return {
                ...state,
                document: {
                    ...state.document,
                    pages: newPages,
                    modified: true,
                    updatedAt: new Date(),
                },
                selectedElement: pastedElement,
            };
        }

        case 'MOVE_ELEMENT_LAYER': {
            if (!state.document) return state;
            const newPages = [...state.document.pages];
            const page = { ...newPages[action.payload.pageIndex] };
            const elements = [...page.elements];
            const index = elements.findIndex(el => el.id === action.payload.elementId);

            if (index === -1) return state;

            const [element] = elements.splice(index, 1);

            switch (action.payload.direction) {
                case 'up':
                    elements.splice(Math.min(index + 1, elements.length), 0, element);
                    break;
                case 'down':
                    elements.splice(Math.max(index - 1, 0), 0, element);
                    break;
                case 'top':
                    elements.push(element);
                    break;
                case 'bottom':
                    elements.unshift(element);
                    break;
            }

            // Update z-indices
            elements.forEach((el, i) => {
                el.zIndex = i;
            });

            page.elements = elements;
            newPages[action.payload.pageIndex] = page;

            return {
                ...state,
                document: {
                    ...state.document,
                    pages: newPages,
                    modified: true,
                    updatedAt: new Date(),
                },
            };
        }

        case 'UPDATE_PAGE': {
            if (!state.document) return state;
            const newPages = [...state.document.pages];
            newPages[action.payload.pageIndex] = {
                ...newPages[action.payload.pageIndex],
                ...action.payload.updates,
            };

            return {
                ...state,
                document: {
                    ...state.document,
                    pages: newPages,
                    modified: true,
                    updatedAt: new Date(),
                },
            };
        }

        case 'REORDER_PAGES': {
            if (!state.document) return state;
            const reorderedPages = action.payload.map((oldIndex, newIndex) => ({
                ...state.document!.pages[oldIndex],
                index: newIndex,
            }));

            return {
                ...state,
                document: {
                    ...state.document,
                    pages: reorderedPages,
                    modified: true,
                    updatedAt: new Date(),
                },
            };
        }

        case 'DELETE_PAGES': {
            if (!state.document) return state;
            const remainingPages = state.document.pages
                .filter((_, index) => !action.payload.includes(index))
                .map((page, index) => ({ ...page, index }));

            return {
                ...state,
                document: {
                    ...state.document,
                    pages: remainingPages,
                    totalPages: remainingPages.length,
                    modified: true,
                    updatedAt: new Date(),
                },
                currentPage: Math.min(state.currentPage, remainingPages.length - 1),
            };
        }

        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };

        case 'SET_SAVING':
            return { ...state, isSaving: action.payload };

        case 'PUSH_HISTORY': {
            if (!state.document) return state;
            const newHistory: HistoryState = {
                id: generateId(),
                timestamp: new Date(),
                action: action.payload,
                pages: deepClone(state.document.pages),
            };

            // Remove any future history if we're not at the end
            const truncatedHistory = state.history.slice(0, state.historyIndex + 1);

            return {
                ...state,
                history: [...truncatedHistory, newHistory].slice(-50), // Keep last 50 states
                historyIndex: Math.min(truncatedHistory.length, 49),
            };
        }

        case 'UNDO': {
            if (state.historyIndex < 0 || !state.document) return state;
            const previousState = state.history[state.historyIndex];

            return {
                ...state,
                document: {
                    ...state.document,
                    pages: deepClone(previousState.pages),
                    modified: true,
                    updatedAt: new Date(),
                },
                historyIndex: state.historyIndex - 1,
                selectedElement: null,
            };
        }

        case 'REDO': {
            if (state.historyIndex >= state.history.length - 1 || !state.document) return state;
            const nextState = state.history[state.historyIndex + 1];

            return {
                ...state,
                document: {
                    ...state.document,
                    pages: deepClone(nextState.pages),
                    modified: true,
                    updatedAt: new Date(),
                },
                historyIndex: state.historyIndex + 1,
                selectedElement: null,
            };
        }

        case 'TOGGLE_GRID':
            return { ...state, showGrid: !state.showGrid };

        case 'TOGGLE_SNAP':
            return { ...state, snapToGrid: !state.snapToGrid };

        case 'SET_GRID_SIZE':
            return { ...state, gridSize: action.payload };

        case 'SET_MODIFIED':
            if (!state.document) return state;
            return {
                ...state,
                document: {
                    ...state.document,
                    modified: action.payload,
                },
            };

        default:
            return state;
    }
}

// Context type
interface EditorContextType {
    state: EditorState;
    dispatch: React.Dispatch<EditorAction>;
    // Convenience methods
    loadDocument: (doc: PDFDocument) => void;
    setCurrentPage: (page: number) => void;
    setZoom: (zoom: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    setTool: (tool: Tool) => void;
    selectElement: (element: PageElement | null) => void;
    addElement: (pageIndex: number, element: PageElement) => void;
    updateElement: (pageIndex: number, element: PageElement) => void;
    deleteElement: (pageIndex: number, elementId: string) => void;
    copyElement: () => void;
    pasteElement: (pageIndex: number) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

// Provider component
export function EditorProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(editorReducer, initialState);

    const loadDocument = useCallback((doc: PDFDocument) => {
        dispatch({ type: 'SET_DOCUMENT', payload: doc });
    }, []);

    const setCurrentPage = useCallback((page: number) => {
        dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
    }, []);

    const setZoom = useCallback((zoom: number) => {
        dispatch({ type: 'SET_ZOOM', payload: zoom });
    }, []);

    const zoomIn = useCallback(() => {
        dispatch({ type: 'SET_ZOOM', payload: state.zoom * 1.25 });
    }, [state.zoom]);

    const zoomOut = useCallback(() => {
        dispatch({ type: 'SET_ZOOM', payload: state.zoom / 1.25 });
    }, [state.zoom]);

    const setTool = useCallback((tool: Tool) => {
        dispatch({ type: 'SET_TOOL', payload: tool });
    }, []);

    const selectElement = useCallback((element: PageElement | null) => {
        dispatch({ type: 'SELECT_ELEMENT', payload: element });
    }, []);

    const addElement = useCallback((pageIndex: number, element: PageElement) => {
        dispatch({ type: 'PUSH_HISTORY', payload: `Add ${element.type}` });
        dispatch({ type: 'ADD_ELEMENT', payload: { pageIndex, element } });
    }, []);

    const updateElement = useCallback((pageIndex: number, element: PageElement) => {
        dispatch({ type: 'UPDATE_ELEMENT', payload: { pageIndex, element } });
    }, []);

    const deleteElement = useCallback((pageIndex: number, elementId: string) => {
        dispatch({ type: 'PUSH_HISTORY', payload: 'Delete element' });
        dispatch({ type: 'DELETE_ELEMENT', payload: { pageIndex, elementId } });
    }, []);

    const copyElement = useCallback(() => {
        dispatch({ type: 'COPY_ELEMENT' });
    }, []);

    const pasteElement = useCallback((pageIndex: number) => {
        if (state.clipboard) {
            dispatch({ type: 'PUSH_HISTORY', payload: 'Paste element' });
            dispatch({ type: 'PASTE_ELEMENT', payload: pageIndex });
        }
    }, [state.clipboard]);

    const undo = useCallback(() => {
        dispatch({ type: 'UNDO' });
    }, []);

    const redo = useCallback(() => {
        dispatch({ type: 'REDO' });
    }, []);

    const value: EditorContextType = {
        state,
        dispatch,
        loadDocument,
        setCurrentPage,
        setZoom,
        zoomIn,
        zoomOut,
        setTool,
        selectElement,
        addElement,
        updateElement,
        deleteElement,
        copyElement,
        pasteElement,
        undo,
        redo,
        canUndo: state.historyIndex >= 0,
        canRedo: state.historyIndex < state.history.length - 1,
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
}

// Hook
export function useEditor() {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
}

export default EditorContext;
