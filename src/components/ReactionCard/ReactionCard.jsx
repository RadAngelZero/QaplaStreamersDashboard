import React, { useEffect, useState, useRef } from 'react';
import { CircularProgress, makeStyles, MenuItem, Select } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import style from './ReactionCard.module.css';

import { REACTION_CARD_CHANNEL_POINTS, REACTION_CARD_QOINS } from '../../utilities/Constants';
import { getInteractionsRewardData, getReactionPriceInBitsByLevel, setReactionPrice, setReactionPriceInBits, updateStreamerProfile } from '../../services/database';
import { refreshUserAccessToken } from '../../services/functions';
import { getCustomReward, updateCustomReward } from '../../services/twitch';
import { auth } from '../../services/firebase';

import { ReactComponent as ChPts } from './../../assets/reactionCardsIcons/ChPts.svg';
import { ReactComponent as Edit } from './../../assets/Edit.svg';
import { ReactComponent as Bits } from './../../assets/Bits.svg';
import { ReactComponent as Show } from './../../assets/Show.svg';

const useStyles = makeStyles(() => ({
    circularProgress: {
        color: '#0AFFD2',
        alignSelf: 'center'
    },
    select: {
        paddingLeft: '16px',
        paddingRight: '16px',
        maxHeight: '320px',
        '& ul': {
            padding: 0
        },
        '& li': {
            fontSize: 12,
            fontWeight: 600,
            color: '#FFF',
            backgroundColor: '#141735 !important',
            justifyContent: 'flex-end'
        },
    },
    selectPaper: {
        borderRadius: '10px',
        backgroundColor: '#141735 !important',
        '&::-webkit-scrollbar': {
            width: 0
        }
    }
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
    background = '#141735',
    backgroundURL,
    availablePrices
}) => {
    const [cost, setCost] = useState(null);
    const [newCost, setNewCost] = useState(null);
    const [rewardId, setRewardId] = useState(null);
    const [editingCost, setEditingCost] = useState(false);
    const [updatingCost, setUpdatingCost] = useState(false);
    const [inputWidth, setInputWidth] = useState('');
    const inputRef = useRef(null);
    const { t } = useTranslation();
    const history = useHistory();
    const classes = useStyles();

    const level = `level${reactionLevel}`;

    useEffect(() => {
        async function getPriceData() {
            try {
                const price = await getReactionPriceInBitsByLevel(user.uid, level);
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
                            setInputWidth(`${reward.cost.toString().length}ch`);
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

    const handleCost = async (e) => {
        if (type === REACTION_CARD_CHANNEL_POINTS) {
            setNewCost(e.target.value);
        } else {
            const selectedProduct = availablePrices.find(({ cost }) => (cost === e.target.value));
            // 10 Qoins = 1 Bit, so the cost in Qoins is the cost in Bits * 10
            await setReactionPriceInBits(user.uid, level, e.target.value, selectedProduct.twitchSku);
            await setReactionPrice(user.uid, level, e.target.value * 10);
            setCost(e.target.value);
        }
    }

    return (
        <div className={style.gradientContainer}>
            <div className={style.container} style={{
                display: 'flex',
                flexDirection: 'column',
                background: background ? background : `url('${backgroundURL}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '288px',
                maxWidth: '248px',
                width: '248px',
                borderRadius: '20px',
                overflow: 'hidden',
                padding: '24px',
                justifyContent: 'space-between',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
                        <linearGradient xmlns="http://www.w3.org/2000/svg" id="icons-gradient" x1="14.1628" y1="-0.16279" x2="3.47637" y2="16.4971" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#FFD3FB" />
                            <stop offset="0.484375" stop-color="#F5FFCB" />
                            <stop offset="1" stop-color="#9FFFDD" />
                        </linearGradient>
                    </svg>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        {icons.map((icon) => (
                                <div style={{
                                    marginRight: '16px',
                                }}>
                                    {icon}
                                </div>
                            ))
                        }
                    </div>
                    <p style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        color: '#FFF'
                    }}>
                        Tier {reactionLevel}
                    </p>
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
                            <Bits />
                        }
                        {type === REACTION_CARD_CHANNEL_POINTS && inputWidth !== '' &&
                            <input ref={inputRef}
                                style={{
                                    width: inputWidth
                                }}
                                className={style.costInput}
                                type='number'
                                value={editingCost ? newCost : cost}
                                disabled={type === REACTION_CARD_QOINS || !editingCost}
                                onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                                onChange={type === REACTION_CARD_QOINS ? () => {} : handleCost} />
                        }
                        {type === REACTION_CARD_CHANNEL_POINTS &&
                            <div className={style.button} onClick={handleButton} style={{
                                backgroundColor: editingCost ? '#3B4BF9' : '#0000'
                            }}>
                                {updatingCost ?
                                    <CircularProgress size={12} className={classes.circularProgress} />
                                    :
                                    <>
                                        {editingCost ?
                                            <p className={style.buttonText}>
                                                {t('StreamerProfile.ReactionCard.button.save')}
                                            </p>
                                            :
                                            <Edit height={24}
                                                width={24}
                                                style={{
                                                    transform: 'scale(.75)',
                                                    maxWidth: '24px',
                                                    maxHeight: '24px',
                                                    margin: '0px -8px',
                                            }} />
                                        }
                                    </>
                                }
                            </div>
                        }
                        {type === REACTION_CARD_QOINS &&
                            <Select MenuProps={{
                                    classes: {
                                        paper: classes.select
                                    },
                                    PaperProps: {
                                        className: classes.selectPaper
                                    },
                                    anchorOrigin: {
                                        vertical: 'top',
                                        horizontal: 'left'
                                        },
                                        transformOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left'
                                        },
                                        getContentAnchorEl: null
                                }}
                                SelectDisplayProps={{
                                    style: {
                                        paddingRight: '16px'
                                    }
                                }}
                                style={{
                                    color: '#fff',
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    border: 'none',
                                    outline: 'none',
                                    borderRadius: '8px',
                                    padding: '0px 8px',
                                }}
                                IconComponent={(props) => <Show {...props} style={{ marginTop: '4px' }} />}
                                displayEmpty
                                disableUnderline
                                value={cost}
                                onChange={handleCost}>
                                {availablePrices.map(({ cost, twitchSku }) => (
                                    <MenuItem value={cost} key={twitchSku}>
                                        {cost.toLocaleString()}
                                    </MenuItem>
                                ))}
                            </Select>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReactionCard;