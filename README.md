Full Sail Lost & Found App – Authentication System

This project includes a complete authentication system for the Full Sail Lost & Found web application.
It allows students to create accounts, log in, reset passwords, and stay signed in securely.

The system uses Firebase Authentication and protects the app so only verified users can access it.

About the App

The Full Sail Lost & Found app helps students report lost items and post found items on campus.
Users must create an account before they can use the app.

The authentication system makes sure:

Only registered users can access the app

Emails are verified

Users stay logged in

Passwords can be reset safely

Features
User Accounts

Users can create an account using their email and password.

Login System

Users can log in and access the app securely.

Email Verification

Users must verify their email before using the app.

Password Reset

Users can reset their password if they forget it.

Persistent Login

Users stay logged in even after refreshing or closing the browser.

Protected Pages

Only logged in users can access the app.

How Authentication Works

The system uses Firebase Authentication to manage users.

When a user signs up:

The account is created

A verification email is sent

The user verifies their email

The user can log in

When a user logs in:

Firebase checks the email and password

The user is authenticated

The app becomes accessible

Main Files

These files control the authentication system:

firebase.js

Connects the app to Firebase.

AuthContext.jsx

Stores user login information across the app.

PrivateRoute.jsx

Prevents users from accessing the app without logging in.

Login.jsx

Login page.

Signup.jsx

Account creation page.

VerifyEmail.jsx

Email verification page.

ForgotPassword.jsx

Password reset page.

Project Structure
src/
 ├── config/
 │    firebase.js
 │
 ├── context/
 │    AuthContext.jsx
 │
 ├── components/
 │    PrivateRoute.jsx
 │
 ├── pages/
 │    Login.jsx
 │    Signup.jsx
 │    VerifyEmail.jsx
 │    ForgotPassword.jsx
 │
 └── App.jsx
Security

The authentication system includes:

Secure login

Email verification

Protected routes

Password reset

Persistent sessions

Users cannot access the app without logging in.

Running the Project

Install dependencies:

npm install

Start the project:

npm run dev
Learning Goals

This project demonstrates:

React Context

Firebase Authentication

Protected routes

User sessions

Form validation

Authentication flow

Future Improvements

Possible future features:

User profiles

Admin accounts

Notifications

Messaging system

Item tracking

Summary

This authentication system allows users to securely access the Full Sail Lost & Found app.
It provides login, signup, verification, and password reset functionality using Firebase.

The system ensures that only authenticated users can interact with the app.