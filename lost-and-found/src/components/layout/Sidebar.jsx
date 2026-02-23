import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { IoHomeOutline, IoClipboardOutline, IoInformationCircleOutline } from "react-icons/io5";
import { PiWarningCircleLight } from "react-icons/pi";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { IoMdAddCircleOutline } from "react-icons/io";
import ReportItemModal from "../ReportItemModal";

function Sidebar({ isOpen, onClose, onItemCreated, reportPrefillData, onPrefillDataUsed }) {
  const [showModal, setShowModal] = useState(false);

  // Auto-open modal when prefill data arrives (from "I Found This" button)
  useEffect(() => {
    if (reportPrefillData) {
      setShowModal(true);
    }
  }, [reportPrefillData]);

  const navItems = [
    { label: "Home",         icon: IoHomeOutline,                to: "/"             },
    { label: "Lost Items",   icon: PiWarningCircleLight,         to: "/lost"         },
    { label: "Found Items",  icon: IoIosCheckmarkCircleOutline,  to: "/found"        },
    { label: "How It Works", icon: IoInformationCircleOutline,   to: "/how-it-works" },
  ];

  const handleModalClose = () => {
    setShowModal(false);
    if (reportPrefillData && onPrefillDataUsed) {
      onPrefillDataUsed();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static top-0 left-0
        h-screen w-64 bg-white border-r z-50 flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 overflow-y-auto
      `}>
        <nav className="p-4 flex flex-col h-full">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-6 pt-2">
            <div className="bg-orange-500 text-white p-2 rounded-md">🔍</div>
            <h1 className="font-bold text-lg">Lost & Found</h1>
          </div>

          {/* Main Navigation */}
          <ul className="space-y-1">
            {navItems.map(({ label, icon: Icon, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium
                    ${isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* User Section */}
          <div className="mt-4">
            {/* My Reports */}
            <NavLink
              to="/my-reports"
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium
                ${isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              <IoClipboardOutline size={20} />
              <span>My Reports</span>
            </NavLink>

            <div className="my-3 border-t" />

            {/* Report Item Button */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition font-medium"
            >
              <IoMdAddCircleOutline size={20} />
              <span>Report Item</span>
            </button>
          </div>

        </nav>
      </aside>

      {/* Report Item Modal */}
      <ReportItemModal
        isOpen={showModal}
        onClose={handleModalClose}
        onItemCreated={(newItem) => {
          onItemCreated?.(newItem);
          handleModalClose();
        }}
        prefillData={reportPrefillData}
      />
    </>
  );
}

export default Sidebar;