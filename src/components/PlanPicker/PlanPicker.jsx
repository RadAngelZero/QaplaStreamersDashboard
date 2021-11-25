import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles, Button, Box, Grid, Card, CardContent, CardActions } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { getSubscriptionsDetails } from '../../services/database';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import ContainedButton from '../ContainedButton/ContainedButton';
import SubscriptionCheckout from '../SubscriptionCheckout/SubscriptionCheckout';

const useStyles = makeStyles(() => ({
    toggleButton: {
        borderRadius: 6,
        margin: 5,
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 24,
        padding: '9px 30px',
        textTransform: 'none'
    },
    backgroundContainer: {
        background: 'linear-gradient(128.22deg, #5600E1 23.87%, #B518FF 87.87%), rgba(3, 7, 34, 0.95)',
        minHeight: '100vh'
    },
    title: {
        fontSize: 24,
        color: '#FFF',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: '30px'
    },
    plansContainer: {
        marginTop: 24,
        marginBottom: 40
    },
    cardGridItem: {
        paddingLeft: 48,
        paddingRight: 48
    },
    planTypeTitle: {
        fontWeight: 'bold',
        fontSize: '36px',
        lineHeight: '44px',
        color: '#FFF',
        textAlign: 'center'
    },
    planTypeDescription: {
        fontSize: '15px',
        lineHeight: '18px',
        color: '#FFF',
        mixBlendMode: 'normal',
        opacity: 0.6,
        textAlign: 'center',
        marginTop: 25,
        marginBottom: 20
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
        padding: 40
    },
    planTitle: {
        marginBottom: 64,
        width: 'fit-content'
    },
    planTitleText: {
        color: '#FFF',
        fontSize: 40,
        fontWeight: '700',
        lineHeight: '72px'
    },
    planTitleSmallElement: {
        clear: 'none',
        color: '#FFF',
        fontSize: 20,
        lineHeight: '30px'
    },
    planSavingContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 10,
        marginBottom: 42
    },
    planSavingPeriod: {
        fontSize: '13px',
        lineHeight: '16px',
        color: '#FFF',
        mixBlendMode: 'normal',
        opacity: 0.4
    },
    planSavingPercentage: {
        fontWeight: 600,
        fontSize: '13px',
        lineHeight: '16px',
        color: '#0AFFD2',
        marginLeft: 2
    },
    cents: {
        float: 'right'
    },
    benefitsList: {
        marginBottom: 36,
        paddingLeft: 0,
        listStyle: 'none'
    },
    listItemContainer: {
        marginBottom: 12,
        paddingBottom: 12
    },
    smallIcon: {
        width: 18,
        opacity: 0.4
    },
    listItemDescription: {
        marginLeft: 12,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    listItem: {
        fontSize: '15px',
        lineHeight: '18px',
        color: '#FFF',
    },
    growthExtraBenefit: {
        fontWeight: 600,
        fontSize: '15px',
        lineHeight: '18px',
        color: '#0AFFD2',
        marginLeft: 4
    },
    actionArea: {
        marginLeft: 40,
        marginBottom: 40
    },
    subscribeButton: {
        paddingLeft: 72,
        paddingRight: 72,
        paddingTop: 16,
        paddingBottom: 16
    },
    growthSubscribeButton: {
        backgroundColor: '#0AFFD2 !important',
        color: '#4E2D92'
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
    const [period, setPeriod] = useState('quarterly');
    const [selectedPlanBillingPageId, setSelectedPlanBillingPageId] = useState('');

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
        if (period === 'quarterly') {
            totalPayment = monthlyAmount * 3;
        } else if (period === 'yearly') {
            totalPayment = monthlyAmount * 12;
        }

        return (
            <p className={classes.planSavingPeriod}>
                {`${t('PlanPicker.totalPeriodPayment', { totalPayment: Number.isInteger(totalPayment) ? totalPayment : totalPayment.toFixed(2) })} ${t(`PlanPicker.plansPeriods.${period}`)}.`}
            </p>
        );
    }

    return (
        <StreamerDashboardContainer user={user} containerStyle={classes.backgroundContainer}>
            <Box display='flex' alignItems='center' justifyContent='center'>
                {user &&
                    <h1 className={classes.title}>
                        {!user.freeTrial ?
                            t('PlanPicker.titlePart1')
                            :
                            t('PlanPicker.titlePart1FreeTrial')
                        }
                        <br />
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
            <Grid container spacing={0} className={classes.plansContainer} justify='center'>
                {subscriptions[period] && Object.entries(subscriptions[period].packages).map((plan) => (
                    <Grid item sm={12} md={6} className={classes.cardGridItem} key={`${plan[0]}-${period}`}>
                        <h1 className={classes.planTypeTitle}>
                            {plan[0] === 'essential' ?
                                'Essential'
                                :
                                'Growth'
                            }
                        </h1>
                        <p className={classes.planTypeDescription}>
                            {t(`PlanPicker.plansDescriptions.${plan[0]}`)}
                        </p>
                        <Card className={plan[0] === 'essential' ? classes.essentialPlanContainer : classes.growthPlanContainer}>
                            <CardContent className={classes.planBody}>
                                <div className={classes.planTitle}>
                                    <div className={classes.planTitleText}>
                                        ${Number.isInteger(plan[1].cost) ? plan[1].cost : plan[1].cost.toString().substring(0, plan[1].cost.toString().indexOf('.') + 3)}
                                        <span className={classes.planTitleSmallElement}>
                                            /{t('PlanPicker.month')}
                                        </span>
                                    </div>
                                    <div className={classes.planSavingContainer}>
                                        {period === 'monthly' ?
                                            <p className={classes.planSavingPeriod}>
                                                {`${t('PlanPicker.payment')} ${t(`PlanPicker.plansPeriods.${period}`)}`}
                                                {plan[1].saving && '.'}
                                            </p>
                                            :
                                            renderTotalPayment(period, plan[1].cost)
                                        }
                                        {plan[1].saving &&
                                            <span className={classes.planSavingPercentage}>
                                                {t(`PlanPicker.saving`, { saving: plan[1].saving })}
                                            </span>
                                        }
                                    </div>
                                </div>
                                <div>
                                    <ul className={classes.benefitsList}>
                                        <li className={classes.listItemContainer}>
                                            <Box display='flex' flexDirection='row' alignItems='center'>
                                                <img src="https://uploads-ssl.webflow.com/6056686ebaee8b4212769569/6056686fbaee8b77b0769611_icon-check-small.svg" alt='' className={classes.smallIcon} />
                                                <div className={classes.listItemDescription}>
                                                    <div className={classes.listItem}>
                                                        {t('PlanPicker.monthlyPublications', { numberOfPublications: plan[1].streamsIncluded })}
                                                        {plan[0] === 'growth' && ` ${t('PlanPicker.with')}`}
                                                        {plan[0] === 'growth' &&
                                                            <span className={classes.growthExtraBenefit}>
                                                                {t('PlanPicker.doubleXQ')}
                                                            </span>
                                                        }
                                                    </div>
                                                </div>
                                            </Box>
                                        </li>
                                        <li className={classes.listItemContainer}>
                                            <Box display='flex' flexDirection='row' alignItems='center'>
                                                <img src="https://uploads-ssl.webflow.com/6056686ebaee8b4212769569/6056686fbaee8b77b0769611_icon-check-small.svg" alt='' className={classes.smallIcon} />
                                                <div className={classes.listItemDescription}>
                                                    <div className={classes.listItem}>
                                                        {t('PlanPicker.redemptions', { numberOfRedemptions: plan[1].redemptionsPerStream })}
                                                    </div>
                                                </div>
                                            </Box>
                                        </li>
                                        <li className={classes.listItemContainer}>
                                            <Box display='flex' flexDirection='row' alignItems='center'>
                                                <img src="https://uploads-ssl.webflow.com/6056686ebaee8b4212769569/6056686fbaee8b77b0769611_icon-check-small.svg" alt='' className={classes.smallIcon} />
                                                <div className={classes.listItemDescription}>
                                                    <div className={classes.listItem}>
                                                        {t('PlanPicker.cheers')}
                                                    </div>
                                                </div>
                                            </Box>
                                        </li>
                                        {plan[0] === 'growth' &&
                                            <li className={classes.listItemContainer}>
                                                <Box display='flex' flexDirection='row' alignItems='center'>
                                                    <img src="https://uploads-ssl.webflow.com/6056686ebaee8b4212769569/6056686fbaee8b77b0769611_icon-check-small.svg" alt='' className={classes.smallIcon} />
                                                    <div className={classes.listItemDescription}>
                                                        <div className={classes.listItem}>
                                                            {t('PlanPicker.extraPublications')}
                                                            <span className={classes.growthExtraBenefit}>
                                                                {t('PlanPicker.doubleXQ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Box>
                                            </li>
                                        }
                                        <li className={classes.listItemContainer}>
                                            <Box display='flex' flexDirection='row' alignItems='center'>
                                                <img src="https://uploads-ssl.webflow.com/6056686ebaee8b4212769569/6056686fbaee8b77b0769611_icon-check-small.svg" alt='' className={classes.smallIcon} />
                                                <div className={classes.listItemDescription}>
                                                    <div className={classes.listItem}>
                                                        {t('PlanPicker.noQoinsMinimum')}
                                                    </div>
                                                </div>
                                            </Box>
                                        </li>
                                        <li className={classes.listItemContainer}>
                                            <Box display='flex' flexDirection='row' alignItems='center'>
                                                <img src="https://uploads-ssl.webflow.com/6056686ebaee8b4212769569/6056686fbaee8b77b0769611_icon-check-small.svg" alt='' className={classes.smallIcon} />
                                                <div className={classes.listItemDescription}>
                                                    <div className={classes.listItem}>
                                                        {t('PlanPicker.qoinsStore')}
                                                    </div>
                                                </div>
                                            </Box>
                                        </li>
                                        {plan[0] === 'growth' &&
                                            <li className={classes.listItemContainer}>
                                                <Box display='flex' flexDirection='row' alignItems='center'>
                                                    <img src="https://uploads-ssl.webflow.com/6056686ebaee8b4212769569/6056686fbaee8b77b0769611_icon-check-small.svg" alt='' className={classes.smallIcon} />
                                                    <div className={classes.listItemDescription}>
                                                        <div className={classes.listItem}>
                                                            {t('PlanPicker.discounts')}
                                                        </div>
                                                    </div>
                                                </Box>
                                            </li>
                                        }
                                    </ul>
                                </div>
                            </CardContent>
                            <CardActions className={classes.actionArea}>
                                <ContainedButton size='large'
                                    className={`${classes.subscribeButton} ${plan[0] === 'growth' ? classes.growthSubscribeButton : ''}`}
                                    onClick={() => setSelectedPlanBillingPageId(plan[1].billingPageId)}>
                                    {t('PlanPicker.subscribeNow')}
                                </ContainedButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            {selectedPlanBillingPageId &&
                <SubscriptionCheckout open={selectedPlanBillingPageId !== ''}
                    user={user}
                    onClose={() => setSelectedPlanBillingPageId('')}
                    billingPageId={selectedPlanBillingPageId} />
            }
        </StreamerDashboardContainer>
    );
}

export default PlanPicker;
