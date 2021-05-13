import {
    giveStreamExperienceForRewardRedeemed,
    updateStreamerProfile,
    saveStreamerTwitchCustomReward,
    removeStreamerTwitchCustomReward,
    saveCustomRewardRedemption,
    getCustomRewardRedemptions,
    getUserByTwitchId,
    isUserRegisteredToStream,
    addQoinsToUser,
    addInfoToEventParticipants
} from './database';
import { TWITCH_CLIENT_ID, TWITCH_SECRET_ID } from '../utilities/Constants';

let webSocket;

/**
 * Establish a connection between the dashboard and the twitch using web sockets
 * @param {string} uid User identifier
 * @param {string} accessToken Twitch access token
 * @param {array} topics Array of strings with the topics to listen
 * @param {stirng} rewardId Id of the qapla custom reward
 * @param {number} timestamp Timestamp of the start hour of the stream
 * @param {function} onInvalidRefreshToken Callback for invalid twitch refresh token
 */
export function connect(streamId, uid, accessToken, topics, rewardId, timestamp, onInvalidRefreshToken) {
    let pingInterval = 1000 * 60;
    let reconnectInterval = 1000 * 3;
    let pingHandle;

    webSocket = new WebSocket('wss://pubsub-edge.twitch.tv');

    webSocket.onopen = (error) => {
        ping();
        pingHandle = setInterval(ping, pingInterval);
        listen(topics, accessToken, uid, onInvalidRefreshToken);
    };

    webSocket.onerror = (error) => {
        console.log(error);
    };

    webSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log(message);
        if (message.data) {
            const reward = JSON.parse(message.data.message);
            if (reward.type === 'reward-redeemed') {
                const redemptionData = reward.data.redemption;
                handleCustomRewardRedemption(streamId, rewardId, redemptionData, timestamp);
            }

            if (message.type === 'RECONNECT') {
                setTimeout(() => connect(streamId, uid, accessToken, topics, onInvalidRefreshToken), reconnectInterval);
            }
        }
    };

    webSocket.onclose = () => {
        clearInterval(pingHandle);
    };
}

export function closeConnection() {
    webSocket.close();
}

/**
 * Fulfill any redemption of the Qapla custom reward redeemed by Qapla users who are subscribed
 * to the given stream and cancel any redemption of the Qapla custom reward for no users or users
 * not subscribed to the event. Ignore any other custom reward redemption
 * @param {string} streamId Streamer Twitch id
 * @param {string} rewardId Qapla Custom Reward Id
 * @param {object} redemptionData Redemption twitch object
 * @param {number} timestamp Timestamp of the start hour of the stream
 */
export async function handleCustomRewardRedemption(streamId, rewardId, redemptionData, timestamp) {
    console.log(redemptionData);
    const date = new Date();
    /**
     * Allow only redemptions during the first 3 and a half hours of a stream
     */
    if (date.getTime() < timestamp + 12600000) {
        if (redemptionData.reward.id === rewardId) {
            console.log('Qapla Custom reward redeemed', redemptionData.user.id);
            const user = await getUserByTwitchId(redemptionData.user.id);
            if (user) {
                console.log('Redeemed by qapla user:', user.id);
                const isUserParticipantOfStream = await isUserRegisteredToStream(user.id, streamId);
                if (isUserParticipantOfStream) {
                    console.log(`User ${user.id} is subscribed to stream`);
                    await saveCustomRewardRedemption(user.id, user.photoUrl, redemptionData.user.id, redemptionData.user.display_name, streamId, redemptionData.id, redemptionData.reward.id, redemptionData.status);
                    const redemptionsSaved = await getCustomRewardRedemptions(streamId, user.id);

                    const numberOfRedemptionsSaved = Object.keys(redemptionsSaved.val()).length;
                    if (numberOfRedemptionsSaved === 1) {
                        giveStreamExperienceForRewardRedeemed(user.id, user.qaplaLevel, user.userName, 15);
                        addInfoToEventParticipants(streamId, user.id, 'xqRedeemed', 15);
                    } else if (numberOfRedemptionsSaved === 2) {
                        addQoinsToUser(user.id, 10);
                        addInfoToEventParticipants(streamId, user.id, 'qoinsRedeemed', 10);
                    }
                    return;
                } else {
                    console.log(`User ${user.id} is NOT subscribed to stream`);
                }
            }
        }
    }
}

/**
 * Send a LISTEN request to twitch to tell them what topics we want to listen
 * @param {array} topics Array of strings with the topics to listen
 * @param {string} accessToken Twitch access token
 * @param {string} uid User identifier
 * @param {function} onInvalidRefreshToken Callback for invalid twitch refresh token
 */
export async function listen(topics, accessToken, uid, onInvalidRefreshToken) {
    const twitchAccessTokenStatus = await getTwitchAccessTokenStatus(accessToken);
    if (twitchAccessTokenStatus === 401) {
        await refreshTwitchToken(uid, accessToken, onInvalidRefreshToken);
        return await listen(topics, accessToken, uid, onInvalidRefreshToken);
    }

    const message = {
        type: 'LISTEN',
        nonce: nonce(15),
        data: {
            topics: topics,
            auth_token: accessToken
        }
    };

    setTimeout(() => webSocket.send(JSON.stringify(message)), 1250);
}

/**
 * Send a ping to twitch
 */
function ping() {
    const message = {
        type: 'PING'
    };

    if (webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(JSON.stringify(message));
    }
}

/**
 * Return a random string of the specified length
 * @param {string} length Size of the string
 */
function nonce(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

/**
 * Create a custom reward in the user´s twitch
 * @param {string} uid User identifier
 * @param {string} twitchId Twitch identifier
 * @param {string} accessToken Twitch access token
 * @param {string} title Title of the reward
 * @param {number} cost Cost for redeem the reward
 * @param {function} onInvalidRefreshToken Callback for invalid twitch refresh token
 */
export async function createCustomReward(uid, twitchId, accessToken, title, cost, onInvalidRefreshToken) {
    try {
        const twitchAccessTokenStatus = await getTwitchAccessTokenStatus(accessToken);
        if (twitchAccessTokenStatus === 401) {
            await refreshTwitchToken(uid, accessToken, onInvalidRefreshToken);
            return createCustomReward(uid, twitchId, accessToken, title, cost, onInvalidRefreshToken);
        }

        let res = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${twitchId}`, {
            method: 'POST',
            headers: {
                'Client-Id': TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                title,
                cost,
                is_max_per_user_per_stream_enabled: true,
                max_per_user_per_stream: 2,
                is_max_per_stream_enabled: false,
                is_enabled: true
            })
        });

        const response = await res.json();
        if (response.data && response.data[0]) {
            saveStreamerTwitchCustomReward(uid, response.data[0].id, response.data[0].title, response.data[0].cost);

            return response.data[0];
        }
    } catch (e) {
        console.log('Error: ', e);
    }
}

/**
 * Delete a custom reward in the user´s twitch
 * @param {string} uid User identifier
 * @param {string} twitchId Twitch identifier
 * @param {string} accessToken Twitch access token
 * @param {string} rewardId Id of the reward to delete
 * @param {function} onInvalidRefreshToken Callback for invalid twitch refresh token
 */
export async function deleteCustomReward(uid, twitchId, accessToken, rewardId, onInvalidRefreshToken) {
    try {
        const twitchAccessTokenStatus = await getTwitchAccessTokenStatus(accessToken);
        if (twitchAccessTokenStatus === 401) {
            await refreshTwitchToken(uid, accessToken, onInvalidRefreshToken);
            return await deleteCustomReward(uid, twitchId, accessToken, rewardId, onInvalidRefreshToken);
        }

        let response = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${twitchId}&id=${rewardId}`, {
            method: 'DELETE',
            headers: {
                'Client-Id': TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=utf-8'
            }
        });

        if (response.status === 204 ) {
            removeStreamerTwitchCustomReward(uid, response.data[0].id, response.data[0].title, response.data[0].cost);
        }

        return response.status;
    } catch (e) {
        console.log('Error: ', e);
    }
}

/**
 * Update the status of the given redemption
 * @param {string} uid Streamer user identifier
 * @param {string} redemptionId Redemption twitch identifier
 * @param {strint} streamerId Streamer Twitch id
 * @param {string} accessToken Twitch access token
 * @param {string} rewardId Qapla custom reward identifier
 * @param {string} status Status to assign (FULFILLED or CANCELED)
 * @param {function} onInvalidRefreshToken Callback for invalid tokens
 */
export async function updateRedemptionStatus(uid, redemptionId, streamerId, accessToken, rewardId, status, onInvalidRefreshToken) {
    console.log('Fulfill Redemption:', status, redemptionId);
    const twitchAccessTokenStatus = await getTwitchAccessTokenStatus(accessToken);
    if (twitchAccessTokenStatus === 401) {
        await refreshTwitchToken(uid, accessToken, onInvalidRefreshToken);
        return await updateRedemptionStatus(uid, redemptionId, streamerId, accessToken, rewardId, status, onInvalidRefreshToken);
    }

    console.log('Fulfill Redemption:', status, redemptionId);

    let response = await fetch('https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?' +
    `&broadcaster_id=${streamerId}` +
    `&reward_id=${rewardId}` +
    `&id=${redemptionId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            headers: {
                'Client-Id': TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                status
            })
        }
    });

    response = await response.json();

    console.log(response);

    return response.data[0].status;
}

/**
 * Try to refresh the token if it can´t then call the onInvalidRefreshToken callback
 * @param {string} uid User identifier
 * @param {string} accessToken Twitch acces token
 * @param {function} onInvalidRefreshToken Callback for invalid twitch refresh token
 */
export async function refreshTwitchToken(uid, accessToken, onInvalidRefreshToken) {
    let algo = await fetch('https://id.twitch.tv/oauth2/token?grant_type=refresh_token' +
    `&refresh_token=${accessToken}` +
    `&client_id=${TWITCH_CLIENT_ID}` +
    `&client_secret=${TWITCH_SECRET_ID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    });

    const result = (await algo.json());
    if (result.status === 400) {
        await onInvalidRefreshToken();
    } else {
        await updateStreamerProfile(uid, { twitchAccessToken: result.access_token, refreshToken: result.refresh_token });

        return result;
    }
}

/**
 * Check if a twitch access token is valid, 200 if it is valid
 * @param {string} twitchAccessToken Twitch access token
 */
export async function getTwitchAccessTokenStatus(twitchAccessToken) {
    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
        headers: {
            Authorization: `OAuth ${twitchAccessToken}`
        }
    });

    return response.status;
}