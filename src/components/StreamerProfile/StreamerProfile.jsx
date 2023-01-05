import React, { useEffect, useRef, useState } from 'react';
import { withStyles, Grid, Avatar, Button, Card, CardContent, Box, IconButton, Hidden, makeStyles, Switch, Dialog, CircularProgress, Tab, Tabs } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import styles from './StreamerProfile.module.css';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import StreamsLeft from '../StreamsLeft/StreamsLeft';
import { ReactComponent as TwitchIcon } from './../../assets/twitchIcon.svg';
import { ReactComponent as AddIcon } from './../../assets/AddIcon.svg';
import { ReactComponent as DonatedQoin } from './../../assets/DonatedQoin.svg';
import { ReactComponent as BitsIcon } from './../../assets/BitsIcon.svg';
import { ReactComponent as MessageIcon } from './../../assets/MessageBubble.svg';

import { ReactComponent as GIFIcon } from './../../assets/reactionCardsIcons/GIF.svg';
import { ReactComponent as MemesIcon } from './../../assets/reactionCardsIcons/Memes.svg';
import { ReactComponent as MegaStickerIcon } from './../../assets/reactionCardsIcons/MegaSticker.svg';
import { ReactComponent as AvatarIcon } from './../../assets/reactionCardsIcons/Avatar.svg';
import { ReactComponent as TtGiphyIcon } from './../../assets/reactionCardsIcons/TtGiphy.svg';
import { ReactComponent as TTSBotIcon } from './../../assets/reactionCardsIcons/TTSBot.svg';
import { ReactComponent as PlusIcon } from './../../assets/reactionCardsIcons/+.svg';

import { ReactComponent as Star } from './../../assets/Star.svg';
import { ReactComponent as Zap } from './../../assets/Zap.svg';
import { ReactComponent as Close } from './../../assets/CloseIcon.svg';
import { ReactComponent as ChPts } from './../../assets/reactionCardsIcons/ChPts.svg';
import { ReactComponent as Edit } from './../../assets/Edit.svg';
import { ReactComponent as OnEye } from './../../assets/OnEye.svg';
import { ReactComponent as OffEye } from './../../assets/OffEye.svg';
import { ReactComponent as CalendarOnTabIcon } from './../../assets/CalendarTabOn.svg';
import { ReactComponent as CalendarOffTabIcon } from './../../assets/CalendarTabOff.svg';
import { ReactComponent as ClockOnTabIcon } from './../../assets/ClockTabOn.svg';
import { ReactComponent as ClockOffTabIcon } from './../../assets/ClockTabOff.svg';
import { ReactComponent as Heart } from './../../assets/Heart.svg';
import { ReactComponent as SlidersSettings } from './../../assets/SlidersSettings.svg';

import BarProgressBit from '../BarProgressBit/BarProgressBit';

import { getInteractionsRewardData, getQreatorCode, getStreamerAlertSetting, getStreamerValueOfQoins, loadStreamsByStatus, loadStreamsByStatusRange, loadTwitchExtensionReactionsPrices, setAlertSetting, updateStreamerProfile } from '../../services/database';
import StreamCard from '../StreamCard/StreamCard';
import {
    SCHEDULED_EVENT_TYPE,
    PENDING_APPROVAL_EVENT_TYPE,
    PAST_STREAMS_EVENT_TYPE,
    PREMIUM
} from '../../utilities/Constants';
import CheersBitsRecordDialog from '../CheersBitsRecordDialog/CheersBitsRecordDialog';
import ReactionCard from '../ReactionCard/ReactionCard';
import { getEmotes, refreshUserAccessToken } from '../../services/functions';
import { auth } from '../../services/firebase';
import { getCustomReward, updateCustomReward } from '../../services/twitch';

const BalanceButtonContainer = withStyles(() => ({
    root: {
        display: 'flex',
        backgroundColor: '#141735',
        width: '100%',
        padding: '22px 24px',
        height: '100px',
        minWidth: '250px !important',
        maxWidth: '330px !important',
        borderRadius: '20px',
        alignItems: 'center',
        justifyContent: 'space-between',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#141735',
            opacity: 0.7
        }
    },
    label: {
        display: 'flex'
    },
}))(Button);

const BitsButtonContainer = withStyles(() => ({
    root: {
        display: 'flex',
        backgroundColor: '#141735',
        padding: '22px 24px',
        height: '100px',
        minWidth: '190px !important',
        maxWidth: 522,
        borderRadius: '20px',
        alignItems: 'center',
        justifyContent: 'space-between',
        textTransform: 'none',
        marginLeft: '5px',
        '&:hover': {
            backgroundColor: '#141735'
        },
        '&:active': {
            backgroundColor: '#141735'
        }
    },
    label: {
        display: 'flex'
    },
}))(Button);

const useStyles = makeStyles((theme) => ({
    createCardContentRoot: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        alignItems: 'center',
    },
    createCardButtonIconLabel: {
        width: '18px',
        height: '18px'
    }
}));


const ReactionsSwitch = withStyles((theme) => ({
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

const PremiumDialog = withStyles(() => ({
    root: {
    },
    paper: {
        backgroundColor: '#141833',
        borderRadius: '35px',
        padding: '40px 30px',
    },
}))(Dialog);

const QaplaTabs = withStyles(() => ({
    root: {
        webkitBoxSizing: 'border-box',
        mozBoxSizing: 'border-box',
        boxSizing: 'border-box',
        marginTop: '24px',
    },
    flexContainer: {
        webkitBoxSizing: 'border-box',
        mozBoxSizing: 'border-box',
        boxSizing: 'border-box',
    },
    indicator: {
        backgroundColor: '#0000'
    }
}))(Tabs);

const QaplaTab = withStyles(() => ({
    root: {
        height: '35px',
        maxHeight: '35px',
        padding: '8px 12px',
        webkitBoxSizing: 'border-box',
        mozBoxSizing: 'border-box',
        boxSizing: 'border-box',
        color: '#fff',
        borderRadius: '6px',
        marginRight: '16px',
        minWidth: 'auto',
        minHeight: 'auto',
        textTransform: 'none',
        fontSize: '16px',
        fontWeight: '600',
        lineHeight: '19px',
        letterSpacing: '-0.33764705061912537px',
        textAlign: 'center',

    },
    selected: {
        backgroundColor: '#29326B',
    },
    wrapper: {
        flexDirection: 'row',
        justifyItems: 'center',
        gap: '4px',
    }
}))(Tab);

const StartFreeTrialButton = withStyles(() => ({
    root: {
        display: 'flex',
        backgroundColor: '#3B4BF9',
        padding: '20px 16px',
        borderRadius: '8px',
        alignItems: 'center',
        justifyContent: 'space-between',
        textTransform: 'none',
        width: '390px',
        marginTop: '56px',
        '&:hover': {
            opacity: 0.8,
            backgroundColor: '#3B4BF9'
        },
        '&:active': {
            opacity: 0.6,
            backgroundColor: '#3B4BF9'

        },
        webkitBoxSizing: 'border-box', /* Safari/Chrome, other WebKit */
        mozBoxSizing: 'border-box',    /* Firefox, other Gecko */
        boxSizing: 'border-box',       /* Opera/IE 8+ */
    },
    label: {
        display: 'flex',
        color: '#fff',
        fontSize: '12px',
        fontWeight: '600',
        lineHeight: '15px',
        letterSpacing: '0.492000013589859px',
        justifyContent: 'center',
    },
}))(Button);

const StreamerProfile = ({ user, games, qoinsDrops }) => {
    const classes = useStyles();
    const history = useHistory();
    const [streams, setStreams] = useState({});
    const [openRecordsDialog, setOpenRecordsDialog] = useState(false);
    const [buttonPressed, setButtonPressed] = useState('Qoins');
    const [pendingMessages, setPendingMessages] = useState(0);
    const [valueOfQoinsForStreamer, setValueOfQoinsForStreamer] = useState(0);
    const [streamsTab, setStreamsTab] = useState(0);
    const [qreatorCode, setQreatorCode] = useState('');
    const [openTooltip, setOpenTooltip] = useState(false);
    const [randomEmoteUrl, setRandomEmoteUrl] = useState('');
    const [reactionsEnabled, setReactionsEnabled] = useState(false);
    const [updatingReactionsStatus, setUpdatingReactionsStatus] = useState(false);
    const [reactionsPrices, setReactionsPrices] = useState([]);
    const [openGoPremiumDialog, setOpenGoPremiumDialog] = useState(false);
    const [editingChannelRewardCost, setEditingChannelRewardCost] = useState(false);
    const [updatingChannelRewardCost, setUpdatingChannelRewardCost] = useState(false);
    const [channelRewardCost, setChannelRewardCost] = useState(null);
    const [newChannelRewardCost, setNewChannelRewardCost] = useState(null);
    const [rewardId, setRewardId] = useState(null);
    const [inputWidth, setInputWidth] = useState('4ch');
    const [editingSubsRewards, setEditingSubsRewards] = useState(0);
    const inputRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        function setStreamLoaded(streams) {
            if (streams.exists()) {
                setStreams(streams.val());
            } else {
                setStreams({});
            }
        }

        async function getValueOfQoins() {
            if (user) {
                let valueOfQoins = (await getStreamerValueOfQoins(PREMIUM)).val();

                setValueOfQoinsForStreamer(valueOfQoins);
            }
        }

        async function loadStreams() {
            if (user) {
                if (!streamsTab) {
                    setStreamLoaded(await loadStreamsByStatusRange(user.uid, PENDING_APPROVAL_EVENT_TYPE, SCHEDULED_EVENT_TYPE));
                } else {
                    setStreamLoaded(await loadStreamsByStatus(user.uid, PAST_STREAMS_EVENT_TYPE));
                }
            } else if (user === undefined) {
                history.push('/');
            }
        }

        async function getUserQreatorCode() {
            if (user) {
                const code = await getQreatorCode(user.uid);
                if (code.exists()) {
                    setQreatorCode(code.val());
                }
            }
        }

        async function getRandomEmote() {
            if (user && user.uid) {
                const emotesRequest = await getEmotes(user.uid);

                const emotes = emotesRequest.data ? emotesRequest.data : null;
                if (emotes) {
                    // Find the first array who has more than 0 elements
                    const array = emotes.find((typeOfEmote) => typeOfEmote.data[0].length > 0);
                    const randomNumber = Math.floor(Math.random() * array.data[0].length);

                    setRandomEmoteUrl(array.data[0][randomNumber].images.url_1x);
                }
            }
        }

        async function loadReactionsEnabled() {
            if (user && user.uid) {
                const reactionsEnabled = await getStreamerAlertSetting(user.uid, 'reactionsEnabled');

                /**
                 * When reactionsEnabled does not exist the reactions are enabled, they are only disabled when the user
                 * has explicitly required them to be disabled
                 */
                setReactionsEnabled(reactionsEnabled.exists() ? Boolean(reactionsEnabled.val()).valueOf() : true);
            }
        }

        async function loadTwitchExtensionPrices() {
            const prices = await loadTwitchExtensionReactionsPrices();
            if (prices.exists()) {
                setReactionsPrices(prices.val());
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
                            setChannelRewardCost(reward.cost);
                            setRewardId(reward.id);
                            setInputWidth(reward.cost.toLocaleString().length > 0 ? (reward.cost.toLocaleString().length > 8 ? '8ch' : reward.cost.toLocaleString().length + 'ch') : '1ch');
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

        if (!editingChannelRewardCost && newChannelRewardCost === null) {
            getChannelPointRewardData();
        }
        loadStreams();
        getValueOfQoins();
        getUserQreatorCode();
        loadReactionsEnabled();
        loadTwitchExtensionPrices();

        if (!randomEmoteUrl) {
            getRandomEmote();
        }
    }, [streamsTab, user, history, randomEmoteUrl, channelRewardCost, t, editingChannelRewardCost, newChannelRewardCost]);

    const createStream = () => {
        // User never has been premium and has never used a Free Trial
        if (user.premium === undefined && user.freeTrial === undefined) {
            history.push('/freeTrial');
            // User was premium at least once but now is not premium, suggest him to buy a membership
        } else if (user.premium === false) {
            history.push('/membership');
        } else {
            history.push('/create');
        }
    }

    /**
     * Format the date to show in the card
     * @param {string} date date in format DD-MM-YYYY
     * @example formatDate("12-02-2021") returns 12 Feb 2021
     */
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic'];
        return `${date.getDate()} ${months[date.getMonth()]}`;
    }

    const formatHour = (timestamp) => {
        const date = new Date(timestamp);
        let hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
        const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

        const amPm = hour >= 12 ? 'p.m.' : 'a.m.';
        hour = hour % 12;
        hour = hour ? hour : 12;

        hour = hour < 10 ? `0${hour}` : hour;

        return `${hour}:${minutes} ${amPm}`;
    }

    const onRemoveStream = (streamId) => {
        const streamsCopy = { ...streams };
        delete streamsCopy[streamId];
        setStreams(streamsCopy);
    }

    let cheersQoins = 0;
    let availableBits = 0;
    let nextMilestone = 250;
    let estimatedBits = 0;

    if (user) {
        cheersQoins = user.qoinsBalance || 0;
        const tensOfBits = cheersQoins / 200;
        estimatedBits = (tensOfBits) * valueOfQoinsForStreamer;
        availableBits = 250 * Math.floor((estimatedBits) / 250);
        nextMilestone = 250 * Math.ceil((estimatedBits + 1) / 250);
    }

    const handleStreamsTabs = (event, newValue) => {
        setStreamsTab(newValue);
    }

    const copyQreatorCode = () => {
        navigator.clipboard.writeText(qreatorCode);
        setOpenTooltip(true);
        setTimeout(() => {
            setOpenTooltip(false);
        }, 1250);
    }

    const handleReactionsSwitch = async (e) => {
        setUpdatingReactionsStatus(true);
        await setAlertSetting(user.uid, 'reactionsEnabled', !reactionsEnabled);
        setReactionsEnabled(!reactionsEnabled);
        setUpdatingReactionsStatus(false);
    }

    const handlePremiumButton = async () => {
        if ((user.premium || user.freeTrial) && user.currentPeriod) {
            return history.push('/membership')
        }
        if (openGoPremiumDialog) {
            // do billing
            return setOpenGoPremiumDialog(false);
        }
        setOpenGoPremiumDialog(true);
    }

    const handleChannelRewardCost = async (e) => {
        setNewChannelRewardCost(e.target.value);
        setInputWidth(e.target.value.length > 0 ? (e.target.value.length > 8 ? '8ch' : e.target.value.length + 'ch') : '1ch');
    }

    const handleChannelRewardButton = async () => {
        if (updatingChannelRewardCost) {
            return;
        }
        if (!editingChannelRewardCost) {
            setEditingChannelRewardCost(true);
            setNewChannelRewardCost(channelRewardCost);
            setTimeout(() => {
                inputRef.current.focus();
            }, 100);

            return;
        }

        let newCostInt = parseInt(newChannelRewardCost);

        if (channelRewardCost === newChannelRewardCost || newChannelRewardCost === '') {
            setEditingChannelRewardCost(false);
            setInputWidth(channelRewardCost.toLocaleString().length > 0 ? (channelRewardCost.toLocaleString().length > 8 ? '8ch' : channelRewardCost.toLocaleString().length + 'ch') : '1ch');

            return;
        }

        setUpdatingChannelRewardCost(true);
        setEditingChannelRewardCost(false);

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
                setChannelRewardCost(newCostInt);
                setInputWidth(newCostInt.toLocaleString().length > 0 ? (newCostInt.toLocaleString().length > 8 ? '8ch' : newCostInt.toLocaleString().length + 'ch') : '1ch');
                setUpdatingChannelRewardCost(false);
                setNewChannelRewardCost(null);
                return;
            }
        }
    }

    const handleSubsTabs = async (event, newValue) => {
        setEditingSubsRewards(newValue);
    }

    return (
        <StreamerDashboardContainer user={user}>
            {user &&
                <>
                    <Grid style={{ maxWidth: '1180px' }} container xs={12} >
                        <Grid style={{ maxWidth: '800px' }} item xs={12}>
                            <Grid container xs={12}>
                                <Grid xs={12}>
                                    <div className={styles.header}>
                                        <Hidden lgUp>
                                            <div style={{ width: '30px' }}></div>
                                        </Hidden>
                                        <div className={styles.avatarContainer}>
                                            <Avatar
                                                alt='User image'
                                                src={user.photoUrl} />
                                            <span className={styles.streamerName}>{user.displayName}</span>
                                        </div>
                                        <Button variant='contained'
                                            style={{ height: '48px', }}
                                            className={styles.twitchButton}
                                            onClick={() => window.open(`https://www.twitch.tv/${user.displayName}`, '_blank')}
                                            startIcon={<TwitchIcon style={{ width: '20px', height: '20px' }} />}>
                                            {user.displayName}
                                        </Button>
                                        <Button variant='contained'
                                            className={styles.messagesButton}
                                            style={{ backgroundColor: '#141735', minWidth: '212px', marginLeft: 'auto' }}
                                            onClick={() => { setOpenRecordsDialog(true); setButtonPressed('Messages') }}
                                            endIcon={
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    {pendingMessages > 0 ?
                                                        <div style={{
                                                            display: 'flex',
                                                            backgroundColor: '#FF007A',
                                                            width: '27px',
                                                            height: '27px',
                                                            borderRadius: '30px',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <p style={{
                                                                display: 'flex',
                                                                fontSize: '11px',
                                                                lineHeight: '24px',
                                                                fontWeight: '600',
                                                                marginTop: '2px'
                                                            }}>
                                                                {pendingMessages}
                                                            </p>
                                                        </div>
                                                        :
                                                        <MessageIcon style={{ width: '32px', height: '32px' }} />
                                                    }
                                                </div>
                                            }>
                                            <p>
                                                Text-to-Speech
                                            </p>
                                        </Button>
                                    </div>
                                </Grid>
                                <Grid xs={12}>
                                    <Grid container xs={12}>
                                        <Grid item xs={12}>
                                            <h1 className={styles.title}>
                                                {t('StreamerProfile.balance')}
                                            </h1>
                                            <p className={styles.subtitle}>
                                                {t('StreamerProfile.balanceSubtitle')}
                                            </p>
                                        </Grid>
                                        <Grid container xs={12} style={{ justifyContent: 'space-between' }} >
                                            <Grid item xs={12} sm={4} style={{ paddingRight: 24 }}>
                                                <BalanceButtonContainer onClick={() => { setOpenRecordsDialog(true); setButtonPressed('Qoins') }}>
                                                    <DonatedQoin style={{ width: '35px', height: '35px' }} />
                                                    <div className={styles.balanceInnerContainer}>
                                                        <p className={styles.balanceDataTextTitle}>Qoins</p>
                                                        <p className={styles.balanceDataText}>
                                                            {cheersQoins.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </BalanceButtonContainer>
                                            </Grid>
                                            <Grid item xs={12} sm={8}>
                                                {/* e.currentTarget != e.target Help us to prevent trigger the event if the user clicks the inner button and not this button */}
                                                <BitsButtonContainer disableRipple className={styles.containerBit} onClick={(e) => { if (e.currentTarget !== e.target) return; setOpenRecordsDialog(true); setButtonPressed("Bits"); }}>
                                                    <BitsIcon style={{ width: '35px', height: '35px' }} />
                                                    <BarProgressBit user={user}
                                                        estimatedBits={Math.floor(estimatedBits)}
                                                        availableBits={Math.floor(availableBits)}
                                                        nextMilestone={nextMilestone} />
                                                </BitsButtonContainer>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid container xs={12} className={styles.reactionsContainer}>
                                        <Grid item xs={12}>
                                            <div className={styles.reactionsHeaderContainer}>
                                                <div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}>
                                                        <h1 className={styles.title}>
                                                            {t('StreamerProfile.reactions')}
                                                        </h1>
                                                    </div>
                                                    <QaplaTabs value={editingSubsRewards} onChange={handleSubsTabs}>
                                                        {/* Must be 0 & 1 because false deselect tabs */}
                                                        <QaplaTab label="All Viewers" value={0} icon={editingSubsRewards === 1 ? <OffEye style={{ marginBottom: '0px' }} /> : <OnEye style={{ marginBottom: '0px' }} />} />
                                                        <QaplaTab label="Subscribers" value={1} icon={<Star style={{ marginBottom: '0px' }} />} style={{
                                                            background: editingSubsRewards === 1 ? 'linear-gradient(93.52deg, #6F11F9 0%, #FA5668 108.72%)' : '#0000',
                                                        }} />
                                                    </QaplaTabs>
                                                    <p className={styles.subtitle}>
                                                        {t('StreamerProfile.reactionsSubtitle')}
                                                    </p>
                                                </div>
                                            </div>
                                        </Grid>
                                        <Grid container xs={12} style={{ justifyContent: 'space-between', gap: '24px', marginTop: '3px' }} >
                                            <div className={styles.reactionSettingContainer}>
                                                <div style={{ display: 'flex' }}>
                                                    <div>
                                                        <Zap />
                                                    </div>
                                                    <div style={{ marginLeft: '8px' }}>
                                                        <p className={styles.reactionSettingTitle}>
                                                            Zaps
                                                        </p>
                                                        <p className={styles.reactionSettingSubtitle}>
                                                            Set the price for the Zap custom channel point reward
                                                        </p>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    alignSelf: 'flex-end',
                                                    marginTop: 'auto',
                                                }}>
                                                    <ChPts />
                                                    <input ref={inputRef}
                                                        style={{
                                                            width: !editingChannelRewardCost ? inputWidth : '100%'
                                                        }}
                                                        className={styles.costInput}
                                                        type={!editingChannelRewardCost ? 'text' : 'number'}
                                                        value={editingChannelRewardCost ? newChannelRewardCost : channelRewardCost ? channelRewardCost.toLocaleString() : ''}
                                                        disabled={!editingChannelRewardCost}
                                                        onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                                                        onChange={handleChannelRewardCost} />
                                                    <div className={styles.editChannelRewardButton} onClick={handleChannelRewardButton} style={{
                                                        backgroundColor: editingChannelRewardCost ? '#3B4BF9' : '#0000'
                                                    }}>
                                                        {updatingChannelRewardCost ?
                                                            <CircularProgress size={12} className={classes.circularProgress} />
                                                            :
                                                            <>
                                                                {editingChannelRewardCost ?
                                                                    <p className={styles.editChannelRewardButtonText}>
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
                                                </div>
                                            </div>
                                            <div className={styles.reactionSettingContainer} style={{}}>
                                                <div style={{ display: 'flex' }}>
                                                    <div>
                                                        <SlidersSettings style={{ height: '24px', width: '24px' }} />
                                                    </div>
                                                    <div style={{ marginLeft: '8px' }}>
                                                        <p className={styles.reactionSettingTitle}>
                                                            {reactionsEnabled ?
                                                                t('StreamerProfile.reactionsEnabled')
                                                                :
                                                                t('StreamerProfile.reactionsDisabled')
                                                            }
                                                        </p>
                                                        <p className={styles.reactionSettingSubtitle}>
                                                            Turn reactions on and off
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={styles.switchContainer}>
                                                    <ReactionsSwitch checked={reactionsEnabled} onChange={handleReactionsSwitch} disabled={updatingReactionsStatus} />
                                                </div>
                                            </div>
                                            <div className={styles.reactionSettingContainer}
                                                onClick={handlePremiumButton}
                                                style={{ background: (user.premium || user.freeTrial) && user.currentPeriod ? '#141735' : 'linear-gradient(318.55deg, #4BDEFE 9.94%, #5328FF 90.92%)', cursor: 'pointer' }}>
                                                <div style={{ display: 'flex' }}>
                                                    <div>
                                                        {(user.premium || user.freeTrial) && user.currentPeriod ?
                                                            <Heart style={{ height: '24px', width: '24px' }} />
                                                            :
                                                            <Star style={{ height: '24px', width: '24px' }} />
                                                        }
                                                    </div>
                                                    <div style={{ marginLeft: '8px' }}>
                                                        <p className={styles.reactionSettingTitle}>
                                                            {(user.premium || user.freeTrial) && user.currentPeriod ?
                                                                'You are premium'
                                                                :
                                                                'Subscribers Set Up'
                                                            }
                                                        </p>
                                                        <p className={styles.reactionSettingSubtitle}>
                                                            {(user.premium || user.freeTrial) && user.currentPeriod ?
                                                                'Viewers can send reactions using their channel points'
                                                                :
                                                                'Viewers can send reactions\nusing their channel points'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Grid>
                                        <Grid container xs={12} style={{ justifyContent: 'space-between', gap: '24px', marginTop: '35px' }} >
                                            <ReactionCard
                                                icons={
                                                    [
                                                        <GIFIcon />,
                                                        <MemesIcon />,
                                                        <MegaStickerIcon />,
                                                    ]
                                                }
                                                title={t('StreamerProfile.ReactionCard.tier1Title')}
                                                subtitle={t('StreamerProfile.ReactionCard.tier1Subtitle')}
                                                textMaxWidth='110px'
                                                reactionLevel={1}
                                                user={user}
                                                availablePrices={reactionsPrices}
                                                subsMode={editingSubsRewards}
                                            />
                                            <ReactionCard
                                                icons={
                                                    [
                                                        <PlusIcon fill={'url(#icons-gradient)'} />,
                                                        <AvatarIcon fill={'url(#icons-gradient)'} />,
                                                        <TtGiphyIcon fill={'url(#icons-gradient)'} />,
                                                        <TTSBotIcon fill={'url(#icons-gradient)'} />,
                                                    ]
                                                }
                                                title={t('StreamerProfile.ReactionCard.tier2Title')}
                                                subtitle={t('StreamerProfile.ReactionCard.tier2Subtitle')}
                                                textMaxWidth='160px'
                                                reactionLevel={2}
                                                user={user}
                                                availablePrices={reactionsPrices}
                                                subsMode={editingSubsRewards}
                                            />
                                            <ReactionCard
                                                icons={
                                                    [
                                                        <PlusIcon fill={'url(#icons-gradient)'} />,
                                                        <img src={randomEmoteUrl}
                                                            style={{ height: 24, width: 24 }} />
                                                    ]
                                                }
                                                title={t('StreamerProfile.ReactionCard.tier3Title')}
                                                subtitle={t('StreamerProfile.ReactionCard.tier3Subtitle')}
                                                textMaxWidth='130px'
                                                reactionLevel={3}
                                                user={user}
                                                availablePrices={reactionsPrices}
                                                subsMode={editingSubsRewards}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <p className={styles.miniInfoText}>
                                                {`☝ People reacting from the mobile app will see prices in Qoins instead of Bits.`}
                                            </p>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container className={styles.myStreamsContainer}>
                                            <div style={{ display: 'flex', flex: 1, }}>
                                                <h1 className={styles.title}>
                                                    {t('StreamerProfile.myStreams')}
                                                </h1>
                                                <div style={{
                                                    marginLeft: 'auto'
                                                }}>
                                                    {(user.premium || user.freeTrial) && user.currentPeriod &&
                                                        <StreamsLeft uid={user.uid}
                                                            qoinsDrops={qoinsDrops}
                                                            renovationDate={user.currentPeriod.endDate} />
                                                    }
                                                </div>
                                            </div>
                                        </Grid>
                                        <div style={{
                                            marginBottom: ''
                                        }}>
                                            <QaplaTabs value={streamsTab} onChange={handleStreamsTabs}>
                                                <QaplaTab label="Scheduled" value={0} icon={streamsTab === 0 ? <CalendarOnTabIcon style={{ marginBottom: '0px' }} /> : <CalendarOffTabIcon style={{ marginBottom: '0px' }} /> } />
                                                <QaplaTab label="History" value={1} icon={streamsTab === 1 ? <ClockOnTabIcon style={{ marginBottom: '0px' }} /> : <ClockOffTabIcon style={{ marginBottom: '0px' }} />} />
                                            </QaplaTabs>
                                        </div>
                                        <div style={{
                                            marginTop: '14px',
                                        }}>
                                            <p style={{
                                                color: '#FFFFFF9A',
                                                fontSize: '16px',
                                                fontWeight: '400',
                                                lineHeight: '19px',
                                            }}>Schedule Qoins drops for your streams</p>
                                        </div>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} className={styles.streamsCardContainer}>
                                    <Grid container spacing={4} className={styles.innerStreamsCardContainer}>
                                        <Grid item xl={2} lg={3} md={3} sm={4} xs={10} className={styles.cardContainer}>
                                            <Card className={styles.createEventCard} onClick={createStream}>
                                                <h1 className={styles.newStream} style={{ whiteSpace: 'pre-line' }}>
                                                    {t('StreamerProfile.postStream')}
                                                </h1>
                                                <CardContent classes={{
                                                    root: classes.createCardContentRoot,
                                                }}>
                                                    <Box display='flex' justifyContent='center'>
                                                        <IconButton className={styles.createButton} classes={{
                                                            label: classes.buttonIconLabel
                                                        }}>
                                                            <AddIcon />
                                                        </IconButton>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                            {streams && Object.keys(streams).reverse().map((streamId) => (
                                                <StreamCard
                                                    key={streamId}
                                                    streamType={streams[streamId].status}
                                                    streamId={streamId}
                                                    image={streams[streamId].image}
                                                    user={user}
                                                    game={streams[streamId].game}
                                                    games={games}
                                                    date={formatDate(streams[streamId].timestamp)}
                                                    hour={formatHour(streams[streamId].timestamp)}
                                                    timestamp={streams[streamId].timestamp}
                                                    drops={streams[streamId].drops}
                                                    usedDrops={streams[streamId].usedDrops}
                                                    onRemoveStream={onRemoveStream} />
                                            ))}
                                        </div>

                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <CheersBitsRecordDialog open={openRecordsDialog}
                        onClose={() => setOpenRecordsDialog(false)}
                        user={user}
                        cheersQoins={cheersQoins}
                        estimatedBits={availableBits}
                        valueOfQoinsForStreamer={valueOfQoinsForStreamer}
                        pressed={buttonPressed}
                        setPendingMessages={setPendingMessages} />
                    <PremiumDialog open={openGoPremiumDialog} onClose={() => setOpenGoPremiumDialog(false)}>
                        <div style={{
                            margin: '-16px -6px 0px auto',
                            maxHeight: '40px',
                            cursor: 'pointer',
                        }} onClick={() => setOpenGoPremiumDialog(false)}>
                            <Close style={{ width: '40px', height: '40px' }} />
                        </div>
                        <p style={{
                            color: '#fff',
                            whiteSpace: 'pre-wrap',
                            fontSize: '18px',
                            fontWeight: '600',
                            lineHeight: '32px',
                            letterSpacing: '0px',
                            textAlign: 'center',
                        }}> {`Benefits for your Twitch\nChannel Subscribers`}</p>
                        <p style={{
                            color: '#fff',
                            fontSize: '16px',
                            fontWeight: '500',
                            lineHeight: '19px',
                            letterSpacing: '0px',
                            textAlign: 'center',
                            marginTop: '32px',
                        }}>
                            Start Free Trial. <span style={{ color: '#00FFDD', fontWeight: '600', }}>No credit card required.</span>
                        </p>
                        <p style={{
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '500',
                            lineHeight: '17px',
                            letterSpacing: '0px',
                            marginTop: '32px',
                            whiteSpace: 'pre-line',
                            maxWidth: '320px',
                            alignSelf: 'center',
                        }}>
                            {`🪂 Reward your audience with Qoins Drops

                            🫡 Add value to your Twitch subscribers with custom alerts

                            👁 Visibility for your content outside of Twitch`}
                        </p>
                        <StartFreeTrialButton onClick={handlePremiumButton} >
                            Start Free Trial
                        </StartFreeTrialButton>
                    </PremiumDialog>
                </>
            }
        </StreamerDashboardContainer >
    );
}

export default StreamerProfile;