import { database } from './firebase';

const gamesRef = database.ref('/GamesResources');
const InvitationCodeRef = database.ref('/InvitationCode');
const userStreamersRef = database.ref('/UserStreamer');
const streamsApprovalRef = database.ref('/StreamsApproval');
const streamersEventsDataRef = database.ref('/StreamersEventsData');
const streamsRef = database.ref('/eventosEspeciales').child('eventsData');
const streamersHistoryEventsDataRef = database.ref('/StreamersHistoryEventsData');
const streamParticipantsRef = database.ref('/EventParticipants');

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

/**
 * Streams
 */

/**
 * Load all the strams of StreamersEventsData based on their value on the status flag
 * @param {string} uid User identifier
 * @param {number} status Value of the status to load
 */
export async function loadStreamsByStatus(uid, status) {
    return await streamersEventsDataRef.child(uid).orderByChild('status').equalTo(status).once('value');
}

/**
 * Removes a stream request of the database
 * @param {string} uid User identifier
 * @param {string} streamId Identifier of the stream to remove
 */
export async function cancelStreamRequest(uid, streamId) {
    await streamersEventsDataRef.child(uid).child(streamId).remove();
    await streamsApprovalRef.child(streamId).remove();
}

/**
 * Returns the value of the participantsNumber node of the given stream
 * @param {string} streamId Stream unique identifier
 */
export async function getStreamParticipantsNumber(streamId) {
    return await streamsRef.child(streamId).child('participantsNumber').once('value');
}

/**
 * Returns the value of the title node of the given stream
 * @param {string} streamId Stream unique identifier
 */
export async function getStreamTitle(streamId) {
    return await streamsRef.child(streamId).child('title').child('en').once('value');
}

/**
 * Returns all the data of the given stream
 * @param {string} streamId Stream unique identifier
 */
export async function loadApprovedStreamTimeStamp(streamId) {
    return await streamsRef.child(streamId).child('timestamp').once('value');
}

/**
 * Returns the value of the participantsNumber node of the given past stream
 * @param {string} uid User identifier
 * @param {string} streamId Stream unique identifier
 */
export async function getPastStreamParticipantsNumber(uid, streamId) {
    return await streamersHistoryEventsDataRef.child(uid).child(streamId).child('participantsNumber').once('value');
}

/**
 * Returns the list of participants of the given stream
 * @param {string} streamId Stream unique identifier
 */
export async function getStreamParticipantsList(streamId) {
    return await streamParticipantsRef.child(streamId).once('value');
}

/**
 * Returns the value of the participantsNumber node of the given past stream
 * @param {string} uid User identifier
 * @param {string} streamId Stream unique identifier
 */
export async function getPastStreamTitle(uid, streamId) {
    return await streamersHistoryEventsDataRef.child(uid).child(streamId).child('title').child('en').once('value');
}