import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoHomeOutline } from "react-icons/io5";
import { PiWarningCircleLight } from "react-icons/pi";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { IoMdAddCircleOutline } from "react-icons/io";
import ReportItemModal from "../ReportItemModal";
import { createItem, uploadImage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import useUserProfile from "../../hooks/useUserProfile";

// NavLink gives us active state + real URL navigation for free
// isActive is provided automatically by React Router when the URL matches

function Sidebar({ isOpen, onClose, onItemCreated }) {
  const [showModal, setShowModal] = useState(false);
  const { currentUser } = useAuth();
  const { profile } = useUserProfile();

  const navItems = [
    { label: "Home",        icon: IoHomeOutline,                 to: "/"      },
    { label: "Lost Items",  icon: PiWarningCircleLight,          to: "/lost"  },
    { label: "Found Items", icon: IoIosCheckmarkCircleOutline,   to: "/found" },
  ];

  const handleSubmitItem = async (formData) => {
    try {
      let imageUrl        = null;
      let privateImageUrl = null;

      const isLost = formData.type === 'lost';

      // Lost item: public image shown on cards
      if (isLost && formData.publicImage) {
        const result = await uploadImage(formData.publicImage, false);
        imageUrl = result.imageUrl;
      }

      // Lost item: proof image — stored privately
      if (isLost && formData.privateImage) {
        const result = await uploadImage(formData.privateImage, true);
        privateImageUrl = result.imageUrl;
      }

      // Found item: actual photo — stored privately, shown as placeholder publicly
      if (!isLost && formData.privateImage) {
        const result = await uploadImage(formData.privateImage, true);
        privateImageUrl = result.imageUrl;
      }

      const payload = {
        // Public fields
        title:           formData.title,
        type:            formData.type,           // 'lost' | 'found'
        category:        formData.category || 'Other',
        location:        formData.location,
        currentLocation: !isLost ? formData.currentLocation : null,
        date:            formData.date || null,
        imageUrl,                                  // lost: public | found: always null
        reportedBy:      currentUser.uid,
        reportedByName:  profile?.firstName || currentUser.email.split('@')[0],

        // Private fields — stored but never returned by GET /items
        privateDescription: formData.privateDescription || null,
        privateImageUrl,
      };

      const result = await createItem(payload);

      // Tell AppLayout a new item was created so it updates the list
      onItemCreated?.(result.item);

      setShowModal(false);
    } catch (err) {
      console.error('Failed to submit item:', err);
      throw err; // let ReportItemModal show the error
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
        h-screen w-64 bg-white border-r z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 overflow-y-auto flex-shrink-0
      `}>
        <nav className="p-4">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-6 pt-2">
            <div className="bg-orange-500 text-white p-2 rounded-md">🔍</div>
            <h1 className="font-bold text-lg">Lost & Found</h1>
          </div>

          {/* Nav links */}
          <ul className="space-y-1">
            {navItems.map(({ label, icon: Icon, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}   // 'end' prevents Home matching all routes
                  onClick={onClose}  // close sidebar on mobile after tap
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

          <div className="my-4 border-t" />

          {/* Report Item button */}
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
              >
                <IoMdAddCircleOutline size={20} />
                <span>Report Item</span>
              </button>
            </li>
          </ul>

        </nav>
      </aside>

      {/* ReportItemModal — onSubmit wired to handleSubmitItem above */}
      <ReportItemModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitItem}
        onItemCreated={(newItem) => {
          onItemCreated?.(newItem);
          setShowModal(false);
        }}
      />
    </>
  );
}

export default Sidebar;