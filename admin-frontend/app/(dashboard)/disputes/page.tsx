'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, AlertTriangle, Clock, CheckCircle, Eye, MessageSquare, ShieldCheck } from 'lucide-react';
import ActionDropdown, { ActionMenuItem } from '@/components/ActionDropdown';

interface Dispute {
  id: string;
  disputeId: string;
  customer: string;
  salon: string;
  reason: string;
  amount: string;
  date: string;
  status: 'open' | 'in-review' | 'resolved';
  severity: 'low' | 'medium' | 'high';
}

// Mock data
const mockDisputes: Dispute[] = [
  {
    id: '1',
    disputeId: 'DSP-001',
    customer: 'Emma Johnson',
    salon: 'Glamour Beauty Studio',
    reason: 'Service quality complaint',
    amount: '$65',
    date: '2024-01-15',
    status: 'open',
    severity: 'medium',
  },
  {
    id: '2',
    disputeId: 'DSP-002',
    customer: 'Michael Chen',
    salon: 'Elite Hair Salon',
    reason: 'Unauthorized charge',
    amount: '$45',
    date: '2024-01-10',
    status: 'in-review',
    severity: 'high',
  },
  {
    id: '3',
    disputeId: 'DSP-003',
    customer: 'Jessica Williams',
    salon: 'Spa Wellness Center',
    reason: 'Booking cancellation issue',
    amount: '$120',
    date: '2024-01-05',
    status: 'resolved',
    severity: 'low',
  },
];

const statusConfig = {
  open: { icon: AlertTriangle, color: 'text-red-400', label: 'Open' },
  'in-review': { icon: Clock, color: 'text-amber-400', label: 'In Review' },
  resolved: { icon: CheckCircle, color: 'text-green-400', label: 'Resolved' },
};

const severityConfig = {
  low: { color: 'bg-green-900/20 border-green-700', text: 'text-green-400' },
  medium: { color: 'bg-amber-900/20 border-amber-700', text: 'text-amber-400' },
  high: { color: 'bg-red-900/20 border-red-700', text: 'text-red-400' },
};

export default function DisputesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'in-review' | 'resolved'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const handleViewDetails = (dispute: Dispute) => {
    alert(`Dispute Details:\nID: ${dispute.disputeId}\nCustomer: ${dispute.customer}\nSalon: ${dispute.salon}\nReason: ${dispute.reason}\nAmount: ${dispute.amount}\nStatus: ${dispute.status}\nSeverity: ${dispute.severity}`);
  };

  const handleReview = (dispute: Dispute) => {
    alert(`Marking dispute ${dispute.disputeId} as in-review...`);
  };

  const handleResolve = (dispute: Dispute) => {
    const resolution = prompt('Enter resolution notes:');
    if (resolution) {
      alert(`Resolving dispute ${dispute.disputeId}:\n${resolution}`);
    }
  };

  const handleEscalate = (dispute: Dispute) => {
    if (!confirm('Escalate this dispute to higher priority?')) return;
    alert(`Escalating dispute ${dispute.disputeId} to higher priority...`);
  };

  const handleAssign = (dispute: Dispute) => {
    const assignee = prompt('Assign to (team member name):');
    if (assignee) {
      alert(`Assigning dispute ${dispute.disputeId} to ${assignee}...`);
    }
  };

  const handleDownloadReport = (dispute: Dispute) => {
    alert(`Downloading dispute report for ${dispute.disputeId}...`);
  };

  const handleAddNote = (dispute: Dispute) => {
    const note = prompt('Add a note to this dispute:');
    if (note) {
      alert(`Adding note to dispute ${dispute.disputeId}:\n${note}`);
    }
  };

  const filteredDisputes = mockDisputes.filter((dispute) => {
    if (!dispute.customer && !dispute.salon && !dispute.reason) {
      return false;
    }
    const matchesSearch =
      dispute.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.salon?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || dispute.status === selectedStatus;
    const matchesSeverity = selectedSeverity === 'all' || dispute.severity === selectedSeverity;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Disputes</h1>
        <p className="text-gray-400">Review and resolve disputes between customers, salons, and the platform.</p>
      </div>

      {/* Key Metrics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Total Disputes</p>
          <p className="text-2xl font-bold text-white">{mockDisputes.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-red-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Open</p>
          <p className="text-2xl font-bold text-red-400">
            {mockDisputes.filter((d) => d.status === 'open').length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-amber-700 p-4">
          <p className="text-xs text-gray-400 mb-1">In Review</p>
          <p className="text-2xl font-bold text-amber-400">
            {mockDisputes.filter((d) => d.status === 'in-review').length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-green-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Resolved</p>
          <p className="text-2xl font-bold text-green-400">
            {mockDisputes.filter((d) => d.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by customer, salon, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-review">In Review</option>
              <option value="resolved">Resolved</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Severity Filter */}
          <div className="relative">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10"
            >
              <option value="all">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Salon</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Severity</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300">Amount</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredDisputes.map((dispute) => {
                const statusConfig_item = statusConfig[dispute.status];
                const StatusIcon = statusConfig_item.icon;
                const severityStyle = severityConfig[dispute.severity];

                return (
                  <tr key={dispute.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-purple-400">{dispute.disputeId}</td>
                    <td className="px-6 py-4 text-sm text-white">{dispute.customer}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{dispute.salon}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{dispute.reason}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(dispute.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${statusConfig_item.color}`} />
                        <span className={statusConfig_item.color}>{statusConfig_item.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${severityStyle.color} ${severityStyle.text}`}
                      >
                        {dispute.severity.charAt(0).toUpperCase() + dispute.severity.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-white font-medium">
                      {dispute.amount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ActionDropdown
                        actions={[
                          {
                            label: 'View Details',
                            icon: <Eye className="w-4 h-4" />,
                            onClick: () => handleViewDetails(dispute),
                          },
                          {
                            label: 'Add Note',
                            icon: <MessageSquare className="w-4 h-4" />,
                            onClick: () => handleAddNote(dispute),
                          },
                          ...(dispute.status === 'open' ? [
                            {
                              label: 'Review',
                              icon: <Clock className="w-4 h-4" />,
                              onClick: () => handleReview(dispute),
                            } as ActionMenuItem,
                            {
                              label: 'Escalate',
                              icon: <AlertTriangle className="w-4 h-4" />,
                              onClick: () => handleEscalate(dispute),
                              danger: true,
                            } as ActionMenuItem,
                          ] : [
                            {
                              label: 'Download Report',
                              icon: <ShieldCheck className="w-4 h-4" />,
                              onClick: () => handleDownloadReport(dispute),
                            },
                          ]),
                          {
                            label: 'Assign',
                            icon: <ShieldCheck className="w-4 h-4" />,
                            onClick: () => handleAssign(dispute),
                          },
                          ...(dispute.status !== 'resolved' ? [
                            {
                              label: 'Resolve',
                              icon: <CheckCircle className="w-4 h-4" />,
                              onClick: () => handleResolve(dispute),
                            } as ActionMenuItem,
                          ] : []),
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredDisputes.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400">No disputes found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
