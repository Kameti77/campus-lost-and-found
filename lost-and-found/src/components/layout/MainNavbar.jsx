import { IoMenuOutline, IoNotificationsOutline, IoPersonCircleOutline, IoSearchOutline } from "react-icons/io5";
import { useState } from "react";
import { useSearch } from "../../context/SearchContext";
import useDebounce from "../../hooks/useDebounce";
import SearchSuggestions from "../SearchSuggestions";

function MainNavbar({ onOpenSidebar, items = [] }) {
  const { searchTerm, setSearchTerm } = useSearch();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedSearch = useDebounce(searchTerm);

  const suggestionResults = items.filter(item =>
    item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    item.category?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white">

      {/* LEFT */}
      <div className="flex items-center gap-4">

        <button className="lg:hidden text-2xl" onClick={onOpenSidebar}>
          <IoMenuOutline />
        </button>

        {/* SEARCH BAR */}
        <div className="relative hidden sm:block w-72">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
          />

          {showSuggestions && (
            <SearchSuggestions
              results={suggestionResults}
              onSelect={(value) => setSearchTerm(value)}
            />
          )}
        </div>

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 text-2xl text-gray-600">
        <IoNotificationsOutline />
        <IoPersonCircleOutline />
      </div>

    </header>
  );
}

export default MainNavbar;