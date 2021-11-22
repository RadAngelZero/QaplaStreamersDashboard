import React, { useEffect, useState } from 'react';
import { withStyles, makeStyles, Grid, AccordionSummary, Avatar, Button, Chip, Switch, AppBar, Tabs, Tab } from '@material-ui/core';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import styles from './StreamerProfileEditor.module.css';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { ReactComponent as FounderBadge } from './../../assets/FounderBadge.svg'
import { ReactComponent as TwitchIcon } from './../../assets/twitchIcon.svg';
import { ReactComponent as ArrowIcon } from './../../assets/Arrow.svg';
import { ReactComponent as AddIcon } from './../../assets/AddIcon.svg';
import StreamerSelect from '../StreamerSelect/StreamerSelect';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { loadStreamsByStatus } from '../../services/database';
import StreamCard from '../StreamCard/StreamCard';

import { ReactComponent as BitsIcon } from './../../assets/BitsIcon.svg';
import { ReactComponent as QoinsIcon } from './../../assets/QoinsIcon.svg';
import { ReactComponent as InfoSquare } from './../../assets/InfoSquare.svg';
import { ReactComponent as Arrow } from './../../assets/Arrow.svg';
import CheersBitsRecordDialog from '../CheersBitsRecordDialog/CheersBitsRecordDialog';

const useStyles = makeStyles((theme) => ({
    gridContainer: {
        width: '100%',
        display: 'flex',
        boxSizing: 'border-box',
        flexWrap: 'nowrap'
    },
}));

const EditBioButton = withStyles(() => ({
    root: {
        backgroundColor: '#272D5780',
        color: '#FFFFFF99',
        '&:hover': {
            backgroundColor: '#24456680'
        }
    },

}))(Button);

const QaplaChip = withStyles(() => ({
    root: {
        backgroundColor: '#272D5780',
        color: '#FFFFFFA6',
        padding: '0 0.4rem',
        '&:focus' : {
            backgroundColor: '#4040FF4F',
        }
    },
    deletable: {
        backgroundColor: '#4040FF4F',
        color: '#FFFFFFA6',
        padding: '0 0.4rem',
        '&:focus' : {
            backgroundColor: '#4040FF4F',
        }
    },
    deleteIcon: {
        color: '#FFFD',
        '&:hover': {
            color: '#F00D'
        },
        '&:active': {
            color: '#A00D'
        }
    }
}))(Chip)

const QaplaSwitch = withStyles(() => ({
    root: {

    },
    track: {
        backgroundColor: '#202750'
    },
    checked: {
        color: '#2CE9D2 !important',
        '& + .MuiSwitch-track': {
            backgroundColor: '#202750 !important'
        }
    },
    thumb: {

    }
}))(Switch);

const QaplaTabs = withStyles({
    root: {
        minHeight: 0
    },
    indicator: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        '& > span': {
            // maxWidth: 50,
            width: '100%',
            backgroundColor: '#0AFFD2',
        },
    },
})((props) => <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />);

const QaplaTab = withStyles((theme) => ({
    root: {
        padding: '0 0.6rem',
        minWidth: 0,
        minHeight: 0,
        textTransform: 'none',
        color: '#fff',
        fontWeight: theme.typography.fontWeightRegular,
        fontSize: theme.typography.pxToRem(15),
        marginRight: theme.spacing(1),
        '&:focus': {
            opacity: 1,
        },
    },
}))((props) => <Tab disableRipple {...props} />);


function TabPanel(props) {
    const { children, value, index, className, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-editor-tabpanel-${index}`}
            aria-labelledby={`profile-editor-tab-${index}`}
            {...other}
            className={className}
        >
            {value === index && (
                <>
                    {children}
                </>
            )}
        </div>
    )
}

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const StreamerProfileEditor = ({ user }) => {
    const history = useHistory();
    const classes = useStyles();
    const [selectedTab, setSelectedTab] = useState(0);
    const [socialLinks, setSocialLinks] = useState([
        {
            key: 0,
            socialPage: 'Twitch',
            input: 'https://www.twitch.tv/QaplaGaming'
        },
        {
            key: 1,
            socialPage: 'Twitter',
            input: ''
        },
        {
            key: 2,
            socialPage: 'Instagram',
            input: ''
        },
        {
            key: 3,
            socialPage: 'Discord',
            input: ''
        },
        {
            key: 4,
            socialPage: 'Youtube',
            input: ''
        },
    ])

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue)
    }

    const [tagsData, setTagsData] = useState([
        { key: 0, label: 'Just Chatting' },
        { key: 1, label: 'Anime' },
        { key: 2, label: 'Hochos' },
        { key: 3, label: 'Brawl Stars' },
        { key: 4, label: 'Among Us' },
        { key: 5, label: 'Pokemon' },
    ])

    const handleTagDelete = (tagToDelete) => () => {
        setTagsData((tags) => tags.filter((tag) => tag.key !== tagToDelete.key))
    }

    return (
        <StreamerDashboardContainer user={user} containerStyle={styles.profileEditorContainer}>
            <div className={styles.coverContainer}>
                <img src='https://wallpaperaccess.com/full/2124973.png' alt={"Cover"} className={styles.cover} />
            </div>
            <div className={styles.profileContainer}>
                <div className={styles.profilePicContainer}>
                    <img src='https://play-lh.googleusercontent.com/8ddL1kuoNUB5vUvgDVjYY3_6HwQcrg1K2fd_R8soD-e2QYj8fT9cfhfh3G0hnSruLKec' alt={"Amogus"} className={styles.profilePic} />
                </div>
                <div className={styles.streamerNameAndEditBioButtonContainer}>
                    <div className={styles.streamerNameContainer}>
                        <p className={styles.streamerName}>Catskull</p>
                        <div className={styles.founderBadgeContainer}>
                            <FounderBadge className={styles.founderBadge} />
                        </div>
                    </div>
                    <div className={styles.editBioButtonContainer}>
                        <EditBioButton variant="contained">
                            Editar Bio
                        </EditBioButton>
                    </div>
                </div>
                <div className={styles.twitchURLContainer}>
                    <a href="https://www.twitch.tv" target='_blank' rel='noreferrer' className={styles.twitchURL} >https://www.twitch.tv</a>
                </div>
                <div className={styles.bioContainer}>
                    <p className={styles.bioText}>
                        Soy un streamer mediocre, y esta es una bio de mis gustos mediocres.
                    </p>
                </div>
                <ul className={styles.tagsList}>
                    {tagsData.map((data) => {
                        return (
                            <li key={data.key} className={styles.tag}>
                                <QaplaChip
                                    label={data.label}
                                    onDelete={handleTagDelete(data)}
                                />
                            </li>
                        )
                    })}
                    <li key={'new'} className={styles.tag}>
                        <QaplaChip
                            label={'Agregar tag'}
                        />
                    </li>
                </ul>
                <div className={styles.showNextStreamsContainer}>
                    <p className={styles.showNextStreamsText}>Mostar próximos streams</p>
                    <QaplaSwitch
                        name="showNextStreams"
                    />
                </div>
                <QaplaTabs value={selectedTab} onChange={handleTabChange} aria-label="profile editor tabs" >
                    <QaplaTab wid label="Social" {...a11yProps(0)} />
                    <QaplaTab label="Códigos de creador" {...a11yProps(1)} />
                </QaplaTabs>
                <TabPanel value={selectedTab} index={0} className={styles.socialLinksContainer}>
                    {socialLinks.map((data) => {
                        return (
                            <>
                                {/* <p className={styles.socialLinkLabel}>{data.socialPage}</p> */}
                                <StreamerTextInput
                                    label={data.socialPage}
                                    containerClassName={styles.socialLinkContainer}
                                    labelClassName={styles.socialLinkLabel}
                                    textInputClassName={styles.socialLinkTextInput}
                                />
                            </>
                        )
                    })}
                </TabPanel>
                <TabPanel value={selectedTab} index={1}>
                    <p>b</p>
                </TabPanel>
            </div>
        </StreamerDashboardContainer>
    )
}

export default StreamerProfileEditor;