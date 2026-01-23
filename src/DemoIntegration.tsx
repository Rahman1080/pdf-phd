// Demo Integration Example - Shows how to use the new features
import { useState } from 'react';
import {
    OCRProcessor,
    SignatureCreator,
    DirectTextEditor,
    ImageReplacement
} from './components';
import type { CreatorMode } from './components/SignatureCreator';

interface DemoAppProps {
    // Your existing props
}

export function DemoApp({ }: DemoAppProps) {
    // State for features
    const [showOCR, setShowOCR] = useState(false);
    const [showSignature, setShowSignature] = useState(false);
    const [editingText, setEditingText] = useState<any>(null);
    const [editingImage, setEditingImage] = useState<any>(null);

    // Example: OCR Integration
    const handleOCRClick = () => {
        setShowOCR(true);
    };

    const handleOCRComplete = (results: { pageIndex: number; text: string }[]) => {
        console.log('OCR Results:', results);
        // TODO: Add extracted text as searchable layer to PDF
        results.forEach((result) => {
            console.log(`Page ${result.pageIndex + 1}:`, result.text);
        });
        setShowOCR(false);
    };

    // Example: Signature Integration
    const handleSignatureClick = () => {
        setShowSignature(true);
    };

    const handleSignatureSave = (signatureData: string, _initialsData: string | null, signatureType: CreatorMode) => {
        console.log('Signature saved:', signatureType);
        // TODO: Add signature to current page
        const signatureElement = {
            id: `sig-${Date.now()}`,
            type: 'signature',
            signatureType,
            data: signatureData,
            x: 100,
            y: 100,
            width: 200,
            height: 80,
            rotation: 0,
            opacity: 1,
            zIndex: 100,
            locked: false,
            signedAt: new Date(),
        };
        console.log('Created signature element:', signatureElement);
        setShowSignature(false);
    };

    // Example: Text Editing Integration
    const handleTextDoubleClick = (textElement: any) => {
        setEditingText({
            element: textElement,
            pageIndex: 0, // Current page
        });
    };

    const handleTextSave = (updated: any) => {
        console.log('Text updated:', updated);
        // TODO: Update text element in your state
        setEditingText(null);
    };

    const handleTextDelete = () => {
        console.log('Text deleted');
        // TODO: Remove text element from your state
        setEditingText(null);
    };

    // Example: Image Editing Integration
    const handleImageDoubleClick = (imageElement: any) => {
        setEditingImage({
            element: imageElement,
            pageIndex: 0, // Current page
        });
    };

    const handleImageReplace = (newImageData: string, transformations?: any) => {
        console.log('Image replaced:', { newImageData: newImageData.substring(0, 50) + '...', transformations });
        // TODO: Update image element in your state
        setEditingImage(null);
    };

    const handleImageDelete = () => {
        console.log('Image deleted');
        // TODO: Remove image element from your state
        setEditingImage(null);
    };

    return (
        <div className="demo-app">
            {/* Example Toolbar */}
            <div className="toolbar">
                <button onClick={handleOCRClick} title="OCR - Extract Text">
                    🔍 OCR
                </button>
                <button onClick={handleSignatureClick} title="Add Signature">
                    ✍️ Sign
                </button>
            </div>

            {/* Example Canvas with editable elements */}
            <div className="canvas">
                {/* Example Text Element */}
                <div
                    onDoubleClick={() => handleTextDoubleClick({
                        id: 'text-1',
                        type: 'text',
                        content: 'Double-click to edit',
                        fontSize: 16,
                        fontFamily: 'Arial',
                        color: '#000000',
                        textAlign: 'left',
                        fontWeight: 400,
                        fontStyle: 'normal',
                        x: 50,
                        y: 50,
                        width: 200,
                        height: 30,
                    })}
                    style={{
                        position: 'absolute',
                        left: 50,
                        top: 50,
                        cursor: 'pointer',
                        padding: '4px',
                        border: '2px dashed transparent',
                    }}
                    className="hover:border-blue-500"
                >
                    Double-click to edit
                </div>

                {/* Example Image Element */}
                <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23e5e7eb' width='200' height='150'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%239ca3af' font-family='Arial' font-size='14'%3EDouble-click to replace%3C/text%3E%3C/svg%3E"
                    alt="Example"
                    onDoubleClick={() => handleImageDoubleClick({
                        id: 'img-1',
                        type: 'image',
                        src: 'example.jpg',
                        x: 50,
                        y: 150,
                        width: 200,
                        height: 150,
                        rotation: 0,
                    })}
                    style={{
                        position: 'absolute',
                        left: 50,
                        top: 150,
                        width: 200,
                        height: 150,
                        cursor: 'pointer',
                        border: '2px dashed transparent',
                    }}
                    className="hover:border-blue-500"
                />
            </div>

            {/* Modals */}
            {showOCR && (
                <OCRProcessor
                    pageImages={[
                        {
                            pageIndex: 0,
                            imageData: 'data:image/png;base64,...' // Your page image
                        }
                    ]}
                    onComplete={handleOCRComplete}
                    onClose={() => setShowOCR(false)}
                />
            )}

            {showSignature && (
                <SignatureCreator
                    onSave={handleSignatureSave}
                    onClose={() => setShowSignature(false)}
                />
            )}

            {editingText && (
                <DirectTextEditor
                    text={editingText.element.content}
                    fontSize={editingText.element.fontSize}
                    fontFamily={editingText.element.fontFamily}
                    color={editingText.element.color}
                    textAlign={editingText.element.textAlign}
                    bold={editingText.element.fontWeight > 400}
                    italic={editingText.element.fontStyle === 'italic'}
                    x={editingText.element.x}
                    y={editingText.element.y}
                    width={editingText.element.width || 200}
                    height={editingText.element.height || 30}
                    onSave={handleTextSave}
                    onCancel={() => setEditingText(null)}
                    onDelete={handleTextDelete}
                />
            )}

            {editingImage && (
                <ImageReplacement
                    currentImage={editingImage.element.src}
                    x={editingImage.element.x}
                    y={editingImage.element.y}
                    width={editingImage.element.width}
                    height={editingImage.element.height}
                    rotation={editingImage.element.rotation}
                    onReplace={handleImageReplace}
                    onCancel={() => setEditingImage(null)}
                    onDelete={handleImageDelete}
                />
            )}
        </div>
    );
}

export default DemoApp;
