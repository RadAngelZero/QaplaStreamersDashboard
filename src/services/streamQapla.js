import { PAST_STREAMS_EVENT_TYPE, QoinsRewardRedemption, QOINS_REWARD } from '../utilities/Constants';
import { addListToStreamRedemptionList, checkActiveCustomReward, removeActiveCustomRewardFromList, removeStreamFromEventsData, saveStreamTwitchCustomReward, setStreamInRedemptionsLists, updateActiveCustomReward, updateStreamerProfile, updateStreamStatus } from './database';
import { notifyBugToDevelopTeam } from './discord';
import { refreshUserAccessToken, subscribeStreamerToTwitchWebhook, unsubscribeStreamerToTwitchWebhook } from './functions';
import { createCustomReward, deleteCustomReward, disableCustomReward, enableCustomReward, getAllRewardRedemptions } from './twitch';

export async function startQaplaStream(uid, twitchId, streamerName, refreshToken, streamId, redemptionsPerStream) {
    const userTokensUpdated = await refreshUserAccessToken(refreshToken);

    if (userTokensUpdated.data.status === 200) {
        const userCredentialsUpdated = userTokensUpdated.data;
        updateStreamerProfile(uid, { twitchAccessToken: userCredentialsUpdated.access_token, refreshToken: userCredentialsUpdated.refresh_token });

        const qoinsReward = await createCustomReward(twitchId, userCredentialsUpdated.access_token, 'Qoins Qapla', 500, false, true, 1, true, redemptionsPerStream);
        if (qoinsReward.status !== 200) {
            // Problem creating reward

            let errorMessage = `Error creating Qoins Reward\nStatus: ${qoinsReward.status}`;
            if (qoinsReward.error) {
                errorMessage += `\nError: ${qoinsReward.error}\nMessage: ${qoinsReward.message}\nStreamer: ${streamerName}\nStream Id: ${streamId}`;
            }
            // Abort and notify Qapla developers
            notifyBugToDevelopTeam(errorMessage);
        }

        // Set the webhooks
        const qoinsWebhookSubscription = await subscribeStreamerToTwitchWebhook(twitchId, QoinsRewardRedemption.type, QoinsRewardRedemption.callback, { reward_id: qoinsReward.data.id });

        if (qoinsWebhookSubscription.data.id) {
            // Save webhook id on database
            await saveStreamTwitchCustomReward(uid, QOINS_REWARD, qoinsReward.data.id, streamId, qoinsWebhookSubscription.data.id);

            await updateActiveCustomReward(streamId, { qoinsEnabled: false });

            // Get the recently created ActiveCustomReward node
            const streamStatus = await checkActiveCustomReward(streamId);

            return { key: streamId, ...streamStatus.val() };
        } else {
            await deleteCustomReward(twitchId, userCredentialsUpdated.access_token, qoinsReward.data.id);

            let errorMessage = `Error creating Webhooks for rewards\nInfo: \n${JSON.stringify(qoinsWebhookSubscription)}`;
            // Abort and notify Qapla developers
            notifyBugToDevelopTeam(errorMessage);
        }
    } else if (userTokensUpdated.data.status === 401) {
        Promise.reject({ status: userTokensUpdated.data.status });
    }
}

export async function closeQaplaStream(uid, twitchId, refreshToken, streamId, qoinsRewardId, qoinsWebhookId) {
    const userTokensUpdated = await refreshUserAccessToken(refreshToken);

    if (userTokensUpdated.data.status === 200) {
        const userCredentialsUpdated = userTokensUpdated.data;
        updateStreamerProfile(uid, { twitchAccessToken: userCredentialsUpdated.access_token, refreshToken: userCredentialsUpdated.refresh_token });

        /** This fragment will be used temporary */

            // Set timestamp of end of stream
            await setStreamInRedemptionsLists(streamId);

            // Get and save redemptions lists
            const QoinsRedemptions = await getAllRewardRedemptions(twitchId, userCredentialsUpdated.access_token, qoinsRewardId);
            await addListToStreamRedemptionList(streamId, QOINS_REWARD, QoinsRedemptions);

        /** End of temporary fragment */

        // Disable Qoins reward remove their webhook and delete it
        await disableCustomReward(twitchId, userCredentialsUpdated.access_token, qoinsRewardId);
        await unsubscribeStreamerToTwitchWebhook(qoinsWebhookId);
        await deleteCustomReward(twitchId, userCredentialsUpdated.access_token, qoinsRewardId);

        await removeActiveCustomRewardFromList(streamId);

        // Update status and remove event from main events node
        await updateStreamStatus(uid, streamId, PAST_STREAMS_EVENT_TYPE);
        await removeStreamFromEventsData(uid, streamId);
    } else if (userTokensUpdated.data.status === 401) {
        Promise.reject({ status: userTokensUpdated.data.status });
    }
}

export async function enableStreamQoinsReward(uid, twitchId, refreshToken, streamId, qoinsRewardId) {
    const userTokensUpdated = await refreshUserAccessToken(refreshToken);

        if (userTokensUpdated.data.status === 200) {
            const userCredentialsUpdated = userTokensUpdated.data;
            updateStreamerProfile(uid, { twitchAccessToken: userCredentialsUpdated.access_token, refreshToken: userCredentialsUpdated.refresh_token });

            const qoinsUpdateStatus = await enableCustomReward(twitchId, userCredentialsUpdated.access_token, qoinsRewardId);
            if (qoinsUpdateStatus === 200) {
                updateActiveCustomReward(streamId, { qoinsEnabled: true });
            }
        } else if (userTokensUpdated.data.status === 400) {
            Promise.reject();
        }
}