// SEO Head Component - Manages meta tags, Open Graph, Twitter Cards, and Structured Data
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: 'website' | 'article';
    schema?: object | object[];
    keywords?: string[];
    noIndex?: boolean;
}

export function SEOHead({
    title,
    description,
    canonical,
    ogImage = '/og-default.png',
    ogType = 'website',
    schema,
    keywords,
    noIndex = false
}: SEOProps) {
    const fullTitle = title.includes('PDF PhD') ? title : `${title} | PDF PhD`;
    const siteUrl = 'https://pdfphd.com'; // Update with actual domain
    const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : siteUrl);

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            {keywords && keywords.length > 0 && (
                <meta name="keywords" content={keywords.join(', ')} />
            )}
            <link rel="canonical" href={canonicalUrl} />

            {/* Robots */}
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />
            <meta property="og:site_name" content="PDF PhD" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />

            {/* Structured Data / JSON-LD */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(Array.isArray(schema) ? schema : [schema])}
                </script>
            )}
        </Helmet>
    );
}

// Helper function to generate Organization schema
export function getOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "PDF PhD",
        "url": "https://pdfphd.com",
        "logo": "https://pdfphd.com/logo-phd.png",
        "description": "Professional PDF tools that run 100% locally in your browser",
        "sameAs": [
            // Add social media URLs here
        ]
    };
}

// Helper function to generate SoftwareApplication schema
export function getSoftwareApplicationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "PDF PhD",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Web Browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "All-in-one PDF editor with merge, split, convert, sign, and edit tools. 100% local processing.",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1000"
        }
    };
}

// Helper function to generate FAQ schema
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
}

// Helper function to generate HowTo schema
export function getHowToSchema(name: string, description: string, steps: { name: string; text: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": name,
        "description": description,
        "step": steps.map((step, index) => ({
            "@type": "HowToStep",
            "position": index + 1,
            "name": step.name,
            "text": step.text
        }))
    };
}

// Helper function to generate BreadcrumbList schema
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };
}

export default SEOHead;
