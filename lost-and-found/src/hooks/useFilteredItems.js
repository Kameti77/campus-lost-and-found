import { useState, useEffect } from 'react';
import { getItems } from '../services/api';
import { useSearch } from '../context/SearchContext';

// Reusable hook used by LostItemsPage and FoundItemsPage
// typeFilter: "lost" or "found" (case-insensitive match)
// Returns filtered items + loading/error state

const useFilteredItems = (typeFilter) => {
  const [items, setItems] = useState([]);       // all items of this type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchTerm } = useSearch();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getItems();
      const all = result.items || [];

      // Filter by type — handles both new lowercase ("lost"/"found")
      // and legacy capitalized ("Lost"/"Found") values
      const filtered = all.filter(item => {
        const type = (item.type || item.status || '').toLowerCase();
        return type === typeFilter.toLowerCase();
      });

      setItems(filtered);
    } catch (err) {
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  // Apply search on top of type filter
  const filteredItems = items.filter(item => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      item.title?.toLowerCase().includes(term) ||
      item.name?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term) ||
      item.location?.toLowerCase().includes(term)
    );
  });

  return { items, filteredItems, loading, error, fetchItems, setItems };
};

export default useFilteredItems;