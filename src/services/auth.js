import { auth } from './firebase';
import { createUserWithTwitch } from './functions';
import { TWITCH_CLIENT_ID, TWITCH_REDIRECT_URI } from '../utilities/Constants';
import { getStreamerUidWithTwitchId } from './database';

/**
 * Listens for changes on the user authentication status
 * @param {callback} callbackForAuthenticatedUser Handler for users correctly authenticated
 * @param {callback} callbackForUserNotAuthenticated Handler for users without account
 */
export function handleUserAuthentication(callbackForAuthenticatedUser, callbackForUserNotAuthenticated) {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            await callbackForAuthenticatedUser(user);
        } else {
            await callbackForUserNotAuthenticated();
        }
    });
}

/**
 * Redirect the user to Twitch login, when the user log into their Twitch account and authorize the requested
 * information in the scope field of the uri Twitch sent him back with the code we need to generate their tokens
 */
export function signInWithTwitch() {
    const uri =
        `https://id.twitch.tv/oauth2/authorize?` +
        `client_id=${TWITCH_CLIENT_ID}&` +
        `redirect_uri=${TWITCH_REDIRECT_URI}&` +
        `response_type=code&` +
        `scope=user:read:email%20user:edit%20bits:read%20user:edit%20channel:read:subscriptions%20channel:manage:redemptions%20channel:read:redemptions`;

    return window.location.href = uri;
}

/**
 * Create/update the user in our auth system
 * @param {string} code Twitch user code
 */
export async function signUpOrSignInTwitchUser(twitchUserData, tokensData) {
    try {
        const twitchId = twitchUserData.id;

        const streamerUid = await getStreamerUidWithTwitchId(twitchId);
        let isNewUser = false;

        // If a registered user has the given twitchId then we save on the object this uid
        if (streamerUid) {
            twitchUserData.id = streamerUid;
        } else {
            // Otherwise we create a new uid for the new user
            twitchUserData.id = `${twitchUserData.id}-${twitchUserData.display_name}`;
            isNewUser = true;
        }

        const userToken = (await createUserWithTwitch(
                twitchUserData.id,
                twitchUserData.display_name,
                twitchUserData.login,
                twitchUserData.profile_image_url,
                twitchUserData.email)
            ).data;
        const userResult = {
            firebaseAuthUser: await auth.signInWithCustomToken(userToken),
            userData: {
                id: twitchId,
                uid: twitchUserData.id,
                displayName: twitchUserData.display_name,
                login: twitchUserData.login,
                photoUrl: twitchUserData.profile_image_url,
                email: twitchUserData.email,
                twitchAccessToken: tokensData.access_token,
                refreshToken: tokensData.refresh_token,
                scope: tokensData.scope,
                isNewUser
            }
        };

        window.analytics.identify(userResult.userData.uid, {
            displayName: userResult.userData.displayName,
            email: userResult.userData.email
        });

        return userResult;
    } catch (err) {
        console.error(err);
    }
}

/**
 * Get the info of the given twitch user
 * @param {string} access_token Twitch user access token
 */
export async function getTwitchUserData(access_token) {
    const response = await fetch('https://api.twitch.tv/helix/users', {
        method: 'GET',
        headers: {
            "Client-Id": TWITCH_CLIENT_ID,
            Authorization: `Bearer ${access_token}`
        }
    });
    const user = (await response.json()).data[0];

    return user;
};

/**
 * Close the current session
 */
export async function signOut() {
    await auth.signOut();
}