import { IoNotificationsOutline, IoCloseOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';

// Shown right after login — BEFORE the browser's native permission dialog
// This custom modal explains WHY we need notifications, increasing acceptance rate
// User clicks "Enable" → THEN browser shows its native dialog

function NotificationPermissionModal({ isOpen, onEnable, onSkip }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">

        {/* Skip button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <IoCloseOutline className="text-xl" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <IoNotificationsOutline className="text-3xl text-orange-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Stay in the Loop 🔔
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enable notifications to get real-time updates about lost and found items
        </p>

        {/* What they'll get */}
        <div className="space-y-3 mb-6">
          {[
            { icon: '🔍', text: 'New lost items reported on campus' },
            { icon: '📦', text: 'New found items reported on campus' },
            { icon: '📍', text: "When someone needs location help on your post" },
            { icon: '✅', text: "When a location you asked about gets updated" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                {icon}
              </div>
              <p className="text-sm text-gray-700">{text}</p>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <button
          onClick={onEnable}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors mb-2"
        >
          Enable Notifications
        </button>

        <button
          onClick={onSkip}
          className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
        >
          Maybe later
        </button>

      </div>
    </div>
  );
}

export default NotificationPermissionModal;