import React from 'react';
import {
    makeStyles,
    IconButton
} from '@material-ui/core';

import { ReactComponent as LeftArrowIcon } from './../../assets/LeftArrowIcon.svg';

const useStyles = makeStyles(() => ({
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    backButton: {
        backgroundColor: '#242731',
        height: 48,
        width: 48,
        marginRight: 16,
        "&:hover": {
            backgroundColor: '#242731'
        }
    },
    label: {
        fontSize: 24,
        color: '#FFF'
    }
}));

const BackButton = ({ onClick, label }) => {
    const classes = useStyles();

    return (
        <div className={classes.container}>
            <IconButton className={classes.backButton}
                onClick={onClick}>
                <LeftArrowIcon />
            </IconButton>
            <p className={classes.label}>
                {label}
            </p>
        </div>
    );
}

export default BackButton;