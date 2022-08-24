import React, { useState, useEffect } from "react";
import { Button, CircularProgress, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import imgStreameCoin from "../../assets/streamerProfileCoin.jpg";
import style from "./StreamerProfileEditCoin.module.css";
import iconEdit from "../../assets/Edit.svg";
import { getCustomReward, updateCustomReward } from "../../services/twitch";
import { getInteractionsRewardData, updateStreamerProfile } from "../../services/database";
import { refreshUserAccessToken } from "../../services/functions";
import { auth } from "../../services/firebase";
import { ReactComponent as ConfirmChange } from './../../assets/ConfirmChange.svg';

const useStyles = makeStyles((theme) => ({
    circularProgress: {
        color: '#0AFFD2',
        alignSelf: 'center'
    }
}));

const StreamerProfileEditCoin = ({ user }) => {
    const [ActiveEditTitle, setActiveEditTitle] = useState(false);
    const [ActiveEditCoins, setActiveEditCoins] = useState(false);
    const [rewardId, setRewardId] = useState('');
    const [rewardName, setRewardName] = useState(undefined);
    const [rewardCost, setRewardCost] = useState(undefined);
    const classes = useStyles();
    const { t } = useTranslation();
    const history = useHistory();

    useEffect(() => {
        async function getRewardData() {
            const rewardData = await getInteractionsRewardData(user.uid);
            if (rewardData.exists()) {
                const userTokensUpdated = await refreshUserAccessToken(user.refreshToken);

                if (userTokensUpdated.data.status === 200) {
                    const userCredentialsUpdated = userTokensUpdated.data;
                    updateStreamerProfile(user.uid, { twitchAccessToken: userCredentialsUpdated.access_token, refreshToken: userCredentialsUpdated.refresh_token });
                    const reward = await getCustomReward(rewardData.val().rewardId, user.id, userCredentialsUpdated.access_token);
                    if (reward) {
                        setRewardId(reward.id);
                        setRewardName(reward.title);
                        setRewardCost(reward.cost);
                    }
                }
            }
        }

        getRewardData();
    }, []);

    const saveData = async (event) => {
        if (event.key === 'Enter' || event.type === 'click') {
            const rewardData = await getInteractionsRewardData(user.uid);
            if (rewardData.exists()) {
                const userTokensUpdated = await refreshUserAccessToken(user.refreshToken);

                if (userTokensUpdated.data.status === 200) {
                    const userCredentialsUpdated = userTokensUpdated.data;
                    updateStreamerProfile(user.uid, { twitchAccessToken: userCredentialsUpdated.access_token, refreshToken: userCredentialsUpdated.refresh_token });
                    const rewardUpdated = await updateCustomReward(
                        user.id,
                        userCredentialsUpdated.access_token,
                        rewardId,
                        {
                            title: rewardName,
                            cost: rewardCost,
                            is_paused: false
                        }
                    );

                    if (rewardUpdated.status === 200) {
                        setRewardName(rewardUpdated.title);
                        setRewardCost(rewardUpdated.cost);
                        setActiveEditCoins(false);
                        setActiveEditTitle(false);
                    } else {
                        switch (rewardUpdated.status) {
                            case 404:
                                // Not found (maybe the reward was removed from Twitch)
                                break;
                            case 500:
                                // Twitch internal server error (could not update because of Twitch)
                                break;
                            default:
                                break;
                        }
                    }
                } else {
                    switch (userTokensUpdated.data.status) {
                        case 401:
                            // Invalid refresh token (need to sign in again)
                            handleExpiredSession();
                            break;
                        case 500:
                            // Twitch internal server error
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }

    const handleExpiredSession = async () => {
        alert(t('StreamCard.sessionExpired'));
        await auth.signOut();
        history.push('/');
    }

    return (
        <div className={style.containerItereractions}>
            <h1 className={style.Titulo}>Reactions</h1>
            {(rewardName !== undefined && rewardCost !== undefined)?
                <>
                <img className={style.img} src={imgStreameCoin} alt="coin" />
                <div className={style.content_input}>
                    <div className={style.input}>
                        {ActiveEditTitle ?
                            <>
                            <input
                                className={style.Visibility_input}
                                type="text"
                                maxLength={18}
                                autoFocus
                                value={rewardName}
                                onChange={(event) => setRewardName(event.target.value)}
                                onKeyPress={saveData} />
                            <Button onClick={saveData}>
                                <ConfirmChange />
                            </Button>
                            </>
                            :
                            <>
                            <p className={style.p}>
                                {rewardName}
                            </p>
                            <Button onClick={() => setActiveEditTitle(!ActiveEditTitle)}>
                                <img src={iconEdit} alt="icons-edit" />
                            </Button>
                            </>
                        }
                    </div>
                    <div className={style.input}>
                        {ActiveEditCoins ?
                            <>
                            <input
                                className={style.Visibility_input}
                                type="number"
                                autoFocus
                                value={rewardCost}
                                onChange={(event) => setRewardCost(event.target.value || 0)}
                                onKeyPress={saveData} />
                                <Button onClick={saveData}>
                                    <ConfirmChange />
                                </Button>
                            </>
                            :
                            <>
                            <p className={style.p}>
                                {rewardCost.toLocaleString()}
                            </p>
                            <Button onClick={() => setActiveEditCoins(!ActiveEditCoins)}>
                                <img src={iconEdit} alt="icons-edit" />
                            </Button>
                            </>
                        }
                    </div>
                    <div className={style.disableInteractions}>
                        <p className={style.p}>Reactions enabled</p>
                        <input type="checkbox" id="boton" />
                        <label for="boton"></label>
                    </div>
                </div>
                </>
            :
                <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
                    <CircularProgress className={classes.circularProgress} size={25} />
                </div>
            }
        </div>
    );
};

export default StreamerProfileEditCoin;
