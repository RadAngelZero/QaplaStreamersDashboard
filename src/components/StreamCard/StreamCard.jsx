import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles, Card, Button, CircularProgress } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import {
    streamsPlaceholderImages,
    SCHEDULED_EVENT_TYPE,
    PAST_STREAMS_EVENT_TYPE,
    PENDING_APPROVAL_EVENT_TYPE,
    HOUR_IN_MILISECONDS
} from '../../utilities/Constants';
import {
    cancelStreamRequest,
    getStreamTitle,
    getPastStreamTitle,
    checkActiveCustomReward
} from '../../services/database';
import { closeQaplaStream, enableStreamQoinsReward, startQaplaStream } from '../../services/streamQapla';
import EventManagementDialog from '../QaplaStreamDialogs/EventManagementDialog';
import EventConfirmStartDialog from '../QaplaStreamDialogs/EventConfirmStartDialog';
import EventWarningQoinsDialog from '../QaplaStreamDialogs/EventWarningQoinsDialog';
import EventEndStreamConfirmDialog from '../QaplaStreamDialogs/EventEndStreamConfirmDialog';
import EventRewardsRemovedConfirmation from '../QaplaStreamDialogs/EventRewardsRemovedConfirmation';
import { auth } from '../../services/firebase';
import EventCustomMessageSentConfirmation from '../QaplaStreamDialogs/EventCustomMessageSentConfirmation';
import { sendCustomMessage } from '../../services/functions';

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
        padding: '2px 8px',
        fontSize: '11px',
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: '20px',
        letterSpacing: '-0.5px',
        textAlign: 'center'

    },
    dateContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        right: '1rem',
        bottom: '1rem',
        padding: '2px 10px',
        background: '#1B1D21',
        height: '32px',
        borderRadius: '10px'
    },
    dateText: {
        color: '#FFF',
        fontSize: '13px',
        fontWeight: '700',
        lineHeight: '20px',
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
        backgroundColor: '#00FFDD',
        color: '#0D1021',
        width: '100%',
        borderRadius: '8px',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#00EACB'
        },
        '&:active': {
            backgroundColor: '#00EACB',
            opacity: '0.9'
        }
    },
    endButton: {
        backgroundColor: '#3B4BF9',
        color: '#FFF',
        width: '100%',
        borderRadius: '8px',
        textTransform: 'none',
        '&:hover': {
            background: '#2E3AC1',
        },
        '&:active': {
            background: '#2E3AC1',
            opacity: '0.9'
        }
    },
    manageButton: {
        backgroundColor: '#272D5780',
        color: '#FFFFFF99',
        width: '100%',
        borderRadius: '8px',
        textTransform: 'none'
    }
}));

const StreamCard = ({ user, streamId, streamType, game, games, date, hour, onRemoveStream, style = {}, timestamp }) => {
    // This information is not longer visible in the card but maybe in the future we would want to show it again
    // const [participantsNumber, setParticipantsNumber] = useState(null);
    const [title, setTitle] = useState({ en: '', es: '' });
    const [stream, setStream] = useState(null);
    const [showRewardsOptions, setShowRewardsOptions] = useState(false);
    const [openStreamDialog, setOpenStreamDialog] = useState(false);
    const [openStreamStartedDialog, setOpenStreamStartedDialog] = useState(false);
    const [openQoinsWarningDialog, setOpenQoinsWarningDialog] = useState(false);
    const [openEndStreamDialog, setOpenEndStreamDialog] = useState(false);
    const [startingStream, setStartingStream] = useState(false);
    const [closingStream, setClosingStream] = useState(false);
    const [openRewardsRemovedDialog, setOpenRewardsRemovedDialog] = useState(false);
    const [openCustomMessageSentDialog, setOpenCustomMessageSentDialog] = useState(false);
    const [loadingDots, setLoadingDots] = useState('');
    const history = useHistory();
    const classes = useStyles();
    const { t } = useTranslation();

    useEffect(() => {
        async function getParticipantsNumber() {
            if (streamType === SCHEDULED_EVENT_TYPE) {
                /* const participants = await getStreamParticipantsNumber(streamId);
                let participantsNumber = participants.exists() ? participants.val() : 0;
                setParticipantsNumber(participantsNumber); */

                const title = await getStreamTitle(streamId);
                if (title.exists()) {
                    setTitle(title.val());
                } else if (games['allGames'] && games['allGames'][game] && games['allGames'][game].gameName) {
                    setTitle({ en: games['allGames'][game].gameName });
                }
            } else if (streamType === PAST_STREAMS_EVENT_TYPE) {
                /* const participants = await getPastStreamParticipantsNumber(user.uid, streamId);
                let participantsNumber = participants.exists() ? participants.val() : 0;
                setParticipantsNumber(participantsNumber); */

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
                setStream({ key: streamStatus.key, ...streamStatus.val() });
            } else {
                setStream(null);
            }
        }


        getParticipantsNumber();
        checkStreamStatus();

        if (streamType === SCHEDULED_EVENT_TYPE && !showRewardsOptions) {
            const fifteenMinutesInMilliseconds = HOUR_IN_MILISECONDS / 4;
            const currentTimestamp = (new Date()).getTime();
            if ((currentTimestamp + fifteenMinutesInMilliseconds) >= timestamp) {
                setShowRewardsOptions(true);
            }
        }

        if (startingStream) {
            setTimeout(() => {
                if (loadingDots.length > 2) {
                    setLoadingDots('');
                } else {
                    setLoadingDots(loadingDots + '.');
                }
            }, 500);
        } else if (loadingDots !== '') {
            setLoadingDots('');
        }

        // stream is not in this array intentionally, cause it causes a loop because of the checkActiveCustomReward function
    }, [game, games, streamId, streamType, user, loadingDots, startingStream, showRewardsOptions, timestamp]);

    const cancelStream = (e) => {
        e.stopPropagation();
        if (window.confirm(t('StreamCard.deleteConfirmation'))) {
            cancelStreamRequest(user.uid, streamId);
            onRemoveStream(streamId);
        }
    }

    const startStream = async (e) => {
        if (e) {
            e.stopPropagation();
        }

        try {
            setStartingStream(true);
            const streamData = await startQaplaStream(user.uid, user.id, user.displayName, user.refreshToken, streamId, user.subscriptionDetails.redemptionsPerStream);

            window.analytics.track('Stream started', {
                streamId,
                uid: user.uid,
                timestamp: (new Date()).getTime()
            });
            setStream(streamData);
            if (!openStreamDialog) {
                setOpenStreamStartedDialog(true);
            }
            setStartingStream(false);
        } catch (error) {
            handleExpiredSession();
        }
    }

    const closeStream = async (e) => {
        if (e) {
            e.stopPropagation();
        }

        try {
            setClosingStream(true);
            await closeQaplaStream(user.uid, user.id, user.refreshToken, streamId, stream.xqReward, stream.xqRewardWebhookId, stream.qoinsReward, stream.qoinsRewardWebhookId);

            window.analytics.track('Stream finished', {
                streamId,
                uid: user.uid,
                timestamp: (new Date()).getTime()
            });
            setOpenRewardsRemovedDialog(true);

            // Close the rest of Dialogs just in case
            setOpenStreamStartedDialog(false);
            setOpenQoinsWarningDialog(false);
            setOpenStreamDialog(false);
        } catch (error) {
            handleExpiredSession();
        }
    }

    const checkIfCloseStreamDialogMustBeShown = (e) => {
        if (e) {
            e.stopPropagation();
        }

        if (stream.qoinsEnabled) {
            const dontShowCloseStreamWarning = localStorage.getItem('dontShowCloseStreamDialog');
            if (dontShowCloseStreamWarning) {
                closeStream();
            } else {
                setOpenEndStreamDialog(true);
            }
        } else {
            setOpenQoinsWarningDialog(true);
        }
    }

    const enableQoinsReward = async () => {
        try {
            await enableStreamQoinsReward(user.uid, user.id, user.refreshToken, streamId, stream.qoinsReward);

            window.analytics.track('Qoins enabled', {
                streamId,
                uid: user.uid,
                timestamp: (new Date()).getTime()
            });
            setStream({ ...stream, qoinsEnabled: true });
        } catch (error) {
            handleExpiredSession();
        }
    }

    const handleExpiredSession = async () => {
        alert(t('StreamCard.sessionExpired'));
        await auth.signOut();
        history.push('/');
    }

    const manageStream = () => history.push({ pathname: `/edit/${streamId}`, state: { streamType } });

    const closeDialogsAndOpenManageRewardsDialog = () => {
        setOpenStreamStartedDialog(false);
        setOpenQoinsWarningDialog(false);
        setOpenStreamDialog(true);
    }

    const closeAndRemoveStream = () => {
        setOpenRewardsRemovedDialog(false);
        onRemoveStream(streamId);
    }

    const sendMessage = async (message) => {
        if (message) {
            await sendCustomMessage(user.uid, title && title['en'] ? title['en'] : '', message);

            window.analytics.track('Custom Message sent', {
                streamId,
                uid: user.uid,
                timestamp: (new Date()).getTime(),
                message
            });
            setOpenCustomMessageSentDialog(true);
        }
    }

    if (game) {
        return (
            <Card className={classes.eventCard} style={style}>
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
                        src={streamsPlaceholderImages[game] || (games.allGames[game] ? games.allGames[game].fallbackImageUrl : null)}
                        width='100%'
                        height='180'
                        className={classes.eventImage} />
                </div>
                <div className={classes.eventCardContent}>
                    <p className={classes.eventCardTitle}>
                        {title && title['en'] ? title['en'] : ''}
                    </p>
                    {streamType !== PAST_STREAMS_EVENT_TYPE && !showRewardsOptions &&
                        <div style={{ display: 'flex', marginTop: '14px', alignItems: 'center' }}>
                            <div style={{
                                backgroundColor: streamType === PENDING_APPROVAL_EVENT_TYPE ? '#C6B200' : '#00FFDD',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%'
                            }} />
                            <div style={{ width: '6px' }} />
                            <p style={{ color: '#FFF', fontSize: '12px', fontWeight: '500', lineHeight: '16px' }}>
                                {streamType === PENDING_APPROVAL_EVENT_TYPE ? t('StreamCard.pendingReview') : t('StreamCard.posted')}
                            </p>
                        </div>
                    }
                    <div className={classes.buttonsContainer}>
                        {(showRewardsOptions && streamType === SCHEDULED_EVENT_TYPE) &&
                            (!startingStream ?
                                (stream ?
                                    (!closingStream ?
                                        <Button size='medium' className={classes.endButton}
                                            disabled={closingStream}
                                            onClick={checkIfCloseStreamDialogMustBeShown}>
                                            {t('StreamCard.end')}
                                        </Button>
                                        :
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <CircularProgress style={{ color: '#3B4BF9' }} />
                                        </div>
                                    )
                                    :
                                    <Button size='medium' className={classes.startButton}
                                        onClick={startStream }>
                                        {t('StreamCard.start')}
                                    </Button>
                                )
                                :
                                <p style={{ fontSize: 11, fontWeight: '600', textAlign: 'center', color: '#FFF', marginBottom: 16 }}>
                                    {`${t('StreamCard.creatingRewards')}${loadingDots}`}
                                </p>
                            )
                        }
                        <div style={{ height: '11px' }} />
                        {streamType === SCHEDULED_EVENT_TYPE &&
                            <Button size='medium' className={classes.manageButton} onClick={showRewardsOptions ? setOpenStreamDialog : manageStream}>
                                {showRewardsOptions ?
                                    t('StreamCard.manageRewards')
                                    :
                                    t('StreamCard.manageStream')
                                }
                            </Button>
                        }
                        {streamType === PENDING_APPROVAL_EVENT_TYPE &&
                            <Button size='medium' className={classes.manageButton} onClick={cancelStream}>
                                {t('StreamCard.cancelStreamRequest')}
                            </Button>
                        }
                    </div>
                </div>
                <EventManagementDialog open={openStreamDialog}
                    user={user}
                    sendMessage={sendMessage}
                    streamId={streamId}
                    stream={stream}
                    streamStarted={startingStream}
                    closingStream={closingStream}
                    onClose={() => setOpenStreamDialog(false)}
                    startStream={startStream}
                    enableQoins={enableQoinsReward}
                    closeStream={checkIfCloseStreamDialogMustBeShown}
                    streamTitle={title && title['en'] ? title['en'] : ''}
                    date={date}
                    hour={hour} />
                <EventConfirmStartDialog open={openStreamStartedDialog}
                    onClose={() => setOpenStreamStartedDialog(false)}
                    manageRewards={closeDialogsAndOpenManageRewardsDialog} />
                <EventWarningQoinsDialog open={openQoinsWarningDialog}
                    onClose={() => setOpenQoinsWarningDialog(false)}
                    manageRewards={closeDialogsAndOpenManageRewardsDialog} />
                <EventEndStreamConfirmDialog open={openEndStreamDialog}
                    closingStream={closingStream}
                    onClose={() => setOpenEndStreamDialog(false)}
                    closeStream={closeStream} />
                <EventRewardsRemovedConfirmation open={openRewardsRemovedDialog}
                    onClose={closeAndRemoveStream}  />
                <EventCustomMessageSentConfirmation open={openCustomMessageSentDialog}
                    onClose={() => setOpenCustomMessageSentDialog(false)} />
            </Card>
        );
    }

    return null;
}

export default StreamCard;