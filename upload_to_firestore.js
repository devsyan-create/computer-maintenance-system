// Script to upload data to Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';

// Firebase config - read from .env
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadData() {
  try {
    console.log('🚀 Starting data upload to Firestore...\n');
    
    // 1. Upload Categories
    console.log('📦 Uploading categories...');
    const categories = JSON.parse(readFileSync('categories_import.json', 'utf8'));
    for (const category of categories) {
      await addDoc(collection(db, 'categories'), {
        name: category.name,
        createdAt: serverTimestamp()
      });
    }
    console.log(`✓ Uploaded ${categories.length} categories\n`);
    
    // 2. Upload Brands
    console.log('📦 Uploading brands...');
    const brands = JSON.parse(readFileSync('brands_import.json', 'utf8'));
    for (const brand of brands) {
      await addDoc(collection(db, 'brands'), {
        name: brand.name,
        createdAt: serverTimestamp()
      });
    }
    console.log(`✓ Uploaded ${brands.length} brands\n`);
    
    // 3. Upload Locations
    console.log('📦 Uploading locations...');
    const locations = JSON.parse(readFileSync('locations_import.json', 'utf8'));
    for (const location of locations) {
      await addDoc(collection(db, 'locations'), {
        name: location.name,
        createdAt: serverTimestamp()
      });
    }
    console.log(`✓ Uploaded ${locations.length} locations\n`);
    
    // 4. Upload Assets (in batches to avoid rate limits)
    console.log('📦 Uploading assets...');
    const assets = JSON.parse(readFileSync('assets_import.json', 'utf8'));
    let uploaded = 0;
    
    for (const asset of assets) {
      await addDoc(collection(db, 'assets'), {
        ...asset,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      uploaded++;
      
      // Show progress every 50 items
      if (uploaded % 50 === 0) {
        console.log(`  → Uploaded ${uploaded}/${assets.length} assets...`);
      }
      
      // Small delay to avoid rate limits
      if (uploaded % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    console.log(`✓ Uploaded ${assets.length} assets\n`);
    
    console.log('✅ All data uploaded successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Categories: ${categories.length}`);
    console.log(`  - Brands: ${brands.length}`);
    console.log(`  - Locations: ${locations.length}`);
    console.log(`  - Assets: ${assets.length}`);
    
  } catch (error) {
    console.error('❌ Error uploading data:', error);
    process.exit(1);
  }
}

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

uploadData();
