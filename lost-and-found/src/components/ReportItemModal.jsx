import { useState } from "react";

function ReportItemModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    type: "lost",
    title: "",
    location: "",
    date: "",
    category: "",
    description: "",
    image: null,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">

        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">
          Report Item
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Lost / Found Toggle */}
          <div>
            <label className="block font-medium mb-1">
              Item Status *
            </label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            >
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block font-medium mb-1">
              Item Title *
            </label>
            <input
              type="text"
              name="title"
              placeholder="ex. Black Backpack"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block font-medium mb-1">
              Location *
            </label>
            <input
              type="text"
              name="location"
              placeholder="ex. Library 2nd Floor"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block font-medium mb-1">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-medium mb-1">
              Category *
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            >
              <option value="">Select Category</option>
              <option>Electronics</option>
              <option>Bags</option>
              <option>Accessories</option>
              <option>Documents</option>
              <option>Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium mb-1">
              Description *
            </label>

            <textarea
              name="description"
              placeholder="Provide detailed description..."
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              rows={3}
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block font-medium mb-1">
              Image (Optional)
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Submit Report
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ReportItemModal;