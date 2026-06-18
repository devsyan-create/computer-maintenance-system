// Delete all data from Firestore
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
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

async function deleteAllData() {
  try {
    console.log('🔐 Authenticating...');
    const email = 'azher@syana.com';
    const password = 'aa44aa44';
    
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✓ Authenticated\n');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🗑️  Deleting all data from Firestore...\n');
    
    const collections_to_delete = ['categories', 'brands', 'locations', 'assets', 'maintenance', 'transfers', 'maintenanceTypes', 'maintenanceLocations'];
    
    for (const collectionName of collections_to_delete) {
      console.log(`📦 Deleting ${collectionName}...`);
      const snapshot = await getDocs(collection(db, collectionName));
      
      if (snapshot.empty) {
        console.log(`  ✓ ${collectionName}: already empty (0 docs)`);
        continue;
      }
      
      let deleted = 0;
      for (const document of snapshot.docs) {
        await deleteDoc(doc(db, collectionName, document.id));
        deleted++;
        
        if (deleted % 10 === 0) {
          console.log(`    → Deleted ${deleted}/${snapshot.size}...`);
        }
      }
      
      console.log(`  ✓ ${collectionName}: deleted ${deleted} documents\n`);
      
      // Small delay between collections
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('✅ All data deleted successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

deleteAllData();
