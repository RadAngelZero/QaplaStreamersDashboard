import React, { useState, useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Grid,
    Button,
    Hidden
} from '@material-ui/core';
import dayjs from 'dayjs';

import { ReactComponent as TwitchIcon } from './../../assets/twitchIcon.svg';
import { ReactComponent as QaplaIcon } from './../../assets/QaplaGamingLandingPage.svg';
import { ReactComponent as QaplaGaming } from './../../assets/QaplaGamingLandingPage.svg';
import styles from './StreamersSignin.module.css';
import RoomGame from './../../assets/room-game.png';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { getTwitchUserData, signInWithTwitch, signUpOrSignInTwitchUser } from '../../services/auth';
import { getUserToken, subscribeStreamerToMailerLiteGroup } from '../../services/functions';
import { createStreamerProfile, updateStreamerProfile, userHasPublicProfile } from '../../services/database';
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
    const { t } = useTranslation();

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
                        try {
                            await subscribeStreamerToMailerLiteGroup(user.userData.email, user.userData.displayName);
                        } catch (error) {
                            console.error(error);
                        }

                        await createStreamerProfile(user.firebaseAuthUser.user.uid, user.userData);
                    }

                    try {
                        await updateStreamerProfile(user.firebaseAuthUser.user.uid, { twitchAccessToken: tokenData.data.access_token, refreshToken: tokenData.data.refresh_token });
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    alert('Hubo un problema al iniciar sesión, intentalo de nuevo o reportalo a soporte técnico');
                }
            }
        }
        async function redirectUser(uid) {
            const userHasBeenRedirectedToCreateProfile = localStorage.getItem('userHasBeenRedirectedToCreateProfile');

            if (userHasBeenRedirectedToCreateProfile) {
                history.push('/profile');
            } else {
                if (await userHasPublicProfile(uid)) {
                    history.push('/profile');
                } else {
                    history.push('/editProfile');
                    localStorage.setItem('userHasBeenRedirectedToCreateProfile', 'true');
                }
            }
        }

        checkIfUsersIsSigningIn();

        if (user) {
            redirectUser(user.uid);
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
                <Hidden smDown>
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
                </Hidden>
                <Grid item md='1' />
                <Grid item md='6' className={styles.mainContainer}>
                    <Hidden mdUp>
                        <QaplaGaming style={{marginTop: '8vh', marginBottom: '5vh', transform: 'scale(1.5)'}} />
                    </Hidden>
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
                                t('StreamersSignin.signIn')
                                :
                                t('StreamersSignin.loading')
                            }
                        </Button>
                        <p style={{ marginTop: 16, color: '#FFF', fontSize: '.8rem' }}>
                            {t('StreamersSignin.termsAndConditionsP1')}
                            <u style={{ cursor: 'pointer', color: '#3B4BF9' }} onClick={() => setOpenTermsAndConditionsDialog(true)}>
                                {t('StreamersSignin.termsAndConditionsP2')}
                            </u>
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