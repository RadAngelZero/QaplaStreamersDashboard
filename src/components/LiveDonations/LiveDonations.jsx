import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

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
        <div style={{ backgroundColor: 'transparent', height: '400px', width: '400px', flex: 1 }}>
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
        <div style={{ flex: 1, fontFamily: 'Montserrat' }}>
            <div style={{
                position: 'absolute',
                backgroundColor: '#0D1021',
                alignContent: 'center',
                justifyItems: 'center',
                borderRadius: 30,
                width: '100px',
                height: '100px',
                marginLeft: '150px',
                top: 0
            }} >
                <QaplaLogo style={{ alignSelf: 'center', width: '75%', height: '75%', marginTop: '12.5%', marginLeft: '12.5%' }} />

            </div>
            <div style={{ flex: 1, marginTop: '110px', backgroundColor: '#0D1021', borderRadius: 40, height: '80px' }}>
                <p style={{ color: '#fff', textAlign: 'center', fontSize: 20, paddingTop: '5px' }}>
                    <b style={{ color: '#3DF9DF' }}>{donation.twitchUserName}</b><br />ha donado<br /><b style={{ color: '#3DF9DF' }}>{donation.amountQoins}</b> Qoins
                </p>
                {donation.message !== '' &&
                    <div style={{ flex: 1 }}>
                        <div style={{ flex: 1, marginTop: '10px', backgroundColor: '#0D1021', borderRadius: 40, alignSelf: 'center', width: '175px', paddingTop: '2px', paddingBottom: '2px', marginLeft: '112.5px' }}>
                            <p style={{ color: '#fff', textAlign: 'center', fontSize: 18 }}>
                                Con el mensaje
                            </p>
                        </div>
                        <div style={{ flex: 1, marginTop: '10px', backgroundColor: '#0D1021', borderRadius: 40, width: '300px', height: 'auto', paddingTop: '1px', paddingBottom: '1px', marginLeft: '50px' }}>
                            <p style={{ color: '#fff', textAlign: 'center', fontSize: 18, maxWidth: '300px' }}>
                                {donation.message}
                            </p>
                        </div>
                    </div>
                }
            </div>
        </div >
    )
}

export default LiveDonations;