import React, { useState } from 'react';
import { withStyles, Chip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import styles from './StreamerProfileEditorOnBoarding.module.css';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { updateStreamerPublicProfile } from '../../services/database';
import ContainedButton from '../ContainedButton/ContainedButton';
import MobileProfile from './../../assets/MobileProfile.png';
import StreamHost from './../../assets/StreamHost.png';
import ProfileTags from './../../assets/ProfileTags.png';
import BioEditorTextArea from '../BioEditorTextArea/BioEditorTextArea';

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
]

const StreamerProfileEditorOnBoarding = ({ step, user, onBoardingDone }) => {
    const [currentStep, setCurrentStep] = useState(step)
    const [tagSearch, setTagSearch] = useState('')
    const [tagSearchLimit, setTagSearchLimit] = useState(false)
    const [tags, setTags] = useState(DEFUALT_TAGS)
    const [bio, setBio] = useState('');
    const [bioError, setBioError] = useState(false);
    const [tagError, setTagError] = useState(false);
    const [showTagHelper, setShowTagHelper] = useState(true);

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
                setCurrentStep(step);
                return await saveBio();
            }
        } else {
            const tagsSelected = tags.filter((tag) => tag.selected);
            if (tagsSelected.length > 0) {
                await updateStreamerPublicProfile(user.uid, { tags: tagsSelected.map((tag) => tag.label) });
                return onBoardingDone();
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

    return (
        <div className={styles.profileOnBoardingContainer}>
            <div className={styles.profileOnBoardingModalContainer}>
                {currentStep === 0 &&
                    <>
                        <div className={styles.modalImgContainer} style={{ backgroundColor: '#AEFFEC' }}>
                            <img src={MobileProfile} alt='Mobile Profile' />
                        </div>
                        <p className={styles.modalTextHeader} style={{ marginTop: '40px' }}>
                            Incrementa tu visibilidad
                        </p>
                        <p className={styles.modalTextParagraph} style={{ marginTop: '25px' }}>
                            Bienvenido a tu perfil Qapla 😍. Conecta con más miembros de la comunidad habilitando tu perfil.
                        </p>
                        <ContainedButton onClick={continueButtonForm} className={styles.modalButtonPresentation}>
                            Continuar
                        </ContainedButton>
                    </>
                }
                {currentStep === 1 &&
                    <>
                        <div className={styles.modalImgContainer} style={{ backgroundColor: '#FBFE6C' }}>
                            <img src={StreamHost} alt='Stream Host' />
                        </div>
                        <p className={styles.modalTextHeader} style={{ marginTop: '40px' }}>
                            Mejora la interacción en vivo
                        </p>
                        <p className={styles.modalTextParagraph} style={{ marginTop: '25px' }}>
                            Comparte tus gustos, de que trata tu contenido, ó ¡lo que tu quieras!, para incrementar las posibilidades hacer match con la gente que se pasa a tu stream 💜
                        </p>
                        <ContainedButton onClick={continueButtonForm} className={styles.modalButtonPresentation}>
                            Continuar
                        </ContainedButton>
                    </>
                }
                {currentStep === 2 &&
                    <>
                        <div className={styles.modalImgContainer} style={{ backgroundColor: '#4BFFD4' }}>
                            <img src={ProfileTags} alt='Profile Tags' style={{ marginBottom: 18 }} />
                        </div>
                        <p className={styles.modalTextHeader} style={{ marginTop: '40px' }}>
                            Amplifica tu alcance
                        </p>
                        <p className={styles.modalTextParagraph} style={{ marginTop: '25px' }}>
                            Lleva tráfico a tus redes desde tu perfil Qapla. Un mismo lugar para tus próximos streams y enlaces para tus diferentes canales de comunicación 🎙
                        </p>
                        <ContainedButton onClick={continueButtonForm} className={styles.modalButtonPresentation}>
                            Comenzar
                        </ContainedButton>
                    </>
                }
                {currentStep === 3 &&
                    <>
                        <p className={styles.modalTextHeader} style={{ marginTop: '52px' }}>
                            Preséntate con la comunidad
                        </p>
                        <p className={styles.modalTextSubParagraph} style={{ marginTop: '17px', width: '70%' }}>
                            Tu intro es un vistazo de ti mismo y tu contenido. Hazlo ameno 😉
                        </p>
                        <BioEditorTextArea bio={bio}
                            setBio={setBio}
                            error={bioError} />
                        {bioError &&
                            <p style={{ color: 'rgba(255, 255, 255, .65)', fontSize: 10 }}>La bio no puede quedar vacia</p>
                        }
                        <ContainedButton onClick={continueButtonForm} className={styles.modalButtonPresentation}>
                            Continuar
                        </ContainedButton>
                    </>
                }
                {currentStep === 4 &&
                    <>
                        <p className={styles.modalTextHeader} style={{ marginTop: '52px' }}>
                            Tags
                        </p>
                        <p className={styles.modalTextSubParagraph} style={{ marginTop: '17px', width: '60%' }}>
                            Agrega etiquetas que te representen a ti como creador, tu persona, tu contenido, etc.
                        </p>
                        <StreamerTextInput
                            containerClassName={styles.modalTagSearchContainer}
                            textInputStyle={{ backgroundColor: (tagSearch.length === 43 || tagError) ? '#802750' : '#202750' }}
                            textInputClassName={styles.modalTagSearchTextInput}
                            value={tagSearch}
                            onChange={onTagSearchChange}
                            placeholder={'Busca o crea un tag'}
                            fullWidth />
                        {tagError &&
                            <p style={{ color: 'rgba(255, 255, 255, .65)', fontSize: 10 }}>
                                {showTagHelper ?
                                    'Para agregar un tag escribelo y da click en el'
                                    :
                                    'Agrega al menos un tag para continuar'
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
                        <ContainedButton onClick={continueButtonForm} className={styles.modalButtonPresentation}>
                            {currentStep !== 4 ?
                                'Continuar'
                                :
                                'Ir a mi perfil'
                            }
                        </ContainedButton>
                    </>
                }
            </div>
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
        </div>
    )
}

export default StreamerProfileEditorOnBoarding;