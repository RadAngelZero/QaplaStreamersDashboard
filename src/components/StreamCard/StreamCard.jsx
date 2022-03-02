import React, { useState, useEffect } from 'react';
import { makeStyles, withStyles, Menu, MenuItem, Card, CardContent, IconButton, Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
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
    saveStreamerTwitchCustomReward,
    updateStreamerProfile,
    listenToActiveCustomReward,
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
        backgroundColor: '#141833',
        borderRadius: '1.5rem',
        boxShadow: '0 6px 15px 0 rgba(0,0,0,0.31)',
        height: '100%'
    },
    relativeContainer: {
        position: 'relative'
    },
    hourContainer: {
        position: 'absolute',
        right: '1rem',
        top: '1rem',
        background: 'rgba(27, 29, 33, .7)',
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
    eventImage: {
        objectFit: 'cover',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    },
    eventCardContent: {
        paddingLeft: '.7rem',
        paddingRight: '.7rem',
        justifyContent: 'space-between'
    },
    eventCardTitle: {
        fontSize: '18px',
        color: '#FFFFFF'
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
    dateContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    date: {
        color: '#FFF',
        fontSize: '13px',
        lineHeight: '20px',
        marginLeft: '.625rem'
    },
    streamButton: {
        backgroundColor: '#6C5DD3 !important',
        color: '#FFF'
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


        getParticipantsNumber();
        listenToActiveCustomReward(streamId, (stream) => {
            console.log('Get');
            if (stream.exists()) {
                setStream({ key: stream.key, ...stream.val()});
            } else {
                setStream(null);
            }
        });

        // stream is not in this array intentionally, as it causes a loop because of the listenToActiveCustomReward function
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
        const xqReward = await createCustomReward(user.id, userCredentialsUpdated.access_token, 'XQ Qapla', 500, false, true, 1);
        if (xqReward.status !== 200) {
            // Problem creating reward
        }

        const qoinsReward = await createCustomReward(user.id, userCredentialsUpdated.access_token, 'Qoins Qapla', 500, false, true, 1, true, user.subscriptionDetails.redemptionsPerStream);
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
            await saveStreamerTwitchCustomReward(user.uid, XQ_REWARD, xqReward.data.id, streamId, xqWebhookSubscription.data.id);
            await saveStreamerTwitchCustomReward(user.uid, QOINS_REWARD, qoinsReward.data.id, streamId, qoinsWebhookSubscription.data.id);

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
                <img
                    alt='Game'
                    src={streamsPlaceholderImages[game] || games.allGames[game].fallbackImageUrl}
                    width='100%'
                    height='160'
                    className={classes.eventImage} />
            </div>
            <CardContent>
                <div className={classes.eventCardContent}>
                    <p className={classes.eventCardTitle}>
                        {title && title['en'] ? title['en'] : ''}
                    </p>
                    <div className={classes.rowContainer}>
                        <div className={classes.circle} style={{ backgroundColor: participantsNumber !== null ? '#0049C6' : 'transparent' }} />
                        <p className={classes.participantsNumber} style={{ color: participantsNumber !== null ? '#808191' : 'transparent' }}>
                            {participantsNumber} {t('StreamCard.participants')}
                        </p>
                    </div>
                </div>
                <div className={classes.dateContainer}>
                    <div className={classes.rowContainer}>
                        <CalendarIcon />
                        <p className={classes.date}>
                            {date}
                        </p>
                    </div>
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
                </div>
            </CardContent>
        </Card>
    );
}

export default StreamCard;