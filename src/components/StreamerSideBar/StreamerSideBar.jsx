import React from 'react';
import { makeStyles, useTheme, Drawer, List, ListItem, ListItemIcon, Box, Hidden, IconButton, ListItemText } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import BurguerMenu from '@material-ui/icons/Menu';
import { useTranslation } from 'react-i18next';

import { signOut } from './../../services/auth';
import { ReactComponent as LogoutIcon } from './../../assets/LogoutIcon.svg';
import LanguageSelect from '../LanguageSelect/LanguageSelect';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    drawerPaper: {
        width: drawerWidth,
        backgroundColor: '#141833'
    },
    listItemsText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 500
    }
}));

const DashboardIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill={active ? "#0AFFD2" : 'rgba(255, 255, 255, .25)'} d="M1.4526 9.37983C1.76537 6.87768 3.89237 5 6.41399 5H17.5862C20.1078 5 22.2348 6.87768 22.5476 9.37983L23.322 15.5757C23.6821 18.456 21.4363 21 18.5336 21C16.9301 21 15.5005 20.2154 14.6212 19H9.37894C8.4997 20.2154 7.07009 21 5.46656 21C2.5639 21 0.318082 18.456 0.678112 15.5757L1.4526 9.37983Z" />
        <path fill={active ? "#4040FF" : '#FFF'} d="M8 9C7.44772 9 7 9.44772 7 10V11H6C5.44772 11 5 11.4477 5 12C5 12.5523 5.44772 13 6 13H7V14C7 14.5523 7.44772 15 8 15C8.55229 15 9 14.5523 9 14V13H10C10.5523 13 11 12.5523 11 12C11 11.4477 10.5523 11 10 11H9V10C9 9.44772 8.55229 9 8 9Z" />
        <path fill={active ? "#4040FF" : '#FFF'} d="M18 11C18.5523 11 19 10.5523 19 10C19 9.44771 18.5523 9 18 9C17.4477 9 17 9.44771 17 10C17 10.5523 17.4477 11 18 11Z" />
        <path fill={active ? "#4040FF" : '#FFF'} d="M16 15C16.5523 15 17 14.5523 17 14C17 13.4477 16.5523 13 16 13C15.4477 13 15 13.4477 15 14C15 14.5523 15.4477 15 16 15Z" />
    </svg>
);

const ProfileIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill={active ? "#4040FF" : '#FFF'} d="M4 18.575C4 21.295 7.66237 22 12 22C16.3146 22 20 21.32 20 18.599C20 15.879 16.3386 15.174 12 15.174C7.68538 15.174 4 15.854 4 18.575Z" />
        <path fill={active ? "#0AFFD2" : 'rgba(255, 255, 255, .25)'} d="M12 12.5831C14.9391 12.5831 17.294 10.2281 17.294 7.29105C17.294 4.35402 14.9391 2 12 2C9.06194 2 6.70605 4.35402 6.70605 7.29105C6.70605 10.2281 9.06194 12.5831 12 12.5831Z" />
    </svg>
);

const CogIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill={active ? '#0AFFD2' : 'rgba(255, 255, 255, .25)'} d="M21.2301 14.3701C21.036 14.0701 20.76 13.7701 20.4023 13.5801C20.1162 13.4401 19.9322 13.2101 19.7687 12.9401C19.2475 12.0801 19.5541 10.9501 20.4228 10.4401C21.4447 9.87009 21.7718 8.60009 21.179 7.61009L20.4943 6.43009C19.9118 5.44009 18.6344 5.09009 17.6226 5.67009C16.7233 6.15009 15.5685 5.83009 15.0473 4.98009C14.8838 4.70009 14.7918 4.40009 14.8122 4.10009C14.8429 3.71009 14.7203 3.34009 14.5363 3.04009C14.1582 2.42009 13.4735 2.00009 12.7172 2.00009H11.2763C10.5302 2.02009 9.84553 2.42009 9.4674 3.04009C9.27323 3.34009 9.16081 3.71009 9.18125 4.10009C9.20169 4.40009 9.10972 4.70009 8.9462 4.98009C8.425 5.83009 7.27019 6.15009 6.38109 5.67009C5.35913 5.09009 4.09191 5.44009 3.49917 6.43009L2.81446 7.61009C2.23194 8.60009 2.55897 9.87009 3.57071 10.4401C4.43937 10.9501 4.74596 12.0801 4.23498 12.9401C4.06125 13.2101 3.87729 13.4401 3.59115 13.5801C3.24368 13.7701 2.93709 14.0701 2.77358 14.3701C2.39546 14.9901 2.4159 15.7701 2.79402 16.4201L3.49917 17.6201C3.87729 18.2601 4.58245 18.6601 5.31825 18.6601C5.66572 18.6601 6.0745 18.5601 6.40153 18.3601C6.65702 18.1901 6.96361 18.1301 7.30085 18.1301C8.31259 18.1301 9.16081 18.9601 9.18125 19.9501C9.18125 21.1001 10.1215 22.0001 11.3069 22.0001H12.6968C13.872 22.0001 14.8122 21.1001 14.8122 19.9501C14.8429 18.9601 15.6911 18.1301 16.7029 18.1301C17.0299 18.1301 17.3365 18.1901 17.6022 18.3601C17.9292 18.5601 18.3278 18.6601 18.6855 18.6601C19.411 18.6601 20.1162 18.2601 20.4943 17.6201L21.2097 16.4201C21.5776 15.7501 21.6083 14.9901 21.2301 14.3701Z" />
        <path fill={active ? '#4040FF' : '#FFF'} d="M12.0122 14.8303C10.4077 14.8303 9.10986 13.5803 9.10986 12.0103C9.10986 10.4403 10.4077 9.18027 12.0122 9.18027C13.6167 9.18027 14.8839 10.4403 14.8839 12.0103C14.8839 13.5803 13.6167 14.8303 12.0122 14.8303Z" />
    </svg>
);

const MembershipIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill={active ? '#00FFDD' : 'rgba(255, 255, 255, .25)'} d="M21.25 13.4764C20.429 13.4764 19.761 12.8145 19.761 12.001C19.761 11.1875 20.429 10.5256 21.25 10.5256C21.45 10.5256 21.64 10.4473 21.781 10.3076C21.921 10.1689 22 9.97864 22 9.78245L21.999 7.10514C21.999 4.84201 20.14 3 17.856 3H6.144C3.86 3 2.002 4.84201 2.002 7.10514L2 9.86866C2 10.0648 2.079 10.2541 2.22 10.3938C2.361 10.5335 2.551 10.6118 2.75 10.6118C3.599 10.6118 4.24 11.2083 4.24 12.001C4.24 12.8145 3.572 13.4764 2.75 13.4764C2.336 13.4764 2 13.8093 2 14.2195V16.8958C2 19.159 3.859 21 6.143 21H17.858C20.142 21 22 19.159 22 16.8958V14.2195C22 13.8093 21.664 13.4764 21.25 13.4764Z" />
        <path fill={active ? '#4040FF' : '#FFF'} d="M15.4311 11.5105L14.2521 12.648L14.5311 14.2562C14.5791 14.5336 14.4661 14.8091 14.2351 14.9735C14.0061 15.14 13.7071 15.1608 13.4551 15.0271L12.0001 14.27L10.5421 15.029C10.4341 15.0855 10.3161 15.1142 10.1991 15.1142C10.0461 15.1142 9.89507 15.0667 9.76507 14.9745C9.53507 14.8091 9.42207 14.5336 9.47007 14.2562L9.74807 12.648L8.56907 11.5105C8.36507 11.3143 8.29407 11.025 8.38207 10.7574C8.47107 10.4899 8.70107 10.2996 8.98207 10.26L10.6081 10.0252L11.3371 8.56168C11.4641 8.31 11.7181 8.15344 12.0001 8.15344H12.0021C12.2851 8.15443 12.5391 8.31099 12.6641 8.56267L13.3931 10.0252L15.0221 10.261C15.3001 10.2996 15.5301 10.4899 15.6181 10.7574C15.7071 11.025 15.6361 11.3143 15.4311 11.5105Z" />
    </svg>
);

const StreamerSideBar = ({ user }) => {
    const history = useHistory();
    const classes = useStyles();
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const { t } = useTranslation();

    const closeSession = () => {
        if (window.confirm('Are you sure you want to signout?')) {
            signOut();
            history.push('/signin');
        }
    }

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

	const goToSettings = () => {
        localStorage.setItem('HasVisitedSettings', 'true');
        history.push('/settings');
    }

    const showNewLabelOnSettings = localStorage.getItem('HasVisitedSettings') === null;

    const currentScreen = history.location.pathname.split('/')[1];


    const drawer = (
        <Box display='flex' style={{ flex: 1, flexDirection: 'column', flexWrap: 'wrap' }} >
            {/**
             * ToDo:
             * Add Qapla Image (see Figma for details)
             */}
            <List style={{ marginTop: '1rem' }}>
                <ListItem button onClick={() => history.push('/profile')}>
                    <ListItemIcon style={{ minWidth: 40 }}>
                        <DashboardIcon active={currentScreen === 'profile' || currentScreen === 'create' || currentScreen === 'edit' || currentScreen === 'stream'} />
                    </ListItemIcon>
                    <ListItemText style={{ opacity: currentScreen === 'profile' || currentScreen === 'create' || currentScreen === 'edit' || currentScreen === 'stream' ? 1 : 0.6 }} classes={{ primary: classes.listItemsText }}>
                        {t('SideBar.dashboard')}
                    </ListItemText>
                </ListItem>
                <ListItem button onClick={() => history.push('/editProfile')}>
                    <ListItemIcon style={{ minWidth: 40 }}>
                        <ProfileIcon active={currentScreen === 'editProfile'} />
                    </ListItemIcon>
                    <ListItemText style={{ opacity: currentScreen === 'editProfile' ? 1 : 0.6 }} classes={{ primary: classes.listItemsText }}>
                        {t('SideBar.universalProfile')}
                    </ListItemText>
                </ListItem>
                {user.premium && !user.freeTrial && user.stripeCustomerId ?
                    <form action='https://us-central1-qapplaapp.cloudfunctions.net/stripeCustomerPortal' method='post'>
                        <input type='hidden' name='stripeCustomerId' value={user.stripeCustomerId || ''} />
                        <ListItem button type='submit' component='button'>
                            <ListItemIcon style={{ minWidth: 40 }}>
                                <MembershipIcon active={currentScreen === 'membership' || currentScreen === 'subscriptions'} />
                            </ListItemIcon>
                            <ListItemText style={{ opacity: currentScreen === 'membership' || currentScreen === 'subscriptions' ? 1 : 0.6 }} classes={{ primary: classes.listItemsText }}>
                                {t('SideBar.membership')}
                            </ListItemText>
                        </ListItem>
                    </form>
                    :
                    <ListItem button onClick={() => history.push('/membership')}>
                        <ListItemIcon style={{ minWidth: 40 }}>
                            <MembershipIcon active={currentScreen === 'membership' || currentScreen === 'subscriptions'} />
                        </ListItemIcon>
                        <ListItemText style={{ opacity: currentScreen === 'membership' || currentScreen === 'subscriptions' ? 1 : 0.6 }} classes={{ primary: classes.listItemsText }}>
                            {t('SideBar.membership')}
                        </ListItemText>
                    </ListItem>
                }
                <ListItem button onClick={goToSettings}>
                    <ListItemIcon style={{ minWidth: 40 }}>
                        <CogIcon active={currentScreen === 'settings'} />
                    </ListItemIcon>
                    <ListItemText style={{ opacity: currentScreen === 'settings' ? 1 : 0.6 }} classes={{ primary: classes.listItemsText }}>
                        {t('SideBar.settings')}
                    </ListItemText>
                    {showNewLabelOnSettings &&
                        <div style={{ float: 'right', borderRadius: 100, background: 'linear-gradient(90deg, #FFC01F 0%, #EB00FF 100%)' }}>
                            <p style={{ color: '#FFF', fontSize: 10, marginRight: 24, marginLeft: 24, marginTop: 8, marginBottom: 8 }}>
                                {t('SideBar.new')}
                            </p>
                        </div>
                    }
                </ListItem>
            </List>
            <div style={{ flexGrow: 1 }} />
            <List>
                <Hidden smUp>
                    <ListItem style={{ marginTop: '.5rem' }}>
                        <LanguageSelect />
                    </ListItem>
                </Hidden>
                <ListItem button style={{ marginTop: '.5rem' }} onClick={closeSession}>
                    <ListItemIcon style={{ minWidth: 40 }}>
                        <LogoutIcon height={32} width={32} />
                    </ListItemIcon>
                    <ListItemText style={{ opacity: 0.6 }} classes={{ primary: classes.listItemsText }}>
                        {t('SideBar.signOut')}
                    </ListItemText>
                </ListItem>
            </List>
        </Box>
    );

    const container = window !== undefined ? () => window.document.body : undefined;

    return (
        <Box display='flex'>
            <nav className={classes.drawer}>
                <Hidden xsDown>
                    <Drawer container={container}
                        variant='permanent'
                        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                        open
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        ModalProps={{
                            keepMounted: true,
                        }}>
                        {drawer}
                    </Drawer>
                </Hidden>
                {history.location.pathname === '/create' ?
                <></>
                :
                <Hidden smUp>
                    <IconButton
                        onClick={handleDrawerToggle}
                        style={{ position: 'absolute', top: 24, left: 24 }}>
                        <BurguerMenu style={{ color: '#FFF', fontSize: 35, }} />
                    </IconButton>
                    <Drawer
                        className={classes.drawer}
                        classes={{
                            paper: classes.drawerPaper
                        }}
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        variant='temporary'
                        anchor={theme.direction === 'rtl' ? 'right' : 'left'}>
                        {drawer}
                    </Drawer>
                </Hidden>
                }
            </nav>
        </Box>
    );
}

export default StreamerSideBar;