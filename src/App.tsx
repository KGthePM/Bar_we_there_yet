import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { Spinner } from '@/components/ui/Spinner';

// Lazy load pages
const HomePage = lazy(() => import('@/pages/public/HomePage').then(m => ({ default: m.HomePage })));
const ExplorePage = lazy(() => import('@/pages/public/ExplorePage').then(m => ({ default: m.ExplorePage })));
const VenuePage = lazy(() => import('@/pages/public/VenuePage').then(m => ({ default: m.VenuePage })));
const CheckinPage = lazy(() => import('@/pages/public/CheckinPage').then(m => ({ default: m.CheckinPage })));
const LoginPage = lazy(() => import('@/pages/public/LoginPage').then(m => ({ default: m.LoginPage })));
const SignUpPage = lazy(() => import('@/pages/public/SignUpPage').then(m => ({ default: m.SignUpPage })));

const ProfilePage = lazy(() => import('@/pages/user/ProfilePage').then(m => ({ default: m.ProfilePage })));
const HistoryPage = lazy(() => import('@/pages/user/HistoryPage').then(m => ({ default: m.HistoryPage })));
const RewardsPage = lazy(() => import('@/pages/user/RewardsPage').then(m => ({ default: m.RewardsPage })));

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const VenueSetupPage = lazy(() => import('@/pages/admin/VenueSetupPage').then(m => ({ default: m.VenueSetupPage })));
const QRCodePage = lazy(() => import('@/pages/admin/QRCodePage').then(m => ({ default: m.QRCodePage })));
const AdminRewardsPage = lazy(() => import('@/pages/admin/AdminRewardsPage').then(m => ({ default: m.AdminRewardsPage })));

function PageLoader() {
  return <Spinner size="lg" className="min-h-[60vh]" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes with header/footer */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/venue/:slug" element={<VenuePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />

                {/* Protected user routes */}
                <Route path="/me" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/me/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                <Route path="/me/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
              </Route>

              {/* Mobile-optimized check-in route (no header/footer) */}
              <Route element={<MobileLayout />}>
                <Route path="/checkin/:slug" element={<CheckinPage />} />
              </Route>

              {/* Admin routes */}
              <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/venue/new" element={<VenueSetupPage />} />
                <Route path="/admin/venue/:id/edit" element={<VenueSetupPage />} />
                <Route path="/admin/venue/:id/qr" element={<QRCodePage />} />
                <Route path="/admin/venue/:id/rewards" element={<AdminRewardsPage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <p className="text-6xl">🍺</p>
                    <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
                    <a href="/" className="text-brand-400 hover:text-brand-300 text-sm">Go home</a>
                  </div>
                </div>
              } />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
