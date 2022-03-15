import React, { useState, useEffect } from 'react';
import { makeStyles, withStyles, Menu, MenuItem, Card, CardContent, IconButton, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as OptionsIcon } from './../../assets/OptionsIcon.svg';
import {
    streamsPlaceholderImages,
    SCHEDULED_EVENT_TYPE,
    PAST_STREAMS_EVENT_TYPE,
    PENDING_APPROVAL_EVENT_TYPE,
    XQRewardRedemption,
    QoinsRewardRedemption,
    XQ_REWARD,
    QOINS_REWARD
} from '../../utilities/Constants';
import {
    cancelStreamRequest,
    getStreamParticipantsNumber,
    getPastStreamParticipantsNumber,
    getStreamTitle,
    getPastStreamTitle,
    saveRedemptionsLists,
    saveStreamTwitchCustomReward,
    updateStreamerProfile,
    checkActiveCustomReward,
    removeActiveCustomRewardFromList,
    setStreamInRedemptionsLists,
    addListToStreamRedemptionList,
    updateStreamStatus,
    removeStreamFromEventsData
} from '../../services/database';
import { createCustomReward, deleteCustomReward, disableCustomReward, enableCustomReward, getAllRewardRedemptions } from '../../services/twitch';
import { notifyBugToDevelopTeam } from '../../services/discord';
import { subscribeStreamerToTwitchWebhook, unsubscribeStreamerToTwitchWebhook } from '../../services/functions';
import { signInWithTwitch } from '../../services/auth';

const useStyles = makeStyles(() => ({
    eventCard: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#141833',
        borderRadius: '1.5rem',
        boxShadow: '0 6px 15px 0 rgba(0,0,0,0.31)',
        height: '100%',
        maxWidth: '250px',
        minWidth: '250px',
    },
    relativeContainer: {
        position: 'relative'
    },
    hourContainer: {
        position: 'absolute',
        right: '1rem',
        top: '1rem',
        background: '#1B1D2159',
        borderRadius: '.5rem'
    },
    hourText: {
        color: '#FFF',
        marginTop: '.25rem',
        marginBottom: '.25rem',
        marginLeft: '.5rem',
        marginRight: '.5rem',
        fontWeight: '700'
    },
    dateContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        right: '1rem',
        bottom: '1rem',
        padding: '6px 10px',
        background: '#1B1D21',
        height: '32px',
        borderRadius: '6px'
    },
    dateText: {
        color: '#FFF',
        lineHeight: '20px',
        fontWeight: '700',
        marginLeft: '10px'
    },
    eventImage: {
        objectFit: 'cover',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        borderRadius: '24px'
    },
    eventCardContent: {
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        height: '100%'
    },
    eventCardTitle: {
        color: '#FFFFFF',
        fontSize: '16px',
        lineHeight: '24px',
        fontWeight: '500',
        height: '48px',

    },
    rowContainer: {
        display: 'flex',
        alignItems: 'center'
    },
    circle: {
        borderRadius: '100%',
        height: '.55rem',
        width: '.55rem',
        marginRight: '.5rem'
    },
    participantsNumber: {
        fontSize: '12px',
        textAlign: 'right',
        lineHeight: '16px'
    },
    streamButton: {
        backgroundColor: '#6C5DD3 !important',
        color: '#FFF'
    },
    buttonsContainer: {
        marginTop: 'auto'
    },
    startButton: {
        color: '#0D1021',
        width: '100%',
        borderRadius: '8px',
    },
    manageButton: {
        backgroundColor: '#272D5780',
        color: '#FFFFFF99',
        width: '100%',
        borderRadius: '8px',
    }
}));

const StyledMenu = withStyles({
    paper: {
        backgroundColor: '#141833',
    },
})((props) => (
    <Menu {...props} />
));

const StyledMenuItem = withStyles(() => ({
    root: {
        color: '#FFF'
    },
}))(MenuItem);

const StreamCard = ({ user, streamId, streamType, game, games, date, hour, onClick, enableOptionsIcon, closeOptionsMenu, onRemoveStream, style = {} }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [participantsNumber, setParticipantsNumber] = useState(null);
    const [title, setTitle] = useState({ en: '', es: '' });
    const [revStatus, setRevStatus] = useState(3);
    const [stream, setStream] = useState(null);
    const classes = useStyles();
    const { t } = useTranslation();

    useEffect(() => {
        async function getParticipantsNumber() {
            if (streamType === SCHEDULED_EVENT_TYPE) {
                const participants = await getStreamParticipantsNumber(streamId);
                let participantsNumber = participants.exists() ? participants.val() : 0;
                setParticipantsNumber(participantsNumber);

                const title = await getStreamTitle(streamId);
                if (title.exists()) {
                    setTitle(title.val());
                } else if (games['allGames'] && games['allGames'][game] && games['allGames'][game].gameName) {
                    setTitle({ en: games['allGames'][game].gameName });
                }
            } else if (streamType === PAST_STREAMS_EVENT_TYPE) {
                const participants = await getPastStreamParticipantsNumber(user.uid, streamId);
                let participantsNumber = participants.exists() ? participants.val() : 0;
                setParticipantsNumber(participantsNumber);

                const title = await getPastStreamTitle(user.uid, streamId);
                setTitle(title.val());
            } else if (streamType === PENDING_APPROVAL_EVENT_TYPE) {
                if (games['allGames'] && games['allGames'][game] && games['allGames'][game].gameName) {
                    setTitle({ en: games['allGames'][game].gameName });
                }
            }
        }

        async function checkStreamStatus() {
            const streamStatus = await checkActiveCustomReward(streamId);
            if (streamStatus.exists()) {
                setStream({ key: streamStatus.key, ...streamStatus.val()});
            } else {
                setStream(null);
            }
        }


        getParticipantsNumber();
        checkStreamStatus();

        // stream is not in this array intentionally, cause it causes a loop because of the checkActiveCustomReward function
    }, [game, games, streamId, streamType, user]);

    const onOptionsIconClick = (e) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    }

    const closeMenu = (e) => {
        e.stopPropagation();
        if (closeOptionsMenu) {
            closeOptionsMenu();
        }
        setAnchorEl(null);
    }

    const cancelStream = (e) => {
        e.stopPropagation();
        if (window.confirm(t('StreamCard.deleteConfirmation'))) {
            cancelStreamRequest(user.uid, streamId);
            onRemoveStream(streamId);
        }
    }

    const onClickCard = () => {
        if (streamType !== PENDING_APPROVAL_EVENT_TYPE && !Boolean(anchorEl)) {
            onClick();
        }
    }

    const startStream = async (e) => {
        e.stopPropagation();
        const userCredentialsUpdated = await handleTwitchSignIn();
        const xqReward = await createCustomReward(user.id, userCredentialsUpdated.access_token, 'XQ Qapla', 1, false, false, 1);
        if (xqReward.status !== 200) {
            // Problem creating reward
        }

        const qoinsReward = await createCustomReward(user.id, userCredentialsUpdated.access_token, 'Qoins Qapla', 1, false, false, 1, false, user.subscriptionDetails.redemptionsPerStream);
        if (qoinsReward.status !== 200) {
            // Problem creating reward
            // Delete XQ reward
            await deleteCustomReward(user.id, userCredentialsUpdated.access_token, xqReward.data.id);

            let errorMessage = `Error creating Qoins Reward\nStatus: ${qoinsReward.status}`;
            if (qoinsReward.error) {
                errorMessage += `\nError: ${qoinsReward.error}\nMessage: ${qoinsReward.message}\nStreamer: ${user.displayName}\nStream Id: ${streamId}`;
            }
            // Abort and notify Qapla developers
            notifyBugToDevelopTeam(errorMessage);
        }

        // Set the webhooks
        const xqWebhookSubscription = await subscribeStreamerToTwitchWebhook(user.id, XQRewardRedemption.type, XQRewardRedemption.callback, { reward_id: xqReward.data.id });
        const qoinsWebhookSubscription = await subscribeStreamerToTwitchWebhook(user.id, QoinsRewardRedemption.type, QoinsRewardRedemption.callback, { reward_id: qoinsReward.data.id });

        if (xqWebhookSubscription.data.id && qoinsWebhookSubscription.data.id) {
            // Save webhook id on database
            await saveStreamTwitchCustomReward(user.uid, XQ_REWARD, xqReward.data.id, streamId, xqWebhookSubscription.data.id);
            await saveStreamTwitchCustomReward(user.uid, QOINS_REWARD, qoinsReward.data.id, streamId, qoinsWebhookSubscription.data.id);

            // Get the recently created ActiveCustomReward node
            const streamStatus = await checkActiveCustomReward(streamId);

            // Set stream as active, so the UI change and we have the necessary data in the state
            setStream({ key: streamId, ...streamStatus.val() });

            // Enable XQ reward
            await enableCustomReward(user.id, userCredentialsUpdated.access_token, xqReward.data.id);
        } else {
            await deleteCustomReward(user.id, userCredentialsUpdated.access_token, xqReward.data.id);
            await deleteCustomReward(user.id, userCredentialsUpdated.access_token, qoinsReward.data.id);

            let errorMessage = `Error creating Webhooks for rewards\nInfo: \n${JSON.stringify(xqWebhookSubscription)}\n${JSON.stringify(qoinsWebhookSubscription)}`;
            // Abort and notify Qapla developers
            notifyBugToDevelopTeam(errorMessage);
        }
    }

    const closeStream = async (e) => {
        e.stopPropagation();
        const userCredentialsUpdated = await handleTwitchSignIn();

        /** This fragment will be used temporary */

            // Set timestamp of end of stream
            await setStreamInRedemptionsLists(stream.key);

            // Get and save redemptions lists
            const XQRedemptions = await getAllRewardRedemptions(user.id, userCredentialsUpdated.access_token, stream.xqReward);
            await addListToStreamRedemptionList(stream.key, XQ_REWARD, XQRedemptions);
            const QoinsRedemptions = await getAllRewardRedemptions(user.id, userCredentialsUpdated.access_token, stream.qoinsReward);
            await addListToStreamRedemptionList(stream.key, QOINS_REWARD, QoinsRedemptions);

        /** End of temporary fragment */

        // Disable XQ reward remove their webhook and delete it
        await disableCustomReward(user.id, userCredentialsUpdated.access_token, stream.xqReward);
        await unsubscribeStreamerToTwitchWebhook(stream.xqRewardWebhookId);
        await deleteCustomReward(user.id, userCredentialsUpdated.access_token, stream.xqReward);

        // Disable Qoins reward remove their webhook and delete it
        await disableCustomReward(user.id, userCredentialsUpdated.access_token, stream.qoinsReward);
        await unsubscribeStreamerToTwitchWebhook(stream.qoinsRewardWebhookId);
        await deleteCustomReward(user.id, userCredentialsUpdated.access_token, stream.qoinsReward);

        await removeActiveCustomRewardFromList(stream.key);

        // Update status and remove event from main events node
        await updateStreamStatus(user.uid, stream.key, PAST_STREAMS_EVENT_TYPE);
        await removeStreamFromEventsData(user.uid, stream.key);

        // Remove stream from the UI
        onRemoveStream();
    }

    const handleTwitchSignIn = async () => {
        let user = await signInWithTwitch();
        await updateStreamerProfile(user.firebaseAuthUser.user.uid, user.userData);

        user.access_token = user.userData.twitchAccessToken;
        user.refresh_token = user.userData.refreshToken;
        return user;
    }

    return (
        <Card className={classes.eventCard} onClick={onClickCard} style={style}>
            <div className={classes.relativeContainer}>
                <div className={classes.hourContainer}>
                    <p className={classes.hourText}>
                        {hour}
                    </p>
                </div>
                <div className={classes.dateContainer}>
                    <CalendarIcon />
                    <p className={classes.dateText}>
                        {date}
                    </p>
                </div>
                <img
                    alt='Game'
                    src={streamsPlaceholderImages[game] || games.allGames[game].fallbackImageUrl}
                    width='100%'
                    height='180'
                    className={classes.eventImage} />
            </div>
            <div className={classes.eventCardContent}>
                <p className={classes.eventCardTitle}>
                    {title && title['en'] ? title['en'] : ''}
                </p>
                {/* <div className={classes.rowContainer}>
                        <div className={classes.circle} style={{ backgroundColor: participantsNumber !== null ? '#0049C6' : 'transparent' }} />
                        <p className={classes.participantsNumber} style={{ color: participantsNumber !== null ? '#808191' : 'transparent' }}>
                            {participantsNumber} {t('StreamCard.participants')}
                        </p>
                    </div> */}
                {/* <div className={classes.dateContainer}>
                    {streamType === SCHEDULED_EVENT_TYPE ?
                        <>
                            {!stream ?
                            <Button size='medium' className={classes.streamButton} onClick={startStream}>
                                {t('StreamCard.start')}
                            </Button>
                            :
                            <Button style={{ marginBottom: 16 }} size='medium' className={classes.streamButton} onClick={closeStream}>
                                {t('StreamCard.resume')}
                            </Button>
                        }
                        </>
                        :
                        <IconButton size='small' disabled={!enableOptionsIcon} onClick={onOptionsIconClick}>
                            <OptionsIcon />
                        </IconButton>
                    }
                    <StyledMenu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        keepMounted
                        onClose={closeMenu}>
                        {streamType === PENDING_APPROVAL_EVENT_TYPE &&
                            <StyledMenuItem onClick={cancelStream}>
                                {t('StreamCard.cancelStreamRequest')}
                            </StyledMenuItem>
                        }
                    </StyledMenu>
                </div> */}
                {revStatus !== 3 &&
                    <div style={{ display: 'flex', marginTop: '14px', alignItems: 'center' }}>
                        <div style={{
                            backgroundColor: revStatus === 1 ? '#C6B200' : '#00FFDD',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%'
                        }} />
                        <div style={{ width: '6px' }} />
                        <p style={{ color: '#FFF', fontSize: '12px', fontWeight: '500', lineHeight: '16px' }}>{revStatus === 1 ? 'Pending for review' : 'Posted'}</p>
                    </div>
                }
                <div className={classes.buttonsContainer}>
                    {revStatus === 3 &&
                        <Button size='medium' className={classes.startButton} style={{ backgroundColor: revStatus === 4 ? '#3B4BF9' : '#00FFDD', }} onClick={/*startStream*/ () => { }}>
                            {revStatus === 4 ? 'End Stream' : t('StreamCard.start')}
                        </Button>
                    }
                    <div style={{ height: '11px' }} />
                    <Button size='medium' className={classes.manageButton} onClick={/*startStream*/ () => { }}>
                        {/* {t('StreamCard.start')} */}
                        {'Manage stream'}
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export default StreamCard;