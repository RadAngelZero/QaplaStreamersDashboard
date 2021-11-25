import React, { useState, useEffect } from 'react';
import { makeStyles, withStyles, Menu, MenuItem, Card, CardContent, IconButton, Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as OptionsIcon } from './../../assets/OptionsIcon.svg';
import {
    streamsPlaceholderImages,
    SCEHDULED_EVENT_TYPE,
    PAST_STREAMS_EVENT_TYPE,
    PENDING_APPROVAL_EVENT_TYPE
} from '../../utilities/Constants';
import {
    cancelStreamRequest,
    getStreamParticipantsNumber,
    getPastStreamParticipantsNumber,
    getStreamTitle,
    getPastStreamTitle,
    getClosedStream
} from '../../services/database';

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

const StreamCard = ({ user, streamId, streamType, game, games, date, hour, onClick, enableOptionsIcon, closeOptionsMenu, onRemoveStream }) => {
    const history = useHistory();
    const [anchorEl, setAnchorEl] = useState(null);
    const [participantsNumber, setParticipantsNumber] = useState(null);
    const [title, setTitle] = useState({ en: '', es: '' });
    const [closedStream, setClosedStream] = useState(null);
    const classes = useStyles();
    const { t } = useTranslation();

    useEffect(() => {
        async function getParticipantsNumber() {
            if (streamType === SCEHDULED_EVENT_TYPE) {
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

        async function getStreamClosedStatus() {
            const closedStream = await getClosedStream(user.uid, streamId);
            if (closedStream.exists()) {
                setClosedStream(closedStream.val());
            } else {
                setClosedStream(null);
            }
        }

        getParticipantsNumber();
        getStreamClosedStatus();
    }, [game, games, streamId, streamType, user, closedStream]);

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

    const startStream = (e) => {
        e.stopPropagation();
        history.push(`/stream/${streamId}`);
    }

    const resumeStream = (e) => {
        e.stopPropagation();
        history.push(`/stream/${streamId}`);
    }

    return (
        <Card className={classes.eventCard} onClick={onClickCard}>
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
                    {streamType === SCEHDULED_EVENT_TYPE ?
                        <>
                            {closedStream === null ?
                            <Button size='medium' className={classes.streamButton} onClick={startStream}>
                                {t('StreamCard.start')}
                            </Button>
                            :
                            closedStream === false &&
                            <Button style={{ marginBottom: 16 }} size='medium' className={classes.streamButton} onClick={resumeStream}>
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