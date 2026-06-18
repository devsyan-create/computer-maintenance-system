// Upload corrected data to Firestore
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function uploadData() {
  try {
    console.log('🔐 Authenticating...');
    const email = 'azher@syana.com';
    const password = 'aa44aa44';
    
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✓ Authenticated successfully\n');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🚀 Starting data upload to Firestore...\n');
    
    // 1. Upload Categories
    console.log('📦 Uploading categories...');
    const categories = JSON.parse(readFileSync('categories_final.json', 'utf8'));
    for (const category of categories) {
      await addDoc(collection(db, 'categories'), {
        name: category.name,
        createdAt: serverTimestamp()
      });
    }
    console.log(`✅ Uploaded ${categories.length} categories\n`);
    
    // 2. Upload Brands
    console.log('📦 Uploading brands...');
    const brands = JSON.parse(readFileSync('brands_final.json', 'utf8'));
    for (const brand of brands) {
      await addDoc(collection(db, 'brands'), {
        name: brand.name,
        createdAt: serverTimestamp()
      });
    }
    console.log(`✅ Uploaded ${brands.length} brands\n`);
    
    // 3. Upload Locations
    console.log('📦 Uploading locations...');
    const locations = JSON.parse(readFileSync('locations_final.json', 'utf8'));
    for (const location of locations) {
      await addDoc(collection(db, 'locations'), {
        name: location.name,
        assetCount: location.assetCount || 0,
        createdAt: serverTimestamp()
      });
    }
    console.log(`✅ Uploaded ${locations.length} locations\n`);
    
    // 4. Upload Assets
    console.log('📦 Uploading assets (this will take a while)...');
    const assets = JSON.parse(readFileSync('assets_final.json', 'utf8'));
    let uploaded = 0;
    
    for (const asset of assets) {
      await addDoc(collection(db, 'assets'), {
        ...asset,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      uploaded++;
      
      if (uploaded % 20 === 0) {
        console.log(`  → Uploaded ${uploaded}/${assets.length} assets...`);
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    console.log(`✅ Uploaded ${assets.length} assets\n`);
    
    console.log('✅ All data uploaded successfully!\n');
    console.log('📊 Summary:');
    console.log(`  • Categories: ${categories.length}`);
    console.log(`  • Brands: ${brands.length}`);
    console.log(`  • Locations: ${locations.length}`);
    console.log(`  • Assets: ${assets.length}`);
    console.log('\n🎉 Data is now available in your website!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

uploadData();
