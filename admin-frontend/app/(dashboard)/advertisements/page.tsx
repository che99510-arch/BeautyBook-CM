'use client';

import React, { useState, useRef } from 'react';
import apiService from '@/services/api';
import { Search, ChevronDown, CheckCircle, Clock, XCircle, Eye, TrendingUp, Trash2, Edit2, Video, Upload, AlertCircle, Plus, X } from 'lucide-react';
import ActionDropdown, { ActionMenuItem } from '@/components/ActionDropdown';

// Dynamic media base — derives from NEXT_PUBLIC_API_URL in production
const getMediaBase = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  if (apiUrl) {
    // Strip /api/admin suffix to get the root domain
    return apiUrl.replace(/\/api\/admin\/?$/, '').replace(/\/api\/?$/, '');
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
      return `${protocol}//${hostname}:8000`;
    }
  }
  return 'http://localhost:8000';
};

const buildMediaUrl = (url: string | null | undefined): string => {
  if (!url) return '/placeholder-ad.jpg';
  if (url.startsWith('http')) return url;
  const base = getMediaBase();
  return url.startsWith('/media/') ? `${base}${url}` : `${base}/media/${url}`;
};

interface Advertisement {
  id: string;
  salon_id: string;
  salon: string;
  salon_name: string;
  video_url: string;
  video: string;
  videoThumbnail: string;
  thumbnail_url: string;
  tagline: string;
  description: string;
  start_date: string;
  startDate: string;
  end_date: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired' | 'pending' | 'paused';
  views: number;
  clicks: number;
  is_active: boolean;
  is_featured: boolean;
}

// Remove mockAds - using real API data

const statusConfig = {
  active:    { icon: CheckCircle, color: 'text-green-400',  label: 'Active',    bg: 'bg-green-900/20' },
  scheduled: { icon: Clock,       color: 'text-blue-400',   label: 'Scheduled', bg: 'bg-blue-900/20' },
  expired:   { icon: XCircle,     color: 'text-gray-400',   label: 'Expired',   bg: 'bg-gray-900/20' },
  pending:   { icon: Clock,       color: 'text-amber-400',  label: 'Pending',   bg: 'bg-amber-900/20' },
  paused:    { icon: AlertCircle, color: 'text-orange-400', label: 'Paused',    bg: 'bg-orange-900/20' },
} as const;

const getStatusConfig = (status: string) =>
  statusConfig[status as keyof typeof statusConfig] ??
  { icon: Clock, color: 'text-gray-400', label: status, bg: 'bg-gray-900/20' };

const MAX_ACTIVE_ADS = 3;

export default function AdvertisementsPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'scheduled' | 'expired' | 'pending'>('all');
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [actionType, setActionType] = useState<'edit' | 'delete' | 'activate' | 'pause' | 'reactivate'>('edit');
  
  // Form state for edit
  const [editForm, setEditForm] = useState({
    tagline: '',
    startDate: '',
    endDate: '',
  });
  
  // Form state for upload
  const [uploadForm, setUploadForm] = useState({
    salonId: '',
    tagline: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0], // Today
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    isFeatured: false,
  });
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch advertisements from API
  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAdvertisements(1, selectedStatus !== 'all' ? selectedStatus : undefined);
      setAds(data.results || []);
    } catch (err) {
      console.error('Failed to fetch advertisements:', err);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch salons for dropdown
  const fetchSalons = async () => {
    try {
      console.log('Fetching salons...');
      const data = await apiService.getSalons();
      console.log('Salons data:', data);
      setSalons(data.results || []);
    } catch (err) {
      console.error('Failed to fetch salons:', err);
      setSalons([]);
    }
  };

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [salons, setSalons] = useState<any[]>([]);

  React.useEffect(() => {
    fetchAdvertisements();
    fetchSalons();
  }, [selectedStatus]);

  const handlePreviewVideo = (ad: Advertisement) => {
    const videoUrl = ad.video_url || ad.video;
    if (videoUrl) {
      setPreviewVideo(buildMediaUrl(videoUrl));
    } else {
      alert('No video available for this advertisement');
    }
  };

  const handleFileSelect = () => {
    videoInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowed.includes(file.type)) {
      alert('Only MP4, WebM, and MOV video files are supported by browsers.\n\nPlease convert your video to MP4 and try again.');
      e.target.value = '';
      return;
    }
    setSelectedVideo(file);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedThumbnail(file);
    }
  };

  const handleUploadAd = async () => {
    if (!uploadForm.salonId || !uploadForm.tagline || !selectedVideo) {
      alert('Please fill in all required fields and select a video');
      return;
    }
    
    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('salonId', uploadForm.salonId);
      formData.append('tagline', uploadForm.tagline);
      formData.append('description', uploadForm.description);
      formData.append('startDate', uploadForm.startDate);
      formData.append('endDate', uploadForm.endDate);
      formData.append('isFeatured', uploadForm.isFeatured.toString());
      
      if (selectedVideo) {
        formData.append('video', selectedVideo);
      }
      
      if (selectedThumbnail) {
        formData.append('thumbnail', selectedThumbnail);
      }
      
      const result = await apiService.uploadAdvertisement(formData);

      if (result) {
        setUploadModalOpen(false);
        setUploadForm({ salonId: '', tagline: '', description: '', startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], isFeatured: false });
        setSelectedVideo(null);
        setSelectedThumbnail(null);
        fetchAdvertisements();
      }
        setSelectedVideo(null);
        setSelectedThumbnail(null);
        fetchAdvertisements();
      }
    } catch (err: any) {
      const msg = err?.message || 'Upload failed. Please try again.';
      alert(`Failed to upload advertisement:\n\n${msg}`);
    } finally {
      setUploading(false);
    }
  };

  // Action handlers that open modals
  const handleEdit = (ad: Advertisement) => {
    setSelectedAd(ad);
    setEditForm({
      tagline: ad.tagline,
      startDate: ad.start_date || ad.startDate,
      endDate: ad.end_date || ad.endDate,
    });
    setEditModalOpen(true);
  };

  const handleDelete = (ad: Advertisement) => {
    setSelectedAd(ad);
    setActionType('delete');
    setDeleteModalOpen(true);
  };

  const handleActivate = (ad: Advertisement) => {
    setSelectedAd(ad);
    setActionType('activate');
    setActionModalOpen(true);
  };

  const handlePause = (ad: Advertisement) => {
    setSelectedAd(ad);
    setActionType('pause');
    setActionModalOpen(true);
  };

  const handleReactivate = (ad: Advertisement) => {
    setSelectedAd(ad);
    setActionType('reactivate');
    setActionModalOpen(true);
  };

  const handleApprove = (ad: Advertisement) => {
    const activeCount = ads.filter(a => a.status === 'active').length;
    if (activeCount >= MAX_ACTIVE_ADS) {
      alert(`Cannot approve: Maximum ${MAX_ACTIVE_ADS} active ads allowed.`);
      return;
    }
    setSelectedAd(ad);
    setActionType('activate');
    setActionModalOpen(true);
  };

  const handleReject = (ad: Advertisement) => {
    setSelectedAd(ad);
    setActionType('delete');
    setDeleteModalOpen(true);
  };

  // Modal action handlers
  const handleUpdateAd = async () => {
    if (!selectedAd) return;
    try {
      await apiService.updateAdvertisement(selectedAd.id, {
        tagline: editForm.tagline,
        start_date: editForm.startDate,
        end_date: editForm.endDate,
      });
      alert(`Updated advertisement successfully!`);
      setEditModalOpen(false);
      setSelectedAd(null);
      fetchAdvertisements();
    } catch (err) {
      console.error('Failed to update ad:', err);
      alert('Failed to update advertisement');
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedAd) return;
    try {
      if (actionType === 'delete') {
        await apiService.deleteAdvertisement(selectedAd.id);
        alert(`Deleted advertisement successfully!`);
        setDeleteModalOpen(false);
      } else if (actionType === 'activate') {
        await apiService.activateAdvertisement(selectedAd.id);
        alert(`Activated advertisement successfully!`);
        setActionModalOpen(false);
      } else if (actionType === 'pause') {
        await apiService.pauseAdvertisement(selectedAd.id);
        alert(`Paused advertisement successfully!`);
        setActionModalOpen(false);
      } else if (actionType === 'reactivate') {
        await apiService.reactivateAdvertisement(selectedAd.id);
        alert(`Reactivated advertisement successfully!`);
        setActionModalOpen(false);
      }
      setSelectedAd(null);
      fetchAdvertisements();
    } catch (err) {
      console.error('Failed to perform action:', err);
      alert('Failed to perform action');
    }
  };

  const filteredAds = ads.filter((ad) => {
    const matchesSearch = (typeof ad.salon === 'string' && ad.salon.toLowerCase().includes(searchTerm.toLowerCase())) || (typeof ad.tagline === 'string' && ad.tagline.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || ad.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const activeAds = ads.filter((ad) => ad.status === 'active');
  const scheduledAds = ads.filter((ad) => ad.status === 'scheduled');
  const expiredAds = ads.filter((ad) => ad.status === 'expired');
  const totalViews = activeAds.reduce((sum, ad) => sum + (ad.views || 0), 0);
  const totalClicks = activeAds.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
  const remainingSlots = MAX_ACTIVE_ADS - activeAds.length;

  // Get status-based actions
  const getStatusActions = (ad: Advertisement): ActionMenuItem[] => {
    switch (ad.status) {
      case 'active':
        return [
          { label: 'Edit', icon: <Edit2 className="w-4 h-4" />, onClick: () => handleEdit(ad) },
          { label: 'Pause', icon: <Clock className="w-4 h-4" />, onClick: () => handlePause(ad) },
          { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(ad), danger: true },
        ];
      case 'scheduled':
        return [
          { label: 'Edit', icon: <Edit2 className="w-4 h-4" />, onClick: () => handleEdit(ad) },
          { label: 'Activate', icon: <CheckCircle className="w-4 h-4" />, onClick: () => handleActivate(ad) },
          { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(ad), danger: true },
        ];
      case 'expired':
        return [
          { label: 'Edit', icon: <Edit2 className="w-4 h-4" />, onClick: () => handleEdit(ad) },
          { label: 'Reactivate', icon: <CheckCircle className="w-4 h-4" />, onClick: () => handleReactivate(ad) },
          { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(ad), danger: true },
        ];
      case 'pending':
        return [
          { label: 'Edit', icon: <Edit2 className="w-4 h-4" />, onClick: () => handleEdit(ad) },
          { label: 'Approve', icon: <CheckCircle className="w-4 h-4" />, onClick: () => handleApprove(ad) },
          { label: 'Reject', icon: <XCircle className="w-4 h-4" />, onClick: () => handleReject(ad), danger: true },
        ];
      default:
        return [];
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Video Advertisements</h1>
        <p className="text-gray-400">Manage homepage carousel video ads (max {MAX_ACTIVE_ADS} active at a time)</p>
      </div>

      {/* Dashboard Metrics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className={`bg-gray-800 rounded-lg border-2 ${remainingSlots === 0 ? 'border-red-700' : 'border-green-700'} p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-4 h-4 text-green-400" />
            <p className="text-xs text-gray-400">Active Ads</p>
          </div>
          <p className="text-2xl font-bold text-green-400">{activeAds.length} / {MAX_ACTIVE_ADS}</p>
          <p className={`text-xs mt-1 ${remainingSlots === 0 ? 'text-red-400' : 'text-green-400'}`}>
            {remainingSlots === 0 ? '⚠️ Max reached' : `${remainingSlots} slot${remainingSlots !== 1 ? 's' : ''} available`}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-blue-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-gray-400">Scheduled</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">{scheduledAds.length}</p>
          <p className="text-xs text-gray-500 mt-1">Upcoming ads</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-400">Expired</p>
          </div>
          <p className="text-2xl font-bold text-gray-400">{expiredAds.length}</p>
          <p className="text-xs text-gray-500 mt-1">Past campaigns</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-purple-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-gray-400">Total Views</p>
          </div>
          <p className="text-2xl font-bold text-purple-400">{totalViews.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">All active ads</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-amber-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <p className="text-xs text-gray-400">Total Clicks</p>
          </div>
          <p className="text-2xl font-bold text-amber-400">{totalClicks.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Clicks to salons</p>
        </div>
      </div>

      {/* Upload New Ad Button */}
      <div className="mb-6">
        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-300/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          Upload New Video Ad
        </button>
      </div>

      {/* Important Notice */}
      <div className="mb-6 bg-amber-900/20 border border-amber-700 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-300">
          <p className="font-semibold mb-1">Homepage Carousel Placement</p>
          <p>Video ads appear between the <strong>Welcome Hero</strong> and <strong>Browse Categories</strong> sections on the customer homepage. Maximum <strong>{MAX_ACTIVE_ADS} videos</strong> displayed at a time in rotating carousel.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by salon or tagline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Video Ads Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Preview</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Salon</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Tagline</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Period</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300">Views</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300">Clicks</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredAds.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    No video ads found
                  </td>
                </tr>
              ) : (
                filteredAds.map((ad) => {
                  const config = getStatusConfig(ad.status);
                  const StatusIcon = config.icon;

                  return (
                    <tr key={ad.id} className="hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4">
                        <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-gray-700 group cursor-pointer" onClick={() => handlePreviewVideo(ad)}>
                          <img
                            src={buildMediaUrl(ad.thumbnail_url || ad.videoThumbnail)}
                            alt={ad.tagline}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log('Image failed to load:', e.currentTarget.src);
                              e.currentTarget.src = '/placeholder-ad.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black-70 transition">
                            <Video className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-white">{ad.salon_name || ad.salon}</td>
                      <td className="px-6 py-4 text-sm">
                        <p className="text-white font-medium">{ad.tagline}</p>
                        <p className="text-xs text-gray-400">Links to salon page</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <div>
                          <p>{ad.start_date ? new Date(ad.start_date).toLocaleDateString() : 'No start date'}</p>
                          <p className="text-xs text-gray-500">to {ad.end_date ? new Date(ad.end_date).toLocaleDateString() : 'No end date'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} w-fit`}>
                          <StatusIcon className={`w-4 h-4 ${config.color}`} />
                          <span className={config.color}>{config.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-white font-medium">
                        {ad.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-white font-medium">
                        {ad.clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ActionDropdown actions={getStatusActions(ad)} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && selectedAd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditModalOpen(false)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Video Ad</h2>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Salon</label>
                <input type="text" value={selectedAd.salon} disabled className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tagline</label>
                <input
                  type="text"
                  value={editForm.tagline}
                  onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditModalOpen(false)} className="flex-1 py-2.5 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition">
                  Cancel
                </button>
                <button onClick={handleUpdateAd} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition">
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete/Action Confirmation Modal */}
      {(deleteModalOpen || actionModalOpen) && selectedAd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => { setDeleteModalOpen(false); setActionModalOpen(false); }}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${actionType === 'delete' ? 'bg-red-900/50' : 'bg-blue-900/50'}`}>
                {actionType === 'delete' ? <Trash2 className="w-6 h-6 text-red-400" /> : <CheckCircle className="w-6 h-6 text-blue-400" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {actionType === 'delete' ? 'Delete Ad' : actionType === 'activate' ? 'Activate Ad' : actionType === 'pause' ? 'Pause Ad' : 'Reactivate Ad'}
                </h2>
                <p className="text-sm text-gray-400">{selectedAd.salon}</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              {actionType === 'delete' 
                ? `Are you sure you want to delete the video ad for "${selectedAd.salon}"? This action cannot be undone.`
                : actionType === 'activate'
                ? `Are you sure you want to activate the video ad for "${selectedAd.salon}"? It will appear on the homepage carousel.`
                : actionType === 'pause'
                ? `Are you sure you want to pause the video ad for "${selectedAd.salon}"? It will be hidden from the homepage.`
                : `Are you sure you want to reactivate the expired ad for "${selectedAd.salon}"?`}
            </p>

            <div className="flex gap-3">
              <button onClick={() => { setDeleteModalOpen(false); setActionModalOpen(false); }} className="flex-1 py-2.5 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition">
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`flex-1 py-2.5 rounded-lg font-medium transition ${
                  actionType === 'delete'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg'
                }`}
              >
                {actionType === 'delete' ? 'Delete' : actionType === 'activate' ? 'Activate' : actionType === 'pause' ? 'Pause' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setPreviewVideo(null)}>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <video 
              src={previewVideo} 
              controls 
              autoPlay
              crossOrigin="anonymous"
              playsInline
              className="w-full rounded-2xl"
              onError={() => {
                alert('Failed to load video. Make sure it was uploaded as MP4, WebM, or MOV.');
                setPreviewVideo(null);
              }}
            />
            <button onClick={() => setPreviewVideo(null)} className="mt-4 w-full py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition">
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* Upload New Ad Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setUploadModalOpen(false)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Upload New Video Ad</h2>
              <button onClick={() => setUploadModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-5">
              {/* Salon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Salon <span className="text-red-400">*</span>
                </label>
                <select
                  value={uploadForm.salonId}
                  onChange={(e) => setUploadForm({ ...uploadForm, salonId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a salon...</option>
                  {salons.map((salon) => (
                    <option key={salon.id} value={salon.id}>
                      {salon.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video File <span className="text-red-400">*</span>
                </label>
                <div
                  onClick={() => document.getElementById('videoUpload')?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  {selectedVideo ? (
                    <div>
                      <p className="text-white font-medium">{selectedVideo.name}</p>
                      <p className="text-sm text-gray-400">{(selectedVideo.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-300 font-medium mb-2">Click to upload video</p>
                      <p className="text-sm text-gray-500">MP4, MOV, or WebM only (max 100MB)</p>
                    </div>
                  )}
                  <input
                    id="videoUpload"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Thumbnail Image (Optional)
                </label>
                <div
                  onClick={() => document.getElementById('thumbnailUpload')?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-xl p-4 text-center cursor-pointer hover:border-purple-500 transition"
                >
                  {selectedThumbnail ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(selectedThumbnail)}
                        alt="Thumbnail"
                        className="max-h-32 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-gray-400 mt-2">{selectedThumbnail.name}</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-300 text-sm">Click to upload thumbnail</p>
                      <p className="text-xs text-gray-500">JPG or PNG (optional)</p>
                    </div>
                  )}
                  <input
                    id="thumbnailUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tagline <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={uploadForm.tagline}
                  onChange={(e) => setUploadForm({ ...uploadForm, tagline: e.target.value })}
                  placeholder="Short catchy phrase for the ad"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Additional details about the ad"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={uploadForm.startDate}
                    onChange={(e) => setUploadForm({ ...uploadForm, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={uploadForm.endDate}
                    onChange={(e) => setUploadForm({ ...uploadForm, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Featured Option */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={uploadForm.isFeatured}
                  onChange={(e) => setUploadForm({ ...uploadForm, isFeatured: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isFeatured" className="text-sm font-medium text-gray-300">
                  Feature this ad in homepage carousel (max 3 active featured ads)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setUploadModalOpen(false)}
                  disabled={uploading}
                  className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadAd}
                  disabled={uploading || !selectedVideo}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload & Publish
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
