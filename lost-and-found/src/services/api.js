const API_URL = 'http://localhost:5000/api';

// ─── ITEMS ────────────────────────────────────────────────────────────────

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

export const getItem = async (id) => {
  try {
    const response = await fetch(`${API_URL}/items/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch item:', error);
    throw error;
  }
};

// createItem now accepts all new fields including reportedBy and private fields
export const createItem = async (itemData) => {
  try {
    const response = await fetch(`${API_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create item');
    return data;
  } catch (error) {
    console.error('Failed to create item:', error);
    throw error;
  }
};

export const updateItem = async (id, updates) => {
  try {
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update item');
    return data;
  } catch (error) {
    console.error('Failed to update item:', error);
    throw error;
  }
};

export const deleteItem = async (id) => {
  try {
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete item');
    return data;
  } catch (error) {
    console.error('Failed to delete item:', error);
    throw error;
  }
};

// ─── IMAGE UPLOAD ──────────────────────────────────────────────────────────
// isPrivate: true  → found item images, proof images (stored privately)
// isPrivate: false → lost item images (shown publicly)
export const uploadImage = async (file, isPrivate = false) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('isPrivate', String(isPrivate));

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to upload image');
    return data;
  } catch (error) {
    console.error('Failed to upload image:', error);
    throw error;
  }
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────

// Owner requests clarification from finder
export const requestLocationClarification = async ({
  itemId,
  itemTitle,
  finderUid,
  requesterUid
}) => {
  try {
    const response = await fetch(`${API_URL}/notifications/request-clarification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, itemTitle, finderUid, requesterUid }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send request');
    return data;
  } catch (error) {
    console.error('Failed to request clarification:', error);
    throw error;
  }
};

// Get all notifications for a user (for bell dropdown)
export const getNotifications = async (uid) => {
  try {
    const response = await fetch(`${API_URL}/notifications/${uid}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
};

// Mark single notification as read
export const markNotificationRead = async (id) => {
  try {
    const response = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PATCH',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to mark notification read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async (uid) => {
  try {
    const response = await fetch(`${API_URL}/notifications/read-all/${uid}`, {
      method: 'PATCH',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to mark all read:', error);
    throw error;
  }
};