import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import useFilteredItems from '../hooks/useFilteredItems';

function MyReportsPage({ onCardClick, onItemsLoaded }) {
  const { currentUser } = useAuth();

  // Fetch ALL items first (type: 'all' means no type filter)
  const { items, loading, error, fetchItems } = useFilteredItems('all');

  // Filter to show only items THIS user posted
  const myItems = items.filter(item => item.reportedBy === currentUser?.uid);

  // Count by type
  const lostCount = myItems.filter(i => 
    (i.type || i.status || '').toLowerCase() === 'lost'
  ).length;
  
  const foundCount = myItems.filter(i => 
    (i.type || i.status || '').toLowerCase() === 'found'
  ).length;

  // FIX: Only call onItemsLoaded when `items` changes, not myItems
  // This prevents infinite loop because items only changes when data is fetched
  useEffect(() => {
    if (onItemsLoaded) {
      onItemsLoaded(myItems);
    }
  }, [items.length]); // ← Changed from [myItems, onItemsLoaded] to [items.length]

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-500 text-sm mt-1">
            Items you've reported lost or found
          </p>
        </div>
        <button
          onClick={fetchItems}
          className="px-4 py-2 rounded-full bg-gray-800 text-white hover:bg-gray-900 transition text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      {!loading && myItems.length > 0 && (
        <div className="flex gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 text-center min-w-[90px]">
            <p className="text-2xl font-bold text-gray-900">{myItems.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-3 text-center min-w-[90px]">
            <p className="text-2xl font-bold text-red-600">{lostCount}</p>
            <p className="text-xs text-red-500 mt-0.5">Lost</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-3 text-center min-w-[90px]">
            <p className="text-2xl font-bold text-green-600">{foundCount}</p>
            <p className="text-xs text-green-500 mt-0.5">Found</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-20">
          <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500">Loading your reports...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-semibold">Error loading reports</p>
          <p>{error}</p>
          <button
            onClick={fetchItems}
            className="mt-3 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && myItems.length === 0 && (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-14 text-center">
          <p className="text-5xl mb-4">📋</p>
          <h3 className="text-lg font-semibold text-gray-800">No reports yet</h3>
          <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
            You haven't reported any items yet. Use the "Report Item" button in the sidebar to get started.
          </p>
        </div>
      )}

      {/* Items Grid */}
      {!loading && !error && myItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {myItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={onCardClick}
            />
          ))}
        </div>
      )}

    </div>
  );
}

export default MyReportsPage;