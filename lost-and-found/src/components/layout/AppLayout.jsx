import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import MainNavbar from "./MainNavbar";

import HomePage from "../../pages/HomePage";
import LostItemsPage from "../../pages/LostItemsPage";
import FoundItemsPage from "../../pages/FoundItemsPage";
import ItemDetailModal from "../ItemDetailModal";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems]               = useState([]);

  // Called by each page when it loads its items
  // Passed down as a prop so MainNavbar search suggestions stay in sync
  const handleItemsLoaded = (loadedItems) => {
    setItems(loadedItems);
  };

  // Called when a card is clicked — opens the detail modal
  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  // Called when owner edits their post inside the modal
  const handleItemUpdated = (updatedItem) => {
    setItems(prev =>
      prev.map(i => i.id === updatedItem.id ? updatedItem : i)
    );
    setSelectedItem(updatedItem);
  };

  // Called when owner deletes their post inside the modal
  const handleItemDeleted = (deletedId) => {
    setItems(prev => prev.filter(i => i.id !== deletedId));
    setSelectedItem(null);
  };

  // Called when a new item is submitted from ReportItemModal
  const handleItemCreated = (newItem) => {
    setItems(prev => [newItem, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar — uses navigate() internally for page changes */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onItemCreated={handleItemCreated}
      />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0">

        <MainNavbar
          onOpenSidebar={() => setSidebarOpen(true)}
          items={items} 
        />

        <main className="
          flex-1 overflow-y-auto
          px-3 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6
          lg:px-8 lg:py-6 xl:px-10 2xl:px-12
          mx-auto w-full max-w-[1800px]
        ">
          {/* React Router handles which page renders */}
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  onCardClick={handleCardClick}
                  onItemsLoaded={handleItemsLoaded}
                  onItemCreated={handleItemCreated}
                />
              }
            />
            <Route
              path="/lost"
              element={
                <LostItemsPage
                  onCardClick={handleCardClick}
                  onItemsLoaded={handleItemsLoaded}
                />
              }
            />
            <Route
              path="/found"
              element={
                <FoundItemsPage
                  onCardClick={handleCardClick}
                  onItemsLoaded={handleItemsLoaded}
                />
              }
            />
            {/* Redirect any unknown sub-path to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Item Detail Modal — lives here so it works across all pages */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onItemUpdated={handleItemUpdated}
        onItemDeleted={handleItemDeleted}
      />

    </div>
  );
}

export default AppLayout;