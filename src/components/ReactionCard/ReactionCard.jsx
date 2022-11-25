import React, { useEffect, useState, useRef } from "react";

import style from './ReactionCard.module.css';

import { ReactComponent as ChPts } from './../../assets/reactionCardsIcons/ChPts.svg';
import { ReactComponent as Qoin } from './../../assets/DonatedQoin.svg';
import { REACTION_CARD_CHANNEL_POINTS, REACTION_CARD_QOINS } from "../../utilities/Constants";
import { getInteractionsRewardData, getReactionsPrices, setReactionPrice, updateStreamerProfile } from "../../services/database";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { refreshUserAccessToken } from "../../services/functions";
import { getCustomReward } from "../../services/twitch";
import { CircularProgress, makeStyles } from "@material-ui/core";

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
    user,
    FBNode,
    defaultCost,
    background,
    backgroundURL,
    backgroundPos = 'center',
    backgroundSize = 'cover',
    backgroundPosX = '50%',
    backgroundPosY = '50%',
}) => {
    const { t } = useTranslation();
    const history = useHistory();
    const classes = useStyles();

    const [cost, setCost] = useState(null);
    const [newCost, setNewCost] = useState(null);
    const [rewardId, setRewardId] = useState(null);
    const [editingCost, setEditingCost] = useState(false);
    const [updatingCost, setUpdatingCost] = useState(false);

    const inputRef = useRef(null);

    useEffect(() => {
        async function getPricesData() {
            try {
                const pricesData = await getReactionsPrices(user.uid);
                if (pricesData.exists()) {
                    if (pricesData.child(FBNode).exists()) {
                        setCost(pricesData.child(FBNode).val());
                    } else {
                        setReactionPrice(user.uid, FBNode, defaultCost);
                        setCost(defaultCost);
                    }
                } else {
                    setReactionPrice(user.uid, FBNode, defaultCost);
                    setCost(defaultCost);
                }
            } catch (error) {
                if (type === REACTION_CARD_QOINS) {
                    console.log('error on qoins card: ' + FBNode);
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
                            // setRewardName(reward.title);
                            setCost(reward.cost);
                            // setRewardBackgroundColor(reward.background_color);
                            // setReactionsEnabled(!reward.is_paused);
                            // setTitleCheckbox(t(!reward.is_paused ? 'StreamerProfile.StreamerProfileEditCoin.enabled' : 'StreamerProfile.StreamerProfileEditCoin.disabled'));
                            setRewardId(reward.id);
                        } else if (reward === 404) {
                            history.push('/onboarding');
                        }
                    } else {
                        history.push('/onboarding');
                    }
                } else {
                    history.push('/onboarding');
                }
            } catch (error) {
                console.log(error);
            }
        }

        if (user.uid && cost === null && type === REACTION_CARD_QOINS) {
            getPricesData();
        }
        if (user.uid && cost === null && type === REACTION_CARD_CHANNEL_POINTS) {
            getChannelPointRewardData();
        }
    }, [FBNode, cost, defaultCost, history, type, user.id, user.refreshToken, user.uid]);

    const HandleButton = () => {
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
            setReactionPrice(user.uid, FBNode, newCostInt);
            // on success
            setCost(newCostInt);
            setUpdatingCost(false);
            return;
        }

        if (type === REACTION_CARD_CHANNEL_POINTS) {

            //on success
            setCost(newCostInt);
            setUpdatingCost(false);
            return;
        }
        setTimeout(() => {
            setUpdatingCost(false);
        }, 1000)
    }

    const HandleCost = (e) => {
        console.log(e.target.value);
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
                        onChange={HandleCost}
                    />
                </div>
                <div className={style.button} onClick={HandleButton}>
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