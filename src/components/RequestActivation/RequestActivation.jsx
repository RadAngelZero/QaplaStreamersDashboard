import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles, Card, Button, CardContent, CircularProgress } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { ReactComponent as CloseIcon } from './../../assets/CloseIcon.svg';
import { activateUserFreeTrial } from '../../services/functions';

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
        marginTop: 24,
        fontWeight: '600',
        fontSize: '16px',
        lineHeight: '22px',
        textAlign: 'center',
        color: '#FFF',
        whiteSpace: 'pre-line'
    },
    activeFreeTrialButton: {
        marginTop: 56,
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
        marginBottom: 16
    },
    benefits: {
        listStyleType: 'none',
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500'
    }
}));

const RequestActivation = ({ user }) => {
    const [activating, setActivating] = useState(false);
    const history = useHistory();
    const classes = useStyles();
    const { t } = useTranslation();

    const activateFreeTrial = async () => {
        setActivating(true);

        // User never has been premium and has never used a Free Trial
        if (user.premium === undefined && user.freeTrial === undefined) {
            const activation = await activateUserFreeTrial(user.uid, user.email);
            if (activation.data) {
                history.push('/create');
            } else {
                setActivating(false);
            }
        } else {
            console.log('You already did your Free Trial');
        }
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
                            {t('RequestActivation.title')}
                        </p>
                        <p className={classes.instructions}>
                                {t('RequestActivation.startTrial')}
                                <span style={{ color: '#00FFDD' }}>
                                    {t('RequestActivation.noCardRequired')}
                                </span>
                        </p>
                        <ul className={classes.benefits}>
                            <li>
                                <p>
                                    {t('RequestActivation.drops')}
                                </p>
                            </li>
                            <li>
                                <p style={{ marginTop: 16 }}>
                                    {t('RequestActivation.customAlerts')}
                                </p>
                            </li>
                            <li>
                                <p style={{ marginTop: 16 }}>
                                    {t('RequestActivation.visibility')}
                                </p>
                            </li>
                        </ul>
                        <Button
                            onClick={activateFreeTrial}
                            fullWidth
                            disabled={activating}
                            classes={{
                                root: classes.activeFreeTrialButton
                            }}>
                            {activating ?
                                <CircularProgress style={{ color: '#FFF' }} />
                                :
                                t('RequestActivation.startFreeTrial')
                            }
                        </Button>
                    </CardContent>
                </Card>
                </div>
            </div>
        </StreamerDashboardContainer>
    );
}

export default RequestActivation;
