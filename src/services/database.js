import { database } from './firebase';

const gamesRef = database.ref('/GamesResources');
const InvitationCodeRef = database.ref('/InvitationCode');
const userStreamersRef = database.ref('/UserStreamer');
const streamsApprovalRef = database.ref('/StreamsApproval');
const streamersEventsDataRef = database.ref('/StreamersEventsData');
const streamsRef = database.ref('/eventosEspeciales').child('eventsData');
const streamersHistoryEventsDataRef = database.ref('/StreamersHistoryEventsData');
const streamParticipantsRef = database.ref('/EventParticipants');
const userRef = database.ref('/Users');
const donationsLeaderBoardRef = database.ref('/DonationsLeaderBoard');
const redeemedCustomRewardsRef = database.ref('/RedeemedCustomRewards');
const eventParticipantsRef = database.ref('/EventParticipants');
const userStreamsRewardsRef = database.ref('/UserStreamsRewards');
const nonRedeemedCustomRewardsRef = database.ref('/NonRedeemedCustomRewards');
const activeCustomRewardsRef = database.ref('/ActiveCustomRewards');
const redemptionsListsRef = database.ref('/RedemptionsLists');
const streamersDonationsRef = database.ref('/StreamersDonations');
const streamersDonationsTestRef = database.ref('/StreamersDonationsTest');
const paymentsToStreamersHistory = database.ref('/PaymentsToStreamersHistory');
const streamerLinksRef = database.ref('/StreamerLinks');
const qaplaLevelsRequirementsRef = database.ref('QaplaLevelsRequirements');

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
 * Update the streamer profile with the given data
 * @param {string} uid User identifier
 * @param {object} userData Data to update
 */
export async function updateStreamerProfile(uid, userData) {
    userStreamersRef.child(uid).update(userData);
}

/**
 * Gets the uid of the streamer using theit twitchId
 * @param {string} twitchId Twitch id of the streamer
 */
export async function getStreamerUidWithTwitchId(twitchId) {
    const streamerSnapshot = await userStreamersRef.orderByChild('id').equalTo(twitchId).once('value');
    let uid = '';
    streamerSnapshot.forEach((streamer) => {
        uid = streamer.key;
    });

    return uid;
}

/**
 * Save on the streamer profile and in the active custom rewards node a new custom reward created with the
 * dashboard
 * @param {string} uid User identifier
 * @param {string} rewardName String name to identify on the database
 * @param {string} rewardId New custom reward identifier
 * @param {string} title Title of the new reward
 * @param {number} cost Cost (in bits) of the new reward
 * @param {string} streamId Id of the stream event
 */
export async function saveStreamerTwitchCustomReward(uid, rewardName, rewardId, title, cost, streamId) {
    userStreamersRef.child(uid).child('customRewards').child(streamId).update({ closedStream: false, [rewardName]: { title, cost, rewardId } });
    activeCustomRewardsRef.child(streamId).update({ streamerUid: uid, [rewardName]: { title, cost, rewardId, timestamp: (new Date()).getTime() } });
}

/**
 * Mark as closed the custom reward created for the event
 * @param {string} uid User identifier
 * @param {string} streamId Id of the stream event
 */
export async function markAsClosedStreamerTwitchCustomReward(uid, streamId) {
    userStreamersRef.child(uid).child('customRewards').child(streamId).update({ closedStream: true });
}

/**
 * Find all the "open" stream rewards (rewards with their closedStream flag marked as false)
 * @param {string} uid User identifier
 */
export async function getOpenCustomRewards(uid) {
    return await userStreamersRef.child(uid).child('customRewards').orderByChild('closedStream').equalTo(false).once('value');
}

/**
 * Find all the "open" stream rewards (rewards with their closedStream flag marked as false)
 * @param {string} uid User identifier
 */
export async function getClosedStream(uid, streamId) {
    return await userStreamersRef.child(uid).child('customRewards').child(streamId).child('closedStream').once('value');
}

/**
 * Remove a custom reward created from the streamer profile
 * @param {string} uid User identifier
 * @param {string} rewardId New custom reward identifier
 */
export async function removeStreamerTwitchCustomReward(uid, rewardId) {
    userStreamersRef.child(uid).child('customRewards').child(rewardId).remove();
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
 * @param {number} createdAt timestamp of when the request was created
 * @param {string} stringDate Temporary field just to detect a bug
 */
export async function createNewStreamRequest(streamer, game, date, hour, streamType, timestamp, optionalData, createdAt, stringDate) {
    const event = await streamersEventsDataRef.child(streamer.uid).push({
        date,
        hour,
        game,
        status: 1,
        streamType,
        timestamp,
        optionalData,
        createdAt,
        stringDate
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
        optionalData,
        createdAt,
        stringDate
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
    return await streamsRef.child(streamId).child('title').once('value');
}

/**
 * Returns the value of the timestamp node of the given stream
 * @param {string} streamId Stream unique identifier
 */
export async function getStreamTimestamp(streamId) {
    return await streamsRef.child(streamId).child('timestamp').once('value');
}

/**
 * Returns all the data of the given stream
 * @param {string} streamId Stream unique identifier
 */
export async function loadApprovedStreamTimeStamp(streamId) {
    return await streamsRef.child(streamId).child('timestamp').once('value');
}

/**
 * Update the date, hour and timestamps of the given stream
 * @param {string} uid User identifier
 * @param {string} streamId Streamer identifier
 * @param {string} dateUTC Date UTC in format DD-MM-YYYY
 * @param {string} hourUTC Hour UTC in format HH:MM
 * @param {string} date Local Date in format DD-MM-YYYY
 * @param {string} hour Local hour in format HH:MM
 * @param {number} timestamp Timestamp of the dates
 */
export async function updateStreamDate(uid, streamId, dateUTC, hourUTC, date, hour, timestamp) {
    await streamsRef.child(streamId).update({
        dateUTC,
        hourUTC,
        tiempoLimite: date,
        hour,
        timestamp
    });

    const lastTimestamp = await userStreamersRef.child(uid).child('lastStreamTs').once('value');
    if (!lastTimestamp.exists() || (lastTimestamp.exists() && lastTimestamp.val() < timestamp)) {
        userStreamersRef.child(uid).update({ lastStreamTs: timestamp });
    }

    return await streamersEventsDataRef.child(uid).child(streamId).update({
        date: dateUTC,
        hour: hourUTC,
        timestamp
    });
}

/**
 * Returns the customRewardsMultipliers object of the given stream
 * @param {string} streamId Stream identifier
 */
export async function getStreamCustomRewardsMultipliers(streamId) {
    return await streamsRef.child(streamId).child('customRewardsMultipliers').once('value');
}

/**
 * Stream Participants
 */

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
    return await streamersHistoryEventsDataRef.child(uid).child(streamId).child('title').once('value');
}

export async function giveStreamExperienceForRewardRedeemed(uid, qaplaLevel, userName, amountOfExperience) {
    let userUpdate = {};
    let userExperience = qaplaLevel || 0;
    const userLeaderboardExperience = (await donationsLeaderBoardRef.child(uid).child('totalDonations').once('value')).val() || 0;

    userUpdate[`/Users/${uid}/qaplaLevel`] = amountOfExperience + userExperience;
    userUpdate[`/Users/${uid}/seasonXQ`] = userLeaderboardExperience + amountOfExperience;
    userUpdate[`/DonationsLeaderBoard/${uid}/totalDonations`] = userLeaderboardExperience + amountOfExperience;
    userUpdate[`/DonationsLeaderBoard/${uid}/userName`] = userName;

    database.ref('/').update(userUpdate);
}


/**
 * @deprecated
 * @param {string} streamerId Id of the streamer
 * @param {string} streamId Stream identifier in our database
 */
export async function getCustomRewardId(streamerId ,streamId) {
    return await (await userStreamersRef.child(streamerId).child('customRewards').child(streamId).child('rewardId').once('value')).val();
}

/**
 * Returns the snapshor of the custom reward for the given event
 * @param {string} streamerId Id of the streamer
 * @param {string} streamId Stream identifier in our database
 */
export async function getStreamCustomReward(streamerId ,streamId) {
    return await userStreamersRef.child(streamerId).child('customRewards').child(streamId).once('value');
}

/**
 * Save on database the information about a redemption of a twitch custom reward
 * @param {string} uid User identifier
 * @param {string} photoUrl Photo of the user
 * @param {string} twitchIdThatRedeemed Id of the user that redeemed the custom reward
 * @param {string} displayName Twitch display name of the user
 * @param {string} streamId Stream identifier in our database
 * @param {string} type Type of reward (XQ or Qoins)
 * @param {string} redemptionId Id of the twitch redemption
 * @param {string} rewardId Id of the reward
 * @param {string} status Status of the redemption
 */
export async function saveCustomRewardRedemption(uid, photoUrl, twitchIdThatRedeemed, displayName, streamId, type, redemptionId, rewardId, status) {
    await redeemedCustomRewardsRef.child(streamId).child(redemptionId).update({ uid, photoUrl, id: twitchIdThatRedeemed, displayName, rewardId, status, type });
}

/**
 * Update the status of the given custom redemption
 * @param {string} streamId Stream identifier in our database
 * @param {string} redemptionId Id of the twitch redemption
 * @param {string} status Status of the redemption
 */
export async function updateCustomRewardRedemptionStatus(streamId, redemptionId, status) {
    await redeemedCustomRewardsRef.child(streamId).child(redemptionId).update({ status });
}

/**
 * Set a listener for the redeemedCustomRewardsRef/streamId node
 * @param {string} streamId Stream identifier in our database
 * @param {function} callback Handler of the returned data
 */
export async function listenCustomRewardRedemptions(streamId, callback) {
    redeemedCustomRewardsRef.child(streamId).on('value', callback);
}

/**
 * App users
 */

/**
 * Return a user profile object (node Users in our database) based on their twitchId or null
 * if it does not exist
 * @param {string} twitchId Twitch id
 */
export async function getUserByTwitchId(twitchId) {
    const users = await userRef.orderByChild('twitchId').equalTo(twitchId).once('value');
    let user = null;
    users.forEach((qaplaUser) => {
        user = { ...qaplaUser.val(), id: qaplaUser.key };
    });

    return user;
}

/**
 * Returns true if the user is registered to the given stream false if he is not
 * @param {string} uid User identifier
 * @param {string} streamId Stream identifier in our database
 */
export async function isUserRegisteredToStream(uid, streamId) {
    return (await eventParticipantsRef.child(streamId).child(uid).once('value')).exists();
}

/**
 * Returns the snapshot of the lastSeasonLevel of the given user
 * @param {string} uid User identifier
 */
export async function getUserLastSeasonLevel(uid) {
    return await userRef.child(uid).child('lastSeasonLevel').once('value');
}

/**
 * Qapla Levels
 */

/**
 * Returns the qoinsToGive snapshot of the given level
 * @param {number} level Season level
 */
export async function getQoinsToGiveToGivenLevel(level) {
    return await qaplaLevelsRequirementsRef.child(level - 1).child('qoinsToGive').once('value');
}

/**
 * Returns the array of Qapla levels
 */
export async function getQaplaLevels() {
    return await qaplaLevelsRequirementsRef.once('value');
}

/**
 * Add the specified field on the EventParticipant node of the given stream and user
 * @param {string} streamId Stream identifier in our database
 * @param {string} uid User identifier
 * @param {string} fieldName Name of the field to create
 * @param {any} value Value to save
 */
export async function addInfoToEventParticipants(streamId, uid, fieldName, value) {
    eventParticipantsRef.child(streamId).child(uid).update({ [fieldName]: value });
}

/**
 * Add the specific amount of Qoins to the given user
 * @param {string} uid user identifier
 * @param {number} qoinsToAdd Qoins to add
 */
export function addQoinsToUser(uid, qoinsToAdd) {
    userRef.child(uid).child('credits').transaction((credits) => {
        if (!credits) {
            return qoinsToAdd;
        }

        if (typeof credits === 'number') {
            return credits + qoinsToAdd;
        }

        return credits;
    }, (error) => {
        if (error) {
            try {
                database.ref('/QoinsTransactionsErrors').push({ error, uid, qoinsToAdd });
            } catch (error) {}
        }
    });
}

/**
 * Saves a reward information on the UserStreamsRewards node on the database
 * @param {string} uid User identifier
 * @param {string} type Type of reward (One of qoins or xq)
 * @param {string} streamerName Name of the streamer
 * @param {string} streamId Stream identifier
 * @param {number} amount Numeric value of the reward
 */
export async function saveUserStreamReward(uid, type, streamerName, streamId, amount) {
    const date = new Date();
    return await userStreamsRewardsRef.child(uid).push({ type, streamerName, streamId, amount, timestamp: date.getTime() });
}

/**
 * Returns all the redemptions made by the user in a given stream
 * @param {string} uid User identifier
 * @param {string} streamId Stream identifier
 */
export async function getStreamUserRedemptions(uid, streamId) {
    return await userStreamsRewardsRef.child(uid).orderByChild('streamId').equalTo(streamId).once('value');
}

/**
 * Save redemption of user that are not registered to the stream
 * @param {string} uid User identifier
 * @param {string} photoUrl Photo of the user
 * @param {string} twitchIdThatRedeemed Id of the user that redeemed the custom reward
 * @param {string} displayName Twitch display name of the user
 * @param {string} streamId Stream identifier
 * @param {string} redemptionId Id of the twitch redemption
 * @param {string} rewardId Id of the reward
 * @param {string} status Status of the redemption
 */
export async function saveCustomRewardNonRedemption(uid, photoUrl, twitchIdThatRedeemed, displayName, streamId, redemptionId, rewardId, status) {
    await nonRedeemedCustomRewardsRef.child(streamId).child(redemptionId).update({ uid, photoUrl, id: twitchIdThatRedeemed, displayName, rewardId, status });
}

export async function removeActiveCustomRewardFromList(streamId) {
    activeCustomRewardsRef.child(streamId).remove();
}

export async function setStreamInRedemptionsLists(streamId) {
    const date = new Date();
    await redemptionsListsRef.child(streamId).set({ timestamp: date.getTime() });
}

export async function addListToStreamRedemptionList(streamId, type, list) {
    await redemptionsListsRef.child(streamId).update({ [type]: list });
}

/**
 * Listener to check if the streamer is online
 * @param {string} streamerUid Uid of the streamer
 * @param {function} callback Handler of the results
 */
export function listenToUserStreamingStatus(streamerUid, callback) {
    userStreamersRef.child(streamerUid).child('isStreaming').on('value', callback);
}

/**
 * Listener to get the last x cheers added to the StreamersDonations
 * @param {string} streamerUid Uid of the streamer
 * @param {function} callback Handler of the results
 */
export function listenForLastStreamerCheers(streamerUid, limit = 10, callback) {
    streamersDonationsRef.child(streamerUid).limitToLast(limit).on('value', callback);
}

/**
 * Listener to get every unread streamer cheer added to the StreamersDonations
 * @param {string} streamerUid Uid of the streamer
 * @param {function} callback Handler of the results
 */
 export function listenForUnreadStreamerCheers(streamerUid, callback) {
    streamersDonationsRef.child(streamerUid).orderByChild('read').equalTo(false).on('child_added', callback);
}

/**
 * Remove listener from the Streamers Donation node
 * @param {string} streamerUid Uid of the streamer
 */
 export function removeListenerForLastStreamerCheers(streamerUid) {
    streamersDonationsRef.child(streamerUid).off('value');
}

/**
 * Remove listener from the Streamers Donation node
 * @param {string} streamerUid Uid of the streamer
 */
export function removeListenerForUnreadStreamerCheers(streamerUid) {
    streamersDonationsRef.child(streamerUid).orderByChild('read').equalTo(false).off('child_added');
}

/**
 * Write a fake cheer on the test cheers node
 * @param {string} streamerUid Streamer unique identifier
 * @param {string} completeMessage Message to show if the operation is succesfuly completed
 * @param {string} errorMessage Message to show if the write operation fails
 */
export function writeTestCheer(streamerUid, completeMessage, errorMessage) {
    streamersDonationsTestRef.child(streamerUid).push({
        amountQoins: 0,
        message: 'Test',
        timestamp: (new Date()).getTime(),
        uid: '',
        read: false,
        twitchUserName: 'QAPLA',
        userName: 'QAPLA',
        photoURL: ''
    }, (error) => {
        if (error) {
            alert(errorMessage);
        } else {
            alert(completeMessage);
        }
    });
}

/**
 * Listener for the unread test cheers
 * @param {string} streamerUid Stremer identifier
 * @param {function} callback Function called for every cheer
 */
export function listenForTestCheers(streamerUid, callback) {
    streamersDonationsTestRef.child(streamerUid).orderByChild('read').equalTo(false).on('child_added', callback)
}

/**
 * Removes the given test donation
 * @param {string} streamerUid Streamer identifier
 * @param {string} donationId Donation identifier
 */
export function removeTestDonation(streamerUid, donationId) {
    streamersDonationsTestRef.child(streamerUid).child(donationId).remove();
}

/**
 * Mark as read the given donation
 * @param {string} streamerUid Uid of the streamer who receive the donation
 * @param {string} donationId Id of the donation
 */
export async function markDonationAsRead(streamerUid, donationId) {
    return await streamersDonationsRef.child(streamerUid).child(donationId).update({ read: true });
}

/**
 * Get the payments received by the streamer in the giving period
 * @param {string} streamerUid Uid of the streamer
 * @param {number} startTimestamp Lower limit for the time query
 * @param {number} endTimestamp Superior limit for the time query
 */
export async function getPeriodStreamerPayments(streamerUid, startTimestamp, endTimestamp) {
    return await paymentsToStreamersHistory.child(streamerUid).orderByChild('timestamp').startAt(startTimestamp).endAt(endTimestamp).once('value');
}

/**
* Streamers Links
 */

/**
 * Saves a link information for the streamer public profile
 * @param {string} streamerUid Uid of the streamer
 * @param {string} username Twitch username of the streamer
 * @param {string} link URL to save
 * @param {string} title Title for the link to show on streamer profile
 */
export async function addStreamerLink(streamerUid, username, link, title) {
    await streamerLinksRef.child(streamerUid).update({ username });
    streamerLinksRef.child(streamerUid).child('links').push({ link, title });
}

/**
 * Listen for all the links of the given streamer
 * @param {string} streamerUid Uid of the streamer
 * @param {function} callback Function called every time the link list id updated
 */
export async function getStreamerLinks(streamerUid, callback) {
    streamerLinksRef.child(streamerUid).child('links').on('value', callback);
}

/**
 * Qoin Reward Redemption counter
 */

/**
 * Validates the limit and add the redemption if the limit is not exceeded yet
 * @param {string} streamId Stream identifier
 * @param {number} maxRedemptionsOfQoinsPerStream Maximum of redemptions allowed for the Qoins reward
 * @param {function} callback Function called if the limit is not exceeded yet
 */
export async function addRedemptionToCounterIfItHaveNotExceededTheLimit(streamId, maxRedemptionsOfQoinsPerStream, callback) {
    streamsRef.child(streamId).child('qoinsRedemptionsCounter').transaction((counter) => {
        if (!counter || counter < maxRedemptionsOfQoinsPerStream) {
            return counter ? counter + 1 : 1;
        }
    }, (a, updated) => {
        if (updated) {
            callback();
        }
    });
}

/**
 * Returns the value of the qoinsRedemptionsCounter of the given stream
 * @param {string} streamId Streamer identifier
 */
export async function getStreamRedemptionCounter(streamId) {
    return await streamsRef.child(streamId).child('qoinsRedemptionsCounter').once('value');
}