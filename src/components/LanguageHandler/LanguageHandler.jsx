import React from 'react';
import { makeStyles, Hidden } from '@material-ui/core';

import LanguageSelect from '../LanguageSelect/LanguageSelect';

const useStyles = makeStyles(() => ({
    container: {
        position: 'fixed',
        bottom: 16,
        right: 24,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    }
}));

const LanguageHandler = () => {
    const classes = useStyles();

    return (
        <Hidden xsDown>
            <div className={classes.container}>
                <LanguageSelect />
            </div>
        </Hidden>
    );
}

export default LanguageHandler;