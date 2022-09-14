import React, { useState, useEffect } from 'react';
import { makeStyles, Button, Box, Grid, Card, CardContent, CardActions } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import styles from './PlanPicker.module.css';
import { getSubscriptionsDetails } from '../../services/database';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import ContainedButton from '../ContainedButton/ContainedButton';
import { QUARTERLY, YEARLY } from '../../utilities/Constants';

import CardsPayments from '../CardsPayments/CardsPayments'

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
            <p className={styles.planSavingPeriod}>
                {`${t('PlanPicker.totalPeriodPayment', { totalPayment: Number.isInteger(totalPayment) ? totalPayment : totalPayment.toFixed(2) })} ${t(`PlanPicker.plansPeriods.${period}`)}.`}
            </p>
        );
    }

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
                    backgroundCards={'#141833'} 
                    title={'Basic'} 
                    textButon={'Current'}
                    textGreen={'Free forever'}
                    backgroundButon={'#141833'}
                    colorTextButon={'#FFFFFF'}
                    price={'0'} 
                    items={['Qapla Reactions', 'Qoins cash out']}/> 
                <CardsPayments 
                    backgroundCards={'#141833'}
                    textGreen={'You save 15%'}
                    title={'Essential'} 
                    textButon={'Get visivility for your content'}
                    subtitle={'$18 Quatertly.'}
                    backgroundButon={'#6C5DD3'}
                    colorTextButon={'#FFFFFF'}
                    price={'6'}
                    items={['200 Qoins Drops per month','Post streams on Qapla as long as you have drops', 'Qapla reactions', 'Qoins cash out', ]}/> 
                <CardsPayments 
                    backgroundCards={'#3B4BF9'} 
                    title={'Growth'}
                    textGreen={'You save 15%'}
                    textButon={'reward your community'}
                    subtitle={'$36.99 Quatertly.'}
                    backgroundButon={'#0AFFD2'}
                    colorTextButon={'#4E2D92'}
                    price={'11.99'}
                    items={['400 Qoins Drops per month','Post streams on Qapla as long as you have drops', 'Qapla reactions', 'Qoins cash out']}/> 
                {/* {subscriptions[period] && Object.entries(subscriptions[period].packages).map((plan) => (
                    <form action='https://us-central1-qapplaapp.cloudfunctions.net/streamerSubscriptionCheckoutIntent' method='post'>
                        <Grid item sm={12} md={6} className={classes.cardGridItem} key={`${plan[0]}-${period}`}>
                            <h1 className={styles.planTypeTitle}>
                                {plan[0] === 'essential' ?
                                    'Essential'
                                    :
                                    'Growth'
                                }
                            </h1>
                            <p className={styles.planTypeDescription}>
                                {t(`PlanPicker.plansDescriptions.${plan[0]}`)}
                            </p>
                            <Card className={plan[0] === 'essential' ? classes.essentialPlanContainer : classes.growthPlanContainer}>
                                <CardContent className={classes.planBody}>
                                    <div className={styles.planTitle}>
                                        <div className={styles.planTitleText}>
                                            ${Number.isInteger(plan[1].cost) ? plan[1].cost : plan[1].cost.toString().substring(0, plan[1].cost.toString().indexOf('.') + 3)}
                                            <span className={styles.planTitleSmallElement}>
                                                /{t('PlanPicker.month')}
                                            </span>
                                        </div>
                                        <div className={styles.planSavingContainer}>
                                            {period === 'monthly' ?
                                                <p className={styles.planSavingPeriod}>
                                                    {`${t('PlanPicker.payment')} ${t(`PlanPicker.plansPeriods.${period}`)}`}
                                                    {plan[1].saving && '.'}
                                                </p>
                                                :
                                                renderTotalPayment(period, plan[1].cost)
                                            }
                                            {plan[1].saving &&
                                                <span className={styles.planSavingPercentage}>
                                                    {t(`PlanPicker.saving`, { saving: plan[1].saving })}
                                                </span>
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <ul className={styles.benefitsList}>
                                            <li className={styles.listItemContainer}>
                                                <Box display='flex' flexDirection='row' alignItems='center'>
                                                    <img src="https://uploads-ssl.webflow.com/6056686ebaee8b4212769569/6056686fbaee8b77b0769611_icon-check-small.svg" alt='' className={styles.smallIcon} />
                                                    <div className={styles.listItemDescription}>
                                                        <div className={styles.listItem}>
                                                            {t('PlanPicker.monthlyPublications', { numberOfPublications: plan[1].streamsIncluded })}
                                                            {plan[0] === 'growth' && ` ${t('PlanPicker.with')}`}
                                                            {plan[0] === 'growth' &&
                                                                <span className={styles.growthExtraBenefit}>
                                                                    {t('PlanPicker.doubleXQ')}
                                                                </span>
                                                            }
                                                        </div>
                                                    </div>
                                                </Box>
                                            </li>
                                            <li className={styles.listItemContainer}>
                                                <Box display='flex' flexDirection='row' alignItems='center'>
                                                    <img src="https://uploads-ssl.webflow.com/6056686ebaee8b4212769569/6056686fbaee8b77b0769611_icon-check-small.svg" alt='' className={styles.smallIcon} />
                                                    <div className={styles.listItemDescription}>
                                                        <div className={styles.listItem}>
                                                            {t('PlanPicker.redemptions', { numberOfRedemptions: plan[1].redemptionsPerStream })}
                                                        </div>
                                                    </div>
                                                </Box>
                                            </li>
                                            <li className={styles.listItemContainer}>
                                                <Box display='flex' flexDirection='row' alignItems='center'>
                                                    <img src="https://uploads-ssl.webflow.com/6056686ebaee8b4212769569/6056686fbaee8b77b0769611_icon-check-small.svg" alt='' className={styles.smallIcon} />
                                                    <div className={styles.listItemDescription}>
                                                        <div className={styles.listItem}>
                                                            {t('PlanPicker.cheers')}
                                                        </div>
                                                    </div>
                                                </Box>
                                            </li>
                                            {plan[0] === 'growth' &&
                                                <li className={styles.listItemContainer}>
                                                    <Box display='flex' flexDirection='row' alignItems='center'>
                                                        <img src="https://uploads-ssl.webflow.com/6056686ebaee8b4212769569/6056686fbaee8b77b0769611_icon-check-small.svg" alt='' className={styles.smallIcon} />
                                                        <div className={styles.listItemDescription}>
                                                            <div className={styles.listItem}>
                                                                {t('PlanPicker.extraPublications')}
                                                                <span className={styles.growthExtraBenefit}>
                                                                    {t('PlanPicker.doubleXQ')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Box>
                                                </li>
                                            }
                                            <li className={styles.listItemContainer}>
                                                <Box display='flex' flexDirection='row' alignItems='center'>
                                                    <img src="https://uploads-ssl.webflow.com/6056686ebaee8b4212769569/6056686fbaee8b77b0769611_icon-check-small.svg" alt='' className={styles.smallIcon} />
                                                    <div className={styles.listItemDescription}>
                                                        <div className={styles.listItem}>
                                                            {t('PlanPicker.noQoinsMinimum')}
                                                        </div>
                                                    </div>
                                                </Box>
                                            </li>
                                            <li className={styles.listItemContainer}>
                                                <Box display='flex' flexDirection='row' alignItems='center'>
                                                    <img src="https://uploads-ssl.webflow.com/6056686ebaee8b4212769569/6056686fbaee8b77b0769611_icon-check-small.svg" alt='' className={styles.smallIcon} />
                                                    <div className={styles.listItemDescription}>
                                                        <div className={styles.listItem}>
                                                            {t('PlanPicker.qoinsStore')}
                                                        </div>
                                                    </div>
                                                </Box>
                                            </li>
                                            {plan[0] === 'growth' &&
                                                <li className={styles.listItemContainer}>
                                                    <Box display='flex' flexDirection='row' alignItems='center'>
                                                        <img src="https://uploads-ssl.webflow.com/6056686ebaee8b4212769569/6056686fbaee8b77b0769611_icon-check-small.svg" alt='' className={styles.smallIcon} />
                                                        <div className={styles.listItemDescription}>
                                                            <div className={styles.listItem}>
                                                                {t('PlanPicker.discounts')}
                                                            </div>
                                                        </div>
                                                    </Box>
                                                </li>
                                            }
                                        </ul>
                                    </div>
                                </CardContent>
                                <input type='hidden' name='uid' value={user.uid} />
                                <input type='hidden' name='stripeCustomerId' value={user.stripeCustomerId || ''} />
                                <input type='hidden' name='email' value={user.email} />
                                <input type='hidden' name='lookupKey' value={plan[1].lookupKey} />
                                <input type='hidden' name='plan' value={plan[0]} />
                                <input type='hidden' name='interval' value={period} />
                                <CardActions className={styles.actionArea}>
                                    <ContainedButton size='large'
                                        buttonColor={plan[0] === 'growth' ? 1 : 0}
                                        type='submit'
                                        className={`${classes.subscribeButton} ${plan[0] === 'growth' ? styles.growthSubscribeButton : ''}`}>
                                        {plan[0] === 'growth' ? t('PlanPicker.rewardYourCommunity') : t('PlanPicker.getVisibility')}
                                    </ContainedButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    </form>
                ))} */}
            </Grid>
        </StreamerDashboardContainer>
    );
}

export default PlanPicker;
