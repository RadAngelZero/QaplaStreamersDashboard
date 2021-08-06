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
    }
}));

const DashboardIcon = ({ active }) => (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill={active ? "#0AFFD2" : 'rgba(255, 255, 255, .25)'} d="M1.81575 11.7248C2.20671 8.5971 4.86546 6.25 8.01749 6.25H21.9827C25.1347 6.25 27.7935 8.5971 28.1845 11.7248L29.1525 19.4696C29.6026 23.07 26.7954 26.25 23.167 26.25C21.1626 26.25 19.3756 25.2693 18.2765 23.75H11.7237C10.6246 25.2693 8.83761 26.25 6.8332 26.25C3.20488 26.25 0.397603 23.07 0.847641 19.4696L1.81575 11.7248Z" />
        <path fill={active ? "#4040FF" : '#FFF'} d="M10 11.25C9.30965 11.25 8.75 11.8097 8.75 12.5V13.75H7.5C6.80965 13.75 6.25 14.3096 6.25 15C6.25 15.6904 6.80965 16.25 7.5 16.25H8.75V17.5C8.75 18.1904 9.30965 18.75 10 18.75C10.6904 18.75 11.25 18.1904 11.25 17.5V16.25H12.5C13.1904 16.25 13.75 15.6904 13.75 15C13.75 14.3096 13.1904 13.75 12.5 13.75H11.25V12.5C11.25 11.8097 10.6904 11.25 10 11.25Z" />
        <path fill={active ? "#4040FF" : '#FFF'} d="M22.5 13.75C23.1904 13.75 23.75 13.1904 23.75 12.5C23.75 11.8096 23.1904 11.25 22.5 11.25C21.8096 11.25 21.25 11.8096 21.25 12.5C21.25 13.1904 21.8096 13.75 22.5 13.75Z" />
        <path fill={active ? "#4040FF" : '#FFF'} d="M20 18.75C20.6904 18.75 21.25 18.1904 21.25 17.5C21.25 16.8096 20.6904 16.25 20 16.25C19.3096 16.25 18.75 16.8096 18.75 17.5C18.75 18.1904 19.3096 18.75 20 18.75Z" />
    </svg>
);

const CogIcon = ({ active }) => (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill={active ? '#0AFFD2' : 'rgba(255, 255, 255, .25)'} d="M26.5377 17.9625C26.2949 17.5875 25.95 17.2125 25.5029 16.975C25.1452 16.8 24.9153 16.5125 24.7109 16.175C24.0594 15.1 24.4427 13.6875 25.5285 13.05C26.8059 12.3375 27.2147 10.75 26.4738 9.5125L25.6179 8.0375C24.8898 6.8 23.2929 6.3625 22.0283 7.0875C20.9041 7.6875 19.4606 7.2875 18.8091 6.225C18.6047 5.875 18.4897 5.5 18.5153 5.125C18.5536 4.6375 18.4003 4.175 18.1704 3.8C17.6977 3.025 16.8418 2.5 15.8965 2.5H14.0953C13.1628 2.525 12.3069 3.025 11.8343 3.8C11.5915 4.175 11.451 4.6375 11.4766 5.125C11.5021 5.5 11.3871 5.875 11.1828 6.225C10.5313 7.2875 9.08774 7.6875 7.97636 7.0875C6.69892 6.3625 5.11488 6.8 4.37396 8.0375L3.51807 9.5125C2.78993 10.75 3.19871 12.3375 4.46338 13.05C5.54921 13.6875 5.93245 15.1 5.29372 16.175C5.07656 16.5125 4.84662 16.8 4.48893 16.975C4.0546 17.2125 3.67137 17.5875 3.46698 17.9625C2.99432 18.7375 3.01987 19.7125 3.49252 20.525L4.37396 22.025C4.84662 22.825 5.72806 23.325 6.64782 23.325C7.08215 23.325 7.59313 23.2 8.00191 22.95C8.32127 22.7375 8.70451 22.6625 9.12606 22.6625C10.3907 22.6625 11.451 23.7 11.4766 24.9375C11.4766 26.375 12.6518 27.5 14.1337 27.5H15.871C17.34 27.5 18.5153 26.375 18.5153 24.9375C18.5536 23.7 19.6139 22.6625 20.8786 22.6625C21.2874 22.6625 21.6706 22.7375 22.0027 22.95C22.4115 23.2 22.9097 23.325 23.3568 23.325C24.2638 23.325 25.1452 22.825 25.6179 22.025L26.5121 20.525C26.972 19.6875 27.0103 18.7375 26.5377 17.9625Z" />
        <path fill={active ? '#4040FF' : '#FFF'} d="M15.0152 18.5378C13.0096 18.5378 11.3872 16.9753 11.3872 15.0128C11.3872 13.0503 13.0096 11.4753 15.0152 11.4753C17.0207 11.4753 18.6048 13.0503 18.6048 15.0128C18.6048 16.9753 17.0207 18.5378 15.0152 18.5378Z" />
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
            <List style={{ marginTop: '1rem' }}>
                <ListItem button onClick={() => history.push('/profile')}>
                    <ListItemIcon style={{ minWidth: 40 }}>
                        <DashboardIcon active={currentScreen === 'profile' || currentScreen === 'create' || currentScreen === 'edit' || currentScreen === 'stream'} />
                    </ListItemIcon>
                    <ListItemText style={{ color: '#FFF' }}>
                        {t('SideBar.dashboard')}
                    </ListItemText>
                </ListItem>
                <ListItem button style={{ marginTop: '.5rem' }} onClick={goToSettings}>
                    <ListItemIcon style={{ minWidth: 40 }}>
                        <CogIcon active={currentScreen === 'settings'} />
                    </ListItemIcon>
                    <ListItemText style={{ color: '#FFF' }}>
                        {t('SideBar.settings')}
                    </ListItemText>
                    {showNewLabelOnSettings &&
                        <div style={{ float: 'right', borderRadius: 100, background: 'linear-gradient(90deg, #FFC01F 0%, #EB00FF 100%)' }}>
                            <p style={{ color: '#FFF', fontSize: 10, marginRight: 24, marginLeft: 24 }}>
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
                    <ListItemText style={{ color: '#FFF' }}>
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