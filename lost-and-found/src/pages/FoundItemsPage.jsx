import ItemCard from "../components/ItemCard";
import useFilteredItems from "../hooks/useFilteredItems";
import { useEffect } from "react";

function FoundItemsPage({ onCardClick, onItemsLoaded }) {
  const { filteredItems, loading, error, fetchItems, items } = useFilteredItems("found");

  // Tell AppLayout about items so search suggestions stay in sync
  useEffect(() => {
    onItemsLoaded?.(items);
  }, [items]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Found Items</h1>
          <p className="text-gray-500 text-sm mt-1">
            Items found and reported by the community
          </p>
        </div>
        <button
          onClick={fetchItems}
          className="px-4 py-2 rounded-full bg-gray-800 text-white hover:bg-gray-900 transition text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-20">
          <div className="h-10 w-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500">Loading found items...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-semibold">Error loading items</p>
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
          <p className="text-4xl mb-3"></p>
          <h3 className="text-lg font-semibold text-gray-800">No found items reported</h3>
          <p className="text-gray-500 mt-2">Check back later or report a found item.</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={onCardClick}  // ← opens ItemDetailModal
            />
          ))}
        </div>
      )}

    </div>
  );
}

export default FoundItemsPage;