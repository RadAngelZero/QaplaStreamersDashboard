import React, { useEffect, useState } from 'react';
import { withStyles, makeStyles, Button, Chip, Switch, Tabs, Tab, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import styles from './StreamerProfileEditorOnBoarding.module.css';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { getStreamerLinks, getStreamerPublicProfile, saveStreamerLinks, updateStreamerPublicProfile } from '../../services/database';

import { ReactComponent as BoldIcon } from './../../assets/textFormatting/bold.svg';
import { ReactComponent as ItalicIcon } from './../../assets/textFormatting/italic.svg';
import { ReactComponent as UnderlineIcon } from './../../assets/textFormatting/underline.svg';
import { ReactComponent as StrikeThroughIcon } from './../../assets/textFormatting/strikeThrough.svg';
import { ReactComponent as EmojiIcon } from './../../assets/textFormatting/smile.svg';
import { ReactComponent as UnorderedListIcon } from './../../assets/textFormatting/unorderedList.svg';
import { ReactComponent as OrderedListIcon } from './../../assets/textFormatting/orderedList.svg';

import ContainedButton from '../ContainedButton/ContainedButton';
import { uploadImage } from '../../services/storage';

import MobileProfile from './../../assets/MobileProfile.png';


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

const FormattingButton = withStyles(() => ({
    root: {
        display: 'flex',
        flex: 1,
        backgroundColor: '#232A54',
        color: '#FFFFFF99',
        minWidth: 'auto',
        '&:hover': {
            backgroundColor: '#24456680'
        },
        '&:disabled': {
            backgroundColor: '#272D5780',
            color: '#FFFFFF99',
        },
    },

}))(Button);

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
    const [bold, setBold] = useState(false)
    const [italic, setItalic] = useState(false)
    const [underline, setUnderline] = useState(false)
    const [strikeThrough, setStrikeThrough] = useState(false)
    const [emoji, setEmoji] = useState(false)
    const [unorderedList, setUnorderedList] = useState(false)
    const [orderedList, setOrderedList] = useState(false)

    useEffect(() => {
        // async function fetchTags() {
        //     let addTags = []
        //     addTags.push({
        //         label: 'Halo',
        //         selected: false
        //     })
        //     addTags.push({
        //         label: 'LoL',
        //         selected: false
        //     })
        //     setTags(addTags)
        // }

        if (user && user.uid) {
            // fetchTags();
        }
    }, [user]);

    const toggleBold = () => {
        setBold(!bold)
    }

    const toggleItalic = () => {
        setItalic(!italic)
    }

    const toggleUnderline = () => {
        setUnderline(!underline)
    }

    const toggleStrikeThrough = () => {
        setStrikeThrough(!strikeThrough)
    }

    const toggleEmoji = () => {
        setEmoji(!emoji)
    }

    const toggleUnorderedList = () => {
        setUnorderedList(!unorderedList)
    }

    const toggleOrderedList = () => {
        setOrderedList(!orderedList)
    }

    const continueButtonPresentation = () => {
        setDotsIndex(dotsIndex + 1)
        if (dotsIndex === 2) {
            setIsPresentation(false)
        }
    }

    const continueButtonForm = () => {
        setDotsIndex(dotsIndex + 1)
        if (isBioCreation) {
            console.log('Uploading bio')
            setIsBioCreation(false)
            return
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

    const onBioChange = (e) => {
        let reg = /\n/g
        let input = e.target.value
        let nl = input.match(reg)
        if (nl) {
            if (nl.length >= 10) {
                let stringArr = input.split('\n')
                if (stringArr[10].length > 0) {
                    if (stringArr[9] <= 0) {
                        stringArr[9] = stringArr[10]
                    }
                }
                while (stringArr.length > 10) {
                    stringArr.pop()
                }
                input = stringArr.join('\n')
            }
            // Limit last line, useless if don't limit other lines
            // if (nl.length >= 9) {
            //     let stringArr = input.split('\n')
            //     if (stringArr[9].length > 43) {
            //         let lastLineArr = stringArr[9].split('')
            //         lastLineArr.splice(43, lastLineArr.length - 43)
            //         lastLineArr = lastLineArr.join('')
            //         stringArr[9] = lastLineArr
            //         input = stringArr.join('\n')
            //     }
            // }

        }
        if (input.length > 300) {
            let stringArr = input.split('')
            stringArr.splice(300, stringArr.length - 300)
            input = stringArr.join('')
        }

        setBio(input)
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
                            {isBioCreation ? 'Tags' : 'Preséntate con la comunidad'}
                        </p>
                        <p className={styles.modalTextSubParagraph} style={{ marginTop: '17px', width: isBioCreation ? '70%' : '60%' }}>
                            {isBioCreation ? 'Agrega etiquetas que te representen a ti como creador, tu persona, tu contenido, etc.' : 'Tu intro es un vistazo de ti mismo y tu contenido. Hazlo ameno 😉'}
                        </p>
                        {isBioCreation ?
                            <>

                                <div className={styles.modalBioEditorContainer}>
                                    <div className={styles.modalBioEditorFormatterButtonsContainer}>
                                        <FormattingButton onClick={toggleBold}>
                                            <div style={{ backgroundColor: bold ? '#57758c' : '#0000' }} className={styles.modalButtonActiveIndicator}>
                                                <BoldIcon />
                                            </div>
                                        </FormattingButton>
                                        <FormattingButton onClick={toggleItalic}>
                                            <div style={{ backgroundColor: italic ? '#57758c' : '#0000' }} className={styles.modalButtonActiveIndicator}>
                                                <ItalicIcon />
                                            </div>
                                        </FormattingButton>
                                        <FormattingButton onClick={toggleUnderline}>
                                            <div style={{ backgroundColor: underline ? '#57758c' : '#0000' }} className={styles.modalButtonActiveIndicator}>
                                                <UnderlineIcon />
                                            </div>
                                        </FormattingButton>
                                        <FormattingButton onClick={toggleStrikeThrough}>
                                            <div style={{ backgroundColor: strikeThrough ? '#57758c' : '#0000' }} className={styles.modalButtonActiveIndicator}>
                                                <StrikeThroughIcon />
                                            </div>
                                        </FormattingButton>
                                        <FormattingButton onClick={toggleEmoji}>
                                            <div style={{ backgroundColor: emoji ? '#57758c' : '#0000' }} className={styles.modalButtonActiveIndicator}>
                                                <EmojiIcon />
                                            </div>
                                        </FormattingButton>
                                        <FormattingButton onClick={toggleUnorderedList}>
                                            <div style={{ backgroundColor: unorderedList ? '#57758c' : '#0000' }} className={styles.modalButtonActiveIndicator}>
                                                <UnorderedListIcon />
                                            </div>
                                        </FormattingButton>
                                        <FormattingButton onClick={toggleOrderedList}>
                                            <div style={{ backgroundColor: orderedList ? '#57758c' : '#0000' }} className={styles.modalButtonActiveIndicator}>
                                                <OrderedListIcon />
                                            </div>
                                        </FormattingButton>
                                    </div>
                                    <StreamerTextInput
                                        containerClassName={styles.modalBioTextInputContainer}
                                        textInputClassName={styles.modalBioTextInput}
                                        textInputStyle={{ backgroundColor: '#202750' }}
                                        rows={10}
                                        rowsMax={10}
                                        value={bio}
                                        onChange={onBioChange}
                                        fullWidth
                                        multiline
                                    />
                                </div>
                            </>
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