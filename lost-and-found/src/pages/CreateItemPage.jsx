import { useState } from 'react';
import { createItem, uploadImage } from '../services/api';

function CreateItemPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Lost',
    category: 'Other'
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState(null);

  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Accessories',
    'Keys',
    'ID/Cards',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          type: 'error',
          text: 'Image must be less than 5MB'
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({
          type: 'error',
          text: 'Only image files are allowed'
        });
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setMessage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let imageUrl = null;

      // Upload image first if one was selected
      if (imageFile) {
        setUploadingImage(true);
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult.imageUrl;
        setUploadingImage(false);
      }

      // Create item with image URL
      const itemData = {
        ...formData,
        imageUrl: imageUrl
      };

      const result = await createItem(itemData);
      
      setMessage({
        type: 'success',
        text: 'Item created successfully!'
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        status: 'Lost',
        category: 'Other'
      });
      setImageFile(null);
      setImagePreview(null);
      
      // Reset file input
      const fileInput = document.getElementById('image');
      if (fileInput) fileInput.value = '';
      
      console.log('Created item:', result.item);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to create item'
      });
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Report Lost or Found Item</h1>
      
      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 p-4 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        
        {/* Item Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Item Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Black Backpack"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Provide details about the item..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">Max size: 5MB</p>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-w-xs rounded-lg border border-gray-300"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {uploadingImage ? 'Uploading Image...' : loading ? 'Creating Item...' : 'Submit Item'}
        </button>
      </form>
    </div>
  );
}

export default CreateItemPage;