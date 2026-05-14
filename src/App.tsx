import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ContentProvider } from "@/context/ContentContext.tsx";
import Layout from "@/components/Layout";
import MetaPixelPageView from "@/components/MetaPixelPageView";
import FunnelTracker from "@/components/FunnelTracker";
import TrackingBootstrap from "@/components/TrackingBootstrap";
import SmoothScroll from "@/components/SmoothScroll";

const Home = lazy(() => import("@/pages/Home"));
const SolutionsIndex = lazy(() => import("@/pages/SolutionsIndex"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Signup = lazy(() => import("@/pages/Signup"));
const ServicePage = lazy(() => import("@/pages/ServicePage"));
const BookingPage = lazy(() => import("@/pages/BookingPage"));
const LeadMagnetPage = lazy(() => import("@/pages/LeadMagnetPage"));
const ThankYouPage = lazy(() => import("@/pages/ThankYouPage"));
const WhatsAppLanding = lazy(() => import("@/pages/WhatsAppLanding"));
const FunnelAnalytics = lazy(() => import("@/pages/FunnelAnalytics"));
const Admin = lazy(() => import("@/pages/Admin"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const BlogIndex = lazy(() => import("@/pages/BlogIndex"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const CampaignLanding = lazy(() => import("@/pages/CampaignLanding"));

export default function App() {
  return (
    <ContentProvider>
      <Router>
        <SmoothScroll>
        <TrackingBootstrap />
        <MetaPixelPageView />
        <FunnelTracker />
        <Routes>
          <Route path="/admin" element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-luxury-gold" /></div>}>
              <Admin />
            </Suspense>
          } />
          <Route path="/lp/:slug" element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-luxury-gold" /></div>}>
              <CampaignLanding />
            </Suspense>
          } />
          <Route path="*" element={
            <Layout>
              <Routes>
                <Route path="/" element={
                  <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-luxury-gold" /></div>}>
                    <Home />
                  </Suspense>
                } />
                <Route path="/pricing" element={
                  <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" /></div>}>
                    <Pricing />
                  </Suspense>
                } />
                <Route path="/solutions" element={
                  <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" /></div>}>
                    <SolutionsIndex />
                  </Suspense>
                } />
                <Route path="/about" element={
                  <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" /></div>}>
                    <About />
                  </Suspense>
                } />
                <Route path="/contact" element={
                  <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" /></div>}>
                    <Contact />
                  </Suspense>
                } />
                <Route path="/signup" element={
                  <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" /></div>}>
                    <Signup />
                  </Suspense>
                } />
                <Route path="/solutions/:slug" element={
                  <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" /></div>}>
                    <ServicePage />
                  </Suspense>
                } />
                <Route path="/booking" element={
                  <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" /></div>}>
                    <BookingPage />
                  </Suspense>
                } />
                <Route path="/free-audit" element={
                  <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" /></div>}>
                    <LeadMagnetPage />
                  </Suspense>
                } />
                <Route path="/thank-you" element={
                  <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" /></div>}>
                    <ThankYouPage />
                  </Suspense>
                } />
                <Route path="/whatsapp" element={
                  <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" /></div>}>
                    <WhatsAppLanding />
                  </Suspense>
                } />
                <Route path="/blog" element={
                  <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" /></div>}>
                    <BlogIndex />
                  </Suspense>
                } />
                <Route path="/blog/:slug" element={
                  <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" /></div>}>
                    <BlogPost />
                  </Suspense>
                } />
                <Route path="/funnel-analytics" element={
                  <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" /></div>}>
                    <FunnelAnalytics />
                  </Suspense>
                } />
                <Route path="/dashboard" element={
                  <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center bg-luxury-champagne"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" /></div>}>
                    <Dashboard />
                  </Suspense>
                } />
              </Routes>
            </Layout>
          } />
        </Routes>
        </SmoothScroll>
      </Router>
    </ContentProvider>
  );
}
