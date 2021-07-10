import React, { useState } from 'react';
import { withStyles, Menu, MenuItem, Drawer, List, ListItem, ListItemIcon, Box, Hidden, IconButton } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import BurguerMenu from '@material-ui/icons/Menu';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';

import { signOut } from './../../services/auth';
import { ReactComponent as EventsIcon } from './../../assets/EventIcon.svg';
import { ReactComponent as CommunityIcon } from './../../assets/CommunityIcon.svg';
import { ReactComponent as AnalyticsIcon } from './../../assets/AnalyticsIcon.svg';
import { ReactComponent as CogIcon } from './../../assets/CogIcon.svg';
import { ReactComponent as QaplaLogo } from './../../assets/QaplaLogo.svg';
import { getAvailableLanguages, changeLanguage } from '../../utilities/i18n';

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
	const theme = useTheme();
	const [anchorEl, setAnchorEl] = useState(null);
	const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
	const [mobileOpen, setMobileOpen] = React.useState(false);
	const { t } = useTranslation();

	const closeSession = () => {
		signOut();
		history.push('/signin');
	}


	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const selectNewLanguage = (language) => {
		changeLanguage(language);
		setLanguageAnchorEl(null);
	}

	const drawer = (
		<Box display={'flex'} style={{ flex: 1, flexDirection: 'column', flexWrap: 'wrap' }}>
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
				<ListItem style={{ marginTop: '.5rem' }} onClick={(e) => setLanguageAnchorEl(e.currentTarget)}>
					<ListItemIcon><CogIcon height={32} width={32} /></ListItemIcon>
				</ListItem>
				<StyledMenu
					anchorEl={languageAnchorEl}
					open={Boolean(languageAnchorEl)}
					keepMounted
					onClose={() => setLanguageAnchorEl(null)}>
					{getAvailableLanguages().map((languageKey) => (
						<StyledMenuItem onClick={() => selectNewLanguage(languageKey)}>
							{t(`sideBar.languages.${languageKey}`)}
						</StyledMenuItem>
					))}
				</StyledMenu>
				<ListItem style={{ marginTop: '.5rem' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
					<ListItemIcon><CogIcon height={32} width={32} /></ListItemIcon>
				</ListItem>
				<StyledMenu
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					keepMounted
					onClose={() => setAnchorEl(null)}>
					<StyledMenuItem onClick={closeSession}>Sign Out</StyledMenuItem>
					<StyledMenuItem onClick={() => window.open('https://discord.gg/zWNhd3QG', '_blank')}>Help</StyledMenuItem>
				</StyledMenu>
				<ListItem style={{ marginTop: '.5rem' }}>
					<ListItemIcon><QaplaLogo height={32} width={32} /></ListItemIcon>
				</ListItem>
			</List>
		</Box>
	);

	return (
		<Box display={'flex'}>
			<Hidden smDown >
				<Drawer
				className={[classes.drawer, classes.drawerClose]}
				classes={{ paper: classes.drawerClose }}
				variant='permanent'
				anchor='left'>
				{drawer}
				</Drawer>
			</Hidden>
			<Box position='absolute'>
				{history.location.pathname === '/create' ?
				<></>
				:
				<Hidden mdUp>
					<IconButton
					onClick={handleDrawerToggle}
					style={{ marginTop: '40%', marginLeft: '30%' }}>
						<BurguerMenu style={{ color: '#FFF', fontSize: 35, }} />
					</IconButton>
					<Drawer
					variant='temporary'
					anchor={theme.direction === 'rtl' ? 'right' : 'left'}
					open={mobileOpen}
					onClose={handleDrawerToggle}
					classes={{
						paper: classes.drawerClose,
					}}
					ModalProps={{
						keepMounted: true,
					}}
					>
					{drawer}
					</Drawer>
				</Hidden>
				}
			</Box>
		</Box>
  	);
}

export default StreamerSideBar;