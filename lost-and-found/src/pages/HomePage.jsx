import { useState, useEffect } from 'react';
import { getItems } from '../services/api';
import ItemCard from '../components/ItemCard';
import { useSearch } from '../context/SearchContext';

function HomePage({ onCardClick, onItemsLoaded, onItemCreated }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const { searchTerm } = useSearch();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getItems();
      const loaded = result.items || [];
      setItems(loaded);
      onItemsLoaded?.(loaded); // tell AppLayout so search suggestions work
    } catch (err) {
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  // Filter by tab + search term
  // Updated to use item.type ('lost'/'found') as well as legacy item.status ('Lost'/'Found')
  const filteredItems = items
    .filter(item => {
      if (filter === 'All') return true;
      const type = item.type || item.status || '';
      return type.toLowerCase() === filter.toLowerCase();
    })
    .filter(item => {
      const term = searchTerm.toLowerCase();
      if (!term) return true;
      return (
        item.title?.toLowerCase().includes(term) ||
        item.name?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term) ||
        item.location?.toLowerCase().includes(term)
      );
    });

  const getCount = (type) => {
    if (type === 'All') return items.length;
    return items.filter(i =>
      (i.type || i.status || '').toLowerCase() === type.toLowerCase()
    ).length;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Home</h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Browse recently reported lost and found items
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {['All', 'lost', 'found'].map(type => {
          const label = type === 'All' ? 'All' : type === 'lost' ? 'Lost' : 'Found';
          const active = filter === type;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                active
                  ? 'bg-orange-500 text-white shadow'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label} ({getCount(type)})
            </button>
          );
        })}
        <button
          onClick={fetchItems}
          className="ml-auto px-4 py-2 rounded-full bg-gray-800 text-white hover:bg-gray-900 transition text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-20">
          <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500">Loading items...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-semibold">Error</p>
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
      {!loading && !error && filteredItems.length === 0 && (
        <div className="bg-white border rounded-xl p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">No items found</h3>
          <p className="text-gray-500 mt-2">
            {filter === 'All'
              ? 'No items have been reported yet.'
              : `No ${filter} items found.`}
          </p>
        </div>
      )}

      {/* Items Grid */}
      {!loading && !error && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={onCardClick}  // ← wired to AppLayout → opens ItemDetailModal
            />
          ))}
        </div>
      )}

    </div>
  );
}

export default HomePage;