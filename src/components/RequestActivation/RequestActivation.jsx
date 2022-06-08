import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles, Card, Button, CardContent, CircularProgress } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { ReactComponent as CloseIcon } from './../../assets/CloseIcon.svg';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { getInvitationCodeParams, getQlanIdWithQreatorCode, getUserDisplayName, giveReferrerRewardsToStreamer, removeInvitationCode, updateStreamerProfile, updateUserStreamerPublicData } from '../../services/database';
import { notifyActivationWithReferralCode } from '../../services/discord';

const useStyles = makeStyles((theme) => ({
    containerStyle: {
        padding: 0
    },
    background: {
        background: 'conic-gradient(from 134.88deg at 50.55% 49.24%, #5600E1 -61.47deg, #373FFF 26.68deg, #A534FE 167.74deg, #B518FF 197.3deg, #5600E1 298.53deg, #373FFF 386.68deg), linear-gradient(0deg, rgba(3, 7, 34, 0.95), rgba(3, 7, 34, 0.95))',
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center'
    },
    card: {
        backgroundColor: '#141833',
        boxShadow: '0px 4px 100px 15px rgba(0, 0, 0, 0.25)',
        borderRadius: '35px',
        [theme.breakpoints.up('md')]: {
            width: 450
        },
        paddingLeft: 30,
        paddingRight: 30,
        paddingTop: 24,
        paddingBottom: 0
    },
    title: {
        fontWeight: '600',
        fontSize: '18px',
        lineHeight: '32px',
        textAlign: 'center',
        color: '#FFFFFF',
        whiteSpace: 'pre-line'
    },
    instructions: {
        marginTop: 15,
        fontWeight: '400',
        fontSize: '14px',
        lineHeight: '22px',
        textAlign: 'center',
        color: '#8F9BBA',
        whiteSpace: 'pre-line'
    },
    textInput: {
        textAlign: 'center',
        paddingTop: 12,
        paddingBottom: 12
    },
    activeFreeTrialButton: {
        marginTop: 32,
        backgroundColor: '#3B4BF9',
        height: '56px',
        borderRadius: '16px',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '20px',
        letterSpacing: '0px',
        color: '#FFF',
        textTransform: 'none',
        boxShadow: '0px 20px 40px -10px rgba(59, 75, 249, 0.4)',
        '&:hover': {
            background: '#2E3AC1',
        },
        '&:active': {
            background: '#2E3AC1',
            opacity: '0.9'
        },
        marginBottom: 60
    },
    noCode: {
        textAlign: 'center',
        width: '100%',
        marginTop: 32,
        fontWeight: '600',
        fontSize: '16px',
        lineHeight: '22px',
        letterSpacing: '0.492px',
        color: '#FFFFFF'
    },
    referralProgram: {
        textAlign: 'center',
        [theme.breakpoints.up('md')]: {
            maxWidth: 450
        },
        paddingLeft: 30,
        paddingRight: 30,
        marginTop: 32,
        fontWeight: '400',
        fontSize: '16px',
        lineHeight: '22px',
        letterSpacing: '0.492px',
        color: '#FFFFFF'
    },
    subscribeButton: {
        marginTop: 40,
        backgroundColor: '#00FFDD',
        height: '56px',
        borderRadius: '16px',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '20px',
        letterSpacing: '0px',
        color: '#0D1021',
        textTransform: 'none',
        boxShadow: '0px 20px 40px -10px rgba(0, 255, 221, 0.2)',
        '&:hover': {
            backgroundColor: '#00EACB'
        },
        '&:active': {
            backgroundColor: '#00EACB',
            opacity: '0.9'
        }
    },
    subscribeButtonCointainer: {
        marginBottom: 24,
        marginTop: 180
    }
}));

const RequestActivation = ({ user, onSuccessActivation }) => {
    const [referralCode, setReferralCode] = useState('');
    const [validatingCode, setValidatingCode] = useState(false);
    const history = useHistory();
    const classes = useStyles();
    const { t } = useTranslation();

    const validateCode = async () => {
        if (user.broadcasterType === '') {
            return alert(t('NewStream.alerts.noChannelPoints'));
        }

        setValidatingCode(true);
        if (referralCode) {
            const referrerUid = await getQlanIdWithQreatorCode(referralCode);
            if (referrerUid) {
                if (!user.referredBy) {
                    activateFreeTrialWithReferralCode(referrerUid, {
                        redemptionsPerStream: 40,
                        streamsIncluded: 2
                    });
                } else {
                    setValidatingCode(false);
                    alert('Ya usaste un código de referido antes');
                }
            } else {
                const invitationCodeSnap = await getInvitationCodeParams(referralCode);
                if (invitationCodeSnap.exists()) {
                    if (invitationCodeSnap.val().freeTrial && invitationCodeSnap.val().subscriptionDetails) {
                        activateFreeTrialWithInvitationCode(referralCode, invitationCodeSnap.val());
                    }
                } else {
                    setValidatingCode(false);
                    alert('Código invalido');
                }
            }
        } else {
            setValidatingCode(false);
        }
    }

    const activateFreeTrialWithReferralCode = async (referrerUid, freeTrialInformation) => {
        const startDate = dayjs.utc().toDate().getTime();
        const endDate = dayjs.utc().add(1, 'month').endOf('day').toDate().getTime();
        await updateStreamerProfile(user.uid, {
            referredBy: referrerUid,
            freeTrial: true,
            premium: true,
            currentPeriod: { startDate, endDate },
            subscriptionDetails: freeTrialInformation
        });

        await updateUserStreamerPublicData(user.uid, {
            premium: true
        });

        await giveReferrerRewardsToStreamer(referrerUid, user.displayName, endDate);

        const referrerDisplayName = await getUserDisplayName(referrerUid);

        await notifyActivationWithReferralCode(referrerDisplayName.val(), user.displayName);

        await onSuccessActivation();
        setValidatingCode(false);
    }

    const activateFreeTrialWithInvitationCode = async (code, freeTrialInformation) => {
        const startDate = dayjs.utc().toDate().getTime();
         const endDate = dayjs.utc().add(1, 'month').endOf('day').toDate().getTime();
         await updateStreamerProfile(user.uid, {
            freeTrial: true,
            premium: true,
            currentPeriod: { startDate, endDate },
            subscriptionDetails: freeTrialInformation.subscriptionDetails
        });

        await updateUserStreamerPublicData(user.uid, {
            premium: true
        });

        await removeInvitationCode(code);
        await onSuccessActivation();
        setValidatingCode(false);
    }

    return (
        <StreamerDashboardContainer user={user} containerStyle={classes.containerStyle}>
            <div className={classes.background}>
                <div>
                <Card className={classes.card}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <CloseIcon onClick={() => history.goBack()} style={{ cursor: 'pointer' }} />
                    </div>
                    <CardContent>
                        <p className={classes.title}>
                            {t('RequestActivation.title')} 🚀
                        </p>
                        <p className={classes.instructions}>
                            {validatingCode || !user.referredBy ?
                                <>
                                    {t('RequestActivation.descriptionP1')}
                                    <b style={{ color: '#FFF' }}>{t('RequestActivation.descriptionHiglight')}</b>
                                    {t('RequestActivation.descriptionP2')}
                                </>
                                :
                                t('RequestActivation.buyAMembership')
                            }
                        </p>
                        {validatingCode || !user.referredBy ?
                            <>
                                <StreamerTextInput
                                    placeholder={t('RequestActivation.referralCode')}
                                    fullWidth
                                    containerStyle={{ marginTop: 24 }}
                                    classes={{ input: classes.textInput }}
                                    textInputStyle={{ background: '#202750', borderRadius: '16px' }}
                                    value={referralCode}
                                    onChange={(e) => setReferralCode(e.target.value)} />
                                {validatingCode ?
                                    <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center', marginTop: 32 }}>
                                        <CircularProgress style={{ color: '#3B4BF9' }} />
                                    </div>
                                    :
                                    <Button
                                        onClick={validateCode}
                                        fullWidth
                                        classes={{
                                            root: classes.activeFreeTrialButton
                                        }}>
                                        {t('RequestActivation.startFreeTrial')}
                                    </Button>
                                }
                            </>
                            :
                            <div className={classes.subscribeButtonCointainer}>
                                <Button
                                    fullWidth
                                    onClick={() => history.push('/membership')}
                                    classes={{ root: classes.subscribeButton }}>
                                    {t('RequestActivation.subscribe')}
                                </Button>
                            </div>
                        }
                    </CardContent>
                </Card>
                {validatingCode || !user.referredBy ?
                    <>
                        <p className={classes.noCode}>
                            {t('RequestActivation.dontHaveACode')}
                        </p>
                        <Button
                            fullWidth
                            onClick={() => history.push('/membership')}
                            classes={{ root: classes.subscribeButton }}>
                            {t('RequestActivation.subscribe')}
                        </Button>
                    </>
                    :
                    <p className={classes.referralProgram}>
                        {t('RequestActivation.referralProgramP1')}
                        <b style={{ color: '#FFF' }}>{t('RequestActivation.qreatorCode')}</b>
                        {t('RequestActivation.referralProgramP2')}
                    </p>
                }
                </div>
            </div>
        </StreamerDashboardContainer>
    );
}

export default RequestActivation;
