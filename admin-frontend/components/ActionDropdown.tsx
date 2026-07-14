'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, Edit2, Trash2, CheckCircle, XCircle, Clock, AlertCircle, DollarSign, MessageSquare } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ActionDropdownProps {
  actions: ActionMenuItem[];
}

export default function ActionDropdown({ actions }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
        aria-label="More actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20 py-1">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                disabled={action.disabled}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  action.danger
                    ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {action.icon && <span className="w-4 h-4">{action.icon}</span>}
                <span className="flex-1 text-left">{action.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
