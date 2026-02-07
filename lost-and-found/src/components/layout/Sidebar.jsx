import { IoHomeOutline } from "react-icons/io5";
import { PiWarningCircleLight } from "react-icons/pi";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { FiMessageSquare } from "react-icons/fi";
import { IoMdAddCircleOutline } from "react-icons/io";

import { PAGES } from "../../utils/pages";

function Sidebar({ currentPage, onChangePage, isOpen, onClose }) {

  const navItems = [
    { label: "Home", icon: IoHomeOutline, page: PAGES.HOME },
    { label: "Lost Items", icon: PiWarningCircleLight, page: PAGES.LOST },
    { label: "Found Items", icon: IoIosCheckmarkCircleOutline, page: PAGES.FOUND },
    { label: "Messages", icon: FiMessageSquare, page: PAGES.MESSAGES }
  ];

  const reportItems = [
    { label: "Report Lost Item", icon: IoMdAddCircleOutline, page: PAGES.REPORT_LOST },
    { label: "Report Found Item", icon: IoMdAddCircleOutline, page: PAGES.REPORT_FOUND }
  ];

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive = currentPage === item.page;

    return (
      <li
        key={item.page}
        onClick={() => {
          onChangePage(item.page);
          onClose(); // close sidebar on mobile after click
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

  return (
    <>
      {/* Overlay for small screens */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}


      {/* Sidebar */}
      <aside
        className={`
    fixed lg:static top-0 left-0 z-50
    h-screen
    w-[240px]
    bg-white border-r
    transform transition-transform duration-300
    -translate-x-full
    lg:translate-x-0
    ${isOpen ? '!translate-x-0' : ''}
  `}
      >

        {/* Logo */}
        <div className="flex items-center gap-2 px-4 mb-6">
          <div className="bg-orange-500 text-white p-2 rounded-md">🔍</div>
          <h1 className="font-bold text-lg">Lost & Found</h1>
        </div>

        <ul className="space-y-2">
          {navItems.map(renderNavItem)}
        </ul>

        <div className="my-4 border-t"></div>

        <ul className="space-y-2">
          {reportItems.map(renderNavItem)}
        </ul>

      </aside>
    </>
  );
}

export default Sidebar;