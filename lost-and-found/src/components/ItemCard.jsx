import { useSearch } from '../context/SearchContext';
import { IoLocationOutline, IoLockClosedOutline, IoTimeOutline } from 'react-icons/io5';

function ItemCard({ item, onClick }) {
  const { searchTerm } = useSearch();

  // Highlight search matches in text
  const highlightText = (text) => {
    if (!searchTerm || !text) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <span key={index} className="bg-yellow-200 font-semibold">{part}</span>
        : part
    );
  };

  const isFound = item.type === 'found' || item.status === 'Found';
  const isLost  = item.type === 'lost'  || item.status === 'Lost';

  const statusStyle = isLost
    ? 'bg-red-100 text-red-700'
    : 'bg-green-100 text-green-700';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div
      onClick={() => onClick && onClick(item)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* ── Image Area ── */}
      {isFound ? (
        // Found items: NEVER show image publicly — show placeholder
        <div className="w-full h-44 bg-gray-100 flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <IoLockClosedOutline className="text-gray-400 text-lg" />
          </div>
          <p className="text-gray-400 text-xs font-medium">Image available upon verification</p>
        </div>
      ) : item.imageUrl ? (
        // Lost items: show image if available
        <img
          src={item.imageUrl}
          alt={item.title || item.name}
          className="w-full h-44 object-cover"
        />
      ) : (
        // Lost items: no image uploaded
        <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No image provided</p>
        </div>
      )}

      {/* ── Content ── */}
      <div className="p-4">

        {/* Status badge */}
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-2 ${statusStyle}`}>
          {isLost ? '🔍 Lost' : '📦 Found'}
        </span>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">
          {highlightText(item.title || item.name || '')}
        </h3>

        {/* Category */}
        <p className="text-xs text-gray-500 mb-3">
          {highlightText(item.category || '')}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <IoLocationOutline className="flex-shrink-0" />
          <span className="line-clamp-1">
            {isFound && item.currentLocation
              ? `Currently at: ${item.currentLocation}`
              : item.location || 'Location not specified'
            }
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <IoTimeOutline className="flex-shrink-0" />
          <span>
            {isLost ? 'Last seen: ' : 'Found: '}
            {formatDate(item.date || item.createdAt)}
          </span>
        </div>

        {/* Reported by */}
        {item.reportedByName && (
          <p className="text-xs text-gray-400 mt-2">
            Reported by {item.reportedByName}
          </p>
        )}

      </div>
    </div>
  );
}

export default ItemCard;