import { useState, useEffect } from 'react';
import {
  IoCloseOutline, IoLocationOutline, IoTimeOutline,
  IoLockClosedOutline, IoCreateOutline, IoTrashOutline,
  IoMapOutline, IoPersonOutline, IoWarningOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { updateItem, deleteItem, requestLocationClarification } from '../services/api';

const CATEGORIES = ["Electronics", "Bags", "Accessories", "Documents", "Clothing", "Keys", "Other"];

// ── Safe date parser ─────────────────────────────────────────────────────────
// Handles: ISO strings, Firestore Timestamps, plain date strings, null/undefined
// The UTC fix prevents timezone shifts (e.g. Feb 13 becoming Feb 12)
const parseDate = (value) => {
  if (!value) return null;
  // Firestore Timestamp object
  if (value?.toDate) return value.toDate();
  // Already a JS Date
  if (value instanceof Date) return value;
  const str = String(value);
  // Plain date "2026-02-13" — parse as UTC to avoid day-shift
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }
  // ISO string or anything else
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

const formatDate = (value) => {
  const d = parseDate(value);
  if (!d) return 'Unknown';
  return d.toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'UTC'   // keep UTC so "Feb 13" stays "Feb 13"
  });
};

// Convert any date value to "YYYY-MM-DD" string for <input type="date">
const toInputDate = (value) => {
  const d = parseDate(value);
  if (!d) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

function ItemDetailModal({ item, isOpen, onClose, onItemUpdated, onItemDeleted, onFoundThisClick }) {
  const { currentUser } = useAuth();

  // ── ALL HOOKS MUST RUN BEFORE ANY EARLY RETURN ──────────────────────────
  // React's rule: hooks cannot be called conditionally
  const [mode, setMode]                   = useState('view');
  const [editData, setEditData]           = useState({});
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [clarificationSent, setClarificationSent] = useState(false);

  // Sync editData whenever item changes OR modal opens
  // This ensures the edit form is always pre-filled with the latest item data
  useEffect(() => {
    if (!item) return;
    setEditData({
      title:              item.title || item.name || '',
      category:           item.category || '',
      location:           item.location || '',
      currentLocation:    item.currentLocation || '',
      date:               toInputDate(item.date || item.createdAt),
      privateDescription: item.privateDescription || '',
    });
  }, [item]);

  // Reset mode when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMode('view');
      setError('');
      setSuccess('');
      setClarificationSent(false);
    }
  }, [isOpen]);

  // ── Early return AFTER all hooks ─────────────────────────────────────────
  if (!isOpen || !item) return null;

  const isOwner = currentUser?.uid === item.reportedBy;
  const isFound = (item.type || item.status || '').toLowerCase() === 'found';
  const isLost  = (item.type || item.status || '').toLowerCase() === 'lost';

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleEditClick = () => {
    setMode('edit');
    setError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setError('');
    if (!editData.title?.trim())    { setError('Item name is required'); return; }
    if (!editData.location?.trim()) { setError('Location is required');  return; }
    try {
      setLoading(true);
      const result = await updateItem(item.id, editData);
      if (onItemUpdated) onItemUpdated(result.item);
      setSuccess('Post updated successfully!');
      setMode('view');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteItem(item.id);
      if (onItemDeleted) onItemDeleted(item.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete post');
      setMode('view');
    } finally {
      setLoading(false);
    }
  };

  const handleClarificationRequest = async () => {
    setError('');
    try {
      setLoading(true);
      await requestLocationClarification({
        itemId:       item.id,
        itemTitle:    item.title || item.name,
        finderUid:    item.reportedBy,
        requesterUid: currentUser.uid,
      });
      setClarificationSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMode('view');
    setError('');
    onClose();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl my-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              isLost ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {isLost ? '🔍 Lost' : '📦 Found'}
            </span>
            {mode === 'edit' && (
              <span className="text-xs text-orange-500 font-medium">Editing...</span>
            )}
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <IoCloseOutline className="text-2xl" />
          </button>
        </div>

        <div className="px-6 py-5">

          {/* Success */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <IoCheckmarkCircleOutline /> {success}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* ══ VIEW MODE ══════════════════════════════════════════════════ */}
          {mode === 'view' && (
            <div className="space-y-5">

              {/* Image */}
              {isFound ? (
                <div className="w-full h-44 bg-gray-100 rounded-xl flex flex-col items-center justify-center gap-2">
                  <IoLockClosedOutline className="text-gray-400 text-3xl" />
                  <p className="text-gray-400 text-sm font-medium">Image available upon verification</p>
                  <p className="text-gray-400 text-xs">Contact school staff with item description</p>
                </div>
              ) : item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title || item.name}
                  className="w-full h-52 object-cover rounded-xl" />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                  <p className="text-gray-400 text-sm">No image provided</p>
                </div>
              )}

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900">
                {item.title || item.name}
              </h2>

              {/* Info */}
              <div className="space-y-3">

                <div className="flex items-center gap-3 text-sm">
                  <IoPersonOutline className="text-gray-400 flex-shrink-0" />
                  <span className="text-gray-500">Reported by</span>
                  <span className="font-medium text-gray-800">
                    {item.reportedByName || 'Anonymous'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400 flex-shrink-0">🏷️</span>
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-gray-800">{item.category || '—'}</span>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <IoLocationOutline className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 flex-shrink-0">
                    {isLost ? 'Last seen' : 'Found at'}
                  </span>
                  <span className="font-medium text-gray-800">
                    {item.location || 'Not specified'}
                  </span>
                </div>

                {/* Current Location — found items only */}
                {isFound && item.currentLocation && (
                  <div className="flex items-start gap-3 text-sm bg-blue-50 rounded-lg px-3 py-2.5">
                    <IoMapOutline className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-blue-700 font-semibold">Currently at: </span>
                      <span className="text-blue-800 font-medium">{item.currentLocation}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <IoTimeOutline className="text-gray-400 flex-shrink-0" />
                  <span className="text-gray-500">
                    {isLost ? 'Last seen' : 'Found on'}
                  </span>
                  <span className="font-medium text-gray-800">
                    {formatDate(item.date || item.createdAt)}
                  </span>
                </div>

              </div>

              {/* Owner actions */}
              {isOwner && (
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={handleEditClick}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <IoCreateOutline /> Edit Post
                  </button>
                  <button
                    onClick={() => setMode('confirmDelete')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <IoTrashOutline /> Delete Post
                  </button>
                </div>
              )}

              {/* Non-owner + found: clarification button */}
              {!isOwner && isFound && (
                <div className="pt-2 border-t border-gray-100">
                  {clarificationSent ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm text-center">
                      ✅ Request sent! The finder will be notified to update the location.
                    </div>
                  ) : (
                    <button
                      onClick={handleClarificationRequest}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 text-sm"
                    >
                      <IoLocationOutline className="text-lg" />
                      {loading ? 'Sending...' : 'Request Location Clarification'}
                    </button>
                  )}
                  <p className="text-xs text-gray-400 text-center mt-2">
                    The finder will be notified to provide more location details
                  </p>
                </div>
              )}

              {/* Non-owner + lost: "I Found This" button */}
              {!isOwner && isLost && onFoundThisClick && (
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      onFoundThisClick({
                        relatedToLostItemId: item.id,
                        prefillType: 'found',
                        prefillCategory: item.category,
                        prefillLocation: item.location,
                        prefillTitle: item.title || item.name,
                      });
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors text-sm"
                  >
                    <IoCheckmarkCircleOutline className="text-lg" />
                    I Found This Item
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Report that you found this item — the owner will be notified automatically
                  </p>
                </div>
              )}

            </div>
          )}

          {/* ══ EDIT MODE ══════════════════════════════════════════════════ */}
          {mode === 'edit' && (
            <form onSubmit={handleSaveEdit} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  value={editData.title || ''}
                  onChange={e => setEditData(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={editData.category || ''}
                  onChange={e => setEditData(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                  disabled={loading}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isLost ? 'Suspected Loss Location' : 'Found Location'} *
                </label>
                <input
                  type="text"
                  value={editData.location || ''}
                  onChange={e => setEditData(p => ({ ...p, location: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                  disabled={loading}
                />
              </div>

              {isFound && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Item Location
                  </label>
                  <input
                    type="text"
                    value={editData.currentLocation || ''}
                    onChange={e => setEditData(p => ({ ...p, currentLocation: e.target.value }))}
                    placeholder="e.g. Front Desk, Security Office"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editData.date || ''}
                  onChange={e => setEditData(p => ({ ...p, date: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                  disabled={loading}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <label className="block text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <IoLockClosedOutline /> Private Description (verification only)
                </label>
                <textarea
                  value={editData.privateDescription || ''}
                  onChange={e => setEditData(p => ({ ...p, privateDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none text-sm bg-white"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('view'); setError(''); }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 text-sm"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          )}

          {/* ══ CONFIRM DELETE ══════════════════════════════════════════════ */}
          {mode === 'confirmDelete' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoWarningOutline className="text-red-500 text-3xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete this post?</h3>
              <p className="text-gray-500 text-sm mb-6">
                This will permanently delete your post and all related data. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setMode('view')}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ItemDetailModal;