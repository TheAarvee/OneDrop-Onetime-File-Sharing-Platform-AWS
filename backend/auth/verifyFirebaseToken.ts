import { getFirebaseAdmin } from "../../firebase/firebaseAdmin";

export async function verifyFirebaseToken(authHeader: string): Promise<string | null> {
    try {
        if (!authHeader) {
            throw new Error("No token provided");
        }
        // Strip "Bearer " prefix if present
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
        const firebaseAdmin = getFirebaseAdmin();
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying Firebase token:", error);
        return null;
    }
}