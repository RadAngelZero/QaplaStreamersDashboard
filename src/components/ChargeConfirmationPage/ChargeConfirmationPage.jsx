import React, { useState, useEffect, useMemo } from 'react';
import { Button, Card, CardContent, Grid, makeStyles } from '@material-ui/core';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ESvg } from './../../assets/g.svg';
import {ReactComponent as Closeicon} from './../../assets/Closeicono.svg'
import HeartHands from './../../assets/HeartHands.png';
import { getSubscriptionPurchaseDetails } from '../../services/database';

const useStyles = makeStyles(() => ({
    container: {
        height: '100vh'
    },
    paymentInfoContainer: {
        paddingLeft: 50,
        paddingRight: 64,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    eImageContainer: {
        display: 'flex',
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#141833',
        justifyContent: 'center',
        alignItems: 'center'
    },
    subscriptionBought: {
        marginTop: 48,
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, .6)'
    },
    subTerms: {
        marginTop: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    totalPaid: {
        fontSize: 48,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, .9)',
        lineHeight:'58.09px'
    },
    interval: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, .6)'
    },
    paymentDetails: {
        marginTop: 48,
        display: 'flex',
        justifyContent: 'space-between',
        maxWidth:'750px'
    },
    subscriptionType: {
        fontSize: 18,
        fontWeight: '500',
        color: '#FFF'
    },
    paymentInterval: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, .6)'
    },
    itemCost: {
        fontSize: 18,
        fontWeight: '500',
        color: '#FFF'
    },
    paymentUntilTodayContainer: {
        marginTop: 56,
        color: '#FFF',
        display: 'flex',
        justifyContent: 'space-between',
        maxWidth:'750px'
    },
    paymentUntilToday: {
        fontSize: 24,
        fontWeight: '500'
    },
    thanksCardContainer: {
        width: '450px',
        background: 'linear-gradient(128.22deg, #5600E1 23.87%, #B518FF 87.87%), rgba(3, 7, 34, 0.95)',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    thanksCard: {
        backgroundColor: '#141833',
        display: 'inline-block',
        color: '#FFF',
        maxWidth: '80%',
        borderRadius: 35
    },
    cardContentContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 30,
        paddingRight: 30,
        maxWidth:'450px'
    },
    thanksTitle: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center'
    },
    thanksDescription: {
        marginTop: 24,
        fontSize: 14,
        fontWeight: '500',
        lineHeight: '22px',
        textAlign: 'center',
        marginRight: 48,
        marginLeft: 48
    },
    publishButton: {
        marginTop: 64,
        marginLeft: 30,
        marginRight: 30,
        backgroundColor: '#0AFFD2',
        borderRadius: 10,
        color: '#4E2D92',
        fontSize: 16,
        fontWeight: '700',
        paddingTop: 19,
        paddingBottom: 19,
        '&:hover': {
            backgroundColor: '#0AFFD2',
            opacity: '.95'
        }
    },
    backToDashboardButton: {
        marginTop: 16,
        marginBottom: 16,
        fontSize: 16,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, .6)'
    },
    buttonClose:{
       position: 'absolute',
       top:'0px',
       left:'-10px',
    },

    paymentPolicy:{
          marginTop:'80px'
    },
    textPaymentPolicy:{
       color: '#FFFFFF',
       opacity: '0.6',
       fontWeight:'500',
       fontSize: '12px',
       lineHeight: '15px',
       letterSpacing:'0.5px'
    }
}));

function useQuery() {
    const { search } = useLocation();

    return useMemo(() => new URLSearchParams(search), [search]);
}

const ChargeConfirmationPage = ({ user }) => {
    const [totalPaid, setTotalPaid] = useState(0);
    const [interval, setInterval] = useState('');
    const [intervalText, setIntervalText] = useState('monthly');
    const [plan, setPlan] = useState('');
    const classes = useStyles();
    const history = useHistory();
    const query = useQuery();
    const { t } = useTranslation();

    useEffect(() => {
        async function getDetails() {
            const id = query.get('subscriptionId');
            const details = await getSubscriptionPurchaseDetails(user.uid, id);
            setTotalPaid(details.val().totalPaid);

            setPlan(details.val().plan[0].toUpperCase() + details.val().plan.substring(1));

            setIntervalText(details.val().interval);

            setInterval(t(`ChargeConfirmationPage.intervals.${details.val().interval}`));
        }

        if (user && user.uid) {
            getDetails();
        }
    }, [user]);

    const onPublishStreamClick = () => {
        history.push('/create');
    }

    const onBackToDashboardClick = () => {
        history.push('/profile');
    }

    return (
        <Grid container alignContent='center' className={classes.container}>
            <Grid item md={6} className={classes.paymentInfoContainer}>
                <Button className={classes.buttonClose}>
                    <Closeicon />
                    </Button>
                <div className={classes.eImageContainer}>
                    <ESvg />
                </div>
                <p className={classes.subscriptionBought}>
                    {plan && intervalText &&
                        `Sub ${plan} ${t(`ChargeConfirmationPage.plansPeriods.${intervalText}`)}`
                    }
                </p>
                <div className={classes.subTerms}>
                    <p className={classes.totalPaid}>
                        ${(totalPaid).toFixed(2)}
                    </p>
                    <p className={classes.interval}>
                        {interval}
                    </p>
                </div>
                <div className={classes.paymentDetails}>
                    <div>
                        <p className={classes.subscriptionType}>
                            {plan}
                        </p>
                        <p className={classes.paymentInterval}>
                            {intervalText &&
                                `${t('ChargeConfirmationPage.payment')} ${t(`ChargeConfirmationPage.plansPeriods.${intervalText}`)}`
                            }
                        </p>
                    </div>
                    <p className={classes.itemCost}>
                        ${(totalPaid).toFixed(2)}
                    </p>
                </div>
                <div className={classes.paymentUntilTodayContainer}>
                    <p className={classes.paymentUntilToday}>
                        {t(`ChargeConfirmationPage.fullPaymentUntilToday`)}
                    </p>
                    <p className={classes.paymentUntilToday}>
                        ${(totalPaid).toFixed(2)}
                    </p>
                </div>
                <div className={classes.paymentPolicy}>
                    <p className={classes.textPaymentPolicy}>Powered by Stripe | Terms Privacy</p>
                </div>
            </Grid>
            <Grid item md={6} className={classes.thanksCardContainer}>
                <Card className={classes.thanksCard}>
                    <div className={classes.cardContentContainer}>
                        <img src={HeartHands} />
                        <CardContent>
                            <p className={classes.thanksTitle}>
                                {t('ChargeConfirmationPage.thanksForSubscribing')}
                            </p>
                            <p className={classes.thanksDescription}>
                                {t('ChargeConfirmationPage.paymentProcessedSuccessfuly')}
                            </p>
                        </CardContent>
                        <Button fullWidth variant='contained'
                            className={classes.publishButton}
                            onClick={onPublishStreamClick}>
                            {t('ChargeConfirmationPage.publishStream')}
                        </Button>
                        <Button className={classes.backToDashboardButton}
                            onClick={onBackToDashboardClick}>
                            {t('ChargeConfirmationPage.backToDashboard')}
                        </Button>
                    </div>
                </Card>
            </Grid>
        </Grid>
    );
}

export default ChargeConfirmationPage;