import React from 'react';
import { withStyles, Tabs } from '@material-ui/core';

const QaplaTabs = withStyles({
    root: {
        borderBottom: 'transparent',
    },
    indicator: {
        backgroundColor: '#0AFFD2',
    },
})(Tabs);

export default (props) => <QaplaTabs {...props} />;