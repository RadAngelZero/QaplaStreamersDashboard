import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Video } from '@giphy/react-components';

import styles from './LiveDonations.module.css';
import { ReactComponent as DonatedQoin } from './../../assets/DonatedQoin.svg';
import { listenToUserStreamingStatus, getStreamerUidWithTwitchId, listenForUnreadStreamerCheers, markDonationAsRead, removeListenerForUnreadStreamerCheers, listenForTestCheers, removeTestDonation, listenToStreamerAlertsSettings, markOverlayAsActive, onLiveDonationsDisconnect, listenForUberduckAudio, removeListenerForUberduckAudio } from '../../services/database';
import channelPointReactionAudio from '../../assets/channelPointReactionAudio.mp3';
import qoinsReactionAudio from '../../assets/qoinsReactionAudio.mp3';
import { speakCheerMessage, speakCheerMessageUberDuck } from '../../services/functions';
import { GIPHY_CLIP, GIPHY_CLIPS, GIPHY_GIF, GIPHY_GIFS, GIPHY_STICKER, GIPHY_STICKERS, MEME, MEMES, TEST_MESSAGE_SPEECH_URL } from '../../utilities/Constants';
import QaplaOnLeft from '../../assets/Qapla-On-Overlay-Left.png';
import QaplaOnRight from '../../assets/Qapla-On-Overlay-Right.png';
import { getCheerVoiceMessage } from '../../services/storage';

const gf = new GiphyFetch('1WgsSOSfrTXTN4IGMMuhajM7WsfxoSdq');

let audioAlert = new Audio(channelPointReactionAudio);
let voiceBotMessage = new Audio(channelPointReactionAudio);

const LiveDonations = () => {
    const [streamerUid, setStreamerUid] = useState('');
    const [donationQueue, setDonationQueue] = useState([]);
    const [donationToShow, setDonationToShow] = useState(null);
    const [listenersAreSetted, setListenersAreSetted] = useState(false);
    const [alertSideRight, setAlertSideRight] = useState(false);
    const [alertOnTop, setAlertOnTop] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [qaplaOnOpacity, setQaplaOnOpacity] = useState(1);
    const [playQaplaOnAnimation, setPlayQaplaOnAnimation] = useState("false");
    const [showEmojiRain, setShowEmojiRain] = useState(false);
    const [reactionsEnabled, setReactionsEnabled] = useState(true);
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
                        setReactionsEnabled(streamerSettings.val().reactionsEnabled !== false);
                        setAlertSideRight(streamerSettings.val().alertSideRight);
                    }
                });

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

        /**
         * Emoji rain functions
         */
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
                const container = document.getElementById('animate');
                if (container) {
                    container.appendChild(this.element);
                }

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
            setShowEmojiRain(true);
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
                    }, 150);
                } else {
                    removeListenerForUnreadStreamerCheers(streamerUid);
                    setDonationQueue([]);
                }
            });
        }

        if (donationQueue.length > 0 && !isPlayingAudio && reactionsEnabled) {
            setIsPlayingAudio(true);
            const donation = popDonation();

            async function showCheer(audioUrl) {
                const qoinsDonation = donation.amountQoins && donation.amountQoins >= 100;
                const bigQoinsDonation = Boolean(qoinsDonation && donation.amountQoins >= 1000).valueOf();
                audioAlert = new Audio(qoinsDonation ? qoinsReactionAudio : channelPointReactionAudio);
                if (audioUrl || !donation.repeating) {
                    const voiceToUse = donation.messageExtraData && donation.messageExtraData.voiceAPIName ? donation.messageExtraData.voiceAPIName : 'es-US-Standard-A';

                    if (donation.message) {
                        if (donation.twitchUserName === 'QAPLA' && donation.message === 'Test') {
                            voiceBotMessage = new Audio(TEST_MESSAGE_SPEECH_URL);
                        } else {
                            const messageToRead = bigQoinsDonation ? `${donation.twitchUserName} has sent you ${donation.amountQoins} coins and says: ${donation.message}` : `${donation.twitchUserName} say: ${donation.message}`;

                            window.analytics.track('Cheer received', {
                                user: donation.twitchUserName,
                                containsMessage: true,
                                message: messageToRead
                            });
                            const cheerMessageUrl = await speakCheerMessage(streamerUid, donation.id, messageToRead, voiceToUse, 'en-US');
                            voiceBotMessage = new Audio(audioUrl ? audioUrl : cheerMessageUrl.data);
                        }
                    } else if (bigQoinsDonation) {
                        const messageToRead = `${donation.twitchUserName} has sent you ${donation.amountQoins} Coins`;

                        window.analytics.track('Cheer received', {
                            user: donation.twitchUserName,
                            containsMessage: false
                        });
                        const cheerMessageUrl = await speakCheerMessage(streamerUid, donation.id, messageToRead, voiceToUse, 'en-US');
                        voiceBotMessage = new Audio(audioUrl ? audioUrl : cheerMessageUrl.data);
                    }
                } else {
                    try {
                        const cheerMessageUrl = await getCheerVoiceMessage(streamerUid, donation.id);

                        if (cheerMessageUrl) {
                            voiceBotMessage = new Audio(cheerMessageUrl);
                        }
                    } catch (error) {
                        console.log('Message not found, what must be do here?');
                    }
                }

                donation.isRightSide = alertSideRight;
                donation.isOnTop = alertOnTop;

                setDonationToShow(donation);

                if (donation.emojiRain && donation.emojiRain.emojis) {
                    executeEmojiRain(donation.emojiRain.emojis);
                }

                if (!donation.message && !bigQoinsDonation) {
                    audioAlert.onended = () => {
                        setTimeout(() => {
                            finishReaction(donation);
                        }, 5000);
                    }
                } else {
                    voiceBotMessage.onended = () => {
                        setTimeout(() => {
                            finishReaction(donation);
                        }, 5000);
                    }
                }
            }

            async function initCheer() {
                if (donation.messageExtraData && donation.messageExtraData.voiceAPIName && donation.messageExtraData && donation.messageExtraData.voiceAPIName.includes('Uberduck:')) {
                    // 9 Because the string "Uberduck:" length is 9
                    const voiceUuid = donation.messageExtraData.voiceAPIName.substring(9);
                    await speakCheerMessageUberDuck(donation.id, donation.message, voiceUuid);
                    listenForUberduckAudio(donation.id, (url) => {
                        if (url.exists()) {
                            if (url.val() !== 'error') {
                                showCheer(url.val());
                            } else {
                                showCheer();
                            }

                            removeListenerForUberduckAudio(donation.id);
                        }
                    });
                } else {
                    showCheer();
                }
            }

            initCheer();
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

            listenToOverlayStatus();
        }
        console.log(donationQueue);
    }, [streamerId, streamerUid, donationQueue, listenersAreSetted, isPlayingAudio, reactionsEnabled]);

    function finishReaction(donation) {
        setDonationToShow(null);
        setShowEmojiRain(false);
        if (donation.twitchUserName === 'QAPLA' && donation.message === 'Test') {
            removeTestDonation(streamerUid, donation.id);
        } else {
            markDonationAsRead(streamerUid, donation.id);
        }
        setTimeout(() => {
            setIsPlayingAudio(false);
        }, 750);
    }

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

    const startDonation = () => {
        const qoinsDonation = donationToShow.amountQoins && donationToShow.amountQoins >= 100;
        const bigQoinsDonation = Boolean(qoinsDonation && donationToShow.amountQoins >= 1000).valueOf();
        if (bigQoinsDonation) {
            voiceBotMessage.play();
        } else if ((!donationToShow.media || donationToShow.media.type !== GIPHY_CLIP || donationToShow.media.type !== GIPHY_CLIPS)) {
            audioAlert.play();
            if (donationToShow.message) {
                audioAlert.onended = () => {
                    setTimeout(() => {
                        voiceBotMessage.play();
                    }, 750);
                }
            }
        }
    }

    document.body.style.backgroundColor = 'transparent';
    return (
        <div style={{ display: 'flex', backgroundColor: 'transparent', maxHeight: '100vh', width: '100%', placeItems: 'flex-end' }}>
            {reactionsEnabled &&
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
                        top: alertOnTop ? '-15px' : 'auto',
                        bottom: alertOnTop ? 'auto' : '-15px',
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
            }
            {showEmojiRain &&
                <div id="animate" style={{
                    position: 'fixed',
                    top: 100,
                    bottom: 0,
                    left: '800px',
                    right: 0,
                    transform: 'scale(1.5)',
                }}></div>
            }
            {donationToShow &&
                <>
                    <DonationHandler donationToShow={donationToShow} finishReaction={finishReaction} startDonation={startDonation} />
                </>
            }
        </div>
    );
}

const DonationHandler = ({ donationToShow, finishReaction, startDonation }) => {
    const [clip, setClip] = useState(null);
    const [mediaReady, setMediaReady] = useState(false);
    const [giphyTextReady, setGiphyTextReady] = useState(false);
    const [showDonation, setShowDonation] = useState(false);
    const [muteClip, setMuteClip] = useState(false);
    const donation = donationToShow;

    useEffect(() => {
        const getClip = async () => {
            const { data } = await gf.gif(donation.media.id);
            setClip(data);
            setShowDonation(true);
        }

        if ((donation.media && (donation.media.type === GIPHY_CLIP || donation.media.type === GIPHY_CLIPS) && donation.media.id) && !clip) {
            getClip();
        } else {
            if (donation.media && donation.messageExtraData && donation.messageExtraData.giphyText && mediaReady && giphyTextReady) {
                displayDonation();
            }

            if (!(donation.messageExtraData && donation.messageExtraData.giphyText) && donation.media && mediaReady) {
                displayDonation();
            }

            if ((!donation.media) && donation.messageExtraData && donation.messageExtraData.giphyText && giphyTextReady) {
                displayDonation();
            }

            if (donation.message && !donation.media && !(donation.messageExtraData && donation.messageExtraData.giphyText)) {
                displayDonation();
            }
        }
    }, [clip, mediaReady, giphyTextReady]);

    const displayDonation = () => {
        setShowDonation(true);
        startDonation();
    }

    const onClipEnded = (count) => {
        if (count === 1) {
            setMuteClip(true);
            const qoinsDonation = donation.amountQoins && donation.amountQoins >= 100;
            const bigQoinsDonation = Boolean(qoinsDonation && donation.amountQoins >= 1000).valueOf();

            if (bigQoinsDonation) {
                setTimeout(() => {
                    startDonation(donation);
                }, 100);
            } else {
                setTimeout(() => {
                    finishReaction(donation);
                }, 5000);
            }
        }
    }

    return (
        <div style={{
            opacity: showDonation ? 1 : 0,
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            backgroundColor: '#f0f0',
            padding: '0px 40px',
            marginBottom: '30px',
            marginLeft: donation.isRightSide ? '0px' : '20px',
            marginRight: donation.isRightSide ? '20px' : '0px'
        }}>
            {donation.media &&
                <>
                {donation.media && (donation.media.type === MEME || donation.media.type === GIPHY_GIF || donation.media.type === GIPHY_STICKER || donation.media.type === MEMES || donation.media.type === GIPHY_GIFS || donation.media.type === GIPHY_STICKERS) ?
                    <img src={donation.media.url} alt='' style={{
                        aspectRatio: donation.media.width / donation.media.height,
                        display: 'flex',
                        alignSelf: donation.isRightSide ? 'flex-end' : 'flex-start',
                        maxHeight: '250px',
                        objectFit: 'scale-down'
                    }}
                    onLoad={() => setMediaReady(true)} />
                    :
                    donation.media && (donation.media.type === GIPHY_CLIP || donation.media.type === GIPHY_CLIPS) && clip ?
                        <div style={{
                            display: 'flex',
                            aspectRatio: donation.media.width / donation.media.height,
                            alignSelf: donation.isRightSide ? 'flex-end' : 'flex-start',
                            maxHeight: '250px',
                            objectFit: 'scale-down'
                        }}>
                            <Video hideAttribution gif={clip} height={250} muted={muteClip} loop onLoop={onClipEnded} />
                        </div>
                    :
                    null
                }
                </>
            }
            {donation.messageExtraData && donation.messageExtraData.giphyText &&
                <img src={donation.messageExtraData.giphyText.url} alt='' style={{
                    aspectRatio: donation.messageExtraData.giphyText.width / donation.messageExtraData.giphyText.height,
                    display: 'flex',
                    alignSelf: donation.isRightSide ? 'flex-end' : 'flex-start',
                    maxHeight: '250px',
                    objectFit: 'scale-down'
                }}
                onLoad={() => setGiphyTextReady(true)} />
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
                        <b style={{ color: '#0AFFD2' }}>{`${donation.twitchUserName} `}</b>
                        {donation.amountQoins ?
                            <>
                            <div style={{ margin: '0 6px' }}>has sent you</div>
                            <b style={{ color: '#0AFFD2', fontWeight: '700', }}>
                                {`${donation.amountQoins.toLocaleString()} Qoins`}
                            </b>
                            </>
                            :
                            <b style={{ color: '#FFF', fontWeight: '700', margin: '0 6px' }}>
                                reacted
                            </b>
                        }
                    </p>
                </div>
                {donation.amountQoins ?
                    <>
                    <div style={{ width: '10px' }}></div>
                    <div style={{ display: 'flex', alignSelf: 'center' }}>
                        <DonatedQoin style={{ display: 'flex', width: '38px', height: '38px' }} />
                    </div>
                    </>
                    :
                    null
                }
            </div>
            {(donation.message && !(donation.messageExtraData && donation.messageExtraData.giphyText)) &&
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
            }
        </div >
    )
}

export default LiveDonations;