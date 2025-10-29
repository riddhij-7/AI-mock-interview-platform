import {initializeApp, getApps, cert} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";

const initFirebaseAdmin = () => {
    const apps = getApps();
    let app;

    if(!apps.length){
        app = initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g,"\n")
            })
        })
    }else {
        app = apps[0];
    }
    return {
        auth: getAuth(app),
        db: getFirestore(app)
    }
}
export const {auth, db} = initFirebaseAdmin();