import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import styles from './LiveDonations.module.css';
import { ReactComponent as DonatedQoin } from './../../assets/DonatedQoin.svg';
import { listenToUserStreamingStatus, getStreamerUidWithTwitchId, listenForUnreadStreamerCheers, markDonationAsRead, removeListenerForUnreadStreamerCheers, listenForTestCheers, removeTestDonation, getStreamerAlertsSettings, getStreamerMediaContent, listenQaplaChallengeXQProgress, getChallengeLevelGoal, getStreamerChallengeCategory, getChallengePreviousLevelGoal, listenToStreamerAlertsSettings } from '../../services/database';
import donationAudio from '../../assets/notification.wav';
import { speakCheerMessage } from '../../services/functions';
import { IMAGE, TEST_MESSAGE_SPEECH_URL } from '../../utilities/Constants';
import QlanProgressBar from '../QlanProgressBar/QlanProgressBar';

const LiveDonations = () => {
    const [streamerUid, setStreamerUid] = useState('');
    const [donationQueue, setDonationQueue] = useState([]);
    const [donationToShow, setDonationToShow] = useState(null);
    const [listenersAreSetted, setListenersAreSetted] = useState(false);
    const [alertSideRight, setAlertSideRight] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [mediaContent, setMediaContent] = useState({ videos: [], images: [] });
    const [qaplaChallengeXQ, setQaplaChallengeXQ] = useState(0);
    const [nextGoalXQ, setNextGoalXQ] = useState(0);
    const [previousGoalXQ, setPreviousGoalXQ] = useState(0);
    const [showQaplaChallengeProgress, setShowQaplaChallengeProgress] = useState(false);
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

                listenToStreamerAlertsSettings(uid, (streamerSettings) => {
                    if (streamerSettings.exists()) {
                        setAlertSideRight(streamerSettings.val().alertSideRight);
                        setShowQaplaChallengeProgress(streamerSettings.val().showQaplaChallengeProgress !== false);
                    }
                });

                listenForTestCheers(uid, (donation) => {
                    pushDonation({ ...donation.val(), id: donation.key });
                });

                const streamerMedia = await getStreamerMediaContent(uid);
                setMediaContent(streamerMedia.val());
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

        if (donationQueue.length > 0 && !isPlayingAudio) {
            setIsPlayingAudio(true);
            const donation = popDonation();

            async function showCheer() {
                if (mediaContent && mediaContent['images'] && mediaContent['images'].length > 0) {
                    const maxLength = mediaContent['images'].length - 1;
                    const mediaToShow = mediaContent['images'][Math.floor(Math.random() * (maxLength - 0 + 1)) + 0];
                    donation.media = { type: IMAGE, source: mediaToShow };
                }

                let audio = new Audio(donationAudio);
                if (donation.message) {
                    if (donation.twitchUserName === 'QAPLA' && donation.message === 'Test') {
                        audio = new Audio(TEST_MESSAGE_SPEECH_URL);
                    } else {
                        const messageToRead = `${donation.twitchUserName} dice: ${donation.message}`;

                        window.analytics.track('Cheer received', {
                            user: donation.twitchUserName,
                            containsMessage: true,
                            message: messageToRead
                        });
                        const cheerMessageUrl = await speakCheerMessage(streamerUid, donation.id, messageToRead, 'es-US-Standard-A', 'es-MX');
                        audio = new Audio(cheerMessageUrl.data);
                    }
                } else {
                    const messageToRead = `${donation.twitchUserName} te ha enviado ${donation.amountQoins} Qoins`;

                    window.analytics.track('Cheer received', {
                        user: donation.twitchUserName,
                        containsMessage: false
                    });
                    const cheerMessageUrl = await speakCheerMessage(streamerUid, donation.id, messageToRead, 'es-US-Standard-A', 'es-MX');
                    audio = new Audio(cheerMessageUrl.data);
                }

                donation.isRightSide = alertSideRight;

                setDonationToShow(donation);
                audio.onended = () => {
                    setTimeout(() => {
                        setDonationToShow(null);
                    }, 3000);
                    if (donation.twitchUserName === 'QAPLA' && donation.message === 'Test') {
                        removeTestDonation(streamerUid, donation.id);
                    } else {
                        markDonationAsRead(streamerUid, donation.id);
                    }

                    setTimeout(() => {
                        setIsPlayingAudio(false);
                    }, 6000);
                }

                audio.play();
            }

            showCheer();
        }

        if (!streamerUid) {
            getStreamerUid();
        }

        if (streamerUid) {
            async function checkIfUserIsUserParticipantOfQaplaChallenge() {
                async function getNextGoal(xq, category) {
                    const neededXQ = await getChallengeLevelGoal(category, xq + 1);
                    const previousGoalXQ = await getChallengePreviousLevelGoal(category, xq);

                    if (neededXQ.exists()) {
                        neededXQ.forEach((levelXQ) => {
                            setNextGoalXQ(levelXQ.val());
                        });

                        previousGoalXQ.forEach((pastLevelXQ) => {
                            setPreviousGoalXQ(pastLevelXQ.val());
                        });

                        setQaplaChallengeXQ(xq);
                    } else {
                        /**
                         * Show some cool UI to let the streamer know he has achieved all the levels in the
                         * Qapla Challenge
                         */

                         previousGoalXQ.forEach((pastLevelXQ) => {
                            setNextGoalXQ(pastLevelXQ.val());
                            setQaplaChallengeXQ(pastLevelXQ.val());
                        });
                    }
                }

                const userParticipation = await getStreamerChallengeCategory(streamerUid);
                if (userParticipation.exists()) {
                    listenQaplaChallengeXQProgress(streamerUid, (xqProgress) => {
                        if (xqProgress.exists()) {
                            getNextGoal(xqProgress.val(), userParticipation.val());
                        }
                    });
                }
            }

            checkIfUserIsUserParticipantOfQaplaChallenge();
        }
    }, [streamerId, streamerUid, donationQueue, listenersAreSetted, isPlayingAudio]);

    document.body.style.backgroundColor = 'transparent';


    const qaplaChallengeBarProgress = (qaplaChallengeXQ - previousGoalXQ)/(nextGoalXQ - previousGoalXQ);
    return (
        <div style={{ display: 'flex', backgroundColor: 'transparent', height: '100vh', width: '100%', placeItems: 'flex-end' }}>
            {donationToShow &&
                <>
                    <DonationHandler donationToShow={donationToShow} />
                </>
            }
            {showQaplaChallengeProgress && qaplaChallengeBarProgress &&
               <QlanProgressBar
                    percentage={qaplaChallengeBarProgress}
                    xq={qaplaChallengeXQ}
                />
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
            {donation.media && donation.media.type === IMAGE &&
                <img src={donation.media.source} alt='' style={{
                display: 'flex',
                alignSelf: donation.isRightSide ? 'flex-end' : 'flex-start',
                maxHeight: '250px',
                objectFit: 'scale-down'
            }} />}
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