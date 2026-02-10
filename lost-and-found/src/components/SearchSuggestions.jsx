import { useNavigate } from "react-router-dom";

function SearchSuggestions({ results, onSelect }) {
  const navigate = useNavigate();

  if (!results.length) return null;

  return (
    <div className="absolute top-full left-0 w-full bg-white border rounded-lg shadow mt-1 z-50">
      {results.slice(0, 6).map((item) => (
        <div
          key={item.id}
          onClick={() => {
            onSelect(item.name);
            navigate("/");
          }}
          className="px-3 py-2 cursor-pointer hover:bg-gray-100"
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}

export default SearchSuggestions;