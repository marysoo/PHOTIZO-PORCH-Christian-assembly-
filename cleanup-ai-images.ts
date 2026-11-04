import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import fs from 'fs';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function clean() {
  console.log('Cleaning Firestore excerpts...');
  const snap = await getDocs(collection(db, 'excerpts'));
  let deletedCount = 0;
  let keptCount = 0;

  for (const d of snap.docs) {
    const data = d.data();
    const url = data.imageUrl || '';
    
    // Check if it's an AI generated image
    const isAiImage = 
      url.includes('humanitarian_') || 
      url.includes('prophet_japhet_') ||
      url.includes('ai-studio') ||
      url.startsWith('/images/humanitarian') ||
      url.startsWith('/images/prophet_japhet');

    if (isAiImage) {
      console.log(`Deleting AI excerpt ${d.id}: ${url} | ${data.text?.substring(0, 30)}`);
      await deleteDoc(doc(db, 'excerpts', d.id));
      deletedCount++;
    } else {
      console.log(`Keeping authentic excerpt ${d.id}: ${url.startsWith('data:') ? 'User Uploaded Photo (' + data.text + ')' : url}`);
      keptCount++;
    }
  }

  console.log(`Done! Deleted ${deletedCount} AI excerpts. Kept ${keptCount} excerpts.`);

  // Check section 'about'
  const aboutRef = doc(db, 'sections', 'about');
  try {
    const aboutSnap = await getDocs(collection(db, 'sections'));
    for (const sDoc of aboutSnap.docs) {
      if (sDoc.id === 'about') {
        const sData = sDoc.data();
        if (sData.imageUrl && (sData.imageUrl.includes('prophet_japhet') || sData.imageUrl.includes('humanitarian'))) {
          console.log('Clearing AI generated image from about section...');
          await updateDoc(aboutRef, { imageUrl: '' });
        }
      }
    }
  } catch (err) {
    console.error('Error updating about section:', err);
  }

  process.exit(0);
}

clean().catch(e => {
  console.error(e);
  process.exit(1);
});
