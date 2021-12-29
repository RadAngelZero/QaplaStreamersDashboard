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

const StreamerProfileEditorOnBoarding = ({ user }) => {
    const [isPresentation, setIsPresentation] = useState(false)
    const [bold, setBold] = useState(false)
    const [italic, setItalic] = useState(false)
    const [underline, setUnderline] = useState(false)
    const [strikeThrough, setStrikeThrough] = useState(false)
    const [emoji, setEmoji] = useState(false)
    const [unorderedList, setUnorderedList] = useState(false)
    const [orderedList, setOrderedList] = useState(false)
    const [bio, setBio] = useState('')

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

    }

    const continueButtonForm = () => {

    }

    const laterButtonForm = () => {

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

    return (
        <div className={styles.profileOnBoardingContainer}>
            <div className={styles.modal}>
                {isPresentation ?
                    <>
                        <div className={styles.modalImgContainer}>
                            <img src={MobileProfile} />
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
                            Preséntate con la comunidad
                        </p>
                        <p className={styles.modalTextSubParagraph} style={{ marginTop: '17px' }}>
                            Tu intro es un vistazo de ti mismo y tu contenido.
                            Hazlo ameno 😉
                        </p>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: '#202750',
                            borderRadius: '15px',
                            width: '390px',
                            height: '234px',
                            marginTop: '20px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                display: 'flex',
                                height: '46px',
                                width: '100%'
                            }}>
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
                                containerClassName={styles.modalTextInputContainer}
                                textInputClassName={styles.modalTextInput}
                                rows={10}
                                rowsMax={10}
                                value={bio}
                                onChange={onBioChange}
                                fullWidth
                                multiline
                            />
                        </div>
                        <ContainedButton onClick={continueButtonForm} className={styles.modalButtonFormContinue}>
                            Continuar
                        </ContainedButton>
                        <ContainedButton onClick={laterButtonForm} className={styles.modalButtonFormLater}>
                            Después lo hago
                        </ContainedButton>
                    </>
                }
            </div>
        </div>
    )
}

export default StreamerProfileEditorOnBoarding;