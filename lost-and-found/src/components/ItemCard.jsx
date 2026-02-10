import { useState } from 'react';
import { updateItem } from '../services/api';
import { useSearch } from '../context/SearchContext';

function ItemCard({ item, onStatusChange }) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(item.status);
  const [message, setMessage] = useState(null);

  const { searchTerm } = useSearch(); // ✅ Global search

  /* ---------------- Highlight Helper ---------------- */
  const highlightText = (text) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');

    return text.split(regex).map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? (
          <span key={index} className="bg-yellow-200 font-semibold">
            {part}
          </span>
        )
        : part
    );
  };
  /* -------------------------------------------------- */

  const statusColor =
    currentStatus === 'Lost'
      ? 'bg-red-100 text-red-800'
      : 'bg-green-100 text-green-800';

  const buttonColor =
    currentStatus === 'Lost'
      ? 'bg-green-600 hover:bg-green-700'
      : 'bg-red-600 hover:bg-red-700';

  const newStatus = currentStatus === 'Lost' ? 'Found' : 'Lost';

  const handleStatusChange = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await updateItem(item.id, { status: newStatus });
      setCurrentStatus(newStatus);
      setMessage({ type: 'success', text: `Marked as ${newStatus}` });

      if (onStatusChange) {
        onStatusChange(item.id, newStatus);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">

      {/* Image */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-lg">No Image</span>
        </div>
      )}

      {/* Content */}
      <div className="p-4">

        {/* Status Badge */}
        <div className="mb-2">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
            {currentStatus}
          </span>
        </div>

        {/* Name with highlight */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {highlightText(item.name || '')}
        </h3>

        {/* Description with highlight */}
        <p className="text-gray-600 mb-3 line-clamp-2">
          {highlightText(item.description || '')}
        </p>

        {/* Category with highlight */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium">Category:</span>
          <span>{highlightText(item.category || '')}</span>
        </div>

        {/* Date */}
        <div className="text-xs text-gray-400 mt-2">
          Posted: {new Date(item.createdAt).toLocaleDateString()}
        </div>

        {/* Feedback Message */}
        {message && (
          <div className={`mt-3 px-3 py-2 rounded text-sm ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Status Toggle */}
        <button
          onClick={handleStatusChange}
          disabled={loading}
          className={`mt-4 w-full py-2 px-4 rounded-lg text-white font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${buttonColor}`}
        >
          {loading ? 'Updating...' : `Mark as ${newStatus}`}
        </button>

      </div>
    </div>
  );
}

export default ItemCard;