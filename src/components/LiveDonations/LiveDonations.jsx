import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import styles from './LiveDonations.module.css';
import { ReactComponent as DonatedQoin } from './../../assets/DonatedQoin.svg';
import { listenToUserStreamingStatus, getStreamerUidWithTwitchId, listenForUnreadStreamerCheers, markDonationAsRead, removeListenerForUnreadStreamerCheers, listenForTestCheers, removeTestDonation } from '../../services/database';
import { ReactComponent as QaplaLogo } from './../../assets/QaplaLogo.svg';
import donationAudio from '../../assets/notification.wav';

const LiveDonations = () => {
    const [streamerUid, setStreamerUid] = useState('');
    const [donationQueue, setDonationQueue] = useState([]);
    const [donationToShow, setDonationToShow] = useState(null);
    const [listenersAreSetted, setListenersAreSetted] = useState(false);
    const { streamerId } = useParams();

    useEffect(() => {
        const pushDonation = (donation) => {
            setDonationQueue((array) => [donation, ...array]);
        }

        const popDonation = () => {
            const indexToPop = donationQueue.length - 1;
            const donationToPop = donationQueue[indexToPop];
            setDonationQueue(donationQueue.filter((donation) => donation.id !== donationQueue[indexToPop].id));

            return donationToPop;
        }

        async function getStreamerUid() {
            if (streamerId) {
                const uid = await getStreamerUidWithTwitchId(streamerId);
                setStreamerUid(uid);
                listenForTestCheers(uid, (donation) => {
                    pushDonation({ ...donation.val(), id: donation.key });
                });
            }
        }

        async function loadDonations() {
            listenForUnreadStreamerCheers(streamerUid, (donation) => {
                pushDonation({ ...donation.val(), id: donation.key });
            });
        }

        if (streamerUid && !listenersAreSetted) {
            listenToUserStreamingStatus(streamerUid, (isStreaming) => {
                setListenersAreSetted(true);
                if (isStreaming.exists() && isStreaming.val()) {
                    setTimeout(() => {
                        loadDonations();
                    }, 150000);
                } else {
                    removeListenerForUnreadStreamerCheers(streamerUid);
                    setDonationQueue([]);
                }
            });
        }

        if (donationQueue.length > 0) {
            setTimeout(() => {
                const donation = popDonation();
                if (donation) {
                    const audio = new Audio(donationAudio);
                    audio.play();
                    setDonationToShow(donation);
                    if (donation.twitchUserName === 'QAPLA' && donation.message === 'Test') {
                        removeTestDonation(streamerUid, donation.id);
                    } else {
                        markDonationAsRead(streamerUid, donation.id);
                    }
                }
            }, 10000);
        } else {
            if (listenersAreSetted) {
                setTimeout(() => {
                    setDonationToShow(null);
                }, 10000);
            }
        }

        if (!streamerUid) {
            getStreamerUid();
        }
    }, [streamerId, streamerUid, donationQueue, listenersAreSetted]);

    document.body.style.backgroundColor = 'transparent';

    return (
        <div style={{ backgroundColor: 'transparent', height: '200px', width: '400px', flex: 1 }}>
            {donationToShow &&
                <>
                    <DonationHandler donationToShow={donationToShow} />
                </>
            }
        </div>
    );
}

const DonationHandler = (donationToShow) => {
    const donation = donationToShow.donationToShow;

    return (
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', fontFamily: 'Montserrat', backgroundColor: '#f0f0' }}>
            <div
                className={styles.donationBubble}
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    width: 'fit-content',
                    minWidth: '340px',
                    height: '60px',
                    borderRadius: '18px',
                    padding: '0 18px'
                }}
            >
                <div style={{ display: 'flex', alignSelf: 'center' }}>
                    <p style={{ display: 'flex', color: 'white', fontSize: '1.05rem', textAlign: 'center' }}>
                        <b style={{ color: '#09ffd2' }}>{donation.twitchUserName}</b>
                        <div style={{ margin: '0 6px' }}>ha enviado</div>
                        <b style={{ color: '#09ffd2' }}>{donation.amountQoins} Qoins</b>
                    </p>
                </div>
                <div style={{ width: '10px' }}></div>
                <div style={{ display: 'flex', flex: 1, alignSelf: 'center' }}>
                    <DonatedQoin style={{ display: 'flex', flex: 1 }} />
                </div>
            </div>
            {donation.message !== '' &&
                <>
                    <div style={{ display: 'flex', height: '6px' }}></div>
                    <div style={{
                        display: 'flex',
                        width: 'fit-content',
                        backgroundColor: '#4D00FB',
                        borderRadius: '18px',
                        borderBottomLeftRadius: '4px',
                        padding: '16.3px 20.4px'
                    }}>
                        <p style={{ display: 'flex', color: 'white', fontSize: '1rem' }}>{donation.message}</p>
                    </div>
                </>
            }
        </div >
    )
}

export default LiveDonations;