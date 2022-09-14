import React from 'react';
import {
    Grid,
    AppBar,
    Toolbar,
    Link,
    Button
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import styles from './StreamerDashboardContainer.module.css';
import StreamerSideBar from '../StreamerSideBar/StreamerSideBar';
import LanguageHandler from '../LanguageHandler/LanguageHandler';

const useStyles = makeStyles((theme) => ({
    gridContainer: {
        width: '100%',
        display: 'flex',
        boxSizing: 'border-box',
        flexWrap: 'nowrap'
    },
    content: {
        flexGrow: 1,
        paddingLeft: theme.spacing(4) + 1,
        paddingTop: theme.spacing(4) + 1,
    }
}));

const StreamerDashboardContainer = ({ children, user, containerStyle = {} }) => {
    const history = useHistory();
    const classes = useStyles();

    return (
        <Grid container className={[classes.gridContainer, styles.container]} alignItems={user ? 'flex-start' : 'center'} justify={user ? 'flex-start' : 'center'}>
            {user && user === undefined ?
                <>
                    {children}
                </>
                :
                <>
                    {history.location.pathname !== '/welcome' &&
                        <StreamerSideBar user={user} />
                    }
                    <div className={`${classes.content} ${containerStyle}`}>
                        {children}
                    </div>
                </>
            }
        </Grid>
    );
}

export default StreamerDashboardContainer;
