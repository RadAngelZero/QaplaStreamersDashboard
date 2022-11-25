import React, { useEffect, useState } from 'react';
import { withStyles, Grid, Avatar, Button, Card, CardContent, Box, IconButton, Hidden, makeStyles, Tooltip } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import styles from './StreamerProfile.module.css';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import StreamsSwitch from '../StreamsSwitch/StreamsSwitch';
import StreamsLeft from '../StreamsLeft/StreamsLeft';
import { ReactComponent as TwitchIcon } from './../../assets/twitchIcon.svg';
import { ReactComponent as AddIcon } from './../../assets/AddIcon.svg';
import { ReactComponent as DonatedQoin } from './../../assets/DonatedQoin.svg';
import { ReactComponent as BitsIcon } from './../../assets/BitsIcon.svg';
import { ReactComponent as MessageIcon } from './../../assets/MessageBubble.svg';
import { ReactComponent as GiftIcon } from './../../assets/Gift.svg';

import { ReactComponent as GIFIcon } from './../../assets/reactionCardsIcons/GIF.svg';
import { ReactComponent as MemesIcon } from './../../assets/reactionCardsIcons/Memes.svg';
import { ReactComponent as MegaStickerIcon } from './../../assets/reactionCardsIcons/MegaSticker.svg';
import { ReactComponent as AvatarIcon } from './../../assets/reactionCardsIcons/Avatar.svg';
import { ReactComponent as TtGiphyIcon } from './../../assets/reactionCardsIcons/TtGiphy.svg';
import { ReactComponent as TTSBotIcon } from './../../assets/reactionCardsIcons/TTSBot.svg';
import { ReactComponent as PlusIcon } from './../../assets/reactionCardsIcons/+.svg';

import StreamerProfileEditCoin from '../StreamerProfileEditCoin/StreamerProfileEditCoin'

import BarProgressBit from '../BarProgressBit/BarProgressBit';

import { getQreatorCode, getStreamerValueOfQoins, loadStreamsByStatus, loadStreamsByStatusRange } from '../../services/database';
import StreamCard from '../StreamCard/StreamCard';
import {
    SCHEDULED_EVENT_TYPE,
    PENDING_APPROVAL_EVENT_TYPE,
    PAST_STREAMS_EVENT_TYPE,
    PREMIUM,
    REACTION_CARD_CHANNEL_POINTS,
    REACTION_CARD_QOINS
} from '../../utilities/Constants';
import CheersBitsRecordDialog from '../CheersBitsRecordDialog/CheersBitsRecordDialog';
import ReactionCard from '../ReactionCard/ReactionCard';

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

const StreamerProfile = ({ user, games, qoinsDrops }) => {
    const classes = useStyles();
    const history = useHistory();
    const [streams, setStreams] = useState({});
    const [openRecordsDialog, setOpenRecordsDialog] = useState(false);
    const [buttonPressed, setButtonPressed] = useState('Qoins');
    const [pendingMessages, setPendingMessages] = useState(0);
    const [valueOfQoinsForStreamer, setValueOfQoinsForStreamer] = useState(0);
    const [switchState, setSwitchState] = useState(false);
    const [qreatorCode, setQreatorCode] = useState('');
    const [openTooltip, setOpenTooltip] = useState(false);
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
                if (!switchState) {
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

        loadStreams();
        getValueOfQoins();
        getUserQreatorCode();
    }, [switchState, user, history]);

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

    const handleSwitchEvents = () => {
        setSwitchState(!switchState);
    }

    const copyQreatorCode = () => {
        navigator.clipboard.writeText(qreatorCode);
        setOpenTooltip(true);
        setTimeout(() => {
            setOpenTooltip(false);
        }, 1250);
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
                                                {`Track and cash out the Qoins you get from reactions.`}
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
                                            <h1 className={styles.title}>
                                                {`Reactions`}
                                            </h1>
                                            <p className={styles.subtitle}>
                                                {`Set the price in Qoins for reactions on your stream reactions`}
                                            </p>
                                        </Grid>
                                        <Grid container xs={12} style={{ justifyContent: 'space-between', gap: '10px' }} >
                                            <ReactionCard
                                                icons={
                                                    [
                                                        <GIFIcon />,
                                                        <MemesIcon />,
                                                        <MegaStickerIcon />,
                                                    ]
                                                }
                                                title='GIF, Sticker or Meme + TTS'
                                                subtitle='Basic reaction'
                                                textMaxWidth='110px'
                                                type={REACTION_CARD_CHANNEL_POINTS}
                                                user={user}
                                                backgroundURL='https://media.tenor.com/XCReBZW8JFAAAAAd/cr1ti-ka-l-penguinz0.gif'
                                                backgroundSize='350%'
                                                backgroundPosX='50%'
                                                backgroundPosY='0'
                                            />
                                            <ReactionCard
                                                icons={
                                                    [
                                                        <PlusIcon />,
                                                        <AvatarIcon />,
                                                        <TtGiphyIcon />,
                                                        <TTSBotIcon />,
                                                    ]
                                                }
                                                title='Animated Avatar, 3D Text and TTS Voice'
                                                subtitle='Everything in basic +'
                                                textMaxWidth='160px'
                                                type={REACTION_CARD_QOINS}
                                                user={user}
                                                FBNode='level2'
                                                defaultCost={500}
                                                background='linear-gradient(0deg, #654DFF, #654DFF)'
                                            />
                                            <ReactionCard
                                                icons={
                                                    [
                                                        <PlusIcon />,
                                                        <MemesIcon />,
                                                    ]
                                                }
                                                title='Full Screen Emotes Animatios'
                                                subtitle='All content +'
                                                textMaxWidth='130px'
                                                type={REACTION_CARD_QOINS}
                                                user={user}
                                                FBNode='level3'
                                                defaultCost={800}
                                                background='linear-gradient(318.55deg, #8322FF 9.94%, #FF98BD 90.92%), #141735'
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container className={styles.myStreamsContainer}>
                                            <div style={{ display: 'flex', flex: 1, }}>
                                                <h1 className={styles.title}>
                                                    {t('StreamerProfile.myStreams')}
                                                </h1>
                                                <div style={{ marginLeft: '32px' }}>
                                                    <StreamsSwitch switchPosition={switchState} onClick={handleSwitchEvents} />
                                                </div>
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

                </>
            }
        </StreamerDashboardContainer>
    );
}

export default StreamerProfile;