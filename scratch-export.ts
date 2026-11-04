import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import fs from 'fs';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function exportImages() {
  const snap = await getDocs(collection(db, 'excerpts'));
  fs.mkdirSync('./public/user_uploads', { recursive: true });
  
  let i = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.imageUrl && data.imageUrl.startsWith('data:image')) {
      const match = data.imageUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (match) {
        const ext = match[1];
        const base64Data = match[2];
        const fileName = `upload_${i}_${data.text ? data.text.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20) : 'img'}.${ext}`;
        fs.writeFileSync(`./public/user_uploads/${fileName}`, Buffer.from(base64Data, 'base64'));
        console.log(`Saved: ${fileName} (${data.category})`);
        i++;
      }
    }
  }
  process.exit(0);
}

exportImages().catch(e => {
  console.error(e);
  process.exit(1);
});
