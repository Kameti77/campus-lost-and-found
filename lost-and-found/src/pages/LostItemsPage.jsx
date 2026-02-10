import ItemCard from "../components/ItemCard";
import useFilteredItems from "../hooks/useFilteredItems";

function LostItemsPage() {
  const {
    filteredItems,
    loading,
    error,
    fetchItems,
    setItems
  } = useFilteredItems("Lost");

  const handleStatusChange = (itemId, newStatus) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, status: newStatus }
          : item
      )
    );
  };

  return (
    <main className="flex-1 bg-gray-50 p-6">

      <h1 className="text-2xl font-bold mb-4">
        Lost Items
      </h1>

      {loading && <p>Loading...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && filteredItems.length === 0 && (
        <p>No lost items found</p>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {filteredItems.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

    </main>
  );
}

export default LostItemsPage;