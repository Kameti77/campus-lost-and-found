import { useState } from 'react';
import ItemListPage from './pages/ItemListPage';
import CreateItemPage from './pages/CreateItemPage';
import MapPage from './pages/MapPage';
import ConnectionTest from './components/ConnectionTest';
import TestMapPage from './pages/TestMapPage';



function App() {
  const [currentPage, setCurrentPage] = useState('list'); // Changed from 'test' to 'list'

  const renderPage = () => {
    switch(currentPage) {
      case 'test':
        return <ConnectionTest />;
      case 'list':
        return <ItemListPage />;
      case 'create':
        return <CreateItemPage />;
      case 'map':
        return <MapPage />;
      case 'testmap':
        return <TestMapPage />;
      default:
        return <ItemListPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex gap-4">
          <h1 className="text-xl font-bold mr-6">Lost & Found</h1>
          <button 
            onClick={() => setCurrentPage('list')}
            className={`px-4 py-2 rounded transition-colors ${
              currentPage === 'list' 
                ? 'bg-blue-800' 
                : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            Items
          </button>
          <button 
            onClick={() => setCurrentPage('create')}
            className={`px-4 py-2 rounded transition-colors ${
              currentPage === 'create' 
                ? 'bg-blue-800' 
                : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            Report Item
          </button>
          <button 
            onClick={() => setCurrentPage('map')}
            className={`px-4 py-2 rounded transition-colors ${
              currentPage === 'map' 
                ? 'bg-blue-800' 
                : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            Map
          </button>
          <button 
            onClick={() => setCurrentPage('test')}
            className={`px-4 py-2 rounded transition-colors ml-auto ${
              currentPage === 'test' 
                ? 'bg-blue-800' 
                : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            Test
          </button>
          <button onClick={() => setCurrentPage('testmap')}>Test Map</button>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;