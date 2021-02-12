import React, { useState, useEffect } from 'react';
import { makeStyles, withStyles, Menu, MenuItem, Card, CardContent, IconButton } from '@material-ui/core';

import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as OptionsIcon } from './../../assets/OptionsIcon.svg';
import { streamsPlaceholderImages, SCEHDULED_EVENT_TYPE, PAST_STREAMS_EVENT_TYPE, PENDING_APPROVAL_EVENT_TYPE } from '../../utilities/Constants';
import { cancelStreamRequest, getStreamParticipantsNumber, getPastStreamParticipantsNumber, getStreamTitle } from '../../services/database';

const useStyles = makeStyles(() => ({
    eventCard: {
        backgroundColor: '#141833',
        borderRadius: '1.5rem',
        boxShadow: '0 6px 15px 0 rgba(0,0,0,0.31)',
        height: '100%'
    },
    eventImage: {
        objectFit: 'cover',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    },
    eventCardContent: {
        padding: '1.5rem',
        paddingTop: '.5rem',
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

const StreamCard = ({ user, streamId, streamType, game, games, date, onClick, enableOptionsIcon, closeOptionsMenu, onRemoveStream }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [participantsNumber, setParticipantsNumber] = useState(null);
    const [title, setTitle] = useState('');
    const classes = useStyles();

    useEffect(() => {
        async function getParticipantsNumber() {
            if (streamType === SCEHDULED_EVENT_TYPE) {
                const participants = await getStreamParticipantsNumber(streamId);
                let participantsNumber = participants.exists() ? participants.val() : 0;
                setParticipantsNumber(participantsNumber);

                const title = await getStreamTitle(streamId);
                setTitle(title.val());
            } else if (streamType === PAST_STREAMS_EVENT_TYPE) {
                const participants = await getPastStreamParticipantsNumber(streamId);
                let participantsNumber = participants.exists() ? participants.val() : 0;

                // Load title
                setParticipantsNumber(participantsNumber);
            } else if (streamType === PENDING_APPROVAL_EVENT_TYPE) {
                setTitle(games['allGames'][game].name);
            }
        }

        getParticipantsNumber();
    }, []);

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
        if (window.confirm('¿Estas seguro que deseas eliminar este stream?')) {
            cancelStreamRequest(user.uid, streamId);
            onRemoveStream(streamId);
        }
    }

    const onClickCard = () => {
        if (streamType !== PENDING_APPROVAL_EVENT_TYPE) {
            onClick();
        }
    }

    return (
        <Card className={classes.eventCard} onClick={onClickCard}>
            <div style={{ overflow: 'hidden' }}>
                <img
                    alt='Game'
                    src={streamsPlaceholderImages[game]}
                    height='160'
                    className={classes.eventImage} />
            </div>
            <CardContent className={classes.eventCardContent}>
                <p className={classes.eventCardTitle}>
                    {title}
                </p>
                <div className={classes.rowContainer}>
                    <div className={classes.circle} style={{ backgroundColor: participantsNumber !== null ? '#0049C6' : 'transparent' }} />
                    <p className={classes.participantsNumber} style={{ color: participantsNumber !== null ? '#808191' : 'transparent' }}>
                        {participantsNumber} participants
                    </p>
                </div>
                <div className={classes.dateContainer}>
                    <div className={classes.rowContainer}>
                        <CalendarIcon />
                        <p className={classes.date}>
                            {date}
                        </p>
                    </div>
                    <IconButton size='small' disabled={!enableOptionsIcon} onClick={onOptionsIconClick}>
                        <OptionsIcon />
                    </IconButton>
                    <StyledMenu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        keepMounted
                        onClose={closeMenu}>
                        <StyledMenuItem onClick={cancelStream}>Cancelar</StyledMenuItem>
                    </StyledMenu>
                </div>
            </CardContent>
        </Card>
    );
}

export default StreamCard;