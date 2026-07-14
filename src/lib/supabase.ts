// Supabase has been removed. 
// This file is kept for backward compatibility but is no longer used.
// All data now comes from the Django backend at http://localhost:8000

// Export a dummy object to prevent import errors
export const supabase = {
  from: () => ({
    select: () => Promise.resolve({ data: null, error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  }),
  channel: () => ({
    on: () => ({ subscribe: () => ({}) }),
  }),
  removeChannel: () => {},
};
