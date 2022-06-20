import { storage } from './firebase';

/**
 * Upload an image to firebase storage
 * @param {file} image Image to save
 * @param {string} ref Path to save the image (E.g: folder/imageName)
 * @param {function} updateUploadStatus Function called every time the state of the upload changes
 * @param {function} onError Function called if there is an error during the upload
 * @param {function} onFinished Function called when the process is over (and succesful)
 */
export function uploadImage(image, ref, updateUploadStatus, onError, onFinished) {
    const uploadTask = storage.ref(ref).put(image);

    uploadTask.on('state_changed', (snapshot) => {
        updateUploadStatus(snapshot.bytesTransferred / snapshot.totalBytes);
    }, (error) => {
        onError(error);
    }, async () => {
        const url = await storage.ref(ref).getDownloadURL();

        onFinished(url);
    });
}

/**
 * Get the downloadURL for the voice message of the specified cheer
 * @param {string} uid User identifier
 * @param {string} cheerId Cheer identifier
 * @returns {Promise<any>} A Promise that resolves with the download URL or rejects if the fetch failed,
 * including if the object did not exist.
 */
export async function getCheerVoiceMessage(uid, cheerId) {
    const cheerMessage = await storage.ref('Cheers').child(uid).child(`${cheerId}.mp3`).getDownloadURL();

    return cheerMessage;
}