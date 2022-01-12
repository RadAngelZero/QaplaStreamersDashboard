import React, { useEffect, useState } from 'react';
import { withStyles, makeStyles, Chip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import styles from './StreamerProfileEditorOnBoarding.module.css';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { updateStreamerPublicProfile } from '../../services/database';
import ContainedButton from '../ContainedButton/ContainedButton';
import MobileProfile from './../../assets/MobileProfile.png';
import BioEditorTextArea from '../BioEditorTextArea/BioEditorTextArea';

const QaplaChip = withStyles(() => ({
    root: {
        backgroundColor: '#272D5780',
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

const StreamerProfileEditorOnBoarding = ({ user, onBoardingDone }) => {
    const [dotsIndex, setDotsIndex] = useState(0)
    const [isPresentation, setIsPresentation] = useState(true)
    const [isBioCreation, setIsBioCreation] = useState(true)
    const [tagSearch, setTagSearch] = useState('')
    const [tagSearchLimit, setTagSearchLimit] = useState(false)
    const [tags, setTags] = useState([])
    const [bio, setBio] = useState('')

    const continueButtonPresentation = () => {
        setDotsIndex(dotsIndex + 1)
        if (dotsIndex === 2) {
            setIsPresentation(false)
        }
    }

    const continueButtonForm = async () => {
        setDotsIndex(dotsIndex + 1)
        if (isBioCreation) {
            await saveBio();
            return setIsBioCreation(false);
        }
        onBoardingDone()
    }

    const laterButtonForm = () => {
        setDotsIndex(dotsIndex + 1)
        if (isBioCreation) {
            setIsBioCreation(false)
            return
        }
        onBoardingDone()
    }

    const onTagSearchChange = (e) => {
        let input = e.target.value
        if (input.length > 43) {
            input = input.slice(0, 43)
        }
        if (tagSearchLimit === false && input.length >= 43) {
            setTagSearchLimit(true)
        }
        else if (tagSearchLimit === true && input.length < 43) {
            setTagSearchLimit(false)
        }
        setTagSearch(input)
    }

    const addNewTag = () => {
        let tagsArr = [...tags]
        tagsArr.unshift({
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

    return (
        <div className={styles.profileOnBoardingContainer}>
            <div className={styles.profileOnBoardingModalContainer}>
                {isPresentation ?
                    <>
                        <div className={styles.modalImgContainer}>
                            <img src={MobileProfile} alt='Mobile Profile' />
                        </div>
                        <p className={styles.modalTextHeader} style={{ marginTop: '40px' }}>
                            Incrementa tu visibilidad
                        </p>
                        <p className={styles.modalTextParagraph} style={{ marginTop: '25px' }}>
                            Bienvenido a tu perfil Qapla 😍. Conecta con más miembros de la comunidad habilitando tu perfil.
                        </p>
                        <ContainedButton onClick={continueButtonPresentation} className={styles.modalButtonPresentation}>
                            Continuar
                        </ContainedButton>
                    </>
                    :
                    <>
                        <p className={styles.modalTextHeader} style={{ marginTop: '52px' }}>
                            {isBioCreation ? 'Preséntate con la comunidad' : 'Tags'}
                        </p>
                        <p className={styles.modalTextSubParagraph} style={{ marginTop: '17px', width: isBioCreation ? '70%' : '60%' }}>
                            {isBioCreation ? 'Tu intro es un vistazo de ti mismo y tu contenido. Hazlo ameno 😉' : 'Agrega etiquetas que te representen a ti como creador, tu persona, tu contenido, etc.'}
                        </p>
                        {isBioCreation ?
                            <BioEditorTextArea bio={bio} setBio={setBio} />
                            :
                            <>
                                <StreamerTextInput
                                    containerClassName={styles.modalTagSearchContainer}
                                    textInputStyle={{ backgroundColor: tagSearchLimit ? '#802750' : '#202750' }}
                                    textInputClassName={styles.modalTagSearchTextInput}
                                    value={tagSearch}
                                    onChange={onTagSearchChange}
                                    placeholder={'Busca o crea un tag'}
                                    fullWidth
                                />
                                <ul className={styles.modalTagsList}
                                    style={{
                                        width: '100%',
                                        overflowY: 'auto',
                                        scrollBehavior: 'smooth',
                                    }}>
                                    {tagSearch !== '' &&
                                        <li className={styles.modalTag}>
                                            <QaplaChip
                                                label={tagSearch.length > 20 ? tagSearch.slice(0, 20) + '...' : tagSearch}
                                                onClick={addNewTag}
                                            />
                                        </li>
                                    }
                                    {tags.map((data, index) => {
                                        return (
                                            <li key={index} className={styles.modalTag}>
                                                <QaplaChip
                                                    label={data.label.length > 20 ? data.label.slice(0, 20) + '...' : data.label}
                                                    style={{ backgroundColor: data.selected ? '#4040FF' : '#232A54' }}
                                                    onClick={(e) => tagClick(data, index, e)}
                                                />
                                            </li>
                                        )
                                    })}
                                </ul>
                            </>
                        }

                        <ContainedButton onClick={continueButtonForm} className={styles.modalButtonFormContinue}>
                            Continuar
                        </ContainedButton>
                        <ContainedButton onClick={laterButtonForm} className={styles.modalButtonFormLater}>
                            Después lo hago
                        </ContainedButton>
                    </>
                }
            </div>
            <div style={{
                display: 'flex',
                marginTop: '50px'
            }}>
                <QaplaDots
                    index={dotsIndex}
                    dots={5}
                    activeWidth='29px'
                />
            </div>
        </div>
    )
}

export default StreamerProfileEditorOnBoarding;