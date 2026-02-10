import { useState } from 'react';
import { IoHomeOutline } from "react-icons/io5";
import { PiWarningCircleLight } from "react-icons/pi";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { FiMessageSquare } from "react-icons/fi";
import { IoMdAddCircleOutline } from "react-icons/io";
import ReportItemModal from "../ReportItemModal"
import { createItem, uploadImage } from "../../services/api";
import { PAGES } from "../../utils/pages";

function Sidebar({ currentPage, onChangePage, isOpen, onClose }) {
  const [showModal, setShowModal] = useState(false);

  const navItems = [
    { label: "Home", icon: IoHomeOutline, page: PAGES.HOME },
    { label: "Lost Items", icon: PiWarningCircleLight, page: PAGES.LOST },
    { label: "Found Items", icon: IoIosCheckmarkCircleOutline, page: PAGES.FOUND },
    { label: "Messages", icon: FiMessageSquare, page: PAGES.MESSAGES }
  ];

  const reportItems = [
    { label: "Report Item", icon: IoMdAddCircleOutline }
  ];

  const renderNavItem = (item) => {

    const Icon = item.icon;
    const isActive = currentPage === item.page;

    return (
      <li
        key={item.page}
        onClick={() => {
          onChangePage(item.page);
          onClose(); // Close sidebar after navigation on mobile
        }}
        className={`
          flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition
          ${isActive
            ? "bg-orange-500 text-white"
            : "text-gray-700 hover:bg-gray-100"}
        `}
      >
        <Icon size={20} />
        <span className="font-medium">{item.label}</span>
      </li>
    );
  };

  const handleSubmitItem = async (data) => {
    try {
      let imageUrl = null;

      if (data.image) {
        const uploadResult = await uploadImage(data.image);
        imageUrl = uploadResult.imageUrl;
      }

      const payload = {
        name: data.title,
        description: data.description,
        status: data.type === "lost" ? "Lost" : "Found",
        category: data.category || "Other",
        location: data.location,
        imageUrl,
        datePosted: new Date(),
      };

      await createItem(payload);

      setShowModal(false);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Overlay - only visible on mobile/tablet when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static
          top-0 left-0 
          h-screen w-64
          bg-white border-r
          z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          overflow-y-auto
          flex-shrink-0
        `}
      >
        <nav className="p-4">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6 pt-2">
            <div className="bg-orange-500 text-white p-2 rounded-md">🔍</div>
            <h1 className="font-bold text-lg">Lost & Found</h1>
          </div>

          <ul className="space-y-2">
            {navItems.map(renderNavItem)}
          </ul>

          <div className="my-4 border-t"></div>

          <ul className="space-y-2">
            {reportItems.map((item) => {
              const Icon = item.icon;

              return (
                <li
                  key={item.label}
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </li>
              );
            })}
          </ul>



        </nav>

      </aside >

      <ReportItemModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitItem}
      />

    </>
  );
}

export default Sidebar;