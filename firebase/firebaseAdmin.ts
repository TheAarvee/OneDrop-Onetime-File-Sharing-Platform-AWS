import * as admin from 'firebase-admin';

function getFirebaseAdmin(): typeof admin {
    if (admin.apps.length > 0) {
        return admin;
    }

    const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        console.error('Firebase Admin: Missing required environment variables', {
            hasProjectId: !!projectId,
            hasClientEmail: !!clientEmail,
            hasPrivateKey: !!privateKey,
        });
        throw new Error('Firebase Admin initialization failed: Missing credentials');
    }

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });

    return admin;
}

export { getFirebaseAdmin };
