import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  const snap = await getDocs(collection(db, 'excerpts'));
  console.log('EXCERPTS COUNT:', snap.docs.length);
  snap.docs.forEach(d => {
    const data = d.data();
    console.log(d.id, '--> imageUrl:', data.imageUrl ? data.imageUrl.substring(0, 80) : 'none', '| cat:', data.category, '| text:', data.text?.substring(0, 40));
  });

  const secSnap = await getDocs(collection(db, 'sections'));
  console.log('SECTIONS COUNT:', secSnap.docs.length);
  secSnap.docs.forEach(d => {
    const data = d.data();
    console.log(d.id, '--> imageUrl:', data.imageUrl ? data.imageUrl.substring(0, 80) : 'none', '| title:', data.title);
  });
  process.exit(0);
}

check().catch(e => {
  console.error(e);
  process.exit(1);
});
