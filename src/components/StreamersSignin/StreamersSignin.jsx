import React, { useState, useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
    Grid,
    Button
} from '@material-ui/core';
import dayjs from 'dayjs';

import { ReactComponent as TwitchIcon } from './../../assets/twitchIcon.svg';
import { ReactComponent as QaplaIcon } from './../../assets/QaplaGamingLandingPage.svg';
import styles from './StreamersSignin.module.css';
import RoomGame from './../../assets/room-game.png';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { getTwitchUserData, signInWithTwitch, signUpOrSignInTwitchUser } from '../../services/auth';
import { getUserToken } from '../../services/functions';
import { createStreamerProfile, updateStreamerProfile } from '../../services/database';
import QaplaTerms from '../QaplaTerms/QaplaTerms';

var utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

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
                        await createStreamerProfile(user.firebaseAuthUser.user.uid, user.userData);
                    }
                    await updateStreamerProfile(user.firebaseAuthUser.user.uid, { termsAndConditions: true, twitchAccessToken: tokenData.data.access_token, refreshToken: tokenData.data.refresh_token });
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

    const signIn = () => {
        setIsLoadingAuth(true);
        signInWithTwitch();
        setIsLoadingAuth(false);
    }

    const closeTermsAndConditionsModal = () => setOpenTermsAndConditionsDialog(false);

    if (user === undefined) {
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
                <Grid item md='6'>
                    <p className={styles.getStarted}>
                        {title}
                    </p>
                    <div className={styles.formContainer}>
                        <Button variant='contained'
                            className={styles.continueButton}
                            disabled={isLoadingAuth}
                            startIcon={<TwitchIcon />}
                            onClick={signIn}>
                            {!isLoadingAuth ?
                                'Sign in with Twitch'
                                :
                                'Loading...'
                            }
                        </Button>
                        <p style={{ marginTop: 16, color: '#FFF', fontSize: '.8rem' }}>
                            Al presionar Sign in with Twitch, aceptas nuestros <u style={{ cursor: 'pointer', color: '#3B4BF9' }} onClick={() => setOpenTermsAndConditionsDialog(true)}>Terminos y condiciones</u>
                        </p>
                    </div>
                </Grid>
                <Grid item md='1' />
                <QaplaTerms open={openTermsAndConditionsDialog} onClose={closeTermsAndConditionsModal} />
            </StreamerDashboardContainer>
        );
    }

    return null;
}

export default StreamersSignin;