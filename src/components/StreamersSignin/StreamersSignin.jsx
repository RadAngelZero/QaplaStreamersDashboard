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
import { ReactComponent as QaplaGaming } from './../../assets/QaplaGamingLandingPage.svg';
import styles from './StreamersSignin.module.css';
import SignInImage from './../../assets/SignIn.png';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { signInWithTwitch, signUpOrSignInTwitchUser } from '../../services/auth';
import { getUserToken, subscribeStreamerToTwitchWebhook, subscribeStreamerToMailerLiteGroup } from '../../services/functions';
import { createStreamerProfile, getInteractionsRewardData, getNumberOfVisits, getStreamerDeepLink, setVisitsCounter, updateStreamerProfile, userHasPublicProfile } from '../../services/database';
import { webhookStreamOffline, webhookStreamOnline } from '../../utilities/Constants';
import { getTwitchUserData } from '../../services/twitch';

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

                        await subscribeStreamerToTwitchWebhook(user.userData.id, webhookStreamOnline.type, webhookStreamOnline.callback);
                        await subscribeStreamerToTwitchWebhook(user.userData.id, webhookStreamOffline.type, webhookStreamOffline.callback);
                        await createStreamerProfile(user.firebaseAuthUser.user.uid, user.userData);
                    }

                    try {
                        await updateStreamerProfile(user.firebaseAuthUser.user.uid, {
                            twitchAccessToken: tokenData.data.access_token,
                            refreshToken: tokenData.data.refresh_token,
                            displayName: user.userData.displayName,
                            photoUrl: user.userData.photoUrl,
                            broadcasterType: user.userData.broadcasterType
                        });
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    alert(t('StreamersSignin.alerts.errorSignIn'));
                }
            }
        }
        async function redirectUser(uid) {
            const interactionsRewardData = await getInteractionsRewardData(uid);
            if (interactionsRewardData.exists()) {
                const userHasProfile = await userHasPublicProfile(uid);
                const userHasLink = await getStreamerDeepLink(uid);

                /**
                 * This flag ensures that the next time the user enters after creating their interactions reward they will be redirected
                 * to create their profile
                 */
                const userHasBeenRedirectedToCreateProfile = localStorage.getItem('userHasBeenRedirectedToCreateProfile');

                // We use this to know if the user must be redirected again to create a profile
                const numberOfTimesUserEnterDashboard = await getNumberOfVisits(uid);
                await setVisitsCounter(uid, numberOfTimesUserEnterDashboard.val() < 2 ? numberOfTimesUserEnterDashboard.val() + 1 : 0);

                if (userHasBeenRedirectedToCreateProfile && numberOfTimesUserEnterDashboard.val() < 2) {
                    history.push('/profile');
                } else {
                    if ((userHasProfile && userHasLink.exists()) || numberOfTimesUserEnterDashboard.val() < 2) {
                        history.push('/profile');
                    } else {
                        history.push('/editProfile');
                        localStorage.setItem('userHasBeenRedirectedToCreateProfile', 'true');
                    }
                }
            } else {
                history.push('/profile');
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
                <Grid item md='1' />
                <Grid item md='6' className={styles.mainContainer}>
                    <QaplaGaming style={{ marginTop: '100px', marginBottom: '80px', transform: 'scale(0.9)' }} />
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
                        <p style={{ marginTop: '38px', color: '#FFF', fontSize: '.8rem' }}>
                            {t('StreamersSignin.termsAndConditionsP1')}
                            <a style={{ cursor: 'pointer', color: '#3B4BF9' }} href={t('Onboarding.termsOfUseUrl')} target='_blank' rel="noreferrer">
                                {t('StreamersSignin.termsAndConditionsP2')}
                            </a>
                        </p>
                    </div>
                    <Hidden smDown>
                        <div className={styles.bottomImage} >
                            <img src={SignInImage} alt='Sign In' />
                        </div>
                    </Hidden>
                </Grid>
                <Grid item md='1' />
            </StreamerDashboardContainer>
        );
    }

    // return null;
// }

export default StreamersSignin;