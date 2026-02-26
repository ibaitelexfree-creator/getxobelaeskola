
import { google } from 'googleapis';

const drive = google.drive('v3');

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const auth = new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly']
});

export async function listFiles(folderId?: string) {
    if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
        console.warn('Google Drive credentials missing.');
        return [];
    }

    try {
        const q = folderId ? `'${folderId}' in parents and trashed = false` : 'trashed = false';
        const res = await drive.files.list({
            auth,
            q,
            fields: 'files(id, name, mimeType, webViewLink, modifiedTime, thumbnailLink)',
            orderBy: 'modifiedTime desc',
            pageSize: 10
        });
        return res.data.files || [];
    } catch (error) {
        console.error('Error listing Google Drive files:', error);
        return [];
    }
}

export async function getFileInfo(fileId: string) {
    try {
        const res = await drive.files.get({
            auth,
            fileId,
            fields: 'id, name, mimeType, webViewLink, description, size'
        });
        return res.data;
    } catch (error) {
        console.error('Error getting Google Drive file info:', error);
        return null;
    }
}
