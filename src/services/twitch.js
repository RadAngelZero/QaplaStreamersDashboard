import { giveStreamExperienceForRewardRedeemed, updateStreamerProfile, saveStreamerTwitchCustomReward } from './database';
import { TWITCH_CLIENT_ID, TWITCH_SECRET_ID } from '../utilities/Constants';
import { signOut } from './auth';

let webSocket;

/**
 * Establish a connection between the dashboard and the twitch using web sockets
 * @param {string} uid User identifier
 * @param {string} accessToken Twitch access token
 */
export function connect(uid, accessToken) {
    let pingInterval = 1000 * 60;
    let reconnectInterval = 1000 * 3;
    let pingHandle;

    webSocket = new WebSocket('wss://pubsub-edge.twitch.tv');

    webSocket.onopen = (error) => {
        ping();
        pingHandle = setInterval(ping, pingInterval);
    };

    webSocket.onerror = (error) => {
        console.log(error);
    };

    webSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log(event);
        console.log(message);
        if (message.type === 'RECONNECT') {
            setTimeout(connect, reconnectInterval);
        }

        if (message.type === 'RESPONSE') {
            if (message.error === 'ERR_BADAUTH') {
                console.log('Refresh token');
                // refreshTwitchToken(uid, accessToken);
            }
        }

        if (message.type === 'reward-redeemed') {
            console.log(message.data.redemption.user.id);
            console.log(message.data.reward.id);
            console.log(message.data.status);
            // giveStreamExperienceForRewardRedeemed(message.data.redemption.user.id, 100);
        }
    };

    webSocket.onclose = () => {
        clearInterval(pingHandle);
        setTimeout(connect, reconnectInterval);
    };
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
        return await refreshTwitchToken(uid, accessToken, onInvalidRefreshToken);
    }

    const message = {
        type: 'LISTEN',
        nonce: nonce(15),
        data: {
            topics: topics,
            auth_token: accessToken
        }
    };

    setTimeout(() => webSocket.send(JSON.stringify(message)), 5000);
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
        let algo = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${twitchId}`, {
            method: 'POST',
            headers: {
                'Client-Id': TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                title,
                cost
            })
        });

        const twitchAccessTokenStatus = await getTwitchAccessTokenStatus(accessToken);
        if (twitchAccessTokenStatus === 401) {
            return await refreshTwitchToken(uid, accessToken, onInvalidRefreshToken);
        }

        const response = await algo.json();
        if (response.data[0]) {
            saveStreamerTwitchCustomReward(uid, response.data[0].id, response.data[0].title, response.data[0].cost);
        }
    } catch (e) {
        console.log('Error: ', e);
    }
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
        onInvalidRefreshToken();
    } else {
        updateStreamerProfile(uid, { twitchAccessToken: result.access_token, refreshToken: result.refresh_token });

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