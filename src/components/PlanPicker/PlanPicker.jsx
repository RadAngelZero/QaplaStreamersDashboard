import React, { useState, useEffect } from 'react';
import { makeStyles, Button, Box, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import styles from './PlanPicker.module.css';
import { getSubscriptionsDetails } from '../../services/database';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { MONTHLY, QUARTERLY, YEARLY } from '../../utilities/Constants';

import CardsPayments from '../CardsPayments/CardsPayments'
import { getCurrentLanguage } from '../../utilities/i18n';

const useStyles = makeStyles(() => ({
    toggleButton: {
        borderRadius: '6px',
        margin: '0px 2px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '14px',
        padding: '12px 24px',
        lineHeight: 'normal',
        textTransform: 'none',
        minWidth: '114px',
        letterSpacing: '-0.34px'
    },
    cardGridItem: {
        margin: '0px 27px',
        maxWidth: '430px',
    },
    essentialPlanContainer: {
        background: '#141833',
        borderRadius: 20
    },
    growthPlanContainer: {
        background: '#3B4BF9',
        borderRadius: 20
    },
    planBody: {
        padding: '40px',
        paddingBottom: '0px'
    },
    subscribeButton: {
        height: '52px',
        width: '260px',
        lineHeight: '17px',
        fontSize: '14px',
        fontWeight: 700,
        padding: '0px',
        borderRadius: '10px',
        letterSpacing: '-0.23px'
    }
}));

const ToggleButton = ({ currentValue, value, label, onChange }) => {
    const classes = useStyles();
    const active = currentValue === value;

    const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

    return (
        <Button
            className={classes.toggleButton}
            style={{ background: active ? '#141833' : 'transparent', color: active ? '#FFF' : 'rgba(255, 255, 255, .6)' }}
            onClick={() => onChange(value)}>
            {capitalizeFirstLetter(label)}
        </Button>
    );
};

const PlanPicker = ({ user }) => {
    const [subscriptions, setSubscriptions] = useState({});
    const [period, setPeriod] = useState(QUARTERLY);
    const { t } = useTranslation();
    const classes = useStyles();

    useEffect(() => {
        async function loadSubscriptions() {
            const subscriptions = await getSubscriptionsDetails();

            if (subscriptions.exists()) {
                setSubscriptions(subscriptions.val());
            }
        }

        if (user) {
            loadSubscriptions();
        }
    }, [user]);

    const renderTotalPayment = (period, monthlyAmount) => {
        let totalPayment = 0;
        if (period === QUARTERLY) {
            totalPayment = monthlyAmount * 3;
        } else if (period === YEARLY) {
            totalPayment = monthlyAmount * 12;
        }

        return (
            `${t('PlanPicker.totalPeriodPayment', { totalPayment: Number.isInteger(totalPayment) ? totalPayment : totalPayment.toFixed(2) })} ${t(`PlanPicker.plansPeriods.${period}`)}.`
        );
    }

    const userLanguage = getCurrentLanguage();
    return (
        <StreamerDashboardContainer user={user} containerStyle={styles.backgroundContainer}>
            <div className={styles.backgroundFilter}/>
            <Box display='flex' alignItems='center' justifyContent='center'>
                {user &&
                    <h1 className={styles.title}>
                        {!user.freeTrial ?
                            t('PlanPicker.titlePart1')
                            :
                            t('PlanPicker.titlePart1FreeTrial')
                        }
                        {' '}
                        {t('PlanPicker.titlePart2')}
                    </h1>
                }
            </Box>
            <Box display='flex' alignItems='center' justifyContent='center'>
                {Object.keys(subscriptions).map((subscriptionType) => (
                    <ToggleButton key={subscriptionType}
                        currentValue={period}
                        value={subscriptions[subscriptionType].title['en'].toLowerCase()}
                        label={t(`PlanPicker.plansPeriods.${subscriptions[subscriptionType].title['en'].toLowerCase()}`)}
                        onChange={setPeriod} />
                ))}
            </Box>
            <Grid container spacing={0}  className={styles.plansContainer} justify='center'>
                <CardsPayments
                    title={'Basic'}
                    textButon={'Current'}
                    subtitle={'Free forever'}
                    backgroundButon={'#141833'}
                    colorTextButon={'#FFFFFF'}
                    price={0}
                    disableButton
                    period={period}
                    items={[{ text: 'Qapla Reactions' }, { text: 'Qoins cash out' }]} />
                {subscriptions[period] && Object.keys(subscriptions[period].packages).map((plan) => (
                    <form action='https://us-central1-qapplaapp.cloudfunctions.net/streamerSubscriptionCheckoutIntent' method='post'>
                        <CardsPayments backgroundCards={plan === 'growth' ? '#3B4BF9' : '#141833'}
                            title={subscriptions[period].packages[plan].title[userLanguage]}
                            textButon={plan === 'growth' ? t('PlanPicker.rewardYourCommunity') : t('PlanPicker.getVisibility')}
                            subtitle={period === MONTHLY ? `${t('PlanPicker.payment')} ${t(`PlanPicker.plansPeriods.${period}`)}` : renderTotalPayment(period, subscriptions[period].packages[plan].cost)}
                            paymentPerMonth={period === MONTHLY ? '' : t('PlanPicker.saving', { saving: subscriptions[period].packages[plan].saving })}
                            backgroundButon={plan === 'growth' ? '#0AFFD2' : '#6C5DD3'}
                            colorTextButon={plan === 'growth' ? '#4E2D92' : '#FFF'}
                            price={subscriptions[period].packages[plan].cost}
                            items={[
                                { text: t('PlanPicker.drops', { numberOfDrops: plan === 'growth' ? 400 : 200 }), color:'#0AFFD2' },
                                { text: t('PlanPicker.postAlways') },
                                { text: t('PlanPicker.qaplaReactions') },
                                { text: t('PlanPicker.cashOut') }
                            ]} />
                        <input type='hidden' name='uid' value={user.uid} />
                        <input type='hidden' name='stripeCustomerId' value={user.stripeCustomerId || ''} />
                        <input type='hidden' name='email' value={user.email} />
                        <input type='hidden' name='lookupKey' value={subscriptions[period].packages[plan].lookupKey} />
                        <input type='hidden' name='plan' value={plan} />
                        <input type='hidden' name='interval' value={period} />
                    </form>
                ))}
            </Grid>
        </StreamerDashboardContainer>
    );
}

export default PlanPicker;
