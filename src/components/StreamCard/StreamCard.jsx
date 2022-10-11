import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles, Card, Button, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as ShareArrow } from './../../assets/ShareArrow.svg';
import { ReactComponent as TimerIcon } from './../../assets/Timer.svg';
import { ReactComponent as EditIcon } from './../../assets/EditPencil.svg';
import { ReactComponent as DeleteIcon } from './../../assets/Delete.svg';
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
    checkActiveCustomReward,
    listenToQoinsEnabled,
    removeQoinsEnabledListener,
    getStreamLink,
    sendQoinsDropsAlert
} from '../../services/database';
import { closeQaplaStream, enableStreamQoinsReward, startQaplaStream } from '../../services/streamQapla';
import EventManagementDialog from '../QaplaStreamDialogs/EventManagementDialog';
import EventConfirmStartDialog from '../QaplaStreamDialogs/EventConfirmStartDialog';
import EventWarningQoinsDialog from '../QaplaStreamDialogs/EventWarningQoinsDialog';
import EventEndStreamConfirmDialog from '../QaplaStreamDialogs/EventEndStreamConfirmDialog';
import EventRewardsRemovedConfirmation from '../QaplaStreamDialogs/EventRewardsRemovedConfirmation';
import { auth } from '../../services/firebase';
import EventCustomMessageSentConfirmation from '../QaplaStreamDialogs/EventCustomMessageSentConfirmation';
import { notifyAboutStreamToFollowersAndParticipants, sendCustomMessage } from '../../services/functions';
import { getCurrentLanguage } from '../../utilities/i18n';
import EventConfirmCancellationDialog from '../QaplaStreamDialogs/EventConfirmCancellationDialog';
import SuccessDialog from '../SuccessDialog/SuccessDialog';

const useStyles = makeStyles(() => ({
    eventCard: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#141833',
        borderRadius: '1.5rem',
        boxShadow: '0 6px 15px 0 rgba(0,0,0,0.31)',
        height: '100%',
        minWidth: '250px',
        minHeight: '360px',
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
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#272D5780',
            opacity: 0.8
        }
    },
    cardContainer: {
        padding: '0px 16px !important',
        maxWidth: '270px !important',
        marginBottom: '20px !important'
    },
    cancelButton: {
        marginBottom: '16px',
        backgroundColor: 'transparent',
        color: '#FFF',
        opacity: 0.6,
        width: '100%',
        borderRadius: '8px',
        textTransform: 'none'
    }
}));

const StreamCard = ({ key, user, streamId, streamType, game, games, date, hour, onRemoveStream, style = {}, timestamp, image, drops, usedDrops = 0 }) => {
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
    const [hideStream, setHideStream] = useState(false);
    const [shareHover, setShareHover] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);
    const [shareGrowAnimationPlay, setShareGrowAnimationPlay] = useState("false");
    const [shareShrinkAnimationPlay, setShareShrinkAnimationPlay] = useState("false");
    const [copiedEnterAnimationPlay, setCopiedEnterAnimationPlay] = useState("false");
    const [copiedExitAnimationPlay, setCopiedExitAnimationPlay] = useState("false");
    const [playBothEnterAnimation, setPlayBothEnterAnimation] = useState("false");
    const [playBothExitAnimation, setPlayBothExitAnimation] = useState("false");
    const [isTouch, setIsTouch] = useState(false);
    const [streamLink, setStreamLink] = useState('');
    const [openCancelStreamDialog, setOpenCancelStreamDialog] = useState(false);
    const [openCanceledStreamSuccessfulDialog, setOpenCanceledStreamSuccessfulDialog] = useState(false);
    const actualShareHover = useRef(null);
    const history = useHistory();
    const classes = useStyles();
    const { t } = useTranslation();

    useEffect(() => {
        async function getTitle() {
            if (streamType === SCHEDULED_EVENT_TYPE) {
                const title = await getStreamTitle(streamId);

                if (title.exists()) {
                    setTitle(title.val());
                } else if (games['allGames'] && games['allGames'][game] && games['allGames'][game].gameName) {
                    setTitle({ en: games['allGames'][game].gameName, es: games['allGames'][game].gameName });
                }
            } else if (streamType === PAST_STREAMS_EVENT_TYPE) {
                const title = await getPastStreamTitle(user.uid, streamId);
                setTitle(title.val());
            } else if (streamType === PENDING_APPROVAL_EVENT_TYPE) {
                if (games['allGames'] && games['allGames'][game] && games['allGames'][game].gameName) {
                    setTitle({ en: games['allGames'][game].gameName });
                }
            }
        }

        async function getLink() {
            const link = await getStreamLink(streamId);
            setStreamLink(link.val());
        }

        async function checkStreamStatus() {
            const streamStatus = await checkActiveCustomReward(streamId);
            if (streamStatus.exists()) {
                if (streamStatus.val().enableIn && !streamStatus.val().qoinsEnabled) {
                    listenToQoinsEnabled(streamId, (qoinsEnabled) => {
                        if (qoinsEnabled.val()) {
                            setStream({
                                ...{ key: streamStatus.key, ...streamStatus.val() },
                                qoinsEnabled: qoinsEnabled.val()
                            });

                            removeQoinsEnabledListener(streamId);
                        } else {
                            setStream({ key: streamStatus.key, ...streamStatus.val() });
                        }
                    });
                } else {
                    setStream({ key: streamStatus.key, ...streamStatus.val() });
                }

                setShowRewardsOptions(true);
                setHideStream(false);
            } else {
                setStream(null);
            }
        }

        getLink();
        getTitle();
        checkStreamStatus();

        if (streamType === SCHEDULED_EVENT_TYPE && !showRewardsOptions) {
            const fifteenMinutesInMilliseconds = HOUR_IN_MILISECONDS / 4;
            const currentTimestamp = (new Date()).getTime();
            if ((currentTimestamp + fifteenMinutesInMilliseconds) >= timestamp) {
                if ((timestamp + (HOUR_IN_MILISECONDS * 3)) < currentTimestamp) {
                    setHideStream(true);
                } else {
                    setShowRewardsOptions(true);
                }
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

    const cancelStream = async () => {
        await cancelStreamRequest(user.uid, streamId);
        onRemoveStream(streamId);
        setOpenCancelStreamDialog(false);
        setOpenCanceledStreamSuccessfulDialog(true);
    }

    const startStream = async (enableIn) => {
        try {
            setStartingStream(true);
            const streamData = await startQaplaStream(user.uid, user.id, user.displayName, user.refreshToken, streamId, drops, enableIn);

            if (enableIn) {
                listenToQoinsEnabled(streamId, (qoinsEnabled) => {
                    if (qoinsEnabled.val()) {
                        setStream({
                            ...stream,
                            qoinsEnabled: qoinsEnabled.val()
                        });

                        removeQoinsEnabledListener(streamId);
                    }
                });
            } else {
                sendQoinsDropsAlert(user.uid);
            }

            setStream(streamData);
            if (!openStreamDialog) {
                setOpenStreamStartedDialog(true);
            }
            setStartingStream(false);

            try {
                await notifyAboutStreamToFollowersAndParticipants(streamId,
                    user.uid,
                    {
                        es: title.en,
                        en: title.es
                    },
                    {
                        en: `${user.displayName}’s is live! Come for your drops 🪂`,
                        es: `${user.displayName} ya prendió su stream con drops 🪂`
                    },
                    'reminders'
                );
            } catch (error) {
                console.log(error);
            }

            window.analytics.track('Stream started', {
                streamId,
                uid: user.uid,
                timestamp: (new Date()).getTime()
            });

            return streamData;
        } catch (error) {
            if (error && error.status === 401) {
                handleExpiredSession();
            } else {
                alert('Hubo un problema al iniciar, si el problema persiste contacta con soporte tecnico');
            }
        }
    }

    const closeStream = async (e) => {
        if (e) {
            e.stopPropagation();
        }

        try {
            setClosingStream(true);
            await closeQaplaStream(user.uid, user.id, user.refreshToken, streamId, stream.qoinsReward, stream.qoinsRewardWebhookId, drops);

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
            console.log(error);
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

    /**
     * When reward created inmediately from modal stream can be undefined and give problems for that case we
     * have streamObject as parameter with a default value of stream state
     */
    const enableQoinsReward = async (streamObject = stream) => {
        try {
            await enableStreamQoinsReward(user.uid, user.id, user.refreshToken, streamId, streamObject.qoinsReward);

            window.analytics.track('Qoins enabled', {
                streamId,
                uid: user.uid,
                timestamp: (new Date()).getTime()
            });
            setStream({ ...streamObject, qoinsEnabled: true });
        } catch (error) {
            console.log(error);
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
            notifyAboutStreamToFollowersAndParticipants(streamId,
                user.uid,
                {
                    es: title.en,
                    en: title.es
                },
                {
                    es: message,
                    en: message
                },
                'reminders'
            );
            setOpenCustomMessageSentDialog(true);

            window.analytics.track('Custom Message sent', {
                streamId,
                uid: user.uid,
                timestamp: (new Date()).getTime(),
                message
            });
        }
    }

    const copiedLink = () => {
        navigator.clipboard.writeText(streamLink);
        setTimeout(() => {
            setShareCopied(false);
            if (actualShareHover.current && !isTouch) {
                setCopiedExitAnimationPlay("true");
            } else {
                setPlayBothExitAnimation("true");
            }
        }, 2.5 * 1000)
    }

    if (game && !hideStream) {
        const currentLanguage = getCurrentLanguage();
        return (
            <Grid item xl={2} lg={3} md={3} sm={4} xs={10} key={key} className={classes.cardContainer}>
                <Card className={classes.eventCard} style={style}>
                    <div className={classes.relativeContainer}>
                        {streamType === SCHEDULED_EVENT_TYPE &&
                            <div
                                onAnimationEnd={() => {
                                    setShareGrowAnimationPlay("false");
                                    setCopiedEnterAnimationPlay("false");
                                    setShareShrinkAnimationPlay("false");
                                    setCopiedExitAnimationPlay("false");
                                    setPlayBothEnterAnimation("false");
                                    setPlayBothExitAnimation("false");
                                }}
                                playGrowAnimation={shareGrowAnimationPlay}
                                playShrinkAnimation={shareShrinkAnimationPlay}
                                playCopiedEnterAnimation={copiedEnterAnimationPlay}
                                playCopiedExitAnimetion={copiedExitAnimationPlay}
                                playBothEnterAnimation={playBothEnterAnimation}
                                playBothExitAnimation={playBothExitAnimation}
                                className="share-container"
                                style={{
                                    position: 'absolute',
                                    display: 'flex',
                                    backgroundColor: shareCopied ? '#3B4BF9' : '#1B1D21',
                                    borderRadius: '5px',
                                    height: '28px',
                                    bottom: '18px',
                                    left: '18px',
                                    width: shareHover || shareCopied ? '86px' : '28px',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                onMouseEnter={() => {
                                    if (isTouch) return;
                                    setShareHover(true);
                                    actualShareHover.current = true;
                                    if (!shareCopied) {
                                        setShareGrowAnimationPlay("true");
                                    }
                                }}
                                onMouseLeave={() => {
                                    setShareHover(false);
                                    actualShareHover.current = false;
                                    if (shareCopied || isTouch) return;
                                    setShareShrinkAnimationPlay("true");
                                }}
                                onMouseDown={() => {
                                    if (shareCopied) return;
                                    setShareCopied(true);
                                    if (isTouch) {
                                        setPlayBothEnterAnimation("true");
                                    } else {
                                        setCopiedEnterAnimationPlay("true");
                                    }
                                    copiedLink();
                                }}
                                onMouseUp={() => {
                                    if (shareCopied) return;
                                    setShareCopied(false);
                                }}
                                onTouchStart={() => {
                                    setIsTouch(true);
                                }}
                                onTouchEnd={() => {
                                    setIsTouch(true);
                                    setShareHover(false);
                                }}
                            >
                                <style>{`
                                    @keyframes widthGrow {
                                        from {
                                            width: 28px;
                                            }
                                        to {
                                            width: 86px;
                                        }
                                    }
                                    @keyframes widthShrink {
                                        from {
                                            width: 86px;
                                            }
                                        to {
                                            width: 28px;
                                        }
                                    }
                                    @keyframes copiedEnter {
                                        from {
                                            background-color: #1B1D21;
                                            }
                                        to {
                                            background-color: #3B4BF9;
                                        }
                                    }
                                    @keyframes copiedExit {
                                        from {
                                            background-color: #3B4BF9;
                                            }
                                        to {
                                            background-color: #1B1D21;
                                        }
                                    }
                                    @keyframes bothEnter {
                                        from {
                                            background-color: #1B1D21;
                                            width: 28px;
                                            }
                                        to {
                                            background-color: #3B4BF9;
                                            width: 86px;
                                        }
                                    }
                                    @keyframes bothExit {
                                        from {
                                            background-color: #3B4BF9;
                                            width: 86px;
                                            }
                                        to {
                                            background-color: #1B1D21;
                                            width: 28px;
                                        }
                                    }
                                    .share-container[playBothEnterAnimation="true"] {
                                        animation: bothEnter 0.5s ease-in-out 1;
                                    }
                                    .share-container[playBothExitAnimation="true"] {
                                        animation: bothExit 0.5s ease-in-out 1;
                                    }
                                    .share-container[playGrowAnimation="true"] {
                                        animation: widthGrow 0.5s ease-in-out 1;
                                    }
                                    .share-container[playShrinkAnimation="true"] {
                                        animation: widthShrink 0.5s ease-in-out 1;
                                    }
                                    .share-container[playCopiedEnterAnimation="true"] {
                                        animation: copiedEnter 0.5s ease-in-out 1;
                                    }
                                    .share-container[playCopiedExitAnimetion="true"] {
                                        animation: copiedExit 0.5s ease-in-out 1;
                                    }
                                `}</style>
                                <p
                                    playCopiedEnterAnimation={copiedEnterAnimationPlay}
                                    playCopiedExitAnimation={copiedExitAnimationPlay}
                                    playBothEnterAnimation={playBothEnterAnimation}
                                    playBothExitAnimation={playBothExitAnimation}
                                    style={{
                                        display: 'flex',
                                        color: '#fff',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        lineHeight: '13px',
                                        letterSpacing: '0px',
                                        textAlign: 'center',
                                        width: shareCopied ? '100%' : '0%',
                                        overflow: 'hidden',
                                        justifyContent: 'center',
                                        whiteSpace: 'nowrap',
                                    }}
                                    className="copied-text">
                                    <style>{`

                                        @keyframes copiedTextGrow {
                                            from {
                                                width: 0%;
                                                }
                                            to {
                                                width: 100%;
                                            }
                                        }
                                        @keyframes copiedTextShrink {
                                            from {
                                                width: 100%;
                                                }
                                            to {
                                                width: 0%;
                                            }
                                        }

                                        .copied-text[playCopiedEnterAnimation="true"] {
                                            animation: copiedTextGrow 0.5s ease-in-out 1;
                                        }
                                        .copied-text[playCopiedExitAnimation="true"] {
                                            animation: copiedTextShrink 0.5s ease-in-out 1;
                                        }
                                        .copied-text[playBothEnterAnimation="true"] {
                                            animation: copiedTextGrow 0.5s ease-in-out 1;
                                        }
                                        .copied-text[playBothExitAnimation="true"] {
                                            animation: copiedTextShrink 0.5s ease-in-out 1;
                                        }
                                        `}</style>
                                    {'🔗 Copiado'}
                                </p>
                                <div
                                    playCopiedEnterAnimation={copiedEnterAnimationPlay}
                                    playCopiedExitAnimation={copiedExitAnimationPlay}
                                    playBothEnterAnimation={playBothEnterAnimation}
                                    playBothExitAnimation={playBothExitAnimation}
                                    style={{
                                        display: 'flex',
                                        flex: 1,
                                        flexDirection: 'row',
                                        flexWrap: 'nowrap',
                                        justifyContent: 'center',
                                        // margin: '0px 15px',
                                        width: shareCopied ? '0%' : '100%',
                                    }}
                                    className="share-display-container"
                                >
                                    <style>{`
                                    @keyframes shareDisplayGrow {
                                        from {
                                            width: 0%;
                                            }
                                        to {
                                            width: 100%;
                                        }
                                    }
                                    @keyframes shareDisplayShrink {
                                        from {
                                            width: 100%;
                                            }
                                        to {
                                            width: 0%;
                                        }
                                    }

                                    .share-display-container[playCopiedEnterAnimation="true"] {
                                        animation: shareDisplayShrink 0.5s ease-in-out 1;
                                    }
                                    .share-display-container[playCopiedExitAnimation="true"] {
                                        animation: shareDisplayGrow 0.5s ease-in-out 1;
                                    }
                                    .share-display-container[playBothEnterAnimation="true"] {
                                        animation: shareDisplayShrink 0.5s ease-in-out 1;
                                    }
                                    .share-display-container[playBothExitAnimation="true"] {
                                        animation: shareDisplayGrow 0.5s ease-in-out 1;
                                    }
                                    `}</style>
                                    <p
                                        playGrowAnimation={shareGrowAnimationPlay}
                                        playShrinkAnimation={shareShrinkAnimationPlay}
                                        playCopiedEnterAnimation={copiedEnterAnimationPlay}
                                        playCopiedExitAnimation={copiedExitAnimationPlay}
                                        style={{
                                            display: 'flex',
                                            color: '#fff',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            lineHeight: '13px',
                                            letterSpacing: '0px',
                                            marginRight: shareHover ? '4px' : '0px',
                                            width: shareHover ? '64%' : '0%',
                                            overflow: 'hidden',
                                        }}
                                        className="share-text">
                                        <style>{`

                                        @keyframes shareTextGrow {
                                            from {
                                                width: 0%;
                                                margin-right: 0px;
                                                }
                                            to {
                                                width: 64%;
                                                margin-right: 4px;
                                            }
                                        }
                                        @keyframes shareTextShrink {
                                            from {
                                                width: 64%;
                                                margin-right: 4px;
                                                }
                                            to {
                                                width: 0%;
                                                margin-right: 0px;
                                            }
                                        }

                                        .share-text[playGrowAnimation="true"] {
                                            animation: shareTextGrow 0.5s ease-in-out 1;
                                        }
                                        .share-text[playShrinkAnimation="true"] {
                                            animation: shareTextShrink 0.5s ease-in-out 1;
                                        }
                                        `}</style>
                                        {'Compartir'}
                                    </p>
                                    <ShareArrow
                                        playGrowAnimation={shareGrowAnimationPlay}
                                        playShrinkAnimation={shareShrinkAnimationPlay}
                                        style={shareHover ?
                                            {
                                                transform: 'scale(0.8)',
                                            }
                                            :
                                            {
                                                transform: 'scale(1)'
                                            }
                                        } className="share-icon">
                                        <style>{`
                                                @keyframes shareIconShrink {
                                                    from {
                                                        transform: scale(1);
                                                        }
                                                    to {
                                                        transform: scale(0.8);
                                                    }
                                                }
                                                @keyframes shareIconNormal {
                                                    from {
                                                        transform: scale(0.8);
                                                        }
                                                    to {
                                                        transform: scale(1);
                                                    }
                                                }

                                                .share-icon[playGrowAnimation="true"] {
                                                    animation: shareIconShrink 0.5s ease-in-out 1;
                                                }
                                                .share-icon[playShrinkAnimation="true"] {
                                                    animation: shareIconNormal 0.5s ease-in-out 1;
                                                }
                                            `}</style>
                                    </ShareArrow>
                                </div>
                            </div>
                        }
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
                            src={image ? image : (streamsPlaceholderImages[game] || (games.allGames[game] ? games.allGames[game].fallbackImageUrl : null))}
                            width='100%'
                            height='180'
                            className={classes.eventImage} />
                    </div>
                    <div className={classes.eventCardContent}>
                        <p className={classes.eventCardTitle}>
                            {title && title[currentLanguage] ? title[currentLanguage] : ''}
                        </p>
                        {(usedDrops && streamType === PAST_STREAMS_EVENT_TYPE) ?
                            <p style={{ fontSize: '16px', fontWeight: '500', color: '#FFF', marginTop: '13px' }}>
                                🪂 <span style={{ color: '#00FFDD' }}>{usedDrops} drops</span> {t('StreamCard.used')}
                            </p>
                            :
                            null
                        }
                        <div className={classes.buttonsContainer}>
                            {(showRewardsOptions && streamType === SCHEDULED_EVENT_TYPE) &&
                                (!startingStream ?
                                    (stream ?
                                        (!closingStream && stream.qoinsEnabled ?
                                            <Button size='medium' className={classes.endButton}
                                                disabled={closingStream}
                                                onClick={checkIfCloseStreamDialogMustBeShown}>
                                                {t('StreamCard.end')}
                                            </Button>
                                            :
                                            <p style={{ color: '#FFF', textAlign: 'center' }}>
                                                {t('StreamCard.dropsScheduled')}
                                            </p>
                                        )
                                        :
                                        <Button size='medium' className={classes.startButton}
                                            startIcon={<TimerIcon />}
                                            onClick={() => setOpenStreamDialog(true)}>
                                            {t('StreamCard.enableDrops')}
                                        </Button>
                                    )
                                    :
                                    <p style={{ fontSize: 11, fontWeight: '600', textAlign: 'center', color: '#FFF', marginBottom: 16 }}>
                                        {`${t('StreamCard.creatingRewards')}${loadingDots}`}
                                    </p>
                                )
                            }
                            <div style={{ height: '11px' }} />
                            {streamType === SCHEDULED_EVENT_TYPE && !showRewardsOptions &&
                                <>
                                <Button size='medium'
                                    className={classes.cancelButton}
                                    onClick={() => setOpenCancelStreamDialog(true)}
                                    startIcon={<DeleteIcon color='rgba(255, 255, 255, 0.6)' />}>
                                    {t('StreamCard.cancelStreamRequest')}
                                </Button>
                                <Button size='medium'
                                    className={classes.manageButton}
                                    onClick={manageStream}
                                    startIcon={<EditIcon />}>
                                    {t('StreamCard.manageStream')}
                                </Button>
                                </>
                            }
                        </div>
                    </div>
                    <EventManagementDialog open={openStreamDialog}
                        user={user}
                        sendMessage={(message) => sendMessage(message)}
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
                        onClose={closeAndRemoveStream} />
                    <EventCustomMessageSentConfirmation open={openCustomMessageSentDialog}
                        onClose={() => setOpenCustomMessageSentDialog(false)} />
                    <EventConfirmCancellationDialog open={openCancelStreamDialog}
                        streamTitle={title && title['en'] ? title['en'] : ''}
                        streamerName={user.displayName}
                        streamerUid={user.uid}
                        streamId={streamId}
                        onClose={() => setOpenCancelStreamDialog(false)}
                        cancelStream={cancelStream} />
                    <SuccessDialog open={openCanceledStreamSuccessfulDialog}
                        title={t('StreamCard.successfullyCanceledStreamDialogTitle')}
                        buttonText={t('StreamCard.successfullyCanceledStreamDialogButtonText')}
                        onClose={() => setOpenCanceledStreamSuccessfulDialog(false)} />
                </Card>
            </Grid>
        );
    }

    return null;
}

export default StreamCard;