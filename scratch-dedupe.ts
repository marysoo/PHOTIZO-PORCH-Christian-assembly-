import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function dedupe() {
  const snap = await getDocs(collection(db, 'excerpts'));
  const seen = new Set<string>();
  let dupesDeleted = 0;

  for (const d of snap.docs) {
    const data = d.data();
    // Unique key: text + imageUrl
    const key = `${data.text?.trim()}___${data.imageUrl?.substring(0, 50)}`;
    if (seen.has(key)) {
      console.log(`Deleting duplicate excerpt ${d.id}: ${data.text?.substring(0, 30)}`);
      await deleteDoc(doc(db, 'excerpts', d.id));
      dupesDeleted++;
    } else {
      seen.add(key);
    }
  }

  console.log(`Deduplication complete. Deleted ${dupesDeleted} duplicates. Total remaining: ${seen.size}`);
  process.exit(0);
}

dedupe().catch(e => {
  console.error(e);
  process.exit(1);
});
