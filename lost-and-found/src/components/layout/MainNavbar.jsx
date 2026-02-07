import { IoMenuOutline } from "react-icons/io5";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoPersonCircleOutline } from "react-icons/io5";

function MainNavbar({ onOpenSidebar }) {
  return (
    <header
      className="
        flex items-center justify-between
        border-b bg-white
        px-3 py-2
        sm:px-5 sm:py-3
        md:px-6
        lg:px-8
      "
    >
      {/* Left */}
      <div className="flex items-center gap-3">

        {/* Hamburger always visible until lg */}
        <button
          className="lg:hidden text-2xl"
          onClick={onOpenSidebar}
        >
          ☰
        </button>

        {/* Search */}
        <input
          type="text"
          placeholder="Search lost or found items..."
          className="
            hidden sm:block
            border rounded-md
            px-3 py-1.5
            w-40
            md:w-64
            lg:w-80
          "
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 sm:gap-4 text-xl">
        🔔
        👤
      </div>
    </header>
  );
}
export default MainNavbar;