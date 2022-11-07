import React, { useState } from 'react';
import { makeStyles, useTheme, Drawer, List, ListItem, ListItemIcon, Box, Hidden, IconButton, ListItemText, CircularProgress } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import BurguerMenu from '@material-ui/icons/Menu';
import { useTranslation } from 'react-i18next';

import { signOut } from './../../services/auth';
import { ReactComponent as LogoutIcon } from './../../assets/LogoutIcon.svg';
import { ReactComponent as QaplaLongLogo } from './../../assets/QaplaLongLogo.svg';
import LanguageSelect from '../LanguageSelect/LanguageSelect';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    drawer: {
        [theme.breakpoints.up('lg')]: {
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
        fontWeight: 500,
        fontFamily: 'Inter'
    },
    listItem: {
        height: '30px',
        margin: '20px 0px',
        padding: '0px'
    },
    circularProgress: {
        color: '#0AFFD2',
        alignSelf: 'center'
    }
}));

const DashboardIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.92 2H4.54C3.14 2 2 3.15 2 4.561V7.97C2 9.39 3.14 10.53 4.54 10.53H7.92C9.33 10.53 10.46 9.39 10.46 7.97V4.561C10.46 3.15 9.33 2 7.92 2ZM7.92 13.4697H4.54C3.14 13.4697 2 14.6107 2 16.0307V19.4397C2 20.8497 3.14 21.9997 4.54 21.9997H7.92C9.33 21.9997 10.46 20.8497 10.46 19.4397V16.0307C10.46 14.6107 9.33 13.4697 7.92 13.4697ZM16.0801 13.4697H19.4601C20.8601 13.4697 22.0001 14.6107 22.0001 16.0307V19.4397C22.0001 20.8497 20.8601 21.9997 19.4601 21.9997H16.0801C14.6701 21.9997 13.5401 20.8497 13.5401 19.4397V16.0307C13.5401 14.6107 14.6701 13.4697 16.0801 13.4697Z" fill={active ? "#00FFDD" : 'rgba(255, 255, 255, .25)'} />
        <path d="M19.46 2H16.08C14.67 2 13.54 3.15 13.54 4.561V7.97C13.54 9.39 14.67 10.53 16.08 10.53H19.46C20.86 10.53 22 9.39 22 7.97V4.561C22 3.15 20.86 2 19.46 2Z" fill={active ? "#3B4BF9" : '#FFF'} />
    </svg>
);

const ProfileIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill={active ? "#4040FF" : 'rgba(255, 255, 255, .25)'} d="M4 18.575C4 21.295 7.66237 22 12 22C16.3146 22 20 21.32 20 18.599C20 15.879 16.3386 15.174 12 15.174C7.68538 15.174 4 15.854 4 18.575Z" />
        <path fill={active ? "#0AFFD2" : '#FFF'} d="M12 12.5831C14.9391 12.5831 17.294 10.2281 17.294 7.29105C17.294 4.35402 14.9391 2 12 2C9.06194 2 6.70605 4.35402 6.70605 7.29105C6.70605 10.2281 9.06194 12.5831 12 12.5831Z" />
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
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loadingStripeCustomerPortal, setLoadingStripeCustomerPortal] = useState(false);
    const { t } = useTranslation();

    const closeSession = async () => {
        if (window.confirm('Are you sure you want to signout?')) {
            await signOut();
            history.push('/signin');
        }
    }

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const goToSettings = () => {
        history.push('/settings');
    }

    const goToUniversalProfile = () => {
        if (localStorage.getItem('HasVisitedSettings')) {
            localStorage.removeItem('HasVisitedSettings');
        }

        localStorage.setItem('HasVisitedUniversalProfile', 'true');
        history.push('/editProfile');
    }

    const showNewLabelOnUniversalProfile = localStorage.getItem('HasVisitedUniversalProfile') === null;
    const currentScreen = history.location.pathname.split('/')[1];

    const drawer = (
        <Box display='flex' style={{ flex: 1, flexDirection: 'column', flexWrap: 'wrap', marginLeft: '21px' }} >
            <div style={{
                marginTop: '40px',
            }}>
                <QaplaLongLogo />

            </div>
            {/*
                TODO: Create a component for ListItem
             */}
            <List style={{ marginTop: '50px', padding: '0px' }}>
                <ListItem button onClick={() => history.push('/profile')} className={classes.listItem}>
                    <ListItemIcon style={{ minWidth: 40 }}>
                        <DashboardIcon active={currentScreen === 'profile' || currentScreen === 'create' || currentScreen === 'edit' || currentScreen === 'stream'} />
                    </ListItemIcon>
                    <ListItemText style={{ opacity: currentScreen === 'profile' || currentScreen === 'create' || currentScreen === 'edit' || currentScreen === 'stream' ? 1 : 0.6 }} classes={{ primary: classes.listItemsText }}>
                        {t('SideBar.dashboard')}
                    </ListItemText>
                </ListItem>
                <ListItem button onClick={goToUniversalProfile} className={classes.listItem}>
                    <ListItemIcon style={{ minWidth: 40 }}>
                        <ProfileIcon active={currentScreen === 'editProfile'} />
                    </ListItemIcon>
                    <ListItemText style={{ opacity: currentScreen === 'editProfile' ? 1 : 0.6 }} classes={{ primary: classes.listItemsText }}>
                        {t('SideBar.universalProfile')}
                    </ListItemText>
                    {showNewLabelOnUniversalProfile &&
                        <div style={{ float: 'right', borderRadius: 100, background: 'linear-gradient(90deg, #FFC01F 0%, #EB00FF 100%)', marginRight: '14px' }}>
                            <p style={{ color: '#FFF', fontSize: 10, padding: '5px 8px 6px 8px' }}>
                                {t('SideBar.new')}
                            </p>
                        </div>
                    }
                </ListItem>
                <ListItem button onClick={goToSettings} className={classes.listItem}>
                    <ListItemIcon style={{ minWidth: 40 }}>
                        <CogIcon active={currentScreen === 'settings'} />
                    </ListItemIcon>
                    <ListItemText style={{ opacity: currentScreen === 'settings' ? 1 : 0.6 }} classes={{ primary: classes.listItemsText }}>
                        {t('SideBar.settings')}
                    </ListItemText>
                </ListItem>
                {user && user.stripeCustomerId && user.premium ?
                    <form action='https://us-central1-qapplaapp.cloudfunctions.net/stripeCustomerPortal' method='post' onSubmit={() => setLoadingStripeCustomerPortal(true)}>
                        <input type='hidden' name='stripeCustomerId' value={user.stripeCustomerId || ''} />
                        <ListItem button type='submit' component='button' className={classes.listItem}>
                            <ListItemIcon style={{ minWidth: 40 }}>
                                <MembershipIcon active={currentScreen === 'membership'} />
                            </ListItemIcon>
                            <ListItemText style={{ opacity: currentScreen === 'membership' ? 1 : 0.6 }} classes={{ primary: classes.listItemsText }}>
                                {!loadingStripeCustomerPortal ?
                                    t('SideBar.billing')
                                    :
                                    <CircularProgress className={classes.circularProgress} size={25} />
                                }
                            </ListItemText>
                        </ListItem>
                    </form>
                    :
                    <ListItem button onClick={() => history.push('/membership')} className={classes.listItem}>
                        <ListItemIcon style={{ minWidth: 40 }}>
                            <MembershipIcon active={currentScreen === 'membership'} />
                        </ListItemIcon>
                        <ListItemText style={{ opacity: currentScreen === 'membership' ? 1 : 0.6 }} classes={{ primary: classes.listItemsText }}>
                            {t('SideBar.membership')}
                        </ListItemText>
                    </ListItem>
                }
            </List>
            <div style={{ flexGrow: 1 }} />
            <List style={{
                marginBottom: '95px',
                padding: '0px'
            }}>
                <ListItem className={classes.listItem}>
                    <LanguageSelect uid={user?.uid ?? null} />
                </ListItem>
                <ListItem button className={classes.listItem} onClick={closeSession}>
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
                <Hidden mdDown>
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
                {(history.location.pathname === '/create' || history.location.pathname.includes('/edit')) ?
                    <></>
                    :
                    <Hidden lgUp>
                        <IconButton
                            onClick={handleDrawerToggle}
                            style={{ position: 'absolute', top: 37, left: 24 }}>
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