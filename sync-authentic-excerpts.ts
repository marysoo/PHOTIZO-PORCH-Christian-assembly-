import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import fs from 'fs';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

interface AuthenticPhoto {
  file: string;
  title: string;
  category: string;
  source: string;
}

const authenticPhotos: AuthenticPhoto[] = [
  { file: 'upload_0_Hour_of_worship.jpeg', title: 'Hour of Divine Worship', category: 'Worship Atmosphere', source: 'Photizo Assembly' },
  { file: 'upload_1_Hour_of_worship.jpeg', title: 'Deep Fellowship in His Presence', category: 'Worship Atmosphere', source: 'Photizo Assembly' },
  { file: 'upload_2_Prayers___.jpeg', title: 'Prayers of Intercession & Power', category: 'Prophetic Altar', source: 'Prophet Japhet Tsukwas' },
  { file: 'upload_3_Worship.jpeg', title: 'Atmosphere of Intense Praise & Honor', category: 'Worship Atmosphere', source: 'Photizo Assembly' },
  { file: 'upload_4_Worship.jpeg', title: 'Hearts Lifted in Holy Worship', category: 'Worship Atmosphere', source: 'Photizo Assembly' },
  { file: 'upload_5_Worship.jpeg', title: 'The Assembly in Sacred Adoration', category: 'Worship Atmosphere', source: 'Photizo Assembly' },
  { file: 'upload_6_Engrossed_in_worship.jpeg', title: 'Engrossed in the Glory of His Presence', category: 'Prophetic Word', source: 'Prophet Japhet Tsukwas' },
  { file: 'upload_7_Hour_of_worship.jpeg', title: 'Supernatural Encounters in the Porch', category: 'Worship Atmosphere', source: 'Photizo Assembly' },
  { file: 'upload_8_Hour_of_worship.jpeg', title: 'Rejoicing in His Manifest Glory', category: 'Worship Atmosphere', source: 'Photizo Assembly' },
  { file: 'upload_9_Humanitarian_service.jpeg', title: 'Humanitarian Outreach & Welfare Service', category: 'Love in Action', source: 'Photizo Outreach Team' },
  { file: 'upload_10_Humanitarian_service.jpeg', title: 'Hands of Honor: Serving Our Community', category: 'Love in Action', source: 'Photizo Outreach Team' },
  { file: 'upload_11_Humanitarian_service.jpeg', title: 'Empowering Families with Essential Care', category: 'Love in Action', source: 'Photizo Outreach Team' },
  { file: 'upload_12_Humanitarian_service.jpeg', title: 'Joyful Giving & Practical Kingdom Love', category: 'Love in Action', source: 'Photizo Outreach Team' },
  { file: 'upload_13_Humanitarian_service.jpeg', title: 'Reaching the Vulnerable with Divine Compassion', category: 'Love in Action', source: 'Photizo Outreach Team' },
  { file: 'upload_14_Humanitarian_service.jpeg', title: 'Distributing Hope and Sustenance', category: 'Love in Action', source: 'Photizo Outreach Team' },
  { file: 'upload_15_Humanitarian_service.jpeg', title: 'Blessed to Be a Blessing to Many', category: 'Love in Action', source: 'Photizo Outreach Team' },
  { file: 'upload_16_Humanitarian_service.jpeg', title: 'Kingdom Care in Motion', category: 'Love in Action', source: 'Photizo Outreach Team' },
];

async function syncExcerpts() {
  console.log('Clearing old excerpts...');
  const snap = await getDocs(collection(db, 'excerpts'));
  for (const d of snap.docs) {
    await deleteDoc(doc(db, 'excerpts', d.id));
  }

  console.log('Writing authentic uploaded photos to Firestore...');
  for (let i = 0; i < authenticPhotos.length; i++) {
    const p = authenticPhotos[i];
    const filePath = `./public/user_uploads/${p.file}`;
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      
      const docId = `upload_${Date.now()}_${i}`;
      await setDoc(doc(db, 'excerpts', docId), {
        text: p.title,
        source: p.source,
        category: p.category,
        imageUrl: base64, // Also works directly with /user_uploads/${p.file} fallback
        fallbackUrl: `/user_uploads/${p.file}`
      });
      console.log(`Synced: ${p.title} (${p.file})`);
    }
  }

  console.log('Sync complete!');
  process.exit(0);
}

syncExcerpts().catch(e => {
  console.error(e);
  process.exit(1);
});
