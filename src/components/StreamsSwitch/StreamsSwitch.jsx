import React, { Component } from 'react';
import { makeStyles } from '@material-ui/core';
import styles from './StreamsSwitch.module.css';

import { ReactComponent as Clock } from './../../assets/Clock.svg';
import { ReactComponent as Calendar } from './../../assets/Calendar.svg';

const useStyles = makeStyles((theme) => ({
    mainContainer: {
        display: 'flex',
        width: '84px',
        height: '40px',
        backgroundColor: '#141735',
        borderRadius: '100px',
        flexDirection: 'row',
        '&:hover': {
            cursor: 'pointer'
        }
    },
    iconContainer: {
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
}));

const StreamsSwitch = ({ switchPosition, onClick }) => {
    const classes = useStyles();

    return (
        <div className={classes.mainContainer} onClick={onClick}>
            <div className={classes.iconContainer} style={{paddingLeft: '6px'}}>
                <Clock style={{
                    opacity: switchPosition ? 1 : 0.4,
                }}
                    className={switchPosition ? styles.iconSelected : styles.icon} />
            </div>
            <div className={classes.iconContainer} style={{paddingRight: '6px'}}>
                <Calendar style={{
                    opacity: switchPosition ? 0.4 : 1,
                }}
                    className={switchPosition ? styles.icon : styles.iconSelected} />
            </div>
        </div>
    )
}

export default StreamsSwitch;