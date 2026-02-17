import { useState, useEffect } from 'react';
import { getItems } from '../services/api';
import { useSearch } from '../context/SearchContext';

// typeFilter: "lost" | "found" | "all"
// "all" skips type filtering — used by MyReportsPage which filters by owner instead

const useFilteredItems = (typeFilter) => {
  const [items, setItems] = useState([]);
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

      // 'all' = no type filter (MyReportsPage filters by owner uid instead)
      // Otherwise handles both lowercase ("lost"/"found") and legacy ("Lost"/"Found")
      const filtered = typeFilter === 'all'
        ? all
        : all.filter(item => {
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

  // Apply search term on top of type filter
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