import React, { useState, useEffect } from "react";
import { Button, CircularProgress, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Modal } from "@material-ui/core";

import iconEdit from "../../assets/Edit.svg";
import { getCustomReward, updateCustomReward } from "../../services/twitch";
import { getInteractionsRewardData, setAlertSetting, updateStreamerProfile } from "../../services/database";
import { refreshUserAccessToken } from "../../services/functions";
import { auth } from "../../services/firebase";
import { ReactComponent as ConfirmChange } from './../../assets/ConfirmChange.svg';
import StreamerProfileModalDisableInteractions from "../StreamerProfileModalDisableInteractions/StreamerProfileModalDisableInteractions";
import StreamerProfileImgCoin from '../StreamerProfileImgCoin/StreamerProfileImgCoin';
import style from "./StreamerProfileEditCoin.module.css";

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
    const [rewardName, setRewardName] = useState('');
    const [rewardCost, setRewardCost] = useState('');
    const [savingChanges, setSavingChanges] = useState(false);
    const [rewardBackgroundColor, setRewardBackgroundColor] = useState('');
    const [modal, setModal] = useState(false);
    const [titleCheckbox, setTitleCheckbox] = useState("enabled");
    const [reactionsEnabled, setReactionsEnabled] = useState(true);
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
                    if (reward && reward.id) {
                        setRewardName(reward.title);
                        setRewardCost(reward.cost);
                        setRewardBackgroundColor(reward.background_color);
                        setReactionsEnabled(!reward.is_paused);
                        setRewardId(reward.id);
                    } else if (reward === 404) {
                        history.push('/onboarding');
                    }
                }
            } else {
                history.push('/onboarding');
            }
        }

        if (user.uid) {
            getRewardData();
        }
    }, [user.uid, user.id, user.refreshToken]);

    const saveData = async (event) => {
        if (event.key === 'Enter' || event.type === 'click') {
            setSavingChanges(true);
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
                        cost: rewardCost
                    }
                );

                if (rewardUpdated.status === 200) {
                    setRewardName(rewardUpdated.title);
                    setRewardCost(rewardUpdated.cost);
                    setRewardBackgroundColor(rewardUpdated.background_color);
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

                setSavingChanges(false);
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

    const handleExpiredSession = async () => {
        alert(t('StreamCard.sessionExpired'));
        await auth.signOut();
        history.push('/');
    }

    const handleCheckbox = (e) => {
        if (!e.target.checked) {
            const dontShowDialog = localStorage.getItem('dontShowCloseDisableReactionsDialog');
            if (!dontShowDialog) {
                setModal(true);
            } else {
                toggleReward();
            }
        } else {
            setTitleCheckbox("enabled");
            toggleReward();
        }
    }

    const toggleReward = async () => {
        setSavingChanges(true);
        const userTokensUpdated = await refreshUserAccessToken(user.refreshToken);

        if (userTokensUpdated.data.status === 200) {
            const userCredentialsUpdated = userTokensUpdated.data;
            updateStreamerProfile(user.uid, { twitchAccessToken: userCredentialsUpdated.access_token, refreshToken: userCredentialsUpdated.refresh_token });
            const rewardUpdated = await updateCustomReward(
                user.id,
                userCredentialsUpdated.access_token,
                rewardId,
                {
                    is_paused: reactionsEnabled
                }
            );

            if (rewardUpdated.status === 200) {
                setAlertSetting(user.uid, 'reactionsEnabled', !rewardUpdated.is_paused);
                setReactionsEnabled(!rewardUpdated.is_paused);
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

            setSavingChanges(false);
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

    return (
        <div className={style.containerItereractions}>
            <h1 className={style.Titulo}>Reactions</h1>
            {rewardId !== '' && !savingChanges ?
                <>
                <StreamerProfileImgCoin rewardCost={rewardCost} backgroundColor={rewardBackgroundColor} />
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
                            <Button onClick={saveData} style={{ justifyContent: 'flex-end', padding: '6px 0px' }}>
                                <ConfirmChange />
                            </Button>
                            </>
                            :
                            <>
                            <p className={style.p}>
                                {rewardName}
                            </p>
                            <Button onClick={() => setActiveEditTitle(!ActiveEditTitle)} style={{ justifyContent: 'flex-end', padding: '6px 0px' }}>
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
                                <Button onClick={saveData} style={{ justifyContent: 'flex-end', padding: '6px 0px' }}>
                                    <ConfirmChange />
                                </Button>
                            </>
                            :
                            <>
                            <p className={style.p}>
                                {rewardCost.toLocaleString()}
                            </p>
                            <Button onClick={() => setActiveEditCoins(!ActiveEditCoins)} style={{ justifyContent: 'flex-end', padding: '6px 0px' }}>
                                <img src={iconEdit} alt="icons-edit" />
                            </Button>
                            </>
                        }
                    </div>
                    <div className={style.disableInteractions}>
                        <p className={style.p}>Reactions {titleCheckbox}</p>
                        <input
                            className={style.input_checkbox}
                            type="checkbox"
                            id="boton"
                            checked={reactionsEnabled}
                            onChange={(e) => handleCheckbox(e)}
                        />
                        <label for="boton"></label>
                    </div>
                </div>
                </>
            :
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress className={classes.circularProgress} size={25} />
                </div>
            }
            <Modal className={style.modalContainer}
                open={modal}
                onClose={() => setModal(false)}>
                <StreamerProfileModalDisableInteractions closeDialog={() => setModal(false)}
                    disableReward={toggleReward}
                    setReactionsEnabled={setReactionsEnabled}
                    setTitleCheckbox={setTitleCheckbox} />
            </Modal>
        </div>
    );
};

export default StreamerProfileEditCoin;
