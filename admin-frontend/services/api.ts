// Real API service connecting to Django backend
import Cookies from 'js-cookie';

// Resolves to NEXT_PUBLIC_API_URL env var, or dynamically uses the current hostname
// so it works on localhost AND on other devices on the same network (192.168.x.x)
const getApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8000/api/admin`;
  }
  return 'http://localhost:8000/api/admin';
};

const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8000/api`;
  }
  return 'http://localhost:8000/api';
};

const API_URL = getApiUrl();

class ApiService {
  private getToken(): string | null {
    return Cookies.get('admin_token') || null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Token ${token}` } : {}),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      console.error('API Error:', error);
      throw new Error(error.detail || error.error || JSON.stringify(error));
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    console.log('Logging in with:', email);
    
    // Use customer_login endpoint (admin users are regular users with is_admin flag)
    const loginResponse = await fetch(`${getBaseUrl()}/users/customer_login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email.split('@')[0], // Use email prefix as username
        password,
      }),
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      console.error('Login failed:', error);
      throw new Error(error.error || 'Login failed');
    }

    const data = await loginResponse.json();
    console.log('Login successful, token:', data.token.substring(0, 20) + '...');
    
    // Check if user is admin by fetching their profile
    const profileResponse = await fetch(`${getBaseUrl()}/users/current_user/`, {
      headers: {
        'Authorization': `Token ${data.token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const userProfile = await profileResponse.json();
    console.log('User profile:', userProfile);
    
    // Check admin privileges (check both is_superuser and profile.is_admin)
    const isAdmin = userProfile.is_superuser || userProfile.profile?.is_admin;
    console.log('Is admin?', isAdmin, '(is_superuser:', userProfile.is_superuser, ', profile.is_admin:', userProfile.profile?.is_admin, ')');
    
    if (!isAdmin) {
      throw new Error('User does not have admin privileges');
    }

    Cookies.set('admin_token', data.token, { expires: 7 });
    return { 
      user: {
        id: userProfile.id.toString(),
        name: `${userProfile.first_name} ${userProfile.last_name}`.trim() || userProfile.username,
        email: userProfile.email,
        role: 'admin' as const,
      },
      token: data.token 
    };
  }

  async logout() {
    Cookies.remove('admin_token');
  }

  // Dashboard
  async getDashboardOverview() {
    return this.request<any>('/analytics/dashboard/');
  }

  // Salons
  async getSalons(page = 1, search?: string) {
    let url = `/salons/?page=${page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.request<any>(url);
  }

  async updateSalon(id: string, data: any) {
    return this.request<any>(`/salons/${id}/`, { 
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSalon(id: string) {
    return this.request<any>(`/salons/${id}/`, { method: 'DELETE' });
  }

  async getSuspensionSalons() {
    return this.request<any>('/salons/?is_active=false');
  }

  async approveSalon(id: string) {
    return this.request<any>(`/salons/${id}/approve/`, { method: 'PATCH' });
  }

  async suspendSalon(id: string, reason?: string) {
    return this.request<any>(`/salons/${id}/suspend/`, { method: 'PATCH' });
  }

  // Customers
  async getCustomers(page = 1, search?: string) {
    let url = `/users/?page=${page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.request<any>(url);
  }

  async updateCustomer(id: string, data: any) {
    return this.request<any>(`/users/${id}/`, { 
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: string) {
    return this.request<any>(`/users/${id}/`, { method: 'DELETE' });
  }

  async suspendUser(id: string) {
    return this.request<any>(`/users/${id}/suspend/`, { method: 'PATCH' });
  }

  async activateUser(id: string) {
    return this.request<any>(`/users/${id}/activate/`, { method: 'PATCH' });
  }

  // Bookings
  async getBookings(page = 1, status?: string) {
    let url = `/bookings/?page=${page}`;
    if (status && status !== 'all') url += `&status=${status}`;
    return this.request<any>(url);
  }

  async updateBooking(id: string, data: any) {
    return this.request<any>(`/bookings/${id}/`, { 
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBooking(id: string) {
    return this.request<any>(`/bookings/${id}/`, { method: 'DELETE' });
  }

  async approveBooking(id: string) {
    return this.request<any>(`/bookings/${id}/approve/`, { method: 'PATCH' });
  }

  async rejectBooking(id: string) {
    return this.request<any>(`/bookings/${id}/reject/`, { method: 'PATCH' });
  }

  async cancelBooking(id: string) {
    return this.request<any>(`/bookings/${id}/cancel/`, { method: 'PATCH' });
  }

  // Payments
  async getPayments(page = 1, status?: string) {
    let url = `/payments/?page=${page}`;
    if (status && status !== 'all') url += `&status=${status}`;
    return this.request<any>(url);
  }

  async getPaymentStats() {
    return this.request<any>('/payments/stats/');
  }

  async verifyPayment(id: string) {
    return this.request<any>(`/payments/${id}/verify/`, { method: 'PATCH' });
  }

  async markPaymentPaid(id: string) {
    return this.request<any>(`/payments/${id}/mark-paid/`, { method: 'PATCH' });
  }

  async failPayment(id: string) {
    return this.request<any>(`/payments/${id}/fail/`, { method: 'PATCH' });
  }

  // Revenue Analytics
  async getRevenue(period?: string) {
    let url = '/analytics/revenue/';
    if (period) url += `?period=${period}`;
    return this.request<any>(url);
  }

  async getRevenueBySalon() {
    return this.request<any>('/analytics/revenue_by_salon/');
  }

  async getRevenueByDate(days?: number) {
    let url = '/analytics/revenue_by_date/';
    if (days) url += `?days=${days}`;
    return this.request<any>(url);
  }

  async getTopServices(limit?: number) {
    let url = '/analytics/top_services/';
    if (limit) url += `?limit=${limit}`;
    return this.request<any>(url);
  }

  // Disputes (placeholder - not in backend yet)
  async getDisputes(page = 1, status?: string) {
    return { results: [], page, count: 0 };
  }

  async resolveDispute(id: string, resolution: string) {
    return { success: true };
  }

  // Notifications
  async getNotifications(enabledPrefs?: string[]) {
    let url = '/notifications/';
    if (enabledPrefs && enabledPrefs.length > 0) {
      url += `?prefs=${enabledPrefs.join(',')}`;
    }
    return this.request<any>(url);
  }

  async markNotificationsRead(ids?: string[]) {
    return this.request<any>('/notifications/mark_read/', {
      method: 'POST',
      body: JSON.stringify({ ids: ids ?? [] }),
    });
  }

  // Testimonials
  async getTestimonials(approved?: 'all' | 'true' | 'false') {    let url = '/testimonials/';
    if (approved) url += `?approved=${approved}`;
    return this.request<any>(url);
  }

  async approveTestimonial(id: string) {
    return this.request<any>(`/testimonials/${id}/approve/`, { method: 'PATCH' });
  }

  async deleteTestimonial(id: string) {
    return this.request<any>(`/testimonials/${id}/reject/`, { method: 'DELETE' });
  }

  async getTestimonialStats() {
    return this.request<any>('/testimonials/stats/');
  }

  // Advertisements
  async getAdvertisements(page = 1, status?: string) {
    let url = `/advertisements/?page=${page}`;
    if (status) url += `&status=${status}`;
    return this.request<any>(url);
  }

  async updateAdvertisement(id: string, data: any) {
    return this.request<any>(`/advertisements/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAdvertisement(id: string) {
    return this.request<any>(`/advertisements/${id}/`, { method: 'DELETE' });
  }

  async activateAdvertisement(id: string) {
    return this.request<any>(`/advertisements/${id}/activate/`, { method: 'PATCH' });
  }

  async pauseAdvertisement(id: string) {
    return this.request<any>(`/advertisements/${id}/pause/`, { method: 'PATCH' });
  }

  async reactivateAdvertisement(id: string) {
    return this.request<any>(`/advertisements/${id}/reactivate/`, { method: 'PATCH' });
  }

  async featureAdvertisement(id: string) {
    return this.request<any>(`/advertisements/${id}/feature/`, { method: 'PATCH' });
  }

  async unfeatureAdvertisement(id: string) {
    return this.request<any>(`/advertisements/${id}/unfeature/`, { method: 'PATCH' });
  }

  async bulkActivateAdvertisements(adIds: string[]) {
    return this.request<any>('/advertisements/bulk_activate/', {
      method: 'POST',
      body: JSON.stringify({ ad_ids: adIds }),
    });
  }

  async bulkPauseAdvertisements(adIds: string[]) {
    return this.request<any>('/advertisements/bulk_pause/', {
      method: 'POST',
      body: JSON.stringify({ ad_ids: adIds }),
    });
  }

  async bulkDeleteAdvertisements(adIds: string[]) {
    return this.request<any>('/advertisements/bulk_delete/', {
      method: 'POST',
      body: JSON.stringify({ ad_ids: adIds }),
    });
  }

  async uploadAdvertisement(formData: FormData) {
    // Don't use the request method for FormData to avoid JSON parsing issues
    const token = Cookies.get('admin_token');
    const response = await fetch(`${API_URL}/advertisements/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        // Don't set Content-Type - browser will set it automatically for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Upload failed');
    }

    return response.json();
  }

  async getAdvertisementStatistics() {
    return this.request<any>('/advertisements/statistics/');
  }

  // Profile & Password (uses the base /api/ prefix, not /api/admin/)
  async updateAdminProfile(data: { first_name: string; last_name: string }) {
    const token = Cookies.get('admin_token');
    const res = await fetch(`${getBaseUrl()}/users/update_profile/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || 'Update failed');
    }
    return res.json();
  }

  async changePassword(current_password: string, new_password: string, confirm_password: string) {
    const token = Cookies.get('admin_token');
    const res = await fetch(`${getBaseUrl()}/users/change_password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify({ current_password, new_password, confirm_password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || 'Password change failed');
    }
    return res.json();
  }

  // Platform Settings
  async getPlatformSettings() {    return this.request<any>('/settings/');
  }

  async updatePlatformSettings(data: any) {
    return this.request<any>('/settings/1/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Reports
  async getReports() {
    return this.request<any>('/reports/');
  }

  async getReportOverview() {
    return this.request<any>('/reports/overview/');
  }

  async getRevenueReport(period: string = 'monthly') {
    return this.request<any>(`/reports/revenue/?period=${period}`);
  }

  async getBookingsReport(period: string = 'monthly') {
    return this.request<any>(`/reports/bookings/?period=${period}`);
  }

  async getSalonsReport(period: string = 'monthly') {
    return this.request<any>(`/reports/salons/?period=${period}`);
  }

  async generateReport(reportType: string, period: string = 'monthly') {
    // For CSV export, use direct fetch to handle text response
    const token = Cookies.get('admin_token');
    const response = await fetch(`${API_URL}/reports/export/?type=${reportType}&period=${period}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return await response.text(); // Return CSV text instead of JSON
  }
}

export default new ApiService();
