import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AccessibilityProvider } from '@/context/AccessibilityContext'
import SkipNavigation from '@/components/SkipNavigation'
import ScreenReaderAnnouncements from '@/components/ScreenReaderAnnouncements'
import Home from '@/pages/Home'
import Welcome from '@/pages/Welcome'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import StandardLogin from '@/pages/StandardLogin'
import VoiceAssistedLogin from '@/pages/VoiceAssistedLogin'
import VoiceAssistanceDialog from '@/pages/VoiceAssistanceDialog'
import CreateAccount from '@/pages/CreateAccount'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import ProductDetails from '@/pages/ProductDetails'
import NotFound from '@/pages/NotFound'
import AccessibilitySettings from '@/pages/AccessibilitySettings'
import AccessibilityDashboard from '@/pages/AccessibilityDashboard'

export default function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <SkipNavigation />
        <ScreenReaderAnnouncements />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />

            <Route
              path="/login"
              element={<VoiceAssistanceDialog intent="login" />}
            />
            <Route path="/login/standard" element={<StandardLogin />} />
            <Route path="/login/voice" element={<VoiceAssistedLogin />} />

            <Route
              path="/register"
              element={<VoiceAssistanceDialog intent="register" />}
            />
            <Route path="/register/standard" element={<Register />} />
            <Route path="/register/voice" element={<CreateAccount />} />

            <Route element={<AuthLayout />}>
              <Route path="/auth/standard-login" element={<Login />} />
              <Route path="/auth/standard-register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            <Route element={<MainLayout />}>
              <Route path="/shop" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={<div className="p-6">Dashboard Home</div>}
              />
              <Route
                path="products"
                element={<div className="p-6">Products Management</div>}
              />
              <Route
                path="orders"
                element={<div className="p-6">Orders Management</div>}
              />
              <Route
                path="customers"
                element={<div className="p-6">Customers Management</div>}
              />
              <Route
                path="settings"
                element={<div className="p-6">Settings</div>}
              />
            </Route>

            <Route path="/accessibility" element={<AccessibilitySettings />} />
            <Route
              path="/accessibility/dashboard"
              element={<AccessibilityDashboard />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AccessibilityProvider>
    </ErrorBoundary>
  )
}
