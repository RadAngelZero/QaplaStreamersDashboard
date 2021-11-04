import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
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
import { signInWithTwitch } from '../../services/auth';
import { streamerProfileExists, createStreamerProfile, updateStreamerProfile, getInvitationCodeParams } from '../../services/database';
import { auth } from '../../services/firebase';
import { subscribeStreamerToTwitchWebhook } from '../../services/functions';
import { webhookStreamOffline, webhookStreamOnline } from '../../utilities/Constants';

var utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const CustomDialog = withStyles((theme) => ({
    paper: {
        backgroundColor: '#0D1021',
        color: '#FFF'
    }
}))(Dialog);

const StreamersSignin = ({ title }) => {
    const [isLoadingAuth, setIsLoadingAuth] = useState(false);
    const [openTermsAndConditionsDialog, setOpenTermsAndConditionsDialog] = useState(false);
    const history = useHistory();
    const { inviteCode } = useParams();

    const signIn = async () => {
        closeTermsAndConditionsModal();
        setIsLoadingAuth(true);
        const user = await signInWithTwitch();
        localStorage.setItem('twitchPermission', 'channel:read:redemptions');
        localStorage.setItem('termsAndConditions', 'true');
        if (!(await streamerProfileExists(user.firebaseAuthUser.user.uid))) {
            const invitationCodeSnap = await getInvitationCodeParams(inviteCode);
            if (inviteCode && invitationCodeSnap.exists()) {
                await createStreamerProfile(user.firebaseAuthUser.user.uid, user.userData, inviteCode);
                if (invitationCodeSnap.val().freeTrial && invitationCodeSnap.val().subscriptionDetails) {
                    const startDate = dayjs.utc().toDate().getTime();
                    const endDate = dayjs.utc().add(1, 'month').endOf('day').toDate().getTime();
                    await updateStreamerProfile(user.firebaseAuthUser.user.uid, {
                        freeTrial: true,
                        premium: true,
                        currentPeriod: { startDate, endDate },
                        subscriptionDetails: invitationCodeSnap.val().subscriptionDetails
                    });
                }
                await subscribeStreamerToTwitchWebhook(user.userData.id, webhookStreamOnline.type, webhookStreamOnline.callback);
                await subscribeStreamerToTwitchWebhook(user.userData.id, webhookStreamOffline.type, webhookStreamOffline.callback);
                history.push('/profile');
            } else {
                const user = auth.currentUser;
                await user.delete();
                alert('Requieres un codigo de invitación para acceder');
            }
        } else {
            await updateStreamerProfile(user.firebaseAuthUser.user.uid, user.userData);
            history.push('/profile');
        }
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