import React, { useState } from 'react';
import { withStyles, Menu, MenuItem, Drawer, List, ListItem, ListItemIcon } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import { signOut } from './../../services/auth';
import { ReactComponent as EventsIcon } from './../../assets/EventIcon.svg';
import { ReactComponent as CommunityIcon } from './../../assets/CommunityIcon.svg';
import { ReactComponent as AnalyticsIcon } from './../../assets/AnalyticsIcon.svg';
import { ReactComponent as CogIcon } from './../../assets/CogIcon.svg';
import { ReactComponent as QaplaLogo } from './../../assets/QaplaLogo.svg';

const useStyles = makeStyles((theme) => ({
  drawer: {
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },
  drawerClose: {
    background: '#2906A4',
    overflowX: 'hidden',
    width: theme.spacing(7.75) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(7.75) + 1,
    }
  }
}));

const StyledMenu = withStyles({
    paper: {
        backgroundColor: '#141833',
    },
})((props) => (
    <Menu {...props} />
));

const StyledMenuItem = withStyles((theme) => ({
    root: {
      color: '#FFF'
    },
  }))(MenuItem);

const StreamerSideBar = ({ user }) => {
    const history = useHistory();
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);

    const closeSession = () => {
        signOut();
        history.push('/signin');
    }

    return (
        <Drawer
            className={[classes.drawer, classes.drawerClose]}
            classes={{ paper: classes.drawerClose }}
            variant='permanent'
            anchor='left'>
            <List style={{ marginTop: '1rem' }}>
                <ListItem>
                    <ListItemIcon><EventsIcon height={32} width={32} /></ListItemIcon>
                </ListItem>
                <ListItem style={{ marginTop: '.5rem' }} disabled>
                    <ListItemIcon><CommunityIcon height={32} width={32} /></ListItemIcon>
                </ListItem>
                <ListItem style={{ marginTop: '.5rem' }} disabled>
                    <ListItemIcon><AnalyticsIcon height={32} width={32} /></ListItemIcon>
                </ListItem>
            </List>
            <div style={{ flexGrow: 1 }} />
            <List>
                <ListItem style={{ marginTop: '.5rem' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <ListItemIcon><CogIcon height={32} width={32} /></ListItemIcon>
                </ListItem>
                <StyledMenu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    keepMounted
                    onClose={() => setAnchorEl(null)}>
                    <StyledMenuItem onClick={closeSession}>Close Session</StyledMenuItem>
                    <StyledMenuItem onClick={() => window.open('https://discord.gg/zWNhd3QG', '_blank')}>Help</StyledMenuItem>
                </StyledMenu>
                <ListItem style={{ marginTop: '.5rem' }}>
                    <ListItemIcon><QaplaLogo height={32} width={32} /></ListItemIcon>
                </ListItem>
            </List>
        </Drawer>
    );
}

export default StreamerSideBar;