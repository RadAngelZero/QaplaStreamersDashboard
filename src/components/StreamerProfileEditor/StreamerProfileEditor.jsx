import React, { useEffect, useState } from 'react';
import { withStyles, makeStyles, Button, Chip, Switch, Tabs, Tab, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import StreamerProfileEditorOnBoarding from '../StreamerProfileEditorOnBoarding/StreamerProfileEditorOnBoarding';

import styles from './StreamerProfileEditor.module.css';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { ReactComponent as FounderBadge } from './../../assets/FounderBadge.svg'
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { getStreamerLinks, getStreamerPublicProfile, saveStreamerLinks, updateStreamerPublicProfile } from '../../services/database';
import { ReactComponent as CopyIcon } from './../../assets/CopyPaste.svg';
import { ReactComponent as EditIcon } from './../../assets/Edit.svg';
import { ReactComponent as CameraIcon } from './../../assets/Camera.svg';
import ContainedButton from '../ContainedButton/ContainedButton';
import { uploadImage } from '../../services/storage';
import { PROFILE_BACKGROUND_GRADIENTS } from '../../utilities/Constants';

const useStyles = makeStyles((theme) => ({
    gridContainer: {
        width: '100%',
        display: 'flex',
        boxSizing: 'border-box',
        flexWrap: 'nowrap'
    },
    linkPlaceholder: {
        '&::placeholder': {
            color: 'rgba(108, 93, 211, 0.4)'
        }
    },
    linkInput: {
        backgroundColor: '#202750',
        color: '#FFF',
        '&.Mui-disabled': {
            color: '#AAA'
        }
    }
}));

const EditBioButton = withStyles(() => ({
    root: {
        backgroundColor: '#272D5780',
        color: '#FFFFFF99',
        padding: '0.6rem 1rem',
        '&:hover': {
            backgroundColor: '#24456680'
        },
        '&:disabled': {
            backgroundColor: '#272D5780',
            color: '#FFFFFF99',
        },
        '&#cover': {
            backgroundColor: '#272D5780'
        }
    },

}))(Button);

const QaplaChip = withStyles(() => ({
    root: {
        backgroundColor: '#272D5780',
        color: '#FFFFFFA6',
        padding: '0 0.4rem',
        '&:focus': {
            backgroundColor: '#4040FF4F',
        },
        '&:hover': {
            backgroundColor: '#4040FF4F',
            opacity: 0.8
        }
    },
    deletable: {
        backgroundColor: '#4040FF4F',
        color: '#FFFFFFA6',
        padding: '0 0.4rem',
        '&:focus': {
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
            role='tabpanel'
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
    const socialLinksInitialValue = [
        {
            socialPage: 'Twitch',
            value: ''
        },
        {
            socialPage: 'Twitter',
            value: ''
        },
        {
            socialPage: 'Instagram',
            value: ''
        },
        {
            socialPage: 'Discord',
            value: ''
        },
        {
            socialPage: 'Youtube',
            value: ''
        },
        /* {
            socialPage: 'TikTok',
            value: ''
        } */
    ];

    const socialLinksPlaceholders = {
        Twitch: `https://twitch.tv/${user ? user.displayName : ''}`,
        Twitter: `https://twitter.com/${user ? user.displayName : ''}`,
        Instagram: `https://instagram.com/${user ? user.displayName : ''}`,
        Discord: `https://discord.gg/inviteCode`,
        Youtube: `https://youtube.com/chanel/Nos3Ns3C0d3`,
        tiktok: `https://www.tiktok.com/@${user ? user.displayName : ''}`
    };

    const classes = useStyles();
    const [dataIsFetched, setDataIsFetched] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);
    const [editingBio, setEditingBio] = useState(false);
    const [streamerBio, setStreamerBio] = useState('');
    const [backgroundUrl, setBackgroundUrl] = useState('');
    const [backgroundGradient, setBackgroundGradient] = useState(null);
    const [uploadImageStatus, setUploadImageStatus] = useState(0);
    const [socialLinks, setSocialLinks] = useState(socialLinksInitialValue);
    const [streamerTags, setStreamerTags] = useState([]);
    const [socialLinksChanged, setSocialLinksChanged] = useState(false);
    const [openTooltip, setOpenTooltip] = useState(false);
    const [onBoardingDone, setOnBoardingDone] = useState(true);
    const [onBoardingStep, setOnBoardingStep] = useState(0);
    const { t } = useTranslation();

    const twitchURL = `https://www.twitch.tv/${user && user.login ? user.login : ''}`;

    useEffect(() => {
        async function getStreamerInfo() {
            const info = await getStreamerPublicProfile(user.uid);
            if (info.exists()) {
                const { bio, tags, backgroundUrl, backgroundGradient } = info.val();
                if (!tags) {
                    setOnBoardingDone(false);
                    setOnBoardingStep(4);
                }

                if (!bio) {
                    setOnBoardingDone(false);
                    setOnBoardingStep(3);
                }
                setStreamerBio(bio || '');
                setBackgroundGradient(backgroundGradient);
                setBackgroundUrl(backgroundUrl);
                setStreamerTags(tags || []);
            } else {
                setOnBoardingDone(false);
            }

            const links = await getStreamerLinks(user.uid);
            if (links.exists()) {
                setSocialLinks(links.val());
            } else {
                setSocialLinks(socialLinksInitialValue);
            }

            setDataIsFetched(true);
        }

        if (user && user.uid) {
            getStreamerInfo();
        }
    }, [user, onBoardingDone]);

    const onBoardingDoneByStreamer = async () => {
        const min = 0;
        const max = 4;
        const randomIndex = Math.floor(Math.random() * (max - min + 1)) + min;

        const backgroundSelected = PROFILE_BACKGROUND_GRADIENTS[randomIndex];
        setBackgroundGradient(backgroundSelected);

        await updateStreamerPublicProfile(user.uid, {
            backgroundGradient: backgroundSelected,
            displayName: user.displayName,
            photoUrl: user.photoUrl
        });
        setOnBoardingDone(true);
    }

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue)
    }

    const handleTagDelete = async (indexToDelete) => {
        const tags = streamerTags.filter((tag, index) => indexToDelete !== index);

        try {
            await updateStreamerPublicProfile(user.uid, { tags });
            setStreamerTags(tags);
        } catch (error) {
            console.log(error);
            alert('Hubo un problema al eliminar el tag, intentalo mas tarde o contacta con soporte tecnico');
        }
    }

    const updateSocialLinks = (value, index) => {
        setSocialLinksChanged(true);
        let newArray = [...socialLinks];
        newArray[index] = {
            ...newArray[index],
            value
        };

        setSocialLinks(newArray);
    }

    const saveLinks = async () => {
        // Creates an array without the placeholder value
        const objectToSave = {};
        socialLinks.forEach((link, index) => {
            objectToSave[index] = { socialPage: link.socialPage, value: link.value };
        });

        try {
            await saveStreamerLinks(user.uid, objectToSave);
        } catch (error) {
            console.log(error);
            alert('Hubo un problema al actualizar los links, intentalo mas tarde o contacta con soporte tecnico');
        }
        setSocialLinksChanged(false);
    }

    const saveBio = async () => {
        try {
            await updateStreamerPublicProfile(user.uid, { bio: streamerBio });
            setEditingBio(false);
        } catch (error) {
            console.log(error);
            alert('Hubo un problema al actualizar la bio, intentalo mas tarde o contacta con soporte tecnico');
        }
    }

    const addTag = async () => {
        const value = window.prompt('Tag:');

        if (value) {
            let tags = [...streamerTags];
            tags.push(value);

            try {
                await updateStreamerPublicProfile(user.uid, { tags });
                setStreamerTags(tags);
            } catch (error) {
                console.log(error);
                alert('Hubo un problema al agregar el tag, intentalo mas tarde o contacta con soporte tecnico');
            }
        }
    }

    const updateTag = async (index, currentValue) => {
        const value = window.prompt('Tag:', currentValue);

        if (value) {
            let tags = [...streamerTags];
            tags[index] = value;

            try {
                await updateStreamerPublicProfile(user.uid, { tags });
                setStreamerTags(tags);
            } catch (error) {
                console.log(error);
                alert('Hubo un problema al actualizar el tag, intentalo mas tarde o contacta con soporte tecnico');
            }
        }
    }

    const uploadBackgroundImage = (e) => {
        if (e.target.files[0]) {
            const newBackgroundImage = (e.target.files[0]);
            uploadImage(
                newBackgroundImage,
                `/StreamersProfilesBackgroundImages/${user.uid}`,
                (progressValue) => setUploadImageStatus(progressValue * 100),
                (error) => { alert('Error al agregar imagen'); console.log(error); },
                async (url) => {
                    try {
                        await updateStreamerPublicProfile(user.uid, { backgroundUrl: url });
                        alert('Imagen guardada correctamente');
                    } catch (error) {
                        alert('Hubo un error al guardar la imagen');
                        console.log(error);
                    }
                }
            );

            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setBackgroundUrl(reader.result);
            });

            reader.readAsDataURL(e.target.files[0]);
        }
    }

    const copyTwitchURL = () => {
        navigator.clipboard.writeText(twitchURL);
        setOpenTooltip(true);
        setTimeout(() => {
            setOpenTooltip(false);
        }, 1250);
    }

    const createLinearGradientCSS = () => {
        if (backgroundGradient) {
            let colorsString = '';
            backgroundGradient.colors.forEach((color, index) => {
                if (index !== backgroundGradient.colors.length - 1) {
                    colorsString += `${color},`;
                } else {
                    colorsString += color;
                }
            });

            return `linear-gradient(${backgroundGradient.angle}deg, ${colorsString})`;
        }

        return '';
    }

    return (
        <StreamerDashboardContainer user={user} containerStyle={styles.profileEditorContainer}>
            {dataIsFetched &&
                <>
                    {onBoardingDone ?
                        <>
                            <div className={styles.coverContainer}>
                                {backgroundUrl ?
                                    <img src={backgroundUrl} alt='Cover' className={styles.cover} />
                                    :
                                    <div className={styles.cover} style={{ background: createLinearGradientCSS() }} />
                                }
                            </div>
                            <div className={styles.editCoverButtonContainer}>
                                <input
                                    accept='image/*'
                                    style={{ display: 'none' }}
                                    type='file'
                                    id='image-input'
                                    onChange={uploadBackgroundImage} />
                                <label htmlFor='image-input'>
                                    <EditBioButton id='cover' component='span'>
                                        <CameraIcon />
                                        <div style={{ width: '0.4rem' }} />
                                        {t('StreamerProfileEditor.editCover')}
                                    </EditBioButton>
                                </label>
                            </div>
                            <div className={styles.profileContainer}>
                                <div className={styles.profilePicContainer}>
                                    <img src={user.photoUrl} alt='User pfp' className={styles.profilePic} />
                                </div>
                                <div className={styles.streamerNameAndEditBioButtonContainer}>
                                    <div className={styles.streamerNameContainer}>
                                        <p className={styles.streamerName}>
                                            {user.displayName}
                                        </p>
                                        <div className={styles.founderBadgeContainer}>
                                            <FounderBadge className={styles.founderBadge} />
                                        </div>
                                    </div>
                                    <div className={styles.editBioButtonContainer}>
                                        <EditBioButton variant='contained'
                                            onClick={() => !editingBio ? setEditingBio(true) : saveBio()}>
                                            {!editingBio ?
                                                <>
                                                    <EditIcon />
                                                    <div style={{ width: '0.4rem' }} />
                                                    {t('StreamerProfileEditor.editBio')}
                                                </>
                                                :
                                                t('StreamerProfileEditor.saveChanges')
                                            }
                                        </EditBioButton>
                                    </div>
                                </div>
                                {/* <div className={styles.twitchURLContainer}>
                                    <a href={twitchURL} target='_blank' rel='noreferrer' className={styles.twitchURL} >{twitchURL}</a>
                                    <Tooltip placement='top' open={openTooltip} title='Copiado'>
                                        <CopyIcon onClick={copyTwitchURL} />
                                    </Tooltip>
                                </div> */}
                                <div className={styles.bioContainer}>
                                    {!editingBio ?
                                        <p className={styles.bioText} onClick={() => setEditingBio(true)}>
                                            {streamerBio}
                                        </p>
                                        :
                                        <StreamerTextInput multiline
                                            fullWidth
                                            rows={5}
                                            rowsMax={5}
                                            onChange={(e) => setStreamerBio(e.target.value)}
                                            value={streamerBio}
                                            max />
                                    }
                                </div>
                                <ul className={styles.tagsList}>
                                    {streamerTags.map((data, index) => {
                                        return (
                                            <li key={`chip-${data}-${index}`} className={styles.tag}>
                                                <QaplaChip
                                                    label={data}
                                                    onDelete={() => handleTagDelete(index)}
                                                    onClick={() => updateTag(index, data)}
                                                />
                                            </li>
                                        )
                                    })}
                                    <li key='new' className={styles.tag}>
                                        <QaplaChip onClick={addTag}
                                            label={t('StreamerProfileEditor.addTag')}
                                        />
                                    </li>
                                </ul>
                                <div className={styles.showNextStreamsContainer}>
                                    <p className={styles.showNextStreamsText}>
                                        {t('StreamerProfileEditor.showUpcomingStreams')}
                                    </p>
                                    <QaplaSwitch
                                        name='showNextStreams'
                                    /** ToDo: Show streams in profile. Also show twitch status (online or offline) <= more of this on cloud function */
                                    />
                                </div>
                                <QaplaTabs value={selectedTab} onChange={handleTabChange} aria-label='profile editor tabs' >
                                    <QaplaTab wid label={t('StreamerProfileEditor.social')} {...a11yProps(0)} />
                                    {/* <QaplaTab label='Códigos de creador' {...a11yProps(1)} /> */}
                                </QaplaTabs>
                                <TabPanel value={selectedTab} index={0} className={styles.socialLinksContainer}>
                                    {socialLinks.map((data, index) => {
                                        return (
                                            <>
                                                {/* <p className={styles.socialLinkLabel}>{data.socialPage}</p> */}
                                                <StreamerTextInput
                                                    key={`SocialLink-${index}`}
                                                    label={data.socialPage}
                                                    containerClassName={styles.socialLinkContainer}
                                                    labelClassName={styles.socialLinkLabel}
                                                    // textInputClassName={styles.socialLinkTextInput}
                                                    value={data.socialPage.toLowerCase() === 'twitch' ? twitchURL : data.value}
                                                    disabled={data.socialPage.toLowerCase() === 'twitch'}
                                                    placeholder={socialLinksPlaceholders[data.socialPage]}
                                                    classes={{ input: classes.linkPlaceholder }}
                                                    textInputClassName={classes.linkInput}
                                                    fullWidth
                                                    onChange={(e) => updateSocialLinks(e.target.value, index)}
                                                />
                                            </>
                                        )
                                    })}
                                    <br />
                                    {socialLinksChanged &&
                                        <ContainedButton onClick={saveLinks}>
                                            {t('StreamerProfileEditor.saveChanges')}
                                        </ContainedButton>
                                    }
                                </TabPanel>
                                <TabPanel value={selectedTab} index={1}>
                                    <p>b</p>
                                </TabPanel>
                            </div>
                        </>
                        :
                        <StreamerProfileEditorOnBoarding step={onBoardingStep}
                            user={user}
                            onBoardingDone={onBoardingDoneByStreamer} />
                    }
                </>
            }
        </StreamerDashboardContainer>
    )
}

export default StreamerProfileEditor;