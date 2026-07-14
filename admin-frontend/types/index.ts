// API Response Types
export interface LoginResponse {
  user: AdminUser;
  token: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

// Salon Types
export interface Salon {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
  totalBookings: number;
  revenue: number;
  services?: Service[];
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalBookings: number;
  lastBooking?: string;
  totalSpent: number;
}

// Booking Types
export interface Booking {
  id: string;
  customerId: string;
  salonId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'cancelled';
  price: number;
  notes?: string;
}

// Payment Types
export interface Payment {
  id: string;
  transactionId: string;
  bookingId: string;
  customerId: string;
  salonId: string;
  amount: number;
  date: string;
  status: 'released' | 'pending' | 'disputed';
  method: string;
  metadata?: Record<string, any>;
}

// Dispute Types
export interface Dispute {
  id: string;
  disputeId: string;
  customerId: string;
  salonId: string;
  bookingId: string;
  reason: string;
  description: string;
  amount: number;
  date: string;
  status: 'open' | 'in-review' | 'resolved';
  severity: 'low' | 'medium' | 'high';
  resolution?: string;
}

// Advertisement Types
export interface Advertisement {
  id: string;
  salonId: string;
  title: string;
  description: string;
  image: string;
  position: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'rejected';
  impressions: number;
  clicks: number;
  rejectionReason?: string;
}

// Dashboard Types
export interface DashboardOverview {
  totalSalons: number;
  totalCustomers: number;
  activeBookings: number;
  totalRevenue: number;
  recentTransactions: Payment[];
  topSalons: Salon[];
  metrics: {
    bookingsTrend: number;
    revenueTrend: number;
    customersTrend: number;
    salonsTrend: number;
  };
}

// Error Response
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
