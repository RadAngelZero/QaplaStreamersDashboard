import React, { useState } from 'react';
import { makeStyles, withStyles, Chip, Button, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import styles from './StreamerProfileEditorOnBoarding.module.css';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { getQreatorCode, saveStreamerDeepLink, saveTags, updateStreamerPublicProfile } from '../../services/database';
import ContainedButton from '../ContainedButton/ContainedButton';
import BioEditorTextArea from '../BioEditorTextArea/BioEditorTextArea';
import { CHEERS_URI, MIN_BIO_LENGTH, MIN_TAGS } from '../../utilities/Constants';
import ProfilesPresentation1 from './../../assets/ProfilesPresentation1.png';
import ProfilesPresentation2 from './../../assets/ProfilesPresentation2.png';
import ProfilesPresentation3 from './../../assets/ProfilesPresentation3.png';
import { ReactComponent as CopyIcon } from './../../assets/CopyPaste.svg';
import { createLink } from '../../services/branch';

const useStyles = makeStyles((theme) => ({
    button: {
        backgroundColor: '#00FFDD',
        color: '#141833',
        width: '390px',
        height: '60px',
        fontSize: '16px',
        fontWeight: '600',
        lineHeight: '22px',
        letterSpacing: '0.492000013589859px',
        textTransform: 'none',
        borderRadius: '16px',
        '&:hover': {
            backgroundColor: '#00EACB'
        },
    },
}));

const QaplaChip = withStyles(() => ({
    root: {
        backgroundColor: 'rgba(64, 64, 255, 0.30859)',
        color: '#FFFFFFA6',
        fontWeight: '600',
        fontSize: '14px',
        padding: '10px 6px',
        minWidth: '90px',
        minHeight: '40px',
        borderRadius: '100px',
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

const QaplaDots = ({ index, dots, activeWidth = '30px' }) => {

    let dotsRender = []

    for (let i = 0; i < dots; i++) {
        dotsRender.push(
            <div key={`dot-${i}`}
                style={{
                    backgroundColor: index === i ? '#00FEDF' : '#00FEDF8A',
                    width: index === i ? activeWidth : '8px',
                    height: '8px',
                    margin: '0px 6.5px',
                    borderRadius: '100px'
                }}>
            </div>
        )
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row'
        }}>
            {dotsRender}
        </div>
    )
}

const createDefaultTag = (label) => ({ label, selected: false, isCustom: false });

const DEFUALT_TAGS = [
    createDefaultTag('Just Chatting'),
    createDefaultTag('Musica'),
    createDefaultTag('IRL'),
    createDefaultTag('Brawl Stars'),
    createDefaultTag('Minecraft'),
    createDefaultTag('CoD'),
    createDefaultTag('KPop'),
    createDefaultTag('Ajedrez'),
    createDefaultTag('Valorant')
];

const StreamerProfileEditorOnBoarding = ({ step, showOnlySpecificStep = false, user, onBoardingDone, streamerBio = '', streamerTags = [], closeOnBoarding = () => { } }) => {
    const [currentStep, setCurrentStep] = useState(step)
    const [tagSearch, setTagSearch] = useState('')
    const [tagSearchLimit, setTagSearchLimit] = useState(false)
    const [tags, setTags] = useState(streamerTags.length === 0 ? DEFUALT_TAGS : streamerTags.map((tag) => ({ label: tag, selected: true, isCustom: true })));
    const [bio, setBio] = useState(streamerBio);
    const [bioError, setBioError] = useState(false);
    const [tagError, setTagError] = useState(false);
    const [showTagHelper, setShowTagHelper] = useState(true);
    const [qaplaLinkAlias, setQaplaLinkAlias] = useState('');
    const [qaplaLink, setQaplaLink] = useState('');
    const [linkError, setLinkError] = useState('');
    const [openTooltip, setOpenTooltip] = useState(false);
    const { t } = useTranslation();
    const classes = useStyles();

    const continueButtonForm = async () => {
        const step = currentStep + 1;

        if (step <= 3) {
            setCurrentStep(step);
            return;
        } else if (step === 4) {
            if (bio.replace(/\s/g, '').length === 0) {
                setBioError(true);
                return;
            } else {
                if (bio.length >= MIN_BIO_LENGTH) {
                    if (showOnlySpecificStep) {
                        closeOnBoarding();
                    } else {
                        setCurrentStep(step);
                    }
                    return await saveBio();
                }
            }
        } else {
            const tagsSelected = tags.filter((tag) => tag.selected);
            if (tagsSelected.length >= MIN_TAGS) {
                const tagsLabels = tagsSelected.map((tag) => tag.label);
                await updateStreamerPublicProfile(user.uid, { tags: tagsLabels });

                // We don´t know how we are going to use this information but we want to save it
                const tagObject = {};
                tagsLabels.forEach((tag) => {
                    tagObject[tag] = true;
                });

                saveTags(tagObject);
                if (showOnlySpecificStep) {
                    return closeOnBoarding();
                } else {
                    return onBoardingDone();
                }
            } else {
                setTagError(true);
            }
        }
    }

    const onTagSearchChange = (e) => {
        setTagError(false);
        let input = e.target.value
        if (input.length > 43) {
            input = input.slice(0, 43)
        }

        setTagSearch(input)
    }

    const addNewTag = () => {
        setShowTagHelper(false);
        setTagError(false);
        let tagsArr = [...tags]
        tagsArr.push({
            label: tagSearch,
            selected: true,
            isCustom: true
        })
        if (tagSearchLimit) {
            setTagSearchLimit(false)
        }
        setTags(tagsArr)
        setTagSearch('')
    }

    const tagClick = (data, index, e) => {
        setShowTagHelper(false);
        setTagError(false);
        let tagsArr = [...tags]
        tagsArr[index] = {
            ...data,
            selected: !data.selected
        }
        if (data.isCustom) {
            tagsArr.splice(index, 1)
        }
        setTags(tagsArr)
    }

    const saveBio = async () => {
        try {
            await updateStreamerPublicProfile(user.uid, { bio });
        } catch (error) {
            console.log(error);
            alert('Hubo un problema al actualizar la bio, intentalo mas tarde o contacta con soporte tecnico');
        }
    }

    const renderBackgroundColor = (index) => {
        switch (index) {
            case 0:
                return '#4BFFD4'
            case 1:
                return '#FBFE6C'
            case 2:
                return '#4BFFD4'
            default:
                break;
        }
    }
    const renderImage = (index) => {
        switch (index) {
            case 0:
                return ProfilesPresentation1
            case 1:
                return ProfilesPresentation2
            case 2:
                return ProfilesPresentation3
            default:
                break;
        }
    }

    const updateBio = (bio) => {
        setBioError(false);
        setBio(bio);
    }

    const handleMainButton = async () => {
        switch (currentStep) {
            case 0:
                const code = await getQreatorCode(user.uid);
                const linkResponse = await createLink(user.uid, code.val(), qaplaLinkAlias);

                if (linkResponse.status === 200) {
                    const linkData = await linkResponse.json();
                    await saveStreamerDeepLink(user.uid, linkData.url);
                    setQaplaLink(linkData.url);
                } else if (linkResponse.status === 409) {
                    return setLinkError('Link duplicado');
                }
                break;
            case 1:
                if (bio.replace(/\s/g, '').length === 0) {
                    setBioError(true);
                    return;
                } else {
                    if (bio.length >= MIN_BIO_LENGTH) {
                        if (showOnlySpecificStep) {
                            closeOnBoarding();
                        } else {
                            setCurrentStep(currentStep + 1);
                        }
                        return await saveBio();
                    }
                }
                break;
            case 2:
                const tagsSelected = tags.filter((tag) => tag.selected);
                if (tagsSelected.length >= MIN_TAGS) {
                    const tagsLabels = tagsSelected.map((tag) => tag.label);
                    await updateStreamerPublicProfile(user.uid, { tags: tagsLabels });

                    // We don´t know how we are going to use this information but we want to save it
                    const tagObject = {};
                    tagsLabels.forEach((tag) => {
                        tagObject[tag] = true;
                    });

                    saveTags(tagObject);
                    if (showOnlySpecificStep) {
                        return closeOnBoarding();
                    }
                } else {
                    return setTagError(true);
                }
                break;
            case 3:
                return onBoardingDone();
            default:
                break;
        }

        setCurrentStep(currentStep + 1);
    }

    const handleQaplaLinkAliasChange = (e) => {
        setQaplaLinkAlias(e.target.value);
    }

    const copyTwitchURL = () => {
        navigator.clipboard.writeText(qaplaLink);
        setOpenTooltip(true);
        setTimeout(() => {
            setOpenTooltip(false);
        }, 1250);
    }

    return (
        <div className={styles.profileOnBoardingContainer}>
            <div style={{
                marginTop: 24,
                position: 'relative',
                display: 'flex',
                backgroundColor: '#141833',
                width: '450px',
                height: currentStep >= 1 ? '450px' : '256px',
                borderRadius: '35px',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                zIndex: 500,
            }}>
                {currentStep === 0 &&
                <>
                    <img src={`https://media.giphy.com/media/57WAs7bCG9o4lCzEX9/giphy.gif`} alt={`Whats up`}
                        style={{
                            zIndex: 10000,
                            position: 'absolute',
                            bottom: 236, // 256 - 20 (height of container - overlaped part of the image)
                            width: '223px',
                            height: '173px',
                        }}
                    />
                </>
                }
                {currentStep === 1 &&
                    <>
                        <img src={`https://media.giphy.com/media/Ll3URGrGa6EAuibyel/giphy.gif`} alt={`Chill`}
                            style={{
                                zIndex: 10000,
                                position: 'absolute',
                                bottom: 400, // 450 - 50 (height of container - overlaped part of the image)
                                width: '175px',
                                height: '175px',
                            }}
                        />
                    </>
                }
                {currentStep === 2 &&
                    <>
                        <img src={`https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/OnboardingGifs%2FIMB_SZ5VPc.gif?alt=media&token=3014ab22-4ab2-4c80-8694-14586d991b3b`} alt={`Umbrella`}
                            style={{
                                zIndex: -1,
                                position: 'absolute',
                                bottom: 450, // 450 - 70 (height of container - hidden part of the image)
                                width: '181px',
                                height: '118px',
                            }}
                        />
                    </>
                }
                {currentStep === 3 &&
                    <>
                        <img src={`https://media.giphy.com/media/lRRomMvhcT66FpTwlc/giphy.gif`} alt={`Victory`}
                            style={{
                                zIndex: -1,
                                position: 'absolute',
                                bottom: 400, // 450 - 50 (height of container - hidden part of the image)
                                width: '142px',
                                height: '175px',
                            }}
                        />
                    </>
                }

                {currentStep === 0 &&
                    <>
                        <p className={styles.headerText}>
                            {`Increase your interactions`}
                        </p>
                        <p className={`${styles.subText} ${styles.subTextMartinTop} ${styles.alignTextCenter}`}>
                            {`Create and share your profile link to make it easier for your viewers to react on your stream ⚡️`}
                        </p>
                        <div className={styles.createLinkContainer}>
                            <p style={{
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: '600',
                                lineHeight: '17px',
                            }}>
                                qapla.app.link/
                            </p>
                            <div className={styles.createLinkFieldContainer}>
                                <div className={styles.createLinkFieldInnerConainer}>
                                    <input
                                        className={styles.createLinkText}
                                        placeholder={`type to create your link`}
                                        onChange={handleQaplaLinkAliasChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <p style={{ color: '#FF0000', fontSize: 10 }}>
                            {linkError}
                        </p>
                    </>
                }
                {currentStep === 1 &&
                    <>
                        <p className={styles.headerText} style={{ marginTop: '18px' }}>
                            {`Introduce yourself`}
                        </p>
                        <p className={`${styles.subText} ${styles.subTextMartinTop} ${styles.alignTextCenter}`}>
                            {`It’s a bio, you know how it goes 🫶`}
                        </p>
                        <BioEditorTextArea bio={bio}
                            setBio={updateBio}
                            error={bioError}
                            minLength={MIN_BIO_LENGTH} />
                    </>
                }
                {currentStep === 2 &&
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                        <p className={styles.headerText} style={{ marginTop: '18px' }}>
                            {`Tags`}
                        </p>
                        <p className={`${styles.subText} ${styles.subTextMartinTop} ${styles.alignTextCenter}`}>
                            {`Add tags about your content, you as a creator, you as a person, or whatever you want! 💜`}
                        </p>
                        <StreamerTextInput
                            containerClassName={styles.modalTagSearchContainer}
                            textInputStyle={{ backgroundColor: (tagSearch.length === 43 || tagError) ? '#802750' : '#202750' }}
                            textInputClassName={styles.modalTagSearchTextInput}
                            value={tagSearch}
                            onChange={onTagSearchChange}
                            placeholder={t('StreamerProfileEditor.addTagPlaceholder')}
                            fullWidth />
                        {tagError &&
                            <p style={{ color: 'rgba(255, 255, 255, .65)', fontSize: 10 }}>
                                {showTagHelper ?
                                    t('StreamerProfileEditor.OnBoarding.tagErrorNotSelected')
                                    :
                                    t('StreamerProfileEditor.OnBoarding.minTags', { minTags: MIN_TAGS })
                                }
                            </p>
                        }
                        <ul className={styles.modalTagsList}
                            style={{
                                width: '100%',
                                overflowY: 'auto',
                                scrollBehavior: 'smooth',
                            }}>
                            {tags.map((data, index) => (
                                <li key={index} className={styles.modalTag}>
                                    <QaplaChip
                                        label={data.label.length > 20 ? data.label.slice(0, 20) + '...' : data.label}
                                        style={{ backgroundColor: data.selected ? '#4040FF' : 'rgba(64, 64, 255, 0.30859)' }}
                                        onClick={(e) => tagClick(data, index, e)}
                                    />
                                </li>
                            ))}
                            {tagSearch !== '' &&
                                <li className={styles.modalTag}>
                                    <QaplaChip
                                        label={tagSearch}
                                        onClick={addNewTag}
                                    />
                                </li>
                            }
                        </ul>
                    </div>
                }
                {currentStep === 3 &&
                    <>
                        <p className={styles.headerText} style={{ marginTop: '18px' }}>
                            {`Copy and share!`}
                        </p>
                        <p className={`${styles.subText} ${styles.subTextMartinTop} ${styles.alignTextCenter}`}>
                            {`Your viewers can send reactions quick on stream right from your profile, or even download the app! `}
                        </p>
                        <div style={{
                            marginTop: '35px',
                        }}>
                            <p className={`${styles.finalListText}`}>
                                {`Ways of sharing:`}
                            </p>
                            <p className={`${styles.finalListText}`} style={{
                                marginTop: '18px',
                            }}>
                                {`🔗 Add it to your Link-in-Bio `}
                            </p>
                            <p className={`${styles.finalListText}`} style={{
                                marginTop: '18px',
                            }}>
                                {`🪪 Use it as a Link-in-Bio`}
                            </p>
                            <p className={`${styles.finalListText}`} style={{
                                marginTop: '18px',
                            }}>
                                {`🤖 Add it to your Nightbot on Twitch`}
                            </p>
                        </div>
                        <div className={styles.twitchURLContainer}>
                            <Tooltip onClick={copyTwitchURL} style={{ cursor: 'pointer' }} placement='top' open={openTooltip} title='Copiado'>
                                <div className={styles.twitchURLSubContainer}>
                                    <p href={qaplaLink} target='_blank' rel='noreferrer' className={styles.twitchURL}>
                                        {qaplaLink}
                                    </p>
                                    <CopyIcon className={styles.copyIcon} />
                                </div>
                            </Tooltip>
                        </div>
                    </>
                }
            </div>
            <div
                style={{
                    marginTop: 24,
                }}>
                <Button
                    disabled={qaplaLinkAlias === ''}
                    onClick={handleMainButton}
                    className={classes.button}
                >
                    {currentStep === 0 &&
                        <>
                            {`Create Profile Link`}
                        </>}
                    {currentStep === 1 &&
                        <>
                            {`Confirm Bio`}
                        </>}
                    {currentStep === 2 &&
                        <>
                            {`Finish set up`}
                        </>}
                    {currentStep === 3 &&
                        <>
                            {`Go to profile`}
                        </>}
                </Button>
            </div>
        </div>
    )
}

export default StreamerProfileEditorOnBoarding;