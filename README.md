# 🎒 Full Sail Lost & Found

A campus lost and found web application that helps students report lost items, post found items, and reconnect owners with their belongings.

This project was built to make the lost and found process easier, faster, and more organized for students on campus.

---

# 📌 About the Project

Students often lose items on campus but don’t know where to check or who to ask.  
This app provides a centralized place where students can:

- Report lost items
- Post found items
- Search for items
- Get notified about matches
- Reconnect with owners

The goal is to create a simple and secure system that improves the chances of returning lost items.

---

# ✨ Features

## 🔍 Lost Item Reports
Students can report items they have lost by including:
- Item name
- Category
- Location
- Date
- Description
- Optional image

Lost items are visible to other users so they can help find them.

---

## 📦 Found Item Reports
Students can report items they have found by including:
- Item name
- Category
- Found location
- Current location
- Date
- Private image for verification

Found item images are stored privately to prevent false claims.

---

## 🔗 Lost & Found Matching

Users can connect found items to lost items using the:

**"I Found This"** button

This helps:
- Notify the owner
- Link related posts
- Speed up item recovery

---

## 🔐 Authentication System

Users must create an account to use the app.

Features include:
- Signup
- Login
- Email verification
- Password reset
- Persistent login sessions

Only authenticated users can access the app.

---

## 🔔 Notifications

Users receive notifications when:
- Someone finds their item
- A match is created
- Updates occur

This helps users stay informed without constantly checking.

---

## 🖼️ Image Privacy System

The app uses a privacy-focused image system:

### Lost Items
- Public image (optional)
- Private proof image (optional)

### Found Items
- Images are always private
- Used only for verification

This prevents people from falsely claiming items.

---

## 📍 Location Information

Users can include location information when posting items.

Examples:
- Library
- Parking lot
- Classroom
- Cafeteria

This helps narrow down where items might be.

---

# 🧠 How It Works

## Reporting a Lost Item

1. User reports a lost item  
2. Item appears in the system  
3. Other users can see it  
4. If someone finds it, they can connect it  

---

## Reporting a Found Item

1. User reports a found item  
2. Item is stored in the system  
3. Owner can be notified  
4. Item can be returned  

---

## Matching Items

1. User clicks **"I Found This"**  
2. Found item is linked to lost item  
3. Owner is notified  
4. They arrange pickup  

---

# 📁 Project Structure

```

src/
├── components/
├── context/
├── hooks/
├── pages/
├── services/
├── config/
└── App.jsx

````

---

# 🛠️ Technologies Used

### Frontend
- React
- React Router
- Context API
- Tailwind CSS

### Backend
- Node.js
- Express

### Database & Auth
- Firebase
- Firestore
- Firebase Authentication

### Storage
- Firebase Storage

---

# 🔐 Security Features

The app includes several security measures:

- Email verification
- Secure authentication
- Protected routes
- Private images
- Ownership verification

These features help ensure items go back to the correct owner.

---

# 🚀 Getting Started

## Install Dependencies

```bash
npm install
````

## Run the App

```bash
npm run dev
```

---

# 🎯 Goals of the Project

This project was built to:

* Help students recover lost items
* Create a centralized lost and found
* Improve campus communication
* Practice full-stack development
* Learn authentication systems
* Build real-world applications

---

# 🔮 Future Improvements

Possible future features:

* Advanced search filters
* Item status tracking
* Campus map integration
* SMS notifications
* Admin dashboard
* Auto-match system
* Claim system

---

# 📖 What I Learned

This project helped me learn:

* React development
* Authentication systems
* API integration
* State management
* Full-stack development
* User experience design

---

# ⭐ Summary

The Full Sail Lost & Found app helps students reconnect with lost items through a simple and secure platform.

Users can:

* Report lost items
* Post found items
* Connect matches
* Receive notifications
* Recover belongings

```

