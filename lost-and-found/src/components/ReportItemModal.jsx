import { useState } from "react";
import { IoCloseOutline, IoLockClosedOutline, IoImageOutline } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import { createItem, uploadImage } from "../services/api";
import useUserProfile from "../hooks/useUserProfile";

const CATEGORIES = ["Electronics", "Bags", "Accessories", "Documents", "Clothing", "Keys", "Other"];

const initialState = {
  type: "lost",
  title: "",
  category: "",
  location: "",
  currentLocation: "",  // found only
  date: "",
  privateDescription: "",
  // images handled separately as File objects
};

function ReportItemModal({ isOpen, onClose, onItemCreated }) {
  const { currentUser } = useAuth();
  const { profile } = useUserProfile();

  const [formData, setFormData] = useState(initialState);
  const [publicImage, setPublicImage] = useState(null);      // lost: public image
  const [privateImage, setPrivateImage] = useState(null);    // found: private image OR lost: proof
  const [publicPreview, setPublicPreview] = useState(null);
  const [privatePreview, setPrivatePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isLost = formData.type === "lost";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageFile = (file, isPrivate) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isPrivate) {
        setPrivateImage(file);
        setPrivatePreview(reader.result);
      } else {
        setPublicImage(file);
        setPublicPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) { setError('Item name is required'); return; }
    if (!formData.category)     { setError('Please select a category'); return; }
    if (!formData.location.trim()) { setError('Location is required'); return; }
    if (isLost && !formData.date) { setError('Please enter the date'); return; }

    try {
      setLoading(true);

      // ── Upload images ──────────────────────────────────────────────────
      let imageUrl = null;
      let privateImageUrl = null;

      if (isLost && publicImage) {
        // Lost item: public image shown on cards
        const result = await uploadImage(publicImage, false);
        imageUrl = result.imageUrl;
      }

      if (isLost && privateImage) {
        // Lost item: proof of ownership — stored privately
        const result = await uploadImage(privateImage, true);
        privateImageUrl = result.imageUrl;
      }

      if (!isLost && privateImage) {
        // Found item: actual item image — stored privately, never shown publicly
        const result = await uploadImage(privateImage, true);
        privateImageUrl = result.imageUrl;
      }

      // ── Build item payload ─────────────────────────────────────────────
      const itemPayload = {
        title: formData.title.trim(),
        type: formData.type,
        category: formData.category,
        location: formData.location.trim(),
        currentLocation: !isLost ? formData.currentLocation.trim() : null,
        date: formData.date || null,
        privateDescription: formData.privateDescription.trim() || null,
        imageUrl,          // lost: public url | found: always null
        privateImageUrl,   // lost: proof url | found: item image url
        reportedBy: currentUser.uid,
        reportedByName: profile?.firstName || currentUser.email.split('@')[0],
      };

      const result = await createItem(itemPayload);

      // Notify parent to refresh item list
      if (onItemCreated) onItemCreated(result.item);

      // Reset and close
      setFormData(initialState);
      setPublicImage(null);
      setPrivateImage(null);
      setPublicPreview(null);
      setPrivatePreview(null);
      onClose();

    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialState);
    setPublicImage(null);
    setPrivateImage(null);
    setPublicPreview(null);
    setPrivatePreview(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-start z-50 px-4 py-6 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative my-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Report an Item</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <IoCloseOutline className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* ── Type Toggle ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am reporting a...
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["lost", "found"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: t }))}
                  className={`py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                    formData.type === t
                      ? t === "lost"
                        ? "bg-red-500 text-white shadow-sm"
                        : "bg-green-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t === "lost" ? "🔍 Lost Item" : "📦 Found Item"}
                </button>
              ))}
            </div>
          </div>

          {/* ── Item Name ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isLost ? "What did you lose?" : "What did you find?"} *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={isLost ? "e.g. Phone, Keys, Wallet" : "e.g. Phone, Backpack"}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-sm"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-400">Use general terms — avoid brand or model</p>
          </div>

          {/* ── Category ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-sm"
              disabled={loading}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* ── Location ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isLost ? "Where do you think you lost it?" : "Where did you find it?"} *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Library, Parking Lot, Cafeteria"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-sm"
              disabled={loading}
            />
            {isLost && (
              <p className="mt-1 text-xs text-gray-400">Share your best guess or last place you had it</p>
            )}
          </div>

          {/* ── Current Location (found only) ── */}
          {!isLost && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Where is the item now? *
              </label>
              <input
                type="text"
                name="currentLocation"
                value={formData.currentLocation}
                onChange={handleChange}
                placeholder="e.g. Front Desk, Security Office, With me"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-sm"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-400">Where can the owner go to pick it up?</p>
            </div>
          )}

          {/* ── Date ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isLost ? "When did you last have it?" : "When did you find it?"} *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-sm"
              disabled={loading}
            />
          </div>

          {/* ── Private Description ── */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <IoLockClosedOutline className="text-amber-600 flex-shrink-0" />
              <label className="text-sm font-semibold text-amber-800">
                {isLost ? "Describe your item for ownership verification" : "Private item description (verification only)"}
              </label>
            </div>
            <p className="text-xs text-amber-700 mb-3">
              🔒 This will NOT be shown publicly — used only to verify rightful ownership
            </p>
            <textarea
              name="privateDescription"
              value={formData.privateDescription}
              onChange={handleChange}
              placeholder={
                isLost
                  ? "Include brand, model, color, markings, accessories, or anything unique..."
                  : "Include brand, markings, accessories, or anything that helps identify the owner..."
              }
              rows={3}
              className="w-full px-3 py-2.5 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition text-sm bg-white"
              disabled={loading}
            />
          </div>

          {/* ── Image Upload ── */}
          {isLost ? (
            // Lost item: two image fields — public image + proof
            <div className="space-y-4">
              {/* Public image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <IoImageOutline />
                  Item Photo (optional — shown publicly)
                </label>
                <input
                  type="file" accept="image/*"
                  onChange={(e) => handleImageFile(e.target.files[0], false)}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 cursor-pointer"
                  disabled={loading}
                />
                {publicPreview && (
                  <img src={publicPreview} alt="Preview" className="mt-2 h-24 rounded-lg object-cover border" />
                )}
              </div>

              {/* Proof image — private */}
              <div className="bg-gray-50 rounded-xl p-3">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <IoLockClosedOutline className="text-gray-500" />
                  Proof of Ownership (optional — stored privately)
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Photo with your name, receipt, or anything proving ownership. Avoid serial numbers.
                </p>
                <input
                  type="file" accept="image/*"
                  onChange={(e) => handleImageFile(e.target.files[0], true)}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-600 hover:file:bg-gray-200 cursor-pointer"
                  disabled={loading}
                />
                {privatePreview && (
                  <img src={privatePreview} alt="Proof preview" className="mt-2 h-24 rounded-lg object-cover border" />
                )}
              </div>
            </div>
          ) : (
            // Found item: one image — stored PRIVATELY, shown as placeholder publicly
            <div className="bg-gray-50 rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <IoLockClosedOutline className="text-gray-500" />
                Item Photo (stored privately)
              </label>
              <p className="text-xs text-gray-400 mb-3">
                🔒 Image will NOT be shown publicly. It's used only to verify the rightful owner.
              </p>
              <input
                type="file" accept="image/*"
                onChange={(e) => handleImageFile(e.target.files[0], true)}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-600 hover:file:bg-gray-200 cursor-pointer"
                disabled={loading}
              />
              {privatePreview && (
                <img src={privatePreview} alt="Preview" className="mt-2 h-24 rounded-lg object-cover border" />
              )}
            </div>
          )}

          {/* ── Submit ── */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                `Submit ${isLost ? 'Lost' : 'Found'} Report`
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ReportItemModal;