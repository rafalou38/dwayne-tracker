import { initializeApp, applicationDefault, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue, Filter, } from 'firebase-admin/firestore';
import { getStorage, getDownloadURL } from "firebase-admin/storage";

import serviceAccount from "./serviceAccount.json";
import { Dwayne, Scan, dwayneNames } from './types';


const WEBHOOK_URL = serviceAccount.webhook;

async function send(data: any) {
    const result = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    console.log("Sent!");
    console.log(result.statusText, await result.json());
}


export async function getDwayneImageURL(code: string) {
    try {
        const fileRef = getStorage().bucket("dwayneop-f78db.appspot.com").file(`dwaynes/${code}`);
        const url = await getDownloadURL(fileRef);
        return url
    } catch (error) {
        return "https://cdn.discordapp.com/avatars/1223669938053709945/72bdbc802e0a590630442057431b40e4.webp?size=512"
    }
}


const app = initializeApp({
    credential: cert(serviceAccount as ServiceAccount)
});

console.log("Connected to app:", app.options.projectId);


const db = getFirestore();
const dwaynesRef = db.collection('dwaynes');

let cachedDwaynes = new Map<string, Dwayne>();
dwaynesRef.onSnapshot(querySnapshot => {
    querySnapshot.docChanges().forEach(async change => {
        const data = change.doc.data() as Dwayne;
        const old = cachedDwaynes.get(change.doc.id);
        if (change.type === 'modified' && old && data.finds != old.finds && data.finds > old.finds) {
            console.log('New Scan: ', data.code);

            send({
                username: dwayneNames[data.type] + ' #' + data.number,
                avatar_url: await getDwayneImageURL(data.code),
                content: `Je viens d'être scanné ! Scan n° ${data.finds}`,
            });

        }

        console.log("Cached: ", data.code);
        cachedDwaynes.set(change.doc.id, data);
    });
});


const scanRef = db.collection('scans');
const start = new Date();
scanRef.onSnapshot(querySnapshot => {
    querySnapshot.docChanges().forEach(async change => {
        const data = change.doc.data() as Scan;
        if (change.type === 'added' && data.time.toDate() > start) {
            console.log("New Comment: ", data.comment);

            await new Promise((resolve, reject) => setTimeout(resolve, 1000 + Math.random() * 5000));
            const dwayne = cachedDwaynes.get(data.code) as Dwayne;

            send({
                content: `Quelqu'un a laissé un commentaire !`,
                embeds: [
                    {
                        title: data.name + ' - ' + data.class + data.classID,
                        description: "```\n" + data.comment + "\n```",
                        thumbnail: { url: await getDwayneImageURL(data.code) },
                        color: 5763719,
                        footer: {
                            text: dwayne?.type ? dwayneNames[dwayne.type] + ' #' + dwayne.number : 'Dwayne the Unknown',
                        },
                        timestamp: data.time.toDate().toISOString(),
                    }
                ]
            });
        }
    });
})