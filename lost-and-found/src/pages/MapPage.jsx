import { useState, useEffect } from 'react';
import { getItems } from '../services/api';
import MapView from '../components/MapView';

function MapPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getItems();
      setItems(result.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  // Filter items
  const filteredItems = filter === 'All' 
    ? items 
    : items.filter(item => item.status === filter);

  // Only show items with location
  const itemsWithLocation = filteredItems.filter(
    item => item.location && item.location.lat && item.location.lng
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Map View
        </h1>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('All')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({itemsWithLocation.length})
          </button>
          <button
            onClick={() => setFilter('Lost')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'Lost'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Lost ({items.filter(i => i.status === 'Lost' && i.location).length})
          </button>
          <button
            onClick={() => setFilter('Found')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'Found'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Found ({items.filter(i => i.status === 'Found' && i.location).length})
          </button>
          <button
            onClick={fetchItems}
            className="ml-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Info Message */}
        {items.length > 0 && itemsWithLocation.length === 0 && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6">
            <p className="font-semibold">No items with location data</p>
            <p className="text-sm">Items need location information to appear on the map.</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading map...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Map */}
        {!loading && !error && (
          <MapView items={itemsWithLocation} />
        )}
      </div>
    </div>
  );
}

export default MapPage;