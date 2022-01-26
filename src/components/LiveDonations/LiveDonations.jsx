import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import styles from './LiveDonations.module.css';
import { ReactComponent as DonatedQoin } from './../../assets/DonatedQoin.svg';
import { listenToUserStreamingStatus, getStreamerUidWithTwitchId, listenForUnreadStreamerCheers, markDonationAsRead, removeListenerForUnreadStreamerCheers, listenForTestCheers, removeTestDonation } from '../../services/database';
import donationAudio from '../../assets/notification.wav';

const LiveDonations = () => {
    const [streamerUid, setStreamerUid] = useState('');
    const [donationQueue, setDonationQueue] = useState([]);
    const [donationToShow, setDonationToShow] = useState(null);
    const [listenersAreSetted, setListenersAreSetted] = useState(false);
    const [alertSideRight, setAlertSideRight] = useState(false)
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
                    setTimeout(() => {
                        if ('speechSynthesis' in window && donation.message) {
                            readMessage(donation.message);
                        }
                    }, 500);
                    donation.isRightSide = alertSideRight
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

    const readMessage = (message) => {
        const availableVoices = window.speechSynthesis.getVoices();
        let utterThis = new SpeechSynthesisUtterance(message);
        const spanishVoice = availableVoices.find((voice) => voice.lang.substring(0, 2) === 'es');
        utterThis.voice = spanishVoice || availableVoices[0];
        utterThis.pitch = 1;
        utterThis.rate = 1;
        window.speechSynthesis.speak(utterThis);
    }

    document.body.style.backgroundColor = 'transparent';


    return (
        <div style={{ display: 'flex', backgroundColor: 'transparent', height: '500px', width: '1920px', placeItems: 'flex-end' }}>
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
        <div style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            backgroundColor: '#f0f0',
            padding: '0px 40px',
            marginBottom: '30px',
            marginLeft: donation.isRightSide ? '0px' : '20px',
            marginRight: donation.isRightSide ? '20px' : '0px'
        }}>
            <img src='https://pbs.twimg.com/profile_images/1377794552677949440/AA4l5bPZ_400x400.jpg' alt='Imagen' style={{
                display: 'flex',
                alignSelf: donation.isRightSide ? 'flex-end' : 'flex-start',
                maxHeight: '250px',
                objectFit: 'scale-down'
            }} />
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    marginTop: '20px',
                    width: 'fit-content',
                    backgroundColor: '#4D00FB',
                    marginLeft: donation.isRightSide ? '0px' : '-30px',
                    marginRight: donation.isRightSide ? '-30px' : '0px',
                    borderRadius: '30px',
                    padding: '24px 24px',
                    alignSelf: donation.isRightSide ? 'flex-end' : 'flex-start',
                    zIndex: 10
                }}
            >
                <div style={{ display: 'flex', alignSelf: 'center' }}>
                    <p style={{
                        display: 'flex',
                        color: 'white',
                        fontSize: '26px',
                        textAlign: 'center'
                    }}>
                        <b style={{ color: '#0AFFD2' }}>{donation.twitchUserName}</b>
                        <div style={{ margin: '0 6px' }}>ha enviado</div>
                        <b style={{ color: '#0AFFD2', fontWeight: '700', }}>{donation.amountQoins} Qoins</b>
                    </p>
                </div>
                <div style={{ width: '10px' }}></div>
                <div style={{ display: 'flex', alignSelf: 'center' }}>
                    <DonatedQoin style={{ display: 'flex', width: '38px', height: '38px' }} />
                </div>
            </div>
            {donation.message !== '' &&
                <>
                    <div style={{
                        display: 'flex',
                        width: 'fit-content',
                        backgroundColor: '#FFFFFF',
                        marginTop: '-20px',
                        borderRadius: '30px',
                        borderTopLeftRadius: donation.isRightSide ? '30px' : '0px',
                        borderTopRightRadius: donation.isRightSide ? '0px' : '30px',
                        padding: '30px',
                        alignSelf: donation.isRightSide ? 'flex-end' : 'flex-start',
                    }}>
                        <p style={{
                            display: 'flex',
                            color: '#0D1021',
                            fontSize: '24px',
                            fontWeight: '600',
                            lineHeight: '36px',
                            letterSpacing: '0.6px'
                        }}>{donation.message}</p>
                    </div>
                </>
            }
        </div >
    )
}

export default LiveDonations;