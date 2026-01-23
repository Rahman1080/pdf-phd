// 404 Not Found Page
import { Link } from 'react-router-dom';
import { Home, Search, FileText } from 'lucide-react';
import { Layout, SEOHead } from '../components/layout';

export function NotFound() {
    return (
        <>
            <SEOHead
                title="Page Not Found"
                description="The page you're looking for doesn't exist. Browse our PDF tools or return to the homepage."
                noIndex={true}
            />

            <Layout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-20">
                    {/* 404 Graphic */}
                    <div className="relative mb-8">
                        <div className="text-[150px] md:text-[200px] font-black text-surface-900 select-none">
                            404
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <FileText className="w-20 h-20 text-primary-500 opacity-50" />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Page Not Found
                    </h1>

                    <p className="text-lg text-surface-400 max-w-md mb-10">
                        Oops! The page you're looking for doesn't exist or has been moved.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors"
                        >
                            <Home className="w-5 h-5" />
                            Go to Homepage
                        </Link>
                        <Link
                            to="/tools"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-800 text-white font-medium rounded-xl hover:bg-surface-700 transition-colors"
                        >
                            <Search className="w-5 h-5" />
                            Browse Tools
                        </Link>
                    </div>

                    {/* Quick Links */}
                    <div className="mt-16 pt-8 border-t border-white/5">
                        <p className="text-sm text-surface-500 mb-4">Popular tools:</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {['Merge', 'Split', 'Compress', 'Sign', 'Convert'].map((tool) => (
                                <Link
                                    key={tool}
                                    to={`/tools/${tool.toLowerCase()}`}
                                    className="px-4 py-2 bg-surface-900 text-surface-300 text-sm rounded-lg hover:bg-surface-800 hover:text-white transition-colors"
                                >
                                    {tool} PDF
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}

export default NotFound;
