import {
    giveStreamExperienceForRewardRedeemed,
    updateStreamerProfile,
    saveCustomRewardRedemption,
    getUserByTwitchId,
    isUserRegisteredToStream,
    addQoinsToUser,
    addInfoToEventParticipants,
    saveUserStreamReward,
    saveCustomRewardNonRedemption,
    getCustomRewardRedemptions,
    getStreamUserRedemptions
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
 * @param {object} rewardsIds Ids of the qapla custom rewards { expReward: 'expId', qoinsReward: 'qoinsId' }
 * @param {function} onInvalidRefreshToken Callback for invalid twitch refresh token
 */
export function connect(streamId, streamerName, uid, accessToken, refreshToken, topics, rewardsIds, onInvalidRefreshToken) {
    let pingInterval = 1000 * 60;
    let reconnectInterval = 1000 * 3;
    let pingHandle;

    webSocket = new WebSocket('wss://pubsub-edge.twitch.tv');
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
        if (message.data) {
            const reward = JSON.parse(message.data.message);
            if (reward.type === 'reward-redeemed') {
                const redemptionData = reward.data.redemption;
                handleCustomRewardRedemption(streamId, streamerName, rewardsIds, redemptionData);
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
 * @param {object} rewardsIds Ids of the qapla custom rewards { expReward: 'expId', qoinsReward: 'qoinsId' }
 * @param {object} redemptionData Redemption twitch object
 */
export async function handleCustomRewardRedemption(streamId, streamerName, rewardsIds, redemptionData) {
    if (redemptionData.reward.id === rewardsIds.expReward) {
        const user = await getUserByTwitchId(redemptionData.user.id);
        if (user) {
            const isUserParticipantOfStream = await isUserRegisteredToStream(user.id, streamId);
            if (isUserParticipantOfStream) {
                const userRedemptions = await getStreamUserRedemptions(user.id, streamId);

                /**
                 * In some cases the users are able to redeem a reward twice for example if the streamer close and then reopen
                 * a stream, to avoide give them the double of rewards we must validate the redemptions with our information
                 * in the database
                 */

                // By default we give the XQ to the user
                let giveXQToUser = true;

                if (userRedemptions.exists()) {
                    // If the user has redemptions on our database but has no redemptions of XQ type set giveXQToUser to true
                    giveXQToUser = !Object.keys(userRedemptions.val()).some((redemptionId) => userRedemptions.val()[redemptionId].type === XQ);
                }

                if (giveXQToUser) {
                    await saveCustomRewardRedemption(user.id, user.photoUrl, redemptionData.user.id, redemptionData.user.display_name, streamId, XQ, redemptionData.id, redemptionData.reward.id, redemptionData.status);

                    const expToGive = 15;
                    giveStreamExperienceForRewardRedeemed(user.id, user.qaplaLevel, user.userName, expToGive);
                    addInfoToEventParticipants(streamId, user.id, 'xqRedeemed', expToGive);
                    saveUserStreamReward(user.id, XQ, streamerName, streamId, expToGive);

                    const userHasRedeemedQoins = await getCustomRewardRedemptions(streamId, user.id);

                    if (userHasRedeemedQoins.exists() && Object.keys(userHasRedeemedQoins.val()).length === 2) {
                        let qoinsToGive = 5;
                        addQoinsToUser(user.id, qoinsToGive);
                        addInfoToEventParticipants(streamId, user.id, 'qoinsRedeemed', qoinsToGive * 2);
                        saveUserStreamReward(user.id, QOINS, streamerName, streamId, qoinsToGive);
                    }
                }
            } else {
                await saveCustomRewardNonRedemption(user.id, user.photoUrl, redemptionData.user.id, redemptionData.user.display_name, streamId, redemptionData.id, redemptionData.reward.id, redemptionData.status);
            }
        }
    } else if (redemptionData.reward.id === rewardsIds.qoinsReward) {
        const user = await getUserByTwitchId(redemptionData.user.id);
        if (user) {
            const isUserParticipantOfStream = await isUserRegisteredToStream(user.id, streamId);
            if (isUserParticipantOfStream) {
                const userRedemptions = await getStreamUserRedemptions(user.id, streamId);

                /**
                 * In some cases the users are able to redeem a reward twice for example if the streamer close and then reopen
                 * a stream, to avoide give them the double of rewards we must validate the redemptions with our information
                 * in the database
                 */

                // By default we give the Qoins to the user
                let giveQoinsToUser = true;

                if (userRedemptions.exists()) {
                    // If the user has redemptions on our database but has no redemptions of XQ type set giveQoinsToUser to true
                    giveQoinsToUser = !Object.keys(userRedemptions.val()).some((redemptionId) => userRedemptions.val()[redemptionId].type === QOINS);
                }

                if (giveQoinsToUser) {
                    await saveCustomRewardRedemption(user.id, user.photoUrl, redemptionData.user.id, redemptionData.user.display_name, streamId, QOINS, redemptionData.id, redemptionData.reward.id, redemptionData.status);

                    const userHasRedeemedExperience = await getCustomRewardRedemptions(streamId, user.id);

                    let qoinsToGive = 5;

                    // If the user has already redeemed the exp reward and now the qoins reward
                    if (userHasRedeemedExperience.exists() && Object.keys(userHasRedeemedExperience.val()).length === 2) {
                        // Give him 10 qoins instead of 5
                        qoinsToGive = 10;
                    }

                    addQoinsToUser(user.id, qoinsToGive);
                    addInfoToEventParticipants(streamId, user.id, 'qoinsRedeemed', qoinsToGive);
                    saveUserStreamReward(user.id, QOINS, streamerName, streamId, qoinsToGive);
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
 * @param {string} refreshToken Twitch refresh token
 * @param {string} title Title of the reward
 * @param {number} cost Cost for redeem the reward
 * @param {boolean} enabled true if the reward must be enable when created
 * @param {function} onInvalidRefreshToken Callback for invalid twitch refresh token
 * @param {string} streamId Id of the stream event
 * @param {boolean} isMaxPerStreamEnabled Whether a maximum per stream is enabled
 * @param {number} maxPerStream The maximum number per stream if enabled
 */
export async function createCustomReward(uid, twitchId, accessToken, refreshToken, title, cost, enabled, onInvalidRefreshToken, streamId, isMaxPerStreamEnabled = false, maxPerStream) {
    try {
        const twitchAccessTokenStatus = await getTwitchAccessTokenStatus(accessToken);
        if (twitchAccessTokenStatus === 401) {
            const newCredentials = await refreshTwitchToken(uid, refreshToken, onInvalidRefreshToken);
            if (newCredentials) {
                return await createCustomReward(uid, twitchId, newCredentials.access_token, newCredentials.refresh_token, title, cost, enabled, onInvalidRefreshToken, streamId, isMaxPerStreamEnabled, maxPerStream);
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
                max_per_user_per_stream: 1,
                is_max_per_stream_enabled: isMaxPerStreamEnabled,
                max_per_stream: maxPerStream,
                is_enabled: enabled
            })
        });

        const response = await res.json();
        if (response.data && response.data[0]) {

            return response.data[0];
        } else if (response.error) {
            if (res.status === 400) {
                return null;
            }
        } else {
            console.log(res);
            console.log(res.status);
        }
    } catch (e) {
        console.log('Error: ', e);
    }
}

/**
 * Update a custom reward in the user´s twitch
 * @param {string} uid User identifier
 * @param {string} twitchId Twitch identifier
 * @param {string} accessToken Twitch access token
 * @param {string} refreshToken Twitch refresh token
 * @param {string} rewardId Id of the reward to delete
 * @param {function} onInvalidRefreshToken Callback for invalid twitch refresh token
 */
export async function enableCustomReward(uid, twitchId, accessToken, refreshToken, rewardId, onInvalidRefreshToken) {
    try {
        const twitchAccessTokenStatus = await getTwitchAccessTokenStatus(accessToken);
        if (twitchAccessTokenStatus === 401) {
            const newCredentials = await refreshTwitchToken(uid, refreshToken, onInvalidRefreshToken);
            if (newCredentials) {
                return await enableCustomReward(uid, twitchId, newCredentials.access_token, newCredentials.refresh_token, rewardId, onInvalidRefreshToken);
            }
        }

        let response = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${twitchId}&id=${rewardId}`, {
            method: 'PATCH',
            headers: {
                'Client-Id': TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_enabled: true
            })
        });

        return response.status;
    } catch (e) {
        console.log('Error: ', e);
    }
}

/**
 * Delete a custom reward in the user´s twitch
 * @param {string} uid User identifier
 * @param {string} twitchId Twitch identifier
 * @param {string} accessToken Twitch access token
 * @param {string} refreshToken Twitch refresh token
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
 * @param {string} refreshToken Twitch refresh token
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
    '&first=50', {
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