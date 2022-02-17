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
        backgroundColor: '#141833',
        height: '40px',
        width: '40px',
        marginRight: '16px',
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
                <LeftArrowIcon style={{height: '18px', width: '11px', marginLeft: '-2px'}} />
            </IconButton>
            <p className={classes.label}>
                {label}
            </p>
        </div>
    );
}

export default BackButton;