import React from 'react'
import styles from './StreamsLeft.module.css'
import { useTranslation } from 'react-i18next'

const StreamsLeft = ({ subscriptionDetails, renovationDate }) => {
    const dateRenovation = new Date(renovationDate);
    const renovationDay = (dateRenovation.getDate().toString().length < 2 ? '0' : '') + dateRenovation.getDate().toString();
    const renovationMonth = dateRenovation.getMonth();
    const leftPercent =  subscriptionDetails.streamsRequested/subscriptionDetails.streamsIncluded;
    const { t } = useTranslation();
    const monthsArray = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    return (
        <div className={styles.container}>
            <div style={{ display: 'flex' }}>
                <p style={{ color: '#fff' }} className={styles.streamsLeftText}>
                    {t('StreamsLeft.streams')}
                </p>
                <div style={{ width: '6px' }} />
                <p style={{ color: leftPercent >= .75 ? '#FF003D' : '#00FFDD' }} className={styles.streamsLeftText}>
                    {`${subscriptionDetails.streamsIncluded - subscriptionDetails.streamsRequested}/${subscriptionDetails.streamsIncluded}`}
                </p>
            </div>
            <div style={{ display: 'flex' }}>
                <p className={styles.renovationText}>
                    {t('StreamsLeft.renewsOn', { date: renovationDay, month: t(`months.${monthsArray[renovationMonth]}`) })}
                </p>
            </div>
        </div>
    )

}

export default StreamsLeft