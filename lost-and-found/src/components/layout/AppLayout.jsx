import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import MainNavbar from "./MainNavbar";

import HomePage from "../../pages/HomePage";
import LostItemsPage from "../../pages/LostItemsPage";
import FoundItemsPage from "../../pages/FoundItemsPage";
import MyReportsPage from "../../pages/MyReportsPage";
import HowItWorksPage from "../../pages/HowItWorksPage";
import ItemDetailModal from "../ItemDetailModal";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems]               = useState([]);

  const handleItemsLoaded  = (loaded)       => setItems(loaded);
  const handleCardClick    = (item)         => setSelectedItem(item);
  const handleItemCreated  = (newItem)      => setItems(prev => [newItem, ...prev]);
  const handleItemUpdated  = (updatedItem)  => {
    setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    setSelectedItem(updatedItem);
  };
  const handleItemDeleted  = (deletedId)   => {
    setItems(prev => prev.filter(i => i.id !== deletedId));
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onItemCreated={handleItemCreated}
      />

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
          <Routes>
            <Route path="/"           element={<HomePage       onCardClick={handleCardClick} onItemsLoaded={handleItemsLoaded} onItemCreated={handleItemCreated} />} />
            <Route path="/lost"       element={<LostItemsPage  onCardClick={handleCardClick} onItemsLoaded={handleItemsLoaded} />} />
            <Route path="/found"      element={<FoundItemsPage onCardClick={handleCardClick} onItemsLoaded={handleItemsLoaded} />} />
            <Route path="/my-reports" element={<MyReportsPage  onCardClick={handleCardClick} onItemsLoaded={handleItemsLoaded} />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="*"           element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

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