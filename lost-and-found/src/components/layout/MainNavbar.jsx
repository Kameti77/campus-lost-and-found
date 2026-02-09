import { IoMenuOutline } from "react-icons/io5";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoPersonCircleOutline } from "react-icons/io5";

function MainNavbar({ onOpenSidebar }) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white">

      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-2xl"
          onClick={onOpenSidebar}
        >
          <IoMenuOutline />
        </button>

        {/* Search */}
        <input
          type="text"
          placeholder="Search lost or found items..."
          className="hidden sm:block border rounded-md px-3 py-1 w-72"
        />
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4 text-2xl text-gray-600">
        <IoNotificationsOutline />
        <IoPersonCircleOutline />
      </div>

    </header>
  );
}

export default MainNavbar;