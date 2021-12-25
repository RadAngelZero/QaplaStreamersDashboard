import React, { useEffect, useState } from 'react';
import { withStyles, makeStyles, Button, Chip, Switch, Tabs, Tab, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import styles from './StreamerProfileEditorOnBoarding.module.css';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { ReactComponent as FounderBadge } from './../../assets/FounderBadge.svg'
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { getStreamerLinks, getStreamerPublicProfile, saveStreamerLinks, updateStreamerPublicProfile } from '../../services/database';

import { ReactComponent as CopyIcon } from './../../assets/CopyPaste.svg';
import { ReactComponent as EditIcon } from './../../assets/Edit.svg';
import { ReactComponent as CameraIcon } from './../../assets/Camera.svg';
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

const StreamerProfileEditorOnBoarding = ({ user }) => {

    return (
        <div className={styles.profileOnBoardingContainer}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#141833',
                width: '450px',
                height: '570px',
                borderRadius: '35px',
                overflow: 'hidden',
                alignItems: 'center',
            }}>
                <div style={{
                    display: 'flex',
                    backgroundColor: '#AEFFEC',
                    width: '100%',
                    height: '254px'
                }}>
                    <img src={MobileProfile}/>
                </div>
                <p style={{
                    display: 'flex',
                    color: '#FFF',
                    fontSize: '18px',
                    fontWeight: '700',
                    textAlign: 'center',
                    marginTop: '40px',
                }}>
                    Incrementa tu visibilidad
                </p>
                <p style={{
                    display: 'flex',
                    color: '#FFF',
                    fontSize: '18px',
                    fontWeight: '500',
                    textAlign: 'center',
                    marginTop: '25px',
                    
                }}>
                    Bienvenido a tu perfil Qapla 😍. Conecta con más miembros de la comunidad habilitando tu perfil.
                </p>
                <ContainedButton onClick={() => { }} style={{
                    display: 'flex',
                    width: '390px',
                    marginTop: 'auto',
                    marginBottom: '30px'
                }}>
                    Continuar
                </ContainedButton>
            </div>
        </div>
    )
}

export default StreamerProfileEditorOnBoarding;