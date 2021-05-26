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
    addInfoToEventParticipants,
    saveUserStreamReward,
    saveCustomRewardNonRedemption
} from './database';
import { TWITCH_CLIENT_ID, TWITCH_SECRET_ID, XQ, QOINS } from '../utilities/Constants';

let webSocket = new WebSocket('wss://pubsub-edge.twitch.tv');

/**
 * Establish a connection between the dashboard and the twitch using web sockets
 * @param {string} streamId Id of the stream on database
 * @param {string} streamerName Name of the streamer
 * @param {string} uid User identifier
 * @param {string} accessToken Twitch access token
 * @param {array} topics Array of strings with the topics to listen
 * @param {stirng} rewardId Id of the qapla custom reward
 * @param {number} timestamp Timestamp of the start hour of the stream
 * @param {function} onInvalidRefreshToken Callback for invalid twitch refresh token
 */
export function connect(streamId, streamerName, uid, accessToken, refreshToken, topics, rewardId, timestamp, onInvalidRefreshToken) {
    let pingInterval = 1000 * 60;
    let reconnectInterval = 1000 * 3;
    let pingHandle;

    webSocket.onopen = (error) => {
        ping();
        pingHandle = setInterval(ping, pingInterval);
        listen(topics, accessToken, refreshToken, uid, onInvalidRefreshToken);
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
                handleCustomRewardRedemption(streamId, streamerName, rewardId, redemptionData, timestamp);
            }

            if (message.type === 'RECONNECT') {
                setTimeout(() => connect(streamId, streamerName, uid, accessToken, topics, onInvalidRefreshToken), reconnectInterval);
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
 * @param {string} streamerName Name of the streamer
 * @param {string} rewardId Qapla Custom Reward Id
 * @param {object} redemptionData Redemption twitch object
 * @param {number} timestamp Timestamp of the start hour of the stream
 */
export async function handleCustomRewardRedemption(streamId, streamerName, rewardId, redemptionData, timestamp) {
    console.log(redemptionData);
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
                    saveUserStreamReward(user.id, XQ, streamerName, streamId, 15);
                } else if (numberOfRedemptionsSaved === 2) {
                    addQoinsToUser(user.id, 10);
                    addInfoToEventParticipants(streamId, user.id, 'qoinsRedeemed', 10);
                    saveUserStreamReward(user.id, QOINS, streamerName, streamId, 10);
                }
                return;
            } else {
                console.log(`User ${user.id} is NOT subscribed to stream`);
                await saveCustomRewardNonRedemption(user.id, user.photoUrl, redemptionData.user.id, redemptionData.user.display_name, streamId, redemptionData.id, redemptionData.reward.id, redemptionData.status);
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
export async function listen(topics, accessToken, refreshToken, uid, onInvalidRefreshToken) {
    const twitchAccessTokenStatus = await getTwitchAccessTokenStatus(accessToken);
    if (twitchAccessTokenStatus === 401) {
        const newCredentials = await refreshTwitchToken(uid, refreshToken, onInvalidRefreshToken);
        if (newCredentials) {
            return await listen(topics, newCredentials.access_token, newCredentials.refresh_token, uid, onInvalidRefreshToken);
        }
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
 * @param {string} streamId Id of the stream event
 */
export async function createCustomReward(uid, twitchId, accessToken, refreshToken, title, cost, onInvalidRefreshToken, streamId) {
    try {
        const twitchAccessTokenStatus = await getTwitchAccessTokenStatus(accessToken);
        if (twitchAccessTokenStatus === 401) {
            const newCredentials = await refreshTwitchToken(uid, refreshToken, onInvalidRefreshToken);
            if (newCredentials) {
                return createCustomReward(uid, twitchId, newCredentials.access_token, newCredentials.refresh_token, title, cost, onInvalidRefreshToken, streamId);
            }
        }

        let res = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${twitchId}`, {
            method: 'POST',
            headers: {
                'Client-Id': TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
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
        console.log(response);
        if (response.data && response.data[0]) {
            saveStreamerTwitchCustomReward(uid, response.data[0].id, response.data[0].title, response.data[0].cost, streamId);

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
export async function deleteCustomReward(uid, twitchId, accessToken, refreshToken, rewardId, onInvalidRefreshToken) {
    try {
        const twitchAccessTokenStatus = await getTwitchAccessTokenStatus(accessToken);
        if (twitchAccessTokenStatus === 401) {
            const newCredentials = await refreshTwitchToken(uid, refreshToken, onInvalidRefreshToken);
            if (newCredentials) {
                return await deleteCustomReward(uid, twitchId, newCredentials.access_token, newCredentials.refresh_token, rewardId, onInvalidRefreshToken);
            }
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
export async function updateRedemptionStatus(uid, redemptionId, streamerId, accessToken, refreshToken, rewardId, status, onInvalidRefreshToken) {
    console.log('Fulfill Redemption:', status, redemptionId);
    const twitchAccessTokenStatus = await getTwitchAccessTokenStatus(accessToken);
    if (twitchAccessTokenStatus === 401) {
        const newCredentials = await refreshTwitchToken(uid, refreshToken, onInvalidRefreshToken);
        if (newCredentials) {
            return await updateRedemptionStatus(uid, redemptionId, streamerId, newCredentials.access_token, newCredentials.refresh_token, rewardId, status, onInvalidRefreshToken);
        }
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

export async function getAllRewardRedemptions(uid, twitchId, accessToken, refreshToken, rewardId, onInvalidRefreshToken) {
    const twitchAccessTokenStatus = await getTwitchAccessTokenStatus(accessToken);
    if (twitchAccessTokenStatus === 401) {
        const newCredentials = await refreshTwitchToken(uid, refreshToken, onInvalidRefreshToken);
        if (newCredentials) {
            return await getAllRewardRedemptions(uid, twitchId, newCredentials.access_token, newCredentials.refresh_token, rewardId, onInvalidRefreshToken);
        }
    }

    let response = await fetch('https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?' +
    `broadcaster_id=${twitchId}` +
    `&reward_id=${rewardId}` +
    '&status=UNFULFILLED' +
    '&first=2', {
        method: 'GET',
        headers: {
            'Client-Id': TWITCH_CLIENT_ID,
            Authorization: `Bearer ${accessToken}`
        }
    });

    const redemptions = [];

    response = await response.json();
    if (response.data) {
        response.data.forEach(redemption => {
            redemptions.push(redemption);
        });
        while (response.pagination && response.pagination.cursor && response.pagination.cursor !== 'IA') {
            response = await getRewardRedemptionsWithCursor(uid, response.pagination.cursor, twitchId, accessToken, refreshToken, rewardId, onInvalidRefreshToken)
            if (response.data) {
                response.data.forEach(redemption => {
                    redemptions.push(redemption);
                });
            }
        }
    }

    return redemptions;
}

async function getRewardRedemptionsWithCursor(uid, cursor, twitchId, accessToken, refreshToken, rewardId, onInvalidRefreshToken) {
    const twitchAccessTokenStatus = await getTwitchAccessTokenStatus(accessToken);
    if (twitchAccessTokenStatus === 401) {
        const newCredentials = await refreshTwitchToken(uid, refreshToken, onInvalidRefreshToken);
        if (newCredentials) {
            return await getRewardRedemptionsWithCursor(uid, cursor, twitchId, newCredentials.access_token, newCredentials.refresh_token, rewardId, onInvalidRefreshToken);
        }
    }

    let response = await fetch('https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?' +
    `&broadcaster_id=${twitchId}` +
    `&reward_id=${rewardId}` +
    '&status=UNFULFILLED' +
    `&after=${cursor}` +
    '&first=2', {
        method: 'GET',
        headers: {
            'Client-Id': TWITCH_CLIENT_ID,
            Authorization: `Bearer ${accessToken}`
        }
    });

    return await response.json();
}

/**
 * Try to refresh the token if it can´t then call the onInvalidRefreshToken callback
 * @param {string} uid User identifier
 * @param {string} refreshToken Twitch refresh token
 * @param {function} onInvalidRefreshToken Callback for invalid twitch refresh token
 */
export async function refreshTwitchToken(uid, refreshToken, onInvalidRefreshToken) {
    let algo = await fetch('https://id.twitch.tv/oauth2/token?grant_type=refresh_token' +
    `&refresh_token=${refreshToken}` +
    `&client_id=${TWITCH_CLIENT_ID}` +
    `&client_secret=${TWITCH_SECRET_ID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    });

    const result = (await algo.json());
    if (result.status === 400) {
        return await onInvalidRefreshToken();
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