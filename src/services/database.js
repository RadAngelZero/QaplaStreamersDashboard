import { database, databaseServerValue } from './firebase';

const gamesRef = database.ref('/GamesResources');
const InvitationCodeRef = database.ref('/InvitationCode');
const userStreamersRef = database.ref('/UserStreamer');
const streamsApprovalRef = database.ref('/StreamsApproval');
const streamersEventsDataRef = database.ref('/StreamersEventsData');
const streamsRef = database.ref('/eventosEspeciales').child('eventsData');
const streamersHistoryEventsDataRef = database.ref('/StreamersHistoryEventsData');
const streamParticipantsRef = database.ref('/EventParticipants');
const userRef = database.ref('/Users');
const redeemedCustomRewardsRef = database.ref('/RedeemedCustomRewards');
const activeCustomRewardsRef = database.ref('/ActiveCustomRewards');
const redemptionsListsRef = database.ref('/RedemptionsLists');
const streamersDonationsRef = database.ref('/StreamersDonations');
const premiumEventsSubscriptionRef = database.ref('/PremiumEventsSubscription');
const streamersDonationsTestRef = database.ref('/StreamersDonationsTest');
const paymentsToStreamersHistory = database.ref('/PaymentsToStreamersHistory');
const streamerLinksRef = database.ref('/StreamerLinks');
const streamsPackagesRef = database.ref('/StreamsPackages');
const streamersSubscriptionsDetailsRef = database.ref('/StreamersSubscriptionsDetails');
const streamersPublicProfilesRef = database.ref('/StreamersPublicProfiles');
const subscriptionPurchaseDetailsRef = database.ref('/SubscriptionPurchaseDetails');
const tagsRef = database.ref('/Tags');
const streamerAlertsSettingsRef = database.ref('/StreamerAlertsSettings');
const streamerCustomMediaForCheers = database.ref('/StreamerCustomMediaForCheers');
const qoinsToBitForStreamersRef = database.ref('/QoinsToBitForStreamers');
const qlanesRef = database.ref('/Qlanes');
const qreatorsCodesRef = database.ref('/QreatorsCodes');
const qaplaChallengeRef = database.ref('/QaplaChallenge');
const qaplaChallengeLevelsRef = database.ref('/QaplaChallengeLevels');
const qStoreRef = database.ref('/QStore');
const qaplaGoalRef = database.ref('/QaplaGoals');
const userStreamerPublicDataRef = database.ref('/UserStreamerPublicData');
const streamersInteractionsRewardsRef = database.ref('/StreamersInteractionsRewards');
const streamerReactionTestMediaRef = database.ref('StreamerReactionTestMedia');

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
 * Get the invitationCode node information (users with free trials code have special fields)
 * @param {string} invitationCode Random invitation code
 */
export async function getInvitationCodeParams(invitationCode) {
    return await InvitationCodeRef.child(invitationCode).once('value');
}

/**
 * Removes the given invitation code from database
 * @param {string} invitationCode Invitation code
 */
export async function removeInvitationCode(invitationCode) {
    return await InvitationCodeRef.child(invitationCode).remove();
}

/**
 * Return true if the streamer id exists
 * @param {string} uid Streamer Identifier
 */
export async function streamerProfileExists(uid) {
    return (await userStreamersRef.child(uid).once('value')).exists();
}

/**
 * Creates the profile for the streamer
 * @param {string} uid User Identifier
 * @param {object} userData Data to save
 */
export async function createStreamerProfile(uid, userData) {
    if (userData.isNewUser) {
        delete userData.isNewUser;
        if (!userData.email) {
            userData.email = '';
        }
    }

    return await userStreamersRef.child(uid).update(userData);
}

/**
 * Update the streamer private and public (if exists) profile with the given data
 * @param {string} uid User identifier
 * @param {object} userData Data to update
 */
export async function updateStreamerProfile(uid, userData) {
    await userStreamersRef.child(uid).update(userData);

    if (userData.displayName && userData.photoUrl) {
        const broadcasterType = userData.broadcasterType ? userData.broadcasterType : {};
        await updateUserStreamerPublicData(uid, {
            displayName: userData.displayName,
            photoUrl: userData.photoUrl,
            displayNameLowerCase: userData.displayName.toLowerCase(),
            broadcasterType
        });

        const publicProfile = await streamersPublicProfilesRef.child(uid).once('value');
        if (publicProfile.exists()) {
            await streamersPublicProfilesRef.child(uid).update({
                displayName: userData.displayName,
                displayNameLowerCase: userData.displayName.toLowerCase(),
                photoUrl: userData.photoUrl,
                broadcasterType
            });
        }
    }
}

/**
 * Update the data on the User Streamer Public Data node
 * @param {string} uid User identifier
 * @param {object} streamerData Data to update
 */
export async function updateUserStreamerPublicData(uid, streamerData) {
    await userStreamerPublicDataRef.child(uid).update(streamerData);
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
export async function saveStreamTwitchCustomReward(uid, rewardName, rewardId, streamId, webhookId) {
    const webhookIdKey = `${rewardName}WebhookId`;

    // Timestamp will be overwritten because we used it as a "last reward created" record
    await activeCustomRewardsRef.child(streamId).update({ streamerUid: uid, [rewardName]: rewardId, timestamp: (new Date()).getTime(), [webhookIdKey]: webhookId });
}

/**
 * Updates an Active Custom Reward node with given rewardsData object
 * @param {string} streamId Stream identifier
 * @param {object} rewardsData Data to update
 */
export async function updateActiveCustomReward(streamId, rewardsData) {
    return await activeCustomRewardsRef.child(streamId).update(rewardsData);
}

/**
 * Gets the information about the given active event
 * @param {string} streamId Stream identifier
 */
export async function checkActiveCustomReward(streamId) {
    return await activeCustomRewardsRef.child(streamId).once('value');
}

/**
 * Create a stream request in the nodes StreamersEvents and StreamsApproval
 * @param {string} uid User identifier
 * @param {object} streamerData Streamer data object
 * @param {string} game Selected game for the stream
 * @param {string} date Date in format DD-MM-YYYY
 * @param {string} hour Hour in format hh:mm
 * @param {string} streamType One of 'exp' or 'tournament'
 * @param {timestamp} timestamp Timestamp based on the given date and hour
 * @param {object} optionalData Customizable data for events
 * @param {number} createdAt timestamp of when the request was created
 * @param {string} stringDate Temporary field just to detect a bug
 */
export async function createNewStreamRequest(uid, streamerData, game, date, hour, streamType, timestamp, optionalData, createdAt, stringDate) {
    const event = await streamersEventsDataRef.child(uid).push({
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

    await premiumEventsSubscriptionRef.child(uid).child(event.key).set({
        approved: false,
        timestamp
    });

    return await streamsApprovalRef.child(event.key).set({
        date,
        hour,
        game,
        idStreamer: uid,
        streamerName: streamerData.displayName,
        streamType,
        timestamp,
        streamerChannelLink: 'https://twitch.tv/' + streamerData.login,
        streamerPhoto: streamerData.photoUrl,
        optionalData,
        createdAt,
        stringDate
    });
}

export async function getUserDisplayName(uid) {
    return await userStreamersRef.child(uid).child('displayName').once('value');
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
 * Load all the strams of StreamersEventsData based on the given statues
 * @param {string} uid User identifier
 * @param {number} statusStart Status where the query starts
 * @param {number} statusEnd Status where the query end
 */
 export async function loadStreamsByStatusRange(uid, statusStart, statusEnd) {
    return await streamersEventsDataRef.child(uid).orderByChild('status').startAt(statusStart).endAt(statusEnd).once('value');
}

/**
 * Removes a stream request of the database
 * @param {string} uid User identifier
 * @param {string} streamId Identifier of the stream to remove
 */
export async function cancelStreamRequest(uid, streamId) {
    await streamersEventsDataRef.child(uid).child(streamId).remove();
    await streamsApprovalRef.child(streamId).remove();
    userStreamersRef.child(uid).child('subscriptionDetails').child('streamsRequested').transaction((numberOfRequests) => {
        if (numberOfRequests) {
            return numberOfRequests - 1;
        }
    });
}

/**
 * Update the status in the StreamersEventsData node
 * @param {string} uid User identifier
 * @param {string} streamId Streamer identifier
 * @param {number} status New status value
 */
export async function updateStreamStatus(uid, streamId, status) {
    return await streamersEventsDataRef.child(uid).child(streamId).update({ status });
}

/**
 * Save a copy of the event in the StreamersHistoryEventsData and remove the event from eventosEspeciales/eventsData
 * @param {string} uid User identifier
 * @param {string} streamId Stream identifier
 */
export async function removeStreamFromEventsData(uid, streamId) {
    const streamData = await streamsRef.child(streamId).once('value');

    // Save a copy in the streamer event history
    await streamersHistoryEventsDataRef.child(uid).child(streamId).update(streamData.val());

    // Admin copy while we test if everything is working
    database.ref('EventsDataAdmin').child(streamId).update(streamData.val());
    return await streamsRef.child(streamId).remove();
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
 * Remove a stream from te ActiveCustomRewards node
 * @param {string} streamId Stream identifier
 */
export async function removeActiveCustomRewardFromList(streamId) {
    return await activeCustomRewardsRef.child(streamId).remove();
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
 * Streamers Donations and Streamers Donations Tests
 */

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
export async function writeTestCheer(streamerUid, completeMessage, errorMessage) {
    const testMediaArrayLength = await streamerReactionTestMediaRef.child('length').once('value');
    const index = Math.floor(Math.random() * testMediaArrayLength.val());
    const media = (await streamerReactionTestMediaRef.child('media').child(index).once('value')).val();

    streamersDonationsTestRef.child(streamerUid).push({
        media,
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
 * Mark as unread and repeating the given donation
 * @param {string} streamerUid Uid of the streamer who receive the donation
 * @param {string} donationId Id of the donation
 */
export async function markDonationAsUnreadToRepeat(streamerUid, donationId) {
    return await streamersDonationsRef.child(streamerUid).child(donationId).update({ read: false, repeating: true });
}

/**
 * Set to true the isOverlayActive flag of the streamer
 * @param {string} streamerUid Streamer identifier
 */
export async function markOverlayAsActive(streamerUid) {
    return await userStreamerPublicDataRef.child(streamerUid).child('isOverlayActive').set(true);
}

/**
 * Set to onDisconnect listener for the isOverlayActive flag
 * @param {string} streamerUid Streamer identifier
 */
export function onLiveDonationsDisconnect(streamerUid) {
    userStreamerPublicDataRef.child(streamerUid).child('isOverlayActive').onDisconnect().set(false);
}

/**
 * Streamers Subscriptions
 */

/**
 * Save the subscription information of the given user
 * @param {string} uid User identifier
 * @param {string} stripeCustomerId Customer Id given by stripe
 * @param {number} periodStart Timestamp of period start (in milliseconds)
 * @param {number} periodEnd Timestamp of period end (in milliseconds)
 */
export async function saveSubscriptionInformation(uid, stripeCustomerId, periodStart, periodEnd) {
    userStreamersRef.child(uid).update({
        freeTrial: null,
        premium: true,
        currentPeriod: {
            startDate: periodStart,
            endDate: periodEnd
        },
        stripeCustomerId
    });
}

/**
 * Add/overwrite the subscriptionDetails information on the given user
 * @param {string} uid User identifier
 * @param {object} subscriptionDetails Subscription details
 */
export async function updateSubscriptionDetails(uid, subscriptionDetails) {
    await userStreamersRef.child(uid).update({ subscriptionDetails });
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
 * @param {Array} link Array of URLs and titles to save [ { title: 'Twitch', url: 'https://twitch.tv/mr_yuboto' } ]
 */
 export async function saveStreamerLinks(streamerUid, links) {
    await streamerLinksRef.child(streamerUid).update(links);
}

/**
 * Get all the links of the given streamer
 * @param {string} streamerUid Uid of the streamer
 */
export async function getStreamerLinks(streamerUid) {
    return await streamerLinksRef.child(streamerUid).once('value');
}

/**
 * Qoin Reward Redemption counter
 */

/**
 * Returns the value of the qoinsRedemptionsCounter of the given stream
 * @param {string} streamId Streamer identifier
 */
export async function getStreamRedemptionCounter(streamId) {
    return await streamsRef.child(streamId).child('qoinsRedemptionsCounter').once('value');
}

/**
 * Gets all the packages on the Streams Packages node
 */
export async function getStreamsPackages() {
    return await streamsPackagesRef.once('value');
}

/**
 * Gets all the subscriptions informations in the Streamers Subscriptions Details node
 */
export async function getSubscriptionsDetails() {
    return await streamersSubscriptionsDetailsRef.once('value');
}

/**
 * Add a child on the boughtStreams node in the user profile so the user can have more streams independently
 * of the streams that their subscription already included
 * @param {string} streamerUid User identifier
 * @param {number} boughtStreams Number of streams bought by the streamer
 * @param {timestamp} expirationTimestamp Timestamp of the maxim date to use the streams
 */
export async function addBoughtStreamsToStreamer(streamerUid, boughtStreams, expirationTimestamp) {
    await userStreamersRef.child(streamerUid).child('boughtStreams').push({
        boughtStreams,
        expirationTimestamp
    });
}

/**
 * Add one to the streamsRequested node of the given streamer in their subscriptionDetails
 * (streamsRequested in this node is the counter of events for their included on their subscription streams)
 * @param {string} streamerUid Streamer user identifier
 */
export async function addToStreamsRequestedOnSubscriptionDetails(streamerUid) {
    userStreamersRef.child(streamerUid).child('subscriptionDetails').child('streamsRequested').transaction((numberOfRequests) => {
        if (!numberOfRequests) {
            return 1;
        }

        return numberOfRequests + 1;
    });
}

/**
 * Add one to the streamsRequested node of the given streamer in their boughtStreams/{package}
 * (streamsRequested in this node is the counter of events for their package that the user bought)
 * @param {string} streamerUid Streamer user identifier
 */
export async function addToStreamsRequestedOnStreamsPackage(streamerUid, packageId) {
    userStreamersRef.child(streamerUid).child('boughtStreams').child(packageId).child('streamsRequested').transaction((numberOfRequests) => {
        if (!numberOfRequests) {
            return 1;
        }

        return numberOfRequests + 1;
    });
}

/**
 * Remove a package of the boughtStreams node in the user profile
 * @param {string} streamerUid Streamer user identifier
 * @param {string} packageId Package identifier
 */
export async function removeStreamPackageOfStreamer(streamerUid, packageId) {
    userStreamersRef.child(streamerUid).child('boughtStreams').child(packageId).remove();
}

/**
 * Streamers Public Profiles
 */

/**
 * Listen to the specified streamer profile
 * @param {string} uid User identifier
 * @param {function} callback Handler for firebase snapshot
 */
export function listenStreamerPublicProfile(uid, callback) {
    return streamersPublicProfilesRef.child(uid).on('value', callback);
}

/**
 * Updates the specified streamer profile with the given data
 * @param {string} uid User identifier
 * @param {object} dataToUpdate Data to update on profile
 */
export async function updateStreamerPublicProfile(uid, dataToUpdate) {
    return await streamersPublicProfilesRef.child(uid).update(dataToUpdate);
}

/**
 * Returns true if the user has a public profile created
 * @param {string} uid User identifier
 */
export async function userHasPublicProfile(uid) {
    return (await streamersPublicProfilesRef.child(uid).once('value')).exists();
}

/**
 * Subscription Purchase Details
 */

/**
 * Get the details of the given subscription of the specified user
 * @param {string} uid User identifier
 * @param {string} subscriptionId Subscription stripe identifier
 */
export async function getSubscriptionPurchaseDetails(uid, subscriptionId) {
    return await subscriptionPurchaseDetailsRef.child(uid).child(subscriptionId).once('value');
}

/**
 * Save all the tags on te Tags node
 * @param {object} tags Object of tags in format { tag1: true, tag2: true }
 */
export async function saveTags(tags) {
    await tagsRef.update(tags);
}

/**
 * Streamer Alerts Settings
 */

/**
 * Set a setting on the Streamer Alert Settings
 * @param {string} uid User identifier
 * @param {string} settingKey Setting to set
 * @param {*} value Value to set
 */
export async function setAlertSetting(uid, settingKey, value) {
    await streamerAlertsSettingsRef.child(uid).child(settingKey).set(value);
}

/**
 * Get the alerts settings of the given streamer
 * @param {string} uid User identifier
 */
 export async function getStreamerAlertsSettings(uid) {
    return await streamerAlertsSettingsRef.child(uid).once('value');
}

/**
 * Listen the alerts settings of the given streamer (useful in the LiveDonations component)
 * @param {string} uid User identifier
 * @param {function} callback Function to handle the response of the listener
 */
export function listenToStreamerAlertsSettings(uid, callback) {
    return streamerAlertsSettingsRef.child(uid).on('value', callback);
}

/**
 * Get the media selected by the streamer to show in their cheers
 * @param {string} uid User identifier
 */
export async function getStreamerMediaContent(uid) {
    return await streamerCustomMediaForCheers.child(uid).once('value');
}

/**
 * QoinsToBitForStreamers
 */

/**
 * Get the value of Qoins in bit for the given type of user
 * @param {string} type Type of user (one of premium or freeUser)
 */
export async function getStreamerValueOfQoins(type) {
    return qoinsToBitForStreamersRef.child(type).once('value');
}

/**
 * Qlanes
 */

/**
 * Returns true if the user has a Qlan
 * @param {string} uid User identifier
 */
export async function streamerHasQlan(uid) {
    return (await qlanesRef.child(uid).once('value')).exists();
}

/**
 * Creates a Qlan for the given user
 * @param {string} uid User identifier
 * @param {string} code Qreator code
 * @param {string} name Name of the Qlan
 * @param {string} image Image url
 */
export async function createQlan(uid, code, name, image) {
    await qreatorsCodesRef.child(uid).update({ code });
    return await qlanesRef.child(uid).update({ name, image });
}

/**
 * Gets the Qreator code of the given user
 * @param {string} uid User identifier
 */
export async function getQreatorCode(uid) {
    return await qreatorsCodesRef.child(uid).child('code').once('value');
}

/**
 * Returns the id of the Qlan based on the Qreator code
 * @param {string} qreatorCode Unique code to join a Qlan
 */
export async function getQlanIdWithQreatorCode(qreatorCode) {
    let id = '';

    const codes = await qreatorsCodesRef.orderByChild('code').equalTo(qreatorCode).once('value');

    /**
     * We know this query will return a maximum of one code, however firebase returns an object of objects
     * so we need to go through it to get the code
     */
    codes.forEach((code) => id = code.key);

    return id;
}

////////////////////////
// Qapla Challenge
////////////////////////

/**
 * Listen to the xq counter of the given streamer for the Qapla Challenge
 * @param {string} streamerUid Streamer identifier
 * @param {function} callback Function to execute when xq node is updated
 */
export function listenQaplaChallengeXQProgress(streamerUid, callback) {
    return qaplaChallengeRef.child(streamerUid).child('xq').on('value', callback);
}

/**
 * Gets the category of the Qapla Challenge in which the user is participating
 * @param {string} streamerUid Streamer identifier
 */
export async function getStreamerChallengeCategory(streamerUid) {
    return await qaplaChallengeRef.child(streamerUid).child('category').once('value');
}

/**
 * Get the goal (XQ amount needed to pass to the next level) of the current level
 * @param {number} category Category in which the user is participating
 * @param {number} currentXQ Current ammount of XQ
 */
export async function getChallengeLevelGoal(category, currentXQ) {
    return await qaplaChallengeLevelsRef.child(category).orderByValue().startAt(currentXQ).limitToFirst(1).once('value');
}

/**
 * Get the goal (XQ amount needed to pass) from the previous level
 * @param {number} category Category in which the user is participating
 * @param {number} currentXQ Current ammount of XQ
 */
export async function getChallengePreviousLevelGoal(category, currentXQ) {
    return await qaplaChallengeLevelsRef.child(category).orderByValue().endAt(currentXQ).limitToLast(1).once('value');
}

////////////////////////
// Q Store
////////////////////////

/**
 * Gets all the items in the Q-Store
 */
export async function getQStoreItems() {
    return await qStoreRef.once('value');
}

////////////////////////
// Qapla Goal
////////////////////////

/**
 * Listen to all the changes in the Qapla goal children of the
 * given user
 * @param {string} uid User identifier
 * @param {function} callback Handler of listener results
 */
export function listenQaplaGoal(uid, callback) {
    return qaplaGoalRef.child(uid).on('value', callback);
}

////////////////////////
// Referral codes
////////////////////////

/**
 * Add two events to a streamer who referred other streamer
 * @param {string} uid User identifier of the user to receive the rewards
 * @param {string} referredDisplayName Display name from the user who used the referral code
 * @param {number} endDate Timestamp in ms for the end date of the events added
 */
export async function giveReferrerRewardsToStreamer(uid, referredDisplayName, endDate) {
    await userStreamersRef.child(uid).child('subscriptionDetails').child('streamsIncluded').set(databaseServerValue.increment(2));
    await userStreamersRef.child(uid).child('subscriptionDetails').child('redemptionsPerStream').set(40);

    await userStreamersRef.child(uid).update({
        premium: true
    });
    await updateUserStreamerPublicData(uid, {
        premium: true
    });

    const referrerCurrentPeriod = await userStreamersRef.child(uid).child('currentPeriod').once('value');
    const today = new Date();

    if (!referrerCurrentPeriod.exists() || (today.getTime() >= referrerCurrentPeriod.val().endDate)) {
        await userStreamersRef.child(uid).child('currentPeriod').child('endDate').set(endDate);
        if (!referrerCurrentPeriod.exists() || !referrerCurrentPeriod.val().startDate) {
            await userStreamersRef.child(uid).child('currentPeriod').child('startDate').set(today.getTime());
        }
    }
}

////////////////////////
 // Channel Point Interactions
 ////////////////////////

/**
 * Get the interactions reward data of the given user
 * @param {string} uid User identifier
 */
export async function getInteractionsRewardData(uid) {
    return await streamersInteractionsRewardsRef.child(uid).once('value');
}