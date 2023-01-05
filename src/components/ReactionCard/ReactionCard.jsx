import React, { useEffect, useState } from 'react';
import { makeStyles, MenuItem, Select, Switch, withStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import style from './ReactionCard.module.css';

import { QOIN, ZAP } from '../../utilities/Constants';
import { getReactionLevelDefaultPrice, getReactionLevelPrice, getReactionSubscriberLevelPrice, getReactionSubscribersLevelDefaultPrice, setReactionLevelPrice, setReactionSubscriberLevelPrice } from '../../services/database';

import { ReactComponent as Bits } from './../../assets/Bits.svg';
import { ReactComponent as Show } from './../../assets/Show.svg';
import { ReactComponent as Zap } from './../../assets/Zap.svg';

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

const ChannelPoinsSwitch = withStyles((theme) => ({
    root: {
        width: 44.4,
        height: 24,
        padding: 0,
    },
    switchBase: {
        color: '#999',
        padding: 0,
        '&$checked': {
            transform: 'translateX(20.4px)',
            color: '#2CE9D2',
            '& + $track': {
                backgroundColor: '#3B4BF9',
                opacity: 1,
                border: 'none',
            },
        },
    },
    checked: {
        // idk why this must exist for the above class to work
    },
    thumb: {
        width: 24,
        height: 24,
    },
    disabled: {
        opacity: 0.6,
        '& + $track': {
            opacity: '0.6 !important',
            backgroundColor: '#444 !important',
        },
    },
    track: {
        borderRadius: 24 / 2,
        backgroundColor: '#444',
        opacity: 1,
    },
}))(Switch);

const SubsSwitch = withStyles((theme) => ({
    root: {
        width: 32,
        height: 24,
        padding: 0,
        borderRadius: 16,
    },
    switchBase: {
        color: '#FF5862',
        padding: 4,
        paddingTop: 6,
        '&$checked': {
            transform: 'translateX(13px)',
            color: '#FF5862',
            '& + $track': {
                backgroundColor: '#fff',
                opacity: 1,
                border: 'none',
            },
        },
    },
    checked: {
        // idk why this must exist for the above class to work
    },
    thumb: {
        width: 12,
        height: 12,
    },
    disabled: {
        opacity: 0.6,
        '& + $track': {
            opacity: '0.6 !important',
            backgroundColor: '#fff !important',
        },
    },
    track: {
        borderRadius: 12 / 2,
        backgroundColor: '#FFFFFF99',
        opacity: 1,
    },
}))(Switch);

const zapsCostArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const ReactionCard = ({
    icons,
    title,
    subtitle,
    textMaxWidth = '100%',
    reactionLevel = 1,
    user,
    availablePrices,
    hideBorder,
    subsMode = 0,
}) => {
    const [cost, setCost] = useState(0);
    const [type, setType] = useState(ZAP);
    const { t } = useTranslation();
    const classes = useStyles();

    const level = `level${reactionLevel}`;

    useEffect(() => {
        async function getPriceData() {
            try {
                let price = null;
                if (subsMode === 0) {
                    price = await getReactionLevelPrice(user.uid, level);
                } else {
                    price = await getReactionSubscriberLevelPrice(user.uid, level);
                }

                if (price.exists()) {
                    setCost(price.val().type === ZAP ? price.val().price : price.val().bitsPrice);
                    setType(price.val().type);
                } else {
                    if (subsMode === 0) {
                        price = await getReactionLevelDefaultPrice(level);
                    } else {
                        price = await getReactionSubscribersLevelDefaultPrice(level);
                    }

                    setCost(price.val().type === ZAP ? price.val().price : price.val().bitsPrice);
                    setType(price.val().type);
                }
            } catch (error) {
                if (type === QOIN) {
                    console.log('error on qoins card: ' + level);
                } else {
                    console.log('error on channel points card: ' + level);
                }
                console.log(error);
            }
        }

        if (user && user.uid) {
            getPriceData();
        }
    }, [cost, type, user.uid, subsMode]);

    const handleCost = async (value, priceType) => {
        const selectedProduct = availablePrices?.find(({ cost }) => (cost === value));

        if (subsMode === 0) {
            await setReactionLevelPrice(
                user.uid,
                level,
                priceType,
                // 10 Qoins = 1 Bit, so the price in Qoins is the price in Bits * 10
                priceType === ZAP ? value : value * 10,
                priceType === ZAP ? null : value,
                selectedProduct?.twitchSku
            );
        } else {
            await setReactionSubscriberLevelPrice(
                user.uid,
                level,
                priceType,
                // 10 Qoins = 1 Bit, so the price in Qoins is the price in Bits * 10
                priceType === ZAP ? value : value * 10,
                priceType === ZAP ? null : value,
                selectedProduct?.twitchSku
            );
        }

        setCost(value);
    }

    const toggleReactionType = async () => {
        // Changes in type will trigger the 2nd useEffect, update the cost there
        if (type === ZAP) {
            setType(QOIN);
            handleCost(availablePrices[0].cost, QOIN);
        } else {
            setType(ZAP);
            handleCost(1, ZAP);
        }
    }

    return (
        <div className={style.gradientContainer} style={{ background: hideBorder ? 'none' : subsMode === 1 ? 'linear-gradient(152.4deg, #690EFF 0%, #FF5862 100%)' : 'linear-gradient(141.89deg, #4657FF 0%, #8F4EFF 100%)', }}>
            <div className={style.container} style={{ background: subsMode === 1 ? 'none' : '#141735' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
                        <linearGradient xmlns="http://www.w3.org/2000/svg" id="icons-gradient" x1="14.1628" y1="-0.16279" x2="3.47637" y2="16.4971" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FFD3FB" />
                            <stop offset="0.484375" stopColor="#F5FFCB" />
                            <stop offset="1" stopColor="#9FFFDD" />
                        </linearGradient>
                    </svg>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        {icons.map((icon, index) => (
                                <div key={`icon-${index}`}
                                    style={{
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
                    <p className={style.subtitle}>
                        {subtitle}
                    </p>
                    <p className={style.title}>
                        {title}
                    </p>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}>
                        <div style={{
                            maxWidth: '136px',
                        }}>
                            <p className={style.title}>
                                Channel Points
                            </p>
                            <p className={style.subtitle}>
                                Allow viewers to send alerts using channel points
                            </p>
                        </div>
                        {subsMode === 1 ?
                            <SubsSwitch checked={type === ZAP}
                                onChange={toggleReactionType} />
                            :
                            <ChannelPoinsSwitch checked={type === ZAP}
                                onChange={toggleReactionType} />
                        }
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '20px'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            {type === ZAP &&
                                <Zap style={{
                                    width: '16px',
                                    heigt: '16px',
                                }} />
                            }
                            {type === QOIN &&
                                <Bits />
                            }
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
                                style={{
                                    color: '#fff',
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    border: 'none',
                                    outline: 'none',
                                    borderRadius: '8px',
                                    padding: '0px 0px 0px 8px'
                                }}
                                IconComponent={(props) => <Show {...props} style={{ marginTop: '4px' }} />}
                                displayEmpty
                                disableUnderline
                                value={cost}
                                onChange={({ target: { value } }) => handleCost(value, type)}>
                                {type === QOIN ?
                                    availablePrices.map(({ cost, twitchSku }) => (
                                        <MenuItem value={cost} key={twitchSku}>
                                            {cost.toLocaleString()}
                                        </MenuItem>
                                    ))
                                    :
                                    zapsCostArray.map((zapNumber) => (
                                        <MenuItem value={zapNumber} key={zapNumber}>
                                            {zapNumber.toLocaleString()}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReactionCard;