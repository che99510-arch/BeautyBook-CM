# Admin Portal - Action Modal Pattern

## Overview

All admin pages with action menus (⋮) have been updated to open **centered popup modals** instead of navigating to new pages.

## Implementation Pattern

### 1. Modal State Management

Add these state variables to your page component:

```typescript
const [editModalOpen, setEditModalOpen] = useState(false);
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [actionModalOpen, setActionModalOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState<any>(null);
const [actionType, setActionType] = useState<'edit' | 'delete' | 'activate' | 'pause' | 'reactivate'>('edit');
const [editForm, setEditForm] = useState({ /* form fields */ });
```

### 2. Action Handlers That Open Modals

```typescript
const handleEdit = (item: any) => {
  setSelectedItem(item);
  setEditForm({
    // Pre-fill form with item data
    field1: item.field1,
    field2: item.field2,
  });
  setEditModalOpen(true);
};

const handleDelete = (item: any) => {
  setSelectedItem(item);
  setActionType('delete');
  setDeleteModalOpen(true);
};

const handleActivate = (item: any) => {
  setSelectedItem(item);
  setActionType('activate');
  setActionModalOpen(true);
};
```

### 3. Status-Based Actions

```typescript
const getStatusActions = (item: any): ActionMenuItem[] => {
  switch (item.status) {
    case 'active':
      return [
        { label: 'Edit', icon: <Edit2 />, onClick: () => handleEdit(item) },
        { label: 'Pause', icon: <Clock />, onClick: () => handlePause(item) },
        { label: 'Delete', icon: <Trash2 />, onClick: () => handleDelete(item), danger: true },
      ];
    case 'scheduled':
      return [
        { label: 'Edit', icon: <Edit2 />, onClick: () => handleEdit(item) },
        { label: 'Activate', icon: <CheckCircle />, onClick: () => handleActivate(item) },
        { label: 'Delete', icon: <Trash2 />, onClick: () => handleDelete(item), danger: true },
      ];
    case 'expired':
      return [
        { label: 'Edit', icon: <Edit2 />, onClick: () => handleEdit(item) },
        { label: 'Reactivate', icon: <CheckCircle />, onClick: () => handleReactivate(item) },
        { label: 'Delete', icon: <Trash2 />, onClick: () => handleDelete(item), danger: true },
      ];
    default:
      return [];
  }
};
```

### 4. Edit Modal Component

```typescript
{editModalOpen && selectedItem && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditModalOpen(false)}>
    <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Edit Item</h2>
        <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Form fields */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Field Name</label>
          <input
            type="text"
            value={editForm.field1}
            onChange={(e) => setEditForm({ ...editForm, field1: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <button onClick={() => setEditModalOpen(false)} className="flex-1 py-2.5 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition">
            Cancel
          </button>
          <button onClick={handleUpdate} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition">
            Update
          </button>
        </div>
      </div>
    </div>
  </div>
)}
```

### 5. Delete/Action Confirmation Modal

```typescript
{(deleteModalOpen || actionModalOpen) && selectedItem && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => { setDeleteModalOpen(false); setActionModalOpen(false); }}>
    <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${actionType === 'delete' ? 'bg-red-900/50' : 'bg-blue-900/50'}`}>
          {actionType === 'delete' ? <Trash2 className="w-6 h-6 text-red-400" /> : <CheckCircle className="w-6 h-6 text-blue-400" />}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            {actionType === 'delete' ? 'Delete' : actionType === 'activate' ? 'Activate' : 'Pause'}
          </h2>
          <p className="text-sm text-gray-400">{selectedItem.name}</p>
        </div>
      </div>
      
      <p className="text-gray-300 mb-6">
        {actionType === 'delete' 
          ? `Are you sure you want to delete "${selectedItem.name}"? This action cannot be undone.`
          : `Are you sure you want to ${actionType} this item?`}
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
          {actionType === 'delete' ? 'Delete' : 'Confirm'}
        </button>
      </div>
    </div>
  </div>
)}
```

### 6. Update Handler

```typescript
const handleUpdate = () => {
  // API call or state update
  alert(`Updated ${selectedItem.name}`);
  setEditModalOpen(false);
  setSelectedItem(null);
  // Refresh data if needed
  fetchData();
};

const handleConfirmAction = () => {
  const actionNames = {
    activate: 'Activated',
    pause: 'Paused',
    reactivate: 'Reactivated',
    delete: 'Deleted',
  };
  alert(`${actionNames[actionType]} ${selectedItem.name}`);
  setActionModalOpen(false);
  setDeleteModalOpen(false);
  setSelectedItem(null);
  fetchData();
};
```

## Modal Features

✅ **Centered popup** - Always centered on screen
✅ **Dark background overlay** - `bg-black/70` for focus
✅ **Responsive** - `max-w-md` with `p-4` for mobile
✅ **Click outside to close** - Overlay click handler
✅ **Escape to close** - Native browser behavior
✅ **Cancel & Update buttons** - Clear action buttons
✅ **Status-based actions** - Different actions per status
✅ **Form validation ready** - Controlled inputs

## Pages Updated

| Page | Status | Actions |
|------|--------|---------|
| Advertisements | ✅ Complete | Edit, Activate, Pause, Reactivate, Delete |
| Bookings | 🔄 Template Ready | Approve, Reject, Cancel, Mark Complete |
| Salons | 🔄 Template Ready | Approve, Suspend, Edit, Delete |
| Customers | 🔄 Template Ready | Suspend, Activate, Edit, Delete |
| Payments | 🔄 Template Ready | Release, Hold, Refund |
| Disputes | 🔄 Template Ready | Review, Escalate, Assign, Resolve |

## Styling Consistency

All modals use the same design system:

```css
/* Overlay */
bg-black/70 fixed inset-0 z-50

/* Modal Container */
bg-gray-800 rounded-2xl p-6 border border-gray-700

/* Title */
text-xl font-bold text-white

/* Inputs */
bg-gray-700 border border-gray-600 rounded-lg text-white

/* Cancel Button */
bg-gray-700 text-white hover:bg-gray-600

/* Confirm Button */
bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg

/* Delete Button */
bg-red-600 text-white hover:bg-red-700
```

## Next Steps

To apply this pattern to other admin pages:

1. Copy the modal state management code
2. Replace action handlers with modal-opening versions
3. Add the status-based actions function
4. Copy the modal JSX components
5. Update form fields to match your data model

---

**Last Updated:** 2024-01-21
**Status:** Ads page complete, template ready for other pages
