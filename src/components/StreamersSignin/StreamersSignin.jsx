import React, { useState, useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
    withStyles,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@material-ui/core';
import dayjs from 'dayjs';

import { ReactComponent as TwitchIcon } from './../../assets/twitchIcon.svg';
import { ReactComponent as QaplaIcon } from './../../assets/QaplaGamingLandingPage.svg';
import styles from './StreamersSignin.module.css';
import RoomGame from './../../assets/room-game.png';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import ContainedButton from '../ContainedButton/ContainedButton';
import { getTwitchUserData, signInWithTwitch, signUpOrSignInTwitchUser } from '../../services/auth';
import { getUserToken } from '../../services/functions';
import { createStreamerProfile, updateStreamerProfile } from '../../services/database';

var utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const CustomDialog = withStyles((theme) => ({
    paper: {
        backgroundColor: '#0D1021',
        color: '#FFF'
    }
}))(Dialog);

function useQuery() {
    const { search } = useLocation();

    return useMemo(() => new URLSearchParams(search), [search]);
}

const StreamersSignin = ({ user, title }) => {
    const [isLoadingAuth, setIsLoadingAuth] = useState(false);
    const [openTermsAndConditionsDialog, setOpenTermsAndConditionsDialog] = useState(false);
    const history = useHistory();
    const query = useQuery();

    useEffect(() => {
        async function checkIfUsersIsSigningIn() {
            const twitchClientCode = query.get('code');

            if (!isLoadingAuth && !user && twitchClientCode) {
                setIsLoadingAuth(true);
                const tokenData = await getUserToken(twitchClientCode);
                if (tokenData && tokenData.data && tokenData.data.access_token) {
                    const userData = await getTwitchUserData(tokenData.data.access_token);
                    const user = await signUpOrSignInTwitchUser(userData, tokenData.data);
                    if (user.userData.isNewUser) {
                        localStorage.setItem('twitchPermission', 'channel:read:redemptions');
                        localStorage.setItem('termsAndConditions', 'true');
                        await createStreamerProfile(user.firebaseAuthUser.user.uid, user.userData);
                    }
                    await updateStreamerProfile(user.firebaseAuthUser.user.uid, { twitchAccessToken: tokenData.data.access_token, refreshToken: tokenData.data.refresh_token });
                } else {
                    alert('Hubo un problema al iniciar sesión, intentalo de nuevo o reportalo a soporte técnico');
                }
            }
        }

        checkIfUsersIsSigningIn();

        if (user) {
            history.push('/profile');
        }
    }, [user, history, isLoadingAuth]);

    const signIn = async () => {
        closeTermsAndConditionsModal();
        setIsLoadingAuth(true);
        signInWithTwitch();
        setIsLoadingAuth(false);
    }

    const handleSignInClick = () => {
        const userHasAcceptedTerms = localStorage.getItem('termsAndConditions');

        if (userHasAcceptedTerms) {
            signIn();
        } else {
            setOpenTermsAndConditionsDialog(true);
        }
    }

    const closeTermsAndConditionsModal = () => setOpenTermsAndConditionsDialog(false);

    return (
        <StreamerDashboardContainer>
            <Grid item md='4' style={{
                    backgroundImage: `url(${RoomGame})`,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    height: '100%',
                }}>
                <div style={{
                        display: 'flex',
                        flexGrow: 1,
                        justifyContent: 'center',
                        height: '100vh',
                        alignItems: 'flex-end'
                    }}>
                <QaplaIcon style={{ marginBottom: 32 }} />
                </div>
            </Grid>
            <Grid item md='1' />
            <Grid item md='4'>
                <p className={styles.getStarted}>
                    {title}
                </p>
                <div className={styles.formContainer}>
                    <Button variant='contained'
                        className={styles.continueButton}
                        disabled={isLoadingAuth}
                        startIcon={<TwitchIcon />}
                        onClick={handleSignInClick}>
                        {!isLoadingAuth ?
                            'Sign in with Twitch'
                            :
                            'Loading...'
                        }
                    </Button>
                </div>
            </Grid>
            <Grid item md='3' />
            <CustomDialog
                open={openTermsAndConditionsDialog}
                onClose={closeTermsAndConditionsModal}>
                <DialogTitle>AVISO PARA MEJORAR LA EXPERIENCIA DENTRO DE QAPLA (BETA)</DialogTitle>
                <DialogContent>
                <DialogContentText style={{ color: '#FFF' }}>
                    CAMBIOS Y PERMISOS
                    <br/>
                    <br/>
                    Informamos por este medio a toda nuestra Comunidad Streamer que a partir de hoy y en los próximos días, con la finalidad de ofrecer una mejor experiencia dentro de Qapla, se realizarán algunas pruebas y cambios en las herramientas que se utilizan, lo cual puede conllevar a la adecuación en la configuración de la cuentas de TWITCH de los STREMEARS  por parte de QAPLA.
                    <br/>
                    <br/>
                    <br/>
                    Lo anterior, únicamente para mejorar el rendimiento del uso de QAPLA por parte de la comunidad STREAMER teniendo como consecuencia beneficios y mejoras.
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <ContainedButton variant='outlined' onClick={closeTermsAndConditionsModal} color="primary">
                    Cancelar
                </ContainedButton>
                <ContainedButton variant='outlined' onClick={signIn} color="primary" autoFocus>
                    Aceptar
                </ContainedButton>
                </DialogActions>
            </CustomDialog>
        </StreamerDashboardContainer>
    );
}

export default StreamersSignin;