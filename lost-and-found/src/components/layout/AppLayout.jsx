import { useState } from "react";
import Sidebar from "./Sidebar";
import MainNavbar from "./MainNavbar";
import { PAGES } from "../../utils/pages";

import HomePage from "../../pages/HomePage";

function AppLayout() {

  const [currentPage, setCurrentPage] = useState(PAGES.HOME);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderPage = () => {
    return <HomePage />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onChangePage={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Content Column */}
      <div className="flex flex-col flex-1 min-w-0">

        <MainNavbar onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Content Container */}
        <main
          className="
            flex-1
            overflow-y-auto
            px-3 py-4
            sm:px-5 sm:py-5
            md:px-6 md:py-6
            lg:px-8 lg:py-6
            xl:px-10
            2xl:px-12
            mx-auto
            w-full
            max-w-[1800px]
          "
        >
          {renderPage()}
        </main>

      </div>
    </div>
  );
}

export default AppLayout;