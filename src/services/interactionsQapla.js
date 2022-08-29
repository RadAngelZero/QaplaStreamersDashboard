import { InteractionsRewardRedemption } from '../utilities/Constants';
import { saveInteractionsRewardData, updateStreamerProfile } from './database';
import { refreshUserAccessToken, subscribeStreamerToTwitchWebhook } from './functions';
import { createCustomReward, deleteCustomReward, updateCustomReward } from './twitch';

export async function createInteractionsReward(uid, twitchId, refreshToken, title, cost) {
    alert('Creando');
    const userTokensUpdated = await refreshUserAccessToken(refreshToken);

    if (userTokensUpdated.data.status === 200) {
        const userCredentialsUpdated = userTokensUpdated.data;
        updateStreamerProfile(uid, { twitchAccessToken: userCredentialsUpdated.access_token, refreshToken: userCredentialsUpdated.refresh_token });
        const reward = await createCustomReward(twitchId, userCredentialsUpdated.access_token, title, cost, true, false, 0, false, 0);

        if (reward.status === 200) {
            const webhookSubscription = await subscribeStreamerToTwitchWebhook(twitchId, InteractionsRewardRedemption.type, InteractionsRewardRedemption.callback, { reward_id: reward.data.id });

            if (webhookSubscription.data.id) {
                // Store on database
                await saveInteractionsRewardData(uid, reward.data.id, webhookSubscription.data.id);
                alert('Creada');
            } else {
                // Webhook creation failed
                await deleteCustomReward(twitchId, userCredentialsUpdated.access_token, reward.data.id);
            }
            // Created
        } else if (reward.status === 400 && reward.message === 'CREATE_CUSTOM_REWARD_TOO_MANY_REWARDS') {
            // Too many rewards
        } else if (reward.status === 401) {
            // Unauthenticated: Missing/invalid Token
        } else if (reward.status === 403) {
            // Forbidden: Channel Points are not available for the broadcaster
        } else if (reward.status === 500) {
            // Internal Server Error: Something bad happened on Twitch
        }
    }
}

export async function updateInteractionsReward(uid, twitchId, refreshToken, rewardId, title, cost, isEnabled) {
    alert('Actualizando');
    console.log(uid, twitchId, refreshToken, rewardId, title, cost);
    const userTokensUpdated = await refreshUserAccessToken(refreshToken);

    if (userTokensUpdated.data.status === 200) {
        const userCredentialsUpdated = userTokensUpdated.data;
        updateStreamerProfile(uid, { twitchAccessToken: userCredentialsUpdated.access_token, refreshToken: userCredentialsUpdated.refresh_token });

        const updateStatus = await updateCustomReward(twitchId, userCredentialsUpdated.access_token, rewardId, { title, cost, is_enabled: isEnabled });
        console.log(updateStatus);
        if (updateStatus === 200) {
            // Reward succesfully updated
            alert('Actualizada');
        }
    }
}