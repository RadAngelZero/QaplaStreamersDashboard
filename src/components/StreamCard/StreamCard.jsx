import React, { useState } from 'react';
import { makeStyles, Card, CardContent, IconButton, Menu, MenuItem } from '@material-ui/core';

import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as OptionsIcon } from './../../assets/OptionsIcon.svg';
import { streamsPlaceholderImages } from '../../utilities/Constants';
import { cancelStreamRequest } from '../../services/database';

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

const StreamCard = ({ user, streamId, game, title, participants, date, onClick, enableOptionsIcon, closeOptionsMenu, onRemoveStream }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const classes = useStyles();
    const hasParticipants = typeof participants === 'number';

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

    return (
        <Card className={classes.eventCard} onClick={onClick}>
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
                    <div className={classes.circle} style={{ backgroundColor: hasParticipants ? '#0049C6' : 'transparent' }} />
                    <p className={classes.participantsNumber} style={{ color: hasParticipants ? '#808191' : 'transparent' }}>
                        {participants} participants
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
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        keepMounted
                        onClose={closeMenu}>
                        <MenuItem onClick={cancelStream}>Cancelar</MenuItem>
                    </Menu>
                </div>
            </CardContent>
        </Card>
    );
}

export default StreamCard;