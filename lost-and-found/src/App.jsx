import AppLayout from "./components/layout/AppLayout";
import { SearchProvider } from "./context/SearchContext";
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <SearchProvider>
        <AppLayout />
      </SearchProvider>
    </BrowserRouter>
  );
}

export default App;