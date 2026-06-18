#!/bin/bash

# Script to set up Netlify environment variables
# Run this after: netlify login && netlify init

echo "Setting up Netlify environment variables..."

netlify env:set VITE_FIREBASE_API_KEY "AIzaSyDAX5WbGYqz6ASWQ7QqrAYJgZqHb_LO9LM"
netlify env:set VITE_FIREBASE_AUTH_DOMAIN "computer-syana.firebaseapp.com"
netlify env:set VITE_FIREBASE_PROJECT_ID "computer-syana"
netlify env:set VITE_FIREBASE_STORAGE_BUCKET "computer-syana.firebasestorage.app"
netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "110153829555"
netlify env:set VITE_FIREBASE_APP_ID "1:110153829555:web:1a970060724c30d01b74c6"
netlify env:set VITE_FIREBASE_MEASUREMENT_ID "G-0953Q1G098"

echo "✅ Environment variables set successfully!"
echo "Now run: npm run build && netlify deploy --prod"
