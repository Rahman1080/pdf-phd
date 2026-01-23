import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'

// Components

// Pages
import {
  Landing,
  NotFound,
  ToolsIndex,
  ToolPage,
  BlogIndex,
  BlogPostPage,
  HelpCenter,
  HelpArticle,
  Contact,
  Privacy,
  Terms
} from './pages'

// Workplace (the main editor - previously App.tsx)
import App from './App'

// Remote Signing Page
import RemoteSignPage from './pages/RemoteSignPage'

// Mobile Sign Component (for QR code / link signing)
import MobileSign from './components/MobileSign'

// Wrapper for MobileSign to work as a route
function MobileSignWrapper() {
  return <MobileSign />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Workplace / Editor */}
          <Route path="/workplace" element={<App />} />

          {/* Tools */}
          <Route path="/tools" element={<ToolsIndex />} />
          <Route path="/tools/:slug" element={<ToolPage />} />
          <Route path="/tools/:slug/:subslug" element={<ToolPage />} />

          {/* Remote Signing - Multiple URL patterns for flexibility */}
          <Route path="/sign/:sessionId" element={<RemoteSignPage />} />
          <Route path="/remote-sign" element={<MobileSignWrapper />} />
          <Route path="/mobile-sign" element={<MobileSignWrapper />} />

          {/* Blog */}
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />

          {/* Help & Documentation */}
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/help/:slug" element={<HelpArticle />} />
          <Route path="/docs" element={<HelpCenter />} />
          <Route path="/tutorials" element={<HelpCenter />} />

          {/* Contact */}
          <Route path="/contact" element={<Contact />} />

          {/* Legal */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Other routes */}
          <Route path="/community" element={<NotFound />} />
          <Route path="/sitemap" element={<NotFound />} />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
