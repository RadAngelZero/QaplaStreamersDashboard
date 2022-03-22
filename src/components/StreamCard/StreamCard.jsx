import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles, Card, Button } from '@material-ui/core';
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
    getStreamParticipantsNumber,
    getPastStreamParticipantsNumber,
    getStreamTitle,
    getPastStreamTitle,
    checkActiveCustomReward
} from '../../services/database';
import EventManagementModal from '../EventManagementModal/EventManagementModal';
import { closeQaplaStream, enableStreamQoinsReward, startQaplaStream } from '../../services/streamQapla';

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

const StreamCard = ({ user, streamId, streamType, game, games, date, hour, onRemoveStream, style = {}, timestamp }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [participantsNumber, setParticipantsNumber] = useState(null);
    const [title, setTitle] = useState({ en: '', es: '' });
    const [stream, setStream] = useState(null);
    const [showRewardsOptions, setShowRewardsOptions] = useState(false);
    const [openStreamDialog, setOpenStreamDialog] = useState(false);
    const [startingStream, setStartingStream] = useState(false);
    const history = useHistory();
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

        if (streamType === SCHEDULED_EVENT_TYPE && !showRewardsOptions) {
            const fifteenMinutesInMilliseconds = HOUR_IN_MILISECONDS / 4;
            const currentTimestamp = (new Date()).getTime();
            if (true || (currentTimestamp + fifteenMinutesInMilliseconds) >= timestamp && (currentTimestamp + fifteenMinutesInMilliseconds) < (timestamp + HOUR_IN_MILISECONDS * 2)) {
                setShowRewardsOptions(true);
            }
        }

        // stream is not in this array intentionally, cause it causes a loop because of the checkActiveCustomReward function
    }, [game, games, streamId, streamType, user]);

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
            setStream(streamData);
            setOpenStreamDialog(true);
            setStartingStream(false);
        } catch (error) {
            // Notify user
            // Log out
        }
    }

    const closeStream = async (e) => {
        if (e) {
            e.stopPropagation();
        }

        try {
            await closeQaplaStream(user.uid, user.id, user.refreshToken, streamId, stream.xqReward, stream.xqRewardWebhookId, stream.qoinsReward, stream.qoinsRewardWebhookId);
            onRemoveStream();
        } catch (error) {
            // Notify user
            // Log out
        }
    }

    const enableQoinsReward = async () => {
        await enableStreamQoinsReward(user.uid, user.id, user.refreshToken, streamId, stream.qoinsReward);
        setStream({ ...stream, qoinsEnabled: true });
    }

    const manageStream = () => history.push({ pathname: `/edit/${streamId}`, state: { streamType } });

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
                    src={streamsPlaceholderImages[game] || games.allGames[game].fallbackImageUrl}
                    width='100%'
                    height='180'
                    className={classes.eventImage} />
            </div>
            <div className={classes.eventCardContent}>
                <p className={classes.eventCardTitle}>
                    {title && title['en'] ? title['en'] : ''}
                </p>
                {streamType !== PAST_STREAMS_EVENT_TYPE &&
                    <div style={{ display: 'flex', marginTop: '14px', alignItems: 'center' }}>
                        <div style={{
                            backgroundColor: streamType === PENDING_APPROVAL_EVENT_TYPE ? '#C6B200' : '#00FFDD',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%'
                        }} />
                        <div style={{ width: '6px' }} />
                        <p style={{ color: '#FFF', fontSize: '12px', fontWeight: '500', lineHeight: '16px' }}>
                            {streamType === PENDING_APPROVAL_EVENT_TYPE ? 'Pending for review' : 'Posted'}
                        </p>
                    </div>
                }
                <div className={classes.buttonsContainer}>
                    {(showRewardsOptions && streamType === SCHEDULED_EVENT_TYPE) &&
                        (!startingStream ?
                        <Button size='medium' className={classes.startButton} style={{ backgroundColor: stream ? '#3B4BF9' : '#00FFDD' }}
                            onClick={stream ? closeStream : startStream }>
                            {stream ? 'End Stream' : t('StreamCard.start')}
                        </Button>
                        :
                        <p style={{ fontSize: 11, fontWeight: '600', textAlign: 'center', color: '#FFF', marginBottom: 16 }}>
                            Creating rewards...
                        </p>)
                    }
                    <div style={{ height: '11px' }} />
                    <Button size='medium' className={classes.manageButton} onClick={showRewardsOptions ? setOpenStreamDialog : manageStream}>
                        {showRewardsOptions ?
                            'Manage rewards'
                            :
                            'Manage stream'
                        }
                    </Button>
                </div>
            </div>
            <EventManagementModal open={openStreamDialog}
                user={user}
                streamId={streamId}
                stream={stream}
                onClose={() => setOpenStreamDialog(false)}
                startStream={startStream}
                enableQoins={enableQoinsReward}
                closeStream={closeStream} />
        </Card>
    );
}

export default StreamCard;