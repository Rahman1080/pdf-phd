// Layout Component - Wraps pages with Header and Footer
import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
    children: ReactNode;
    hideHeader?: boolean;
    hideFooter?: boolean;
    fullWidth?: boolean;
    className?: string;
}

export function Layout({
    children,
    hideHeader = false,
    hideFooter = false,
    fullWidth = false,
    className = ''
}: LayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-surface-950">
            {!hideHeader && <Header />}

            <main className={`flex-1 ${!hideHeader ? 'pt-16' : ''} ${className}`}>
                {fullWidth ? (
                    children
                ) : (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                        {children}
                    </div>
                )}
            </main>

            {!hideFooter && <Footer />}
        </div>
    );
}

// Minimal Layout for the Workplace/Editor (no footer, minimal header)
export function WorkplaceLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-surface-950">
            {children}
        </div>
    );
}

export default Layout;
