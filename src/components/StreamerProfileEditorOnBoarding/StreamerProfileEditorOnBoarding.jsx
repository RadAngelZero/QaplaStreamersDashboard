import React, { useState } from 'react';
import { withStyles, Chip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import styles from './StreamerProfileEditorOnBoarding.module.css';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { updateStreamerPublicProfile } from '../../services/database';
import ContainedButton from '../ContainedButton/ContainedButton';
import BioEditorTextArea from '../BioEditorTextArea/BioEditorTextArea';
import { MIN_BIO_LENGTH, MIN_TAGS } from '../../utilities/Constants';
import ProfilesPresentation1 from './../../assets/ProfilesPresentation1.png';
import ProfilesPresentation2 from './../../assets/ProfilesPresentation2.png';
import ProfilesPresentation3 from './../../assets/ProfilesPresentation3.png';

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
            <div style={{
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

const StreamerProfileEditorOnBoarding = ({ step, showOnlySpecificStep = false, user, onBoardingDone, streamerBio = '', streamerTags = [], closeOnBoarding = () => {} }) => {
    const [currentStep, setCurrentStep] = useState(step)
    const [tagSearch, setTagSearch] = useState('')
    const [tagSearchLimit, setTagSearchLimit] = useState(false)
    const [tags, setTags] = useState(streamerTags.length === 0 ? DEFUALT_TAGS : streamerTags.map((tag) => ({ label: tag, selected: true, isCustom: true })));
    const [bio, setBio] = useState(streamerBio);
    const [bioError, setBioError] = useState(false);
    const [tagError, setTagError] = useState(false);
    const [showTagHelper, setShowTagHelper] = useState(true);
    const { t } = useTranslation();

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
                await updateStreamerPublicProfile(user.uid, { tags: tagsSelected.map((tag) => tag.label) });
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

    const tagsSelected = tags.filter((tag) => tag.selected);
    return (
        <div className={styles.profileOnBoardingContainer}>
            <div className={styles.profileOnBoardingModalContainer}>
                {currentStep < 3 &&
                    <>
                        <div className={styles.modalImgContainer} style={{backgroundColor: renderBackgroundColor(currentStep)}}>
                            <img src={renderImage(currentStep)} alt='Profile Presentation' />
                        </div>
                        <p className={styles.modalTextHeader} style={{ marginTop: '40px' }}>
                            {t(`StreamerProfileEditor.OnBoarding.header${currentStep + 1}`)}
                        </p>
                        <p className={styles.modalTextParagraph} style={{ marginTop: '25px' }}>
                            {t(`StreamerProfileEditor.OnBoarding.body${currentStep + 1}`)}
                        </p>
                        <ContainedButton onClick={continueButtonForm} className={styles.modalButtonPresentation}>
                            {t('continue')}
                        </ContainedButton>
                    </>
                }
                {currentStep === 3 &&
                    <>
                        <p className={styles.modalTextHeader} style={{ marginTop: '52px' }}>
                            {t('StreamerProfileEditor.OnBoarding.presentYourself')}
                        </p>
                        <p className={styles.modalTextSubParagraph} style={{ marginTop: '17px', width: '70%' }}>
                            {t('StreamerProfileEditor.OnBoarding.yourIntro')}
                        </p>
                        <BioEditorTextArea bio={bio}
                            setBio={updateBio}
                            error={bioError}
                            minLength={MIN_BIO_LENGTH} />
                        <p style={{ color: 'rgba(255, 255, 255, .65)', fontSize: 10, marginBottom: 'auto' }}>
                            {bioError && t('StreamerProfileEditor.errors.emptyBioError')}
                        </p>
                        {showOnlySpecificStep ?
                            <>
                            <ContainedButton onClick={continueButtonForm} className={styles.modalButtonEditing}>
                                {t('save')}
                            </ContainedButton>
                            <ContainedButton onClick={closeOnBoarding} className={styles.modalButtonFormLater}>
                                {t('cancel')}
                            </ContainedButton>
                            </>
                        :
                            <ContainedButton onClick={continueButtonForm} className={styles.modalButtonContinue}>
                                {t('continue')}
                            </ContainedButton>
                        }
                    </>
                }
                {currentStep === 4 &&
                    <>
                        <p className={styles.modalTextHeader} style={{ marginTop: '52px' }}>
                            Tags
                        </p>
                        <p className={styles.modalTextSubParagraph} style={{ marginTop: '17px', width: '60%' }}>
                            {t('StreamerProfileEditor.OnBoarding.addTags')}
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
                                    'Para agregar un tag escribelo y/o da click en el'
                                    :
                                    `Agrega al menos ${MIN_TAGS} tags para continuar`
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
                        {showOnlySpecificStep ?
                            <>
                            <p className={styles.minLengthIndicator}>
                                Min. Tags
                                <p style={{ marginLeft: 2, color: tagsSelected.length >= MIN_TAGS ? '#51a05e' : '#FF0000' }}>
                                    {tagsSelected.length}/{MIN_TAGS}
                                </p>
                            </p>
                            <ContainedButton onClick={continueButtonForm} className={styles.modalButtonEditing}>
                                {t('save')}
                            </ContainedButton>
                            <ContainedButton onClick={closeOnBoarding} className={styles.modalButtonFormLater}>
                                {t('cancel')}
                            </ContainedButton>
                            </>
                        :
                            <>
                            <p className={styles.minLengthIndicator}>
                                Min. Tags
                                <p style={{ marginLeft: 2, color: tagsSelected.length >= MIN_TAGS ? '#51a05e' : '#FF0000' }}>
                                    {tagsSelected.length}/{MIN_TAGS}
                                </p>
                            </p>
                            <ContainedButton onClick={continueButtonForm} className={styles.modalButtonContinue}>
                                {t('goToProfile')}
                            </ContainedButton>
                            </>
                        }
                    </>
                }
            </div>
            {!showOnlySpecificStep &&
                <div style={{
                    display: 'flex',
                    marginTop: '50px'
                }}>
                    <QaplaDots
                        index={currentStep}
                        dots={5}
                        activeWidth='29px'
                    />
                </div>
            }
        </div>
    )
}

export default StreamerProfileEditorOnBoarding;