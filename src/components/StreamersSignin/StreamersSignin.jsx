import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
    Grid,
    Button,
    Icon
} from '@material-ui/core';

import { ReactComponent as TwitchIcon } from './../../assets/twitchIcon.svg';
import { ReactComponent as QaplaIcon } from './../../assets/QaplaGamingLandingPage.svg';
import styles from './StreamersSignin.module.css';
import RoomGame from './../../assets/room-game.png';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { signInWithTwitch } from '../../services/auth';
import { streamerProfileExists, createStreamerProfile } from '../../services/database';
import { auth } from '../../services/firebase';

const StreamersSignin = ({ title }) => {
    const [isLoadingAuth, setIsLoadingAuth] = useState(false);
    const history = useHistory();
    const { inviteCode } = useParams();

    const SignIn = async () => {
        setIsLoadingAuth(true);
        const user = await signInWithTwitch();
        if (!(await streamerProfileExists(user.firebaseAuthUser.user.uid))) {
            if (inviteCode) {
                await createStreamerProfile(user.firebaseAuthUser.user.uid, user.userData, inviteCode);
                history.push('/profile');
            } else {
                const user = auth.currentUser;
                await user.delete();
                alert('Requieres un codigo de invitación para acceder');
            }
        } else {
            history.push('/profile');
        }
        setIsLoadingAuth(false);
    }

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
                        onClick={SignIn}>
                        {!isLoadingAuth ?
                            'Sign in with Twitch'
                            :
                            'Loading...'
                        }
                    </Button>
                </div>
            </Grid>
            <Grid item md='3' />
        </StreamerDashboardContainer>
    );
}

export default StreamersSignin;