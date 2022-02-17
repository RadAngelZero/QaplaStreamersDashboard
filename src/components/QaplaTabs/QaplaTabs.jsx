import React from 'react';
import { withStyles, Tabs } from '@material-ui/core';

const QaplaTabs = withStyles((theme) => ({
    root: {
        borderBottom: 'transparent',
        [theme.breakpoints.down('md')]: {
            paddingLeft: 45
        }
    },
    indicator: {
        backgroundColor: '#0AFFD2',
    }
}))(Tabs);

export default (props) => <QaplaTabs {...props} />;