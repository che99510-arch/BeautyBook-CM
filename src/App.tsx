
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Register from "./pages/beautybook/Register";
import SalonRegister from "./pages/beautybook/SalonRegister";
import Login from "./pages/beautybook/Login";
import SalonDashboard from "./pages/beautybook/SalonDashboard";
import Services from "./pages/beautybook/Services";
import Bookings from "./pages/beautybook/Bookings";
import Analytics from "./pages/beautybook/Analytics";
import SalonDetail from "./pages/beautybook/SalonDetail";
import MyBookings from "./pages/beautybook/MyBookings";
import Profile from "./pages/beautybook/Profile";
import ForgotPassword from "./pages/beautybook/ForgotPassword";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              {/* /salon-login redirects to the unified login with salon tab pre-selected */}
              <Route path="/salon-login" element={<Navigate to="/login?tab=salon" replace />} />
              <Route path="/salon-register" element={<SalonRegister />} />
              <Route path="/salon-dashboard" element={<SalonDashboard />} />
              <Route path="/salon-services" element={<Services />} />
              <Route path="/salon-bookings" element={<Bookings />} />
              <Route path="/salon-analytics" element={<Analytics />} />
              <Route path="/salons/:id" element={<SalonDetail />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <PWAInstallPrompt />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
