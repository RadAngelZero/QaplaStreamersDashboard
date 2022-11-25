import React, { useEffect, useState, useRef } from "react";

import style from './ReactionCard.module.css';

import { ReactComponent as ChPts } from './../../assets/reactionCardsIcons/ChPts.svg';
import { ReactComponent as Qoin } from './../../assets/DonatedQoin.svg';
import { REACTION_CARD_CHANNEL_POINTS, REACTION_CARD_QOINS } from "../../utilities/Constants";
import { getInteractionsRewardData, getReactionPriceByLevel, setReactionPrice, updateStreamerProfile } from "../../services/database";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { refreshUserAccessToken } from "../../services/functions";
import { getCustomReward, updateCustomReward } from "../../services/twitch";
import { CircularProgress, makeStyles } from "@material-ui/core";
import { auth } from "../../services/firebase";

const useStyles = makeStyles((theme) => ({
    circularProgress: {
        color: '#0AFFD2',
        alignSelf: 'center'
    },
}));

const ReactionCard = ({
    icons,
    title,
    subtitle,
    textMaxWidth = '100%',
    type,
    reactionLevel = 1,
    user,
    defaultCost,
    background,
    backgroundURL,
    backgroundPos = 'center',
    backgroundSize = 'cover',
    backgroundPosX = '50%',
    backgroundPosY = '50%',
}) => {
    const [cost, setCost] = useState(null);
    const [newCost, setNewCost] = useState(null);
    const [rewardId, setRewardId] = useState(null);
    const [editingCost, setEditingCost] = useState(false);
    const [updatingCost, setUpdatingCost] = useState(false);
    const inputRef = useRef(null);
    const { t } = useTranslation();
    const history = useHistory();
    const classes = useStyles();

    const level = `level${reactionLevel}`;

    useEffect(() => {
        async function getPriceData() {
            try {
                const price = await getReactionPriceByLevel(user.uid, level);
                if (price.exists()) {
                    setCost(price.val());
                } else {
                    setCost(defaultCost);
                }
            } catch (error) {
                if (type === REACTION_CARD_QOINS) {
                    console.log('error on qoins card: ' + level);
                } else {
                    console.log('error on channel points card');
                }
                console.log(error);
            }
        }

        async function getChannelPointRewardData() {
            try {
                const rewardData = await getInteractionsRewardData(user.uid);
                if (rewardData.exists()) {
                    const userTokensUpdated = await refreshUserAccessToken(user.refreshToken);
                    if (userTokensUpdated.data.status === 200) {
                        const userCredentialsUpdated = userTokensUpdated.data;
                        updateStreamerProfile(user.uid, { twitchAccessToken: userCredentialsUpdated.access_token, refreshToken: userCredentialsUpdated.refresh_token });
                        const reward = await getCustomReward(rewardData.val().rewardId, user.id, userCredentialsUpdated.access_token);
                        if (reward && reward.id) {
                            setCost(reward.cost);
                            setRewardId(reward.id);
                        } else if (reward === 404) {
                            history.push('/onboarding');
                        }
                    } else {
                        // Refresh token is useless, signout user
                        alert(t('StreamCard.sessionExpired'));
                        await auth.signOut();
                        history.push('/');
                    }
                } else {
                    history.push('/onboarding');
                }
            } catch (error) {
                console.log(error);
            }
        }

        if (user.uid && cost === null && type === REACTION_CARD_QOINS) {
            getPriceData();
        }
        if (user.uid && cost === null && type === REACTION_CARD_CHANNEL_POINTS) {
            getChannelPointRewardData();
        }
    }, [cost, defaultCost, history, type, user.id, user.refreshToken, user.uid, reactionLevel]);

    const handleButton = async () => {
        if (updatingCost) {
            return;
        }
        if (!editingCost) {
            setEditingCost(true);
            setNewCost(cost);
            setTimeout(() => {
                inputRef.current.focus();
            }, 100);

            return;
        }

        let newCostInt = parseInt(newCost);

        if (cost === newCost) {
            setEditingCost(false);

            return;
        }

        setUpdatingCost(true);
        setEditingCost(false);

        if (type === REACTION_CARD_QOINS) {
            await setReactionPrice(user.uid, level, newCostInt);
            setCost(newCostInt);
            setUpdatingCost(false);
            return;
        }

        if (type === REACTION_CARD_CHANNEL_POINTS) {
            const userTokensUpdated = await refreshUserAccessToken(user.refreshToken);

            if (userTokensUpdated.data.status === 200) {
                const userCredentialsUpdated = userTokensUpdated.data;
                updateStreamerProfile(user.uid, { twitchAccessToken: userCredentialsUpdated.access_token, refreshToken: userCredentialsUpdated.refresh_token });
                const rewardUpdated = await updateCustomReward(
                    user.id,
                    userCredentialsUpdated.access_token,
                    rewardId,
                    {
                        cost: newCostInt
                    }
                );

                if (rewardUpdated.status === 200) {
                    setCost(newCostInt);
                    setUpdatingCost(false);

                    return;
                }
            }
        }
    }

    const handleCost = (e) => {
        setNewCost(e.target.value);
    }

    return (
        <div className={style.container} style={{
            display: 'flex',
            flexDirection: 'column',
            background: background ? background : `url('${backgroundURL}')`,
            backgroundSize: backgroundSize,
            backgroundPosition: backgroundPos,
            backgroundPositionX: backgroundPosX,
            backgroundPositionY: backgroundPosY,
            height: '288px',
            maxWidth: '250px',
            width: '250px',
            borderRadius: '20px',
            overflow: 'hidden',
            padding: '24px',
            justifyContent: 'space-between',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
            }}>
                {
                    icons.map((icon) => {
                        return (
                            <div style={{
                                marginRight: '16px',
                            }}>
                                {icon}
                            </div>
                        );
                    })
                }
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: textMaxWidth,
            }}>
                <p style={{
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '400',
                    lineHeight: '12px',
                }}>
                    {subtitle}
                </p>
                <p style={{
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '700',
                    lineHeight: '17px',
                }}>
                    {title}
                </p>
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    {type === REACTION_CARD_CHANNEL_POINTS &&
                        <ChPts />
                    }
                    {type === REACTION_CARD_QOINS &&
                        <Qoin style={{
                            maxWidth: '18px',
                            maxHeight: '18px'
                        }} />
                    }
                    <input
                        ref={inputRef}
                        className={style.costInput}
                        type='number'
                        value={editingCost ? newCost : cost}
                        disabled={!editingCost}
                        onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                        onChange={handleCost}
                    />
                </div>
                <div className={style.button} onClick={handleButton}>
                    {updatingCost ?
                        <CircularProgress size={12} className={classes.circularProgress} />
                        :
                        <p className={style.buttonText}>
                            {editingCost ?
                                `Save`
                                :
                                `Edit`
                            }
                        </p>
                    }

                </div>
            </div>
        </div>
    );

}

export default ReactionCard;