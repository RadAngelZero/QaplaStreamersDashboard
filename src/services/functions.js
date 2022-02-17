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
 * @param {object} condition Conditions to apply to twitch webhook (broadcaster_user_id is added automatically, DONT add broadcaster_user_id here)
 */
export async function subscribeStreamerToTwitchWebhook(streamerId, type, callback, condition = {}) {
    const authWithTwitch = functions.httpsCallable('subscribeStreamerToTwitchWebhook');
    try {
        return await authWithTwitch({ streamerId, type, callback, condition });
    } catch (error) {
        console.log(error);
    }
}

/**
 * Call the distributeStreamRedemptionsRewards cloud function to distribute
 * XQ or Qoins
 * @param {string} streamerId Streamer uid
 * @param {string} streamerName Name of the streamer
 * @param {string} streamId Stream identifier
 * @param {('xq'|'qoins')} rewardType Type of reward to distribute
 * @param {array} redemptions Array of redemptions (List gattered from Twitch API)
 */
export async function distributeStreamRedemptionsRewards(streamerId, streamerName, streamId, rewardType, redemptions) {
    const distributeRewards = functions.httpsCallable('distributeStreamRedemptionsRewards');
    try {
        return await distributeRewards({ streamerId, streamerName, type: rewardType, streamId, redemptions });
    } catch (error) {
        console.log(error);
    }
}

/**
 * Call the cheerMessageTextToSpeech to convert the message in audio
 * @param {string} streamerId Streamer uid
 * @param {string} donationId Donation id
 * @param {string} message Message to convert in audio
 * @param {string} voiceName Selected voice from: https://cloud.google.com/text-to-speech/docs/voices
 * @param {string} languageCode Language code selected
 */
 export async function speakCheerMessage(streamerId, donationId, message, voiceName, languageCode) {
    const cheerMessageTextToSpeech = functions.httpsCallable('cheerMessageTextToSpeech');
    try {
        return await cheerMessageTextToSpeech({ streamerId, donationId, message, voiceName, languageCode });
    } catch (error) {
        console.log(error);
    }
}