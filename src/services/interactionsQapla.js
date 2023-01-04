import { updateStreamerProfile } from './database';
import { refreshUserAccessToken } from './functions';
import { createCustomReward, updateCustomReward } from './twitch';

export async function createInteractionsReward(uid, twitchId, refreshToken, title, cost) {
    const userTokensUpdated = await refreshUserAccessToken(refreshToken);

    if (userTokensUpdated.data.status === 200) {
        const userCredentialsUpdated = userTokensUpdated.data;
        updateStreamerProfile(uid, { twitchAccessToken: userCredentialsUpdated.access_token, refreshToken: userCredentialsUpdated.refresh_token });
        const reward = await createCustomReward(twitchId, userCredentialsUpdated.access_token, title, cost, true, false, 0, false, 0);

        return { reward };
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