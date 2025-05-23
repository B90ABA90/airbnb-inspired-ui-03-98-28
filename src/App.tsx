
import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { SidebarProvider } from './components/ui/sidebar';
import { AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import AppInitializer from './components/auth/AppInitializer';
import { OfflineIndicator } from './components/messages/OfflineIndicator';

import './index.css';

import Index from './pages/Index';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFound from './pages/NotFound';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import Support from './pages/Support';
import FAQ from './pages/FAQ';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';

import Profile from './pages/user/Profile';
import Favorites from './pages/user/Favorites';
import UserReservations from './pages/user/Reservations';
import Messages from './pages/user/Messages';
import Notifications from './pages/user/Notifications';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListings from './pages/admin/AdminListings';
import AdminJobs from './pages/admin/AdminJobs';
import AdminReviews from './pages/admin/AdminReviews';
import AdminReservations from './pages/admin/AdminReservations';
import AdminPayments from './pages/admin/AdminPayments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSupport from './pages/admin/AdminSupport';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMessages from './pages/admin/AdminMessages';
import SupabaseTest from './pages/admin/SupabaseTest';
import MySQLTest from './pages/admin/MySQLTest';

import { CompareListings } from './components/CompareListings';
import { useEffect } from 'react';
import { useSiteSettings } from './hooks/useSiteSettings';
import NotAuthenticated from './components/messages/NotAuthenticated';

function App() {
  const { settings, applySettingsToDOM } = useSiteSettings();
  
  useEffect(() => {
    applySettingsToDOM();
  }, [applySettingsToDOM, settings]);

  return (
    <SidebarProvider>
      <AppInitializer />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/logement/:id" element={<ListingDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/emplois" element={<Jobs />} />
          <Route path="/emploi/:id" element={<JobDetail />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Support />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          } />
          <Route path="/reservations" element={
            <ProtectedRoute>
              <UserReservations />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/logements" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminListings />
            </ProtectedRoute>
          } />
          <Route path="/admin/emplois" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminJobs />
            </ProtectedRoute>
          } />
          <Route path="/admin/avis" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminReviews />
            </ProtectedRoute>
          } />
          <Route path="/admin/reservations" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminReservations />
            </ProtectedRoute>
          } />
          <Route path="/admin/paiements" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPayments />
            </ProtectedRoute>
          } />
          <Route path="/admin/utilisateurs" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/support" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminSupport />
            </ProtectedRoute>
          } />
          <Route path="/admin/parametres" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/messages" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminMessages />
            </ProtectedRoute>
          } />
          <Route path="/admin/supabase-test" element={
            <ProtectedRoute requireAdmin={true}>
              <SupabaseTest />
            </ProtectedRoute>
          } />
          <Route path="/admin/mysql-test" element={
            <ProtectedRoute requireAdmin={true}>
              <MySQLTest />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      
      <CompareListings />
      <OfflineIndicator />
      
      <SonnerToaster position="top-right" closeButton theme="light" 
        toastOptions={{
          classNames: {
            toast: "notification-pop",
            title: "font-semibold",
            description: "text-sm"
          }
        }}
      />
      <Toaster />
    </SidebarProvider>
  );
}

export default App;
