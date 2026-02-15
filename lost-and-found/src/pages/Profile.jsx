import { useNavigate } from 'react-router-dom';
import { IoArrowBackOutline, IoMailOutline, IoCalendarOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import useUserProfile from '../hooks/useUserProfile';

const Profile = () => {
  const { currentUser } = useAuth();
  const { profile, loading, getInitials } = useUserProfile();
  const navigate = useNavigate();

  // Format Firestore timestamp to readable date
  // serverTimestamp() returns a Firestore Timestamp object, not a JS Date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate(); // Firestore method to convert to JS Date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-orange-500 transition-colors"
          aria-label="Go back"
        >
          <IoArrowBackOutline className="text-2xl" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">My Profile</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-10 space-y-6">

        {/* ── Avatar + Name Card ── */}
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center text-center">
          {/* Large initials avatar */}
          <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-3xl mb-4 shadow-md">
            {getInitials()}
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            {profile?.displayName || 'Full Sail Student'}
          </h2>

          <p className="text-gray-500 text-sm mt-1">{currentUser?.email}</p>

          {/* Verified badge */}
          {currentUser?.emailVerified && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <IoShieldCheckmarkOutline className="text-sm" />
              Verified Full Sail Account
            </div>
          )}
        </div>

        {/* ── Info Card ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Account Details
            </h3>
          </div>

          <div className="divide-y divide-gray-100">

            {/* First Name */}
            <div className="px-6 py-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">First Name</span>
              <span className="text-sm font-medium text-gray-900">
                {profile?.firstName || '—'}
              </span>
            </div>

            {/* Last Name */}
            <div className="px-6 py-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Last Name</span>
              <span className="text-sm font-medium text-gray-900">
                {profile?.lastName || '—'}
              </span>
            </div>

            {/* Email */}
            <div className="px-6 py-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-gray-500">
                <IoMailOutline className="text-base flex-shrink-0" />
                <span className="text-sm">Email</span>
              </div>
              <span className="text-sm font-medium text-gray-900 text-right break-all">
                {currentUser?.email || '—'}
              </span>
            </div>

            {/* Member Since */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500">
                <IoCalendarOutline className="text-base flex-shrink-0" />
                <span className="text-sm">Member Since</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(profile?.createdAt)}
              </span>
            </div>

          </div>
        </div>

        {/* ── Placeholder for future sections ── */}
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center border-2 border-dashed border-gray-200">
          <p className="text-sm text-gray-400">More profile features coming soon</p>
        </div>

      </div>
    </div>
  );
};

export default Profile;