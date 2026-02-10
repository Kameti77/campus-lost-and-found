import { useState, useEffect } from "react";
import { getItems } from "../services/api";
import { useSearch } from "../context/SearchContext";

export default function useFilteredItems(statusFilter = "All") {
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
      setItems(result.items || []);
    } catch (err) {
      setError(err.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items
    .filter(item =>
      statusFilter === "All"
        ? true
        : item.status === statusFilter
    )
    .filter(item => {
      const term = searchTerm.toLowerCase();

      return (
        item.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term)
      );
    });

  return {
    items,
    filteredItems,
    loading,
    error,
    fetchItems,
    setItems
  };
}