const API_URL = 'http://localhost:5000/api';

// Test backend connection
export const testBackend = async () => {
  try {
    const response = await fetch(`${API_URL}/test`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Backend connection failed:', error);
    throw error;
  }
};

// Test Firestore connection
export const testFirestore = async () => {
  try {
    const response = await fetch(`${API_URL}/test-firebase/firestore`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Firestore connection failed:', error);
    throw error;
  }
};

// Get all items
export const getItems = async () => {
  try {
    const response = await fetch(`${API_URL}/items`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch items:', error);
    throw error;
  }
};

// Create new item
export const createItem = async (itemData) => {
  try {
    const response = await fetch(`${API_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create item');
    }
    
    return data;
  } catch (error) {
    console.error('Failed to create item:', error);
    throw error;
  }
};

// Update item
export const updateItem = async (id, updates) => {
  try {
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update item');
    }

    return data;
  } catch (error) {
    console.error('Failed to update item:', error);
    throw error;
  }
};

// Delete item
export const deleteItem = async (id) => {
  try {
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to delete item:', error);
    throw error;
  }
};




// Upload image
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData, 
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload image');
    }
    
    return data;
  } catch (error) {
    console.error('Failed to upload image:', error);
    throw error;
  }
};