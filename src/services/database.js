import { database } from './firebase';

const gamesRef = database.ref('/GamesResources');
const InvitationCodeRef = database.ref('/InvitationCode');
const userStreamersRef = database.ref('/UserStreamer');
const streamsApprovalRef = database.ref('/StreamsApproval');
const streamersEventsDataRef = database.ref('/StreamersEventsData');

/**
 * Load all the games ordered by platform from GamesResources
 * database node
 */
export async function loadQaplaGames() {
    return (await gamesRef.once('value')).val();
}

export function loadStreamerProfile(uid, dataHandler) {
    userStreamersRef.child(uid).on('value', (streamerData) => {
        if (streamerData.exists()) {
            dataHandler(streamerData.val());
        }
    });
}

/**
 * Check if the invitation code exists
 * @param {string} invitationCode Random invitation code
 */
export async function invitationCodeExists(invitationCode) {
    if (invitationCode) {
        return (await InvitationCodeRef.child(invitationCode).once('value')).exists();
    }

    return false;
}

/**
 * Return true if the streamer id exists
 * @param {string} uid Streamer Identifier
 */
export async function streamerProfileExists(uid) {
    return (await userStreamersRef.child(uid).once('value')).exists();
}

/**
 * Remove the invitation code and create the profile for the streamer
 * @param {string} uid User Identifier
 * @param {object} userData Data to save
 * @param {string} inviteCode Invitation code used
 */
export async function createStreamerProfile(uid, userData, inviteCode) {
    InvitationCodeRef.child(inviteCode).remove();
    return await userStreamersRef.child(uid).update(userData);
}

/**
 * Create a stream request in the nodes StreamersEvents and StreamsApproval
 * @param {object} streamer User object
 * @param {string} game Selected game for the stream
 * @param {string} date Date in format DD-MM-YYYY
 * @param {string} hour Hour in format hh:mm
 * @param {string} streamType One of 'exp' or 'tournament'
 * @param {timestamp} timestamp Timestamp based on the given date and hour
 * @param {object} optionalData Customizable data for events
 */
export async function createNewStreamRequest(streamer, game, date, hour, streamType, timestamp, optionalData) {
    const event = await streamersEventsDataRef.child(streamer.uid).push({
        date,
        hour,
        game,
        status: 1,
        streamType,
        timestamp,
        optionalData
    });

    return await streamsApprovalRef.child(event.key).set({
        date,
        hour,
        game,
        idStreamer: streamer.uid,
        streamerName: streamer.displayName,
        streamType,
        timestamp,
        streamerChannelLink: 'https://twitch.tv/' + streamer.login,
        streamerPhoto: streamer.photoUrl,
        optionalData
    });
}