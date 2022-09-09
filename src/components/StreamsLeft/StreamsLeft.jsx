import React, {  useState, useEffect} from 'react'
import styles from './StreamsLeft.module.css'
import { useTranslation } from 'react-i18next'
import { listenToStreamerDrops, removeListenerFromStreamerDrops } from '../../services/database';

const StreamsLeft = ({ uid, renovationDate }) => {
    const [qoinsDrops, setQoinsDrops] = useState({ left: 0, original: 0 });

    useEffect(() => {
        async function getDropsLeft() {
            listenToStreamerDrops(uid, (drops) => {
                if (drops.exists()) {
                    setQoinsDrops(drops.val());
                }
            });
        }

        if (uid) {
            getDropsLeft();
        }

        return () => {
            if (uid) {
                removeListenerFromStreamerDrops(uid);
            }
        };
    }, [uid]);

    const dateRenovation = new Date(renovationDate);
    const renovationDay = (dateRenovation.getDate().toString().length < 2 ? '0' : '') + dateRenovation.getDate().toString();
    const renovationMonth = dateRenovation.getMonth();
    const leftPercent =  qoinsDrops.left/qoinsDrops.original;
    const { t } = useTranslation();
    const monthsArray = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    let isMembershipOver = false;
    const currentDate = new Date();
    if (currentDate.getTime() > dateRenovation.getTime()) {
        isMembershipOver = true;
    }

    return (
        <div className={styles.container}>
            <div style={{ display: 'flex' }}>
                <p style={{ color: '#fff' }} className={styles.streamsLeftText}>
                    {t('StreamsLeft.drops')}
                </p>
                <div style={{ width: '6px' }} />
                <p style={{ color: leftPercent >= .25 ? '#00FFDD' : '#FF003D' }} className={styles.streamsLeftText}>
                    {t('StreamsLeft.dropsLeft', { available: qoinsDrops.left, total: qoinsDrops.original })}
                </p>
            </div>
            <div style={{ display: 'flex' }}>
                <p className={styles.renovationText}>
                    {!isMembershipOver ?
                        t('StreamsLeft.renewsOn', { date: renovationDay, month: t(`months.${monthsArray[renovationMonth]}`) })
                        :
                        t('StreamsLeft.membershipExpired', { date: renovationDay, month: t(`months.${monthsArray[renovationMonth]}`) })
                    }
                </p>
            </div>
        </div>
    )

}

export default StreamsLeft