import { functions } from './firebase';

/**
 * Call the twitchAuthentication cloud function to generate user and token of the new
 * qapla-twitch user
 * @param {string} uid User identifier
 * @param {string} displayName Username on twitch
 * @param {string} login Login string of twitch (regularly is the equal to the display name)
 * @param {string} photoUrl URL of twitch image
 * @param {string} email email of twitch
 */
export async function createUserWithTwitch(uid, displayName, login, photoUrl, email) {
    const authWithTwitch = functions.httpsCallable('twitchAuthentication');
    try {
        return await authWithTwitch({ uid, displayName, login, photoUrl, email });
    } catch (error) {
        console.log(error);
    }
}

/**
 * Send a push notification to the given topic
 * @param {string} topic Topic identifier
 * @param {object} titles Titles of the push notification (in different languages)
 * @param {object} bodys Bodys of the push notification (in different languages)
 * @param {object} extraData Data to send with the notification
 * @param {boolean} onlyData True if the message is an only data message, false for push notification
 */
export async function sednPushNotificationToTopic(topic, titles, bodys, extraData = {}, onlyData = false) {
    const notificateToTopic = functions.httpsCallable('notificateToTopic');

    return await notificateToTopic({ topic, titles, bodys, extraData, onlyData });
}

/**
 * Subscribe a user to the given Twitch webhook
 * @param {string} streamerId Streamer Twitch id
 * @param {string} type Webhook name to subscribe
 * @param {string} callback URL to call when webhook is called
 */
export async function subscribeStreamerToTwitchWebhook(streamerId, type, callback) {
    const authWithTwitch = functions.httpsCallable('subscribeStreamerToTwitchWebhook');
    try {
        return await authWithTwitch({ streamerId, type, callback });
    } catch (error) {
        console.log(error);
    }
}