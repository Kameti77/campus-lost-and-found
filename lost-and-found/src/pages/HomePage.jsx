import { useState, useEffect } from 'react';
import { getItems } from '../services/api';
import ItemCard from '../components/ItemCard';
import { IoSearchOutline } from "react-icons/io5";

function HomePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleStatusChange = (itemId, newStatus) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );
  };

  const filteredItems = items
    .filter(item => filter === 'All' ? true : item.status === filter)
    .filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <main className="flex-1 min-w-0 bg-gray-50 p-4 sm:p-6 lg:p-8">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Home
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Browse recently reported lost and found items
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2">

          {['All', 'Lost', 'Found'].map(type => {

            const count =
              type === 'All'
                ? items.length
                : items.filter(i => i.status === type).length;

            const active = filter === type;

            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition
                  ${active
                    ? 'bg-orange-500 text-white shadow'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {type} ({count})
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
            <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
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
            <h3 className="text-lg font-semibold text-gray-800">
              No items found
            </h3>

            <p className="text-gray-500 mt-2">
              {filter === 'All'
                ? 'No items have been reported yet.'
                : `No ${filter.toLowerCase()} items found.`}
            </p>
          </div>
        )}

        {/* Items Grid */}
        {!loading && !error && filteredItems.length > 0 && (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-1
              md:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              gap-5
            "
          >
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

export default HomePage;