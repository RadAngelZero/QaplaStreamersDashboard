import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import styles from './LiveDonations.module.css';
import { ReactComponent as DonatedQoin } from './../../assets/DonatedQoin.svg';
import { listenToUserStreamingStatus, getStreamerUidWithTwitchId, listenForUnreadStreamerCheers, markDonationAsRead, removeListenerForUnreadStreamerCheers, listenForTestCheers, removeTestDonation, getStreamerAlertsSettings, getStreamerMediaContent, listenQaplaChallengeXQProgress, getChallengeLevelGoal, getStreamerChallengeCategory, getChallengePreviousLevelGoal, listenToStreamerAlertsSettings, listenQaplaGoal, markOverlayAsActive, onLiveDonationsDisconnect } from '../../services/database';
import donationAudio from '../../assets/notification.wav';
import { speakCheerMessage } from '../../services/functions';
import { GIPHY_GIFS, GIPHY_STICKERS, MEME, TEST_MESSAGE_SPEECH_URL } from '../../utilities/Constants';
import QlanProgressBar from '../QlanProgressBar/QlanProgressBar';
import GoalProgressBar from '../GoalProgressBar/GoalProgressBar';
import QaplaOnLeft from '../../assets/Qapla-On-Overlay-Left.png';
import QaplaOnRight from '../../assets/Qapla-On-Overlay-Right.png';
import { getCheerVoiceMessage } from '../../services/storage';

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
    const [qoinsGoal, setQoinsGoal] = useState(null);
    const [qoinsGoalProgress, setQoinsGoalProgress] = useState(null);
    const [goalTitle, setGoalTitle] = useState('');
    const [showQaplaChallengeProgress, setShowQaplaChallengeProgress] = useState(false);
    const [qaplaOnOpacity, setQaplaOnOpacity] = useState(1);
    const [playQaplaOnAnimation, setPlayQaplaOnAnimation] = useState("false");
    const { streamerId } = useParams();

    useEffect(() => {
        queueAnimation();
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

        /**
         * Emoji rain functions
         */
         let emojiRainContainer = document.getElementById('animate');
         let circles = [];

         function addCircle(delay, range, color) {
             setTimeout(function () {
                let c = new Circle(range[0] + Math.random() * range[1], 80 + Math.random() * 4, color, {
                    x: -0.15 + Math.random() * 0.3,
                    y: 1 + Math.random() * 10
                }, range);

                circles.push(c);
            }, delay);
         }

         class Circle {
            constructor(x, y, color, velocity, range) {
                let _this = this;
                this.x = x;
                this.y = y;
                this.color = color;
                this.velocity = velocity;
                this.range = range;
                this.element = document.createElement('span');
                /*this.element.style.display = 'block';*/
                this.element.style.opacity = 0;
                this.element.style.position = 'absolute';
                this.element.style.fontSize = '26px';
                this.element.style.color = 'hsl(' + (Math.random() * 360 | 0) + ',80%,50%)';
                this.element.innerHTML = color;
                emojiRainContainer.appendChild(this.element);

                this.update = function () {
                    if (_this.y > 800) {
                        _this.y = 80 + Math.random() * 4;
                        _this.x = _this.range[0] + Math.random() * _this.range[1];
                    }
                    _this.y += _this.velocity.y;
                    _this.x += _this.velocity.x;
                    this.element.style.opacity = 1;
                    this.element.style.transform = 'translate3d(' + _this.x + 'px, ' + _this.y + 'px, 0px)';
                    this.element.style.webkitTransform = 'translate3d(' + _this.x + 'px, ' + _this.y + 'px, 0px)';
                    this.element.style.mozTransform = 'translate3d(' + _this.x + 'px, ' + _this.y + 'px, 0px)';
                };
            }
        }

         function animate() {
            for (let i in circles) {
                circles[i].update();
            }

            return requestAnimationFrame(animate);
         }

        function executeEmojiRain(emoji) {

            for (let i = 0; i < 10; i++) {
                addCircle(i * 350, [10 + 0, 300], emoji[Math.floor(Math.random() * emoji.length)]);
                addCircle(i * 350, [10 + 0, -300], emoji[Math.floor(Math.random() * emoji.length)]);
                addCircle(i * 350, [10 - 200, -300], emoji[Math.floor(Math.random() * emoji.length)]);
                addCircle(i * 350, [10 + 200, 300], emoji[Math.floor(Math.random() * emoji.length)]);
                addCircle(i * 350, [10 - 400, -300], emoji[Math.floor(Math.random() * emoji.length)]);
                addCircle(i * 350, [10 + 400, 300], emoji[Math.floor(Math.random() * emoji.length)]);
                addCircle(i * 350, [10 - 600, -300], emoji[Math.floor(Math.random() * emoji.length)]);
                addCircle(i * 350, [10 + 600, 300], emoji[Math.floor(Math.random() * emoji.length)]);
                addCircle(i * 350, [10 + 600, 300], emoji[Math.floor(Math.random() * emoji.length)]);
                addCircle(i * 350, [10 + 600, 300], emoji[Math.floor(Math.random() * emoji.length)]);
            }

            animate();
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
                let audio = new Audio(donationAudio);
                if (!donation.repeating) {
                    if (donation.message) {
                        if (donation.twitchUserName === 'QAPLA' && donation.message === 'Test') {
                            audio = new Audio(TEST_MESSAGE_SPEECH_URL);
                        } else {
                            const messageToRead = `${donation.twitchUserName} te ha enviado ${donation.amountQoins} Coins y dice: ${donation.message}`;

                            window.analytics.track('Cheer received', {
                                user: donation.twitchUserName,
                                containsMessage: true,
                                message: messageToRead
                            });
                            const cheerMessageUrl = await speakCheerMessage(streamerUid, donation.id, messageToRead, 'es-US-Standard-A', 'es-MX');
                            audio = new Audio(cheerMessageUrl.data);
                        }
                    } else {
                        const messageToRead = `${donation.twitchUserName} te ha enviado ${donation.amountQoins} Coins`;

                        window.analytics.track('Cheer received', {
                            user: donation.twitchUserName,
                            containsMessage: false
                        });
                        const cheerMessageUrl = await speakCheerMessage(streamerUid, donation.id, messageToRead, 'es-US-Standard-A', 'es-MX');
                        audio = new Audio(cheerMessageUrl.data);
                    }
                } else {
                    try {
                        const cheerMessageUrl = await getCheerVoiceMessage(streamerUid, donation.id);

                        if (cheerMessageUrl) {
                            audio = new Audio(cheerMessageUrl);
                        }
                    } catch (error) {
                        console.log('Message not found, what must be do here?');
                    }
                }

                donation.isRightSide = alertSideRight;

                setDonationToShow(donation);

                if (donation.emojiRain && donation.emojiRain.emojis) {
                    executeEmojiRain(donation.emojiRain.emojis);
                }

                audio.onended = () => {
                    setTimeout(() => {
                        emojiRainContainer.innerHTML = '';
                        setDonationToShow(null);
                    }, 4000);
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
            async function listenToOverlayStatus() {
                try {
                    await markOverlayAsActive(streamerUid);
                    onLiveDonationsDisconnect(streamerUid);
                } catch (error) {
                    console.log('Error mounting overlay listeners');
                }
            }

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
                } else {
                    setShowQaplaChallengeProgress(false);
                }
            }

            listenToOverlayStatus();

            listenQaplaGoal(streamerUid, (goal) => {
                if (goal.exists()) {
                    setQoinsGoal(goal.val().goal);
                    setQoinsGoalProgress(goal.val().qoins);
                    setGoalTitle(goal.val().title);
                }
            });

            checkIfUserIsUserParticipantOfQaplaChallenge();
        }
    }, [streamerId, streamerUid, donationQueue, listenersAreSetted, isPlayingAudio]);

    const queueAnimation = () => {
        if (qaplaOnOpacity !== 1) {
            setTimeout(() => {
                setPlayQaplaOnAnimation("true");
            }, 10 * 1000)
        } else {
            setTimeout(() => {
                setPlayQaplaOnAnimation("true");
            }, 60 * 1000)
        }
    }

    document.body.style.backgroundColor = 'transparent';


    const qaplaChallengeBarProgress = (qaplaChallengeXQ - previousGoalXQ) / (nextGoalXQ - previousGoalXQ);
    return (
        <div style={{ display: 'flex', backgroundColor: 'transparent', maxHeight: '100vh', width: '100%', placeItems: 'flex-end' }}>
            <div
                onAnimationEnd={() => {
                    setPlayQaplaOnAnimation("false");
                    if (qaplaOnOpacity === 1)
                        setQaplaOnOpacity(0)
                    if (qaplaOnOpacity === 0)
                        setQaplaOnOpacity(1)
                    queueAnimation();
                }}
                style={{
                    position: 'fixed',
                    bottom: '-15px',
                    left: alertSideRight ? 'auto' : '-12px',
                    right: alertSideRight ? '-12px' : 'auto',
                    width: '150px',
                }}
                className="qapla-logo-container"
                playAnimation={playQaplaOnAnimation}
            >
                <style>{`
                @keyframes dissapear {
                    from {
                        opacity: ${qaplaOnOpacity === 1 ? 1 : 0};
                    }
                    to {
                        opacity: ${qaplaOnOpacity === 1 ? 0 : 1};
                    }
                }
                .qapla-logo-container{
                    opacity: ${qaplaOnOpacity};
                }
                .qapla-logo-container[playAnimation="true"] {
                    animation-name: dissapear;
                    animation-duration: 5s;
                    animation-iteration-count: 1;
                    animation-timing-function: ease-in-out;
                }
                `}</style>
                <img src={alertSideRight ? QaplaOnRight : QaplaOnLeft} alt="qapla logo" />
            </div>
            <div id="animate" style={{
                position: 'fixed',
                top: 100,
                bottom: 0,
                left: '800px',
                right: 0,
                transform: 'scale(1.5)',
            }}></div>
            {donationToShow &&
                <>
                    <DonationHandler donationToShow={donationToShow} />
                </>
            }
            {qoinsGoal && goalTitle &&
                <GoalProgressBar
                    percentage={qoinsGoalProgress / qoinsGoal}
                    title={goalTitle}
                    qoins={qoinsGoalProgress || 0}
                />
            }
            {showQaplaChallengeProgress &&
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
            {donation.media && (donation.media.type === MEME || donation.media.type === GIPHY_GIFS || donation.media.type === GIPHY_STICKERS) &&
                <img src={donation.media.url} alt='' style={{
                    aspectRatio: donation.media.width / donation.media.height,
                    display: 'flex',
                    alignSelf: donation.isRightSide ? 'flex-end' : 'flex-start',
                    maxHeight: '250px',
                    objectFit: 'scale-down'
                }} />
            }
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