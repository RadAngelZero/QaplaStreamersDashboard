import React from 'react';
import { withStyles, Tab } from '@material-ui/core';

const QaplaTab = withStyles((theme) => ({
    root: {
        textTransform: 'none',
        minWidth: 72,
        fontWeight: theme.typography.fontWeightRegular,
        marginRight: theme.spacing(4),
        fontSize: 18,
        '&:hover': {
            color: '#FFF',
            opacity: 1,
        },
        '&$selected': {
            color: '#FFF',
            fontWeight: '500',
        },
        '&:focus': {
            color: '#FFF',
        },
    },
    selected: {},
}))((props) => <Tab {...props} TabIndicatorProps={{ children: <span /> }} />);

export default (props) => <QaplaTab {...props} />;