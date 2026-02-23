import { useState, useEffect } from "react";
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
  currentLocation: "",
  date: "",
  privateDescription: "",
};

function ReportItemModal({ isOpen, onClose, onItemCreated, prefillData }) {
  const { currentUser } = useAuth();
  const { profile } = useUserProfile();

  const [formData, setFormData] = useState(initialState);
  const [publicImage, setPublicImage] = useState(null);
  const [privateImage, setPrivateImage] = useState(null);
  const [publicPreview, setPublicPreview] = useState(null);
  const [privatePreview, setPrivatePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (prefillData && isOpen) {
      setFormData({
        type: prefillData.prefillType || "lost",
        title: prefillData.prefillTitle || "",
        category: prefillData.prefillCategory || "",
        location: prefillData.prefillLocation || "",
        currentLocation: "",
        date: "",
        privateDescription: "",
      });
    } else if (!isOpen) {
      setFormData(initialState);
    }
  }, [prefillData, isOpen]);

  if (!isOpen) return null;

  const isLost = formData.type === "lost";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    setError("");

    if (!formData.title.trim()) return setError("Item name is required");
    if (!formData.category) return setError("Please select a category");
    if (!formData.location.trim()) return setError("Location is required");
    if (isLost && !formData.date) return setError("Please enter the date");

    try {
      setLoading(true);

      let imageUrl = null;
      let privateImageUrl = null;

      if (isLost && publicImage) {
        const result = await uploadImage(publicImage, false);
        imageUrl = result.imageUrl;
      }

      if (privateImage) {
        const result = await uploadImage(privateImage, true);
        privateImageUrl = result.imageUrl;
      }

      const itemPayload = {
        title: formData.title.trim(),
        type: formData.type,
        category: formData.category,
        location: formData.location.trim(),
        currentLocation: !isLost ? formData.currentLocation.trim() : null,
        date: formData.date || null,
        privateDescription: formData.privateDescription.trim() || null,
        imageUrl,
        privateImageUrl,
        reportedBy: currentUser.uid,
        reportedByName: profile?.firstName || currentUser.email.split("@")[0],
        relatedToLostItemId: prefillData?.relatedToLostItemId || null,
      };

      const result = await createItem(itemPayload);

      if (onItemCreated) onItemCreated(result.item);

      handleClose();
    } catch (err) {
      setError(err.message || "Failed to submit report.");
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
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-start z-50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-lg border relative my-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="text-lg font-semibold">Report an Item</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {error && (
            <div className="border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Type */}
          <div>
            <label className="block text-sm mb-1">I am reporting a...</label>
            <div className="grid grid-cols-2 gap-2">
              {["lost", "found"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: t }))}
                  className={`py-2 rounded border text-sm ${
                    formData.type === t
                      ? t === "lost"
                        ? "bg-red-500 text-white"
                        : "bg-green-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {t === "lost" ? "🔍 Lost Item" : "📦 Found Item"}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm mb-1">
              {isLost ? "What did you lose?" : "What did you find?"} *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded text-sm"
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1">
              Use general terms — avoid brand or model
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded text-sm"
              disabled={loading}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm mb-1">
              {isLost
                ? "Where do you think you lost it?"
                : "Where did you find it?"} *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded text-sm"
              disabled={loading}
            />
          </div>

          {!isLost && (
            <div>
              <label className="block text-sm mb-1">
                Where is the item now? *
              </label>
              <input
                type="text"
                name="currentLocation"
                value={formData.currentLocation}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded text-sm"
                disabled={loading}
              />
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm mb-1">
              {isLost
                ? "When did you last have it?"
                : "When did you find it?"} *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border rounded text-sm"
              disabled={loading}
            />
          </div>

          {/* Private Description */}
          <div className="border rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <IoLockClosedOutline />
              <label className="text-sm">
                {isLost
                  ? "Describe your item for ownership verification"
                  : "Private item description (verification only)"}
              </label>
            </div>

            <p className="text-xs text-gray-500 mb-2">
              🔒 This will NOT be shown publicly — used only to verify rightful ownership
            </p>

            <textarea
              name="privateDescription"
              value={formData.privateDescription}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded text-sm"
              disabled={loading}
            />
          </div>

          {/* Image */}
          <div>
            <label className="text-sm flex items-center gap-2 mb-1">
              <IoImageOutline />
              Item Photo
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageFile(e.target.files[0], !isLost)
              }
              className="text-sm"
              disabled={loading}
            />

            {publicPreview && (
              <img
                src={publicPreview}
                alt="Preview"
                className="mt-2 h-24 border rounded object-cover"
              />
            )}

            {privatePreview && (
              <img
                src={privatePreview}
                alt="Preview"
                className="mt-2 h-24 border rounded object-cover"
              />
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 border rounded"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-orange-500 text-white rounded disabled:opacity-50"
            >
              Submit {isLost ? "Lost" : "Found"} Report
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ReportItemModal;