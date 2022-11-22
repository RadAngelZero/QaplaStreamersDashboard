import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Video } from '@giphy/react-components';
import * as THREE from 'three';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Text } from 'troika-three-text';
import { useGLTF, GradientTexture, OrbitControls } from '@react-three/drei';
import { useTranslation } from 'react-i18next';

import styles from './LiveDonations.module.css';
import { ReactComponent as DonatedQoin } from './../../assets/DonatedQoin.svg';
import { listenToUserStreamingStatus, getStreamerUidWithTwitchId, listenForUnreadStreamerCheers, markDonationAsRead, removeListenerForUnreadStreamerCheers, listenForTestCheers, removeTestDonation, listenToStreamerAlertsSettings, markOverlayAsActive, onLiveDonationsDisconnect, listenForUberduckAudio, removeListenerForUberduckAudio, listenForUnreadUsersGreetings, removeListenerForUnreadUsersGreetings, markGreetingAsRead, getAvatarAnimationData, logOverlayError, getStreamerDashboardUserLanguage, listenStreamerDashboardUserLanguage } from '../../services/database';
import channelPointReactionAudio from '../../assets/channelPointReactionAudio.mp3';
import qoinsReactionAudio from '../../assets/qoinsReactionAudio.mp3';
import QoinsDropsAudio from '../../assets/siu.mp3';
import { speakCheerMessage, speakCheerMessageUberDuck } from '../../services/functions';
import { EMOTE, GIPHY_CLIP, GIPHY_CLIPS, GIPHY_GIF, GIPHY_GIFS, GIPHY_STICKER, GIPHY_STICKERS, MEME, MEMES, TEST_MESSAGE_SPEECH_URL } from '../../utilities/Constants';
import QaplaOnLeft from '../../assets/Qapla-On-Overlay-Left.png';
import QaplaOnRight from '../../assets/Qapla-On-Overlay-Right.png';
import { getCheerVoiceMessage } from '../../services/storage';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import { changeLanguage, getCurrentLanguage } from '../../utilities/i18n';
import ChatBubbleiOS from '../ChatBubbleiOS/ChatBubbleiOS';

const gf = new GiphyFetch('1WgsSOSfrTXTN4IGMMuhajM7WsfxoSdq');

extend({ Text });

let audioAlert = new Audio(channelPointReactionAudio);
let voiceBotMessage = new Audio(channelPointReactionAudio);

const LiveDonations = () => {
    const [streamerUid, setStreamerUid] = useState('');
    const [donationQueue, setDonationQueue] = useState([]);
    const [greetingsQueue, setGreetingsQueue] = useState([]);
    const [donationToShow, setDonationToShow] = useState(null);
    const [greetingToShow, setGreetingToShow] = useState(null);
    const [listenersAreSetted, setListenersAreSetted] = useState(false);
    const [alertSideRight, setAlertSideRight] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [qaplaOnOpacity, setQaplaOnOpacity] = useState(1);
    const [playQaplaOnAnimation, setPlayQaplaOnAnimation] = useState("false");
    const [showEmojiRain, setShowEmojiRain] = useState(false);
    const [reactionsEnabled, setReactionsEnabled] = useState(true);
    const [alertOffsets, setAlertOffsets] = useState({ top: 0, left: 0 });
    const [qaplaOnOffsets, setQaplaOnOffsets] = useState({ left: 0, right: 0, bottom: 0 });
    const happyTalkingAnimation = useGLTF('https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/AvatarsAnimations%2FTalkingAvatarHappy.glb?alt=media&token=2c2d24f1-a8bf-47be-850f-06eeda6fe885');
    const { streamerId } = useParams();
    const { t } = useTranslation();

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

        const popGreeting = () => {
            const indexToPop = greetingsQueue.length - 1;
            const greetingToPop = greetingsQueue[indexToPop];
            setGreetingsQueue(greetingsQueue.filter((greeting) => greeting.id !== greetingsQueue[indexToPop].id));

            return greetingToPop;
        }

        async function getStreamerUid() {
            if (streamerId) {
                const uid = await getStreamerUidWithTwitchId(streamerId);
                setStreamerUid(uid);

                listenToStreamerAlertsSettings(uid, (streamerSettings) => {
                    if (streamerSettings.exists()) {
                        setReactionsEnabled(streamerSettings.val().reactionsEnabled !== false);

                        let alertsOffsets = {};
                        if (streamerSettings.val().reactionCoordinates) {
                            // The only time alerts are displayed to the right is in x === 3
                            setAlertSideRight(streamerSettings.val().reactionCoordinates.x === 3);
                            switch (streamerSettings.val().reactionCoordinates.y) {
                                case 1:
                                    alertsOffsets.top = '0%';
                                    break;
                                case 2:
                                    alertsOffsets.top = '22%';
                                    break;
                                case 3:
                                    alertsOffsets.bottom = '0%';
                                    break;
                                default:
                                    break;
                            }

                            switch (streamerSettings.val().reactionCoordinates.x) {
                                case 1:
                                    alertsOffsets.left = '5%';
                                    break;
                                case 2:
                                    alertsOffsets.left = '40%';
                                    break;
                                case 3:
                                    alertsOffsets.left = '65%';
                                    break;
                                default:
                                    break;
                            }
                        } else {
                            alertsOffsets = {
                                left: streamerSettings.val().alertSideRight ? '65%' : '5%',
                                top: '0%'
                            };
                        }

                        setAlertOffsets(alertsOffsets);

                        let qaplaOnOffsets = {};
                        /**
                         * Currently Qapla on only can be at the bottom of the screen totally aligned to the
                         * left or to the right
                         */
                        if (streamerSettings.val().qaplaOnCoordinates) {
                            switch (streamerSettings.val().qaplaOnCoordinates.y) {
                                case 1:
                                    qaplaOnOffsets.bottom = '-15px';
                                    break;
                                default:
                                    break;
                            }

                            switch (streamerSettings.val().qaplaOnCoordinates.x) {
                                case 1:
                                    qaplaOnOffsets.left = '-12px';
                                    qaplaOnOffsets.right = 'auto';
                                    break;
                                case 2:
                                    qaplaOnOffsets.right = '-12px';
                                    qaplaOnOffsets.left = 'auto';
                                    break;
                                default:
                                    break;
                            }
                        } else {
                            qaplaOnOffsets = {
                                bottom: 0,
                                right: streamerSettings.val().alertSideRight ? '-12px' : 'auto',
                                left: streamerSettings.val().alertSideRight ? 'auto' : '-12px',
                            };
                        }

                        setQaplaOnOffsets(qaplaOnOffsets);
                    }
                });

                listenForTestCheers(uid, (donation) => {
                    pushDonation({ ...donation.val(), id: donation.key });
                });
            }
        }

        async function loadDonations() {
            listenForUnreadStreamerCheers(streamerUid, (donationsSnap) => {
                const donations = [];
                donationsSnap.forEach((donation) => {
                    donations.unshift({ ...donation.val(), id: donation.key });
                });

                setDonationQueue(donations);
            });
        }

        async function loadGreetings() {
            listenForUnreadUsersGreetings(streamerUid, (greetingsSnap) => {
                const greetings = [];
                greetingsSnap.forEach((greeting) => {
                    greetings.unshift({ ...greeting.val(), id: greeting.key });
                });

                setGreetingsQueue(greetings);
            });
        }

        function loadLanguage() {
            listenStreamerDashboardUserLanguage(streamerUid, (language) => {
                changeLanguage(language.val() ?? 'es');
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

         function addEmoteCircle(delay, range, color) {
            setTimeout(function () {
               let c = new EmoteCircle(range[0] + Math.random() * range[1], 80 + Math.random() * 4, color, {
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

        class EmoteCircle {
            constructor(x, y, color, velocity, range) {
                let _this = this;
                this.x = x;
                this.y = y;
                this.color = color;
                this.velocity = velocity;
                this.range = range;
                this.element = document.createElement('img');
                /*this.element.style.display = 'block';*/
                this.element.style.opacity = 0;
                this.element.style.position = 'absolute';
                this.element.style.color = 'hsl(' + (Math.random() * 360 | 0) + ',80%,50%)';
                this.element.style.width = '30px'
                this.element.style.height = '30px'
                this.element.src = color;
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

        function executeEmoteRain(emote) {
            setShowEmojiRain(true);
            for (let i = 0; i < 10; i++) {
                addEmoteCircle(i * 350, [10 + 0, 300], emote[Math.floor(Math.random() * emote.length)]);
                addEmoteCircle(i * 350, [10 + 0, -300], emote[Math.floor(Math.random() * emote.length)]);
                addEmoteCircle(i * 350, [10 - 200, -300], emote[Math.floor(Math.random() * emote.length)]);
                addEmoteCircle(i * 350, [10 + 200, 300], emote[Math.floor(Math.random() * emote.length)]);
                addEmoteCircle(i * 350, [10 - 400, -300], emote[Math.floor(Math.random() * emote.length)]);
                addEmoteCircle(i * 350, [10 + 400, 300], emote[Math.floor(Math.random() * emote.length)]);
                addEmoteCircle(i * 350, [10 - 600, -300], emote[Math.floor(Math.random() * emote.length)]);
                addEmoteCircle(i * 350, [10 + 600, 300], emote[Math.floor(Math.random() * emote.length)]);
                addEmoteCircle(i * 350, [10 + 600, 300], emote[Math.floor(Math.random() * emote.length)]);
                addEmoteCircle(i * 350, [10 + 600, 300], emote[Math.floor(Math.random() * emote.length)]);
            }

            animate();
        }

        if (streamerUid && !listenersAreSetted) {
            listenToUserStreamingStatus(streamerUid, (isStreaming) => {
                setListenersAreSetted(true);
                if (isStreaming.exists() && isStreaming.val()) {
                    loadGreetings();
                    loadDonations();
                    loadLanguage();
                } else {
                    removeListenerForUnreadUsersGreetings(streamerUid);
                    setGreetingsQueue([]);

                    removeListenerForUnreadStreamerCheers(streamerUid);
                    setDonationQueue([]);
                }
            });
        }

        if (!isPlayingAudio && reactionsEnabled) {
            if (greetingsQueue.length > 0) {
                setIsPlayingAudio(true);
                const greeting = popGreeting();

                async function showGreeting() {
                    const voiceToUse = getCurrentLanguage() === 'en' ? 'en-US-Standard-C' : 'es-US-Standard-A';
                    const messageToRead = t('LiveDonations.greetingMessage', { viewerName: greeting.twitchUsername, message: greeting.message });

                    const cheerMessageUrl = await speakCheerMessage(streamerUid, greeting.id, messageToRead, voiceToUse, 'en-US');
                    voiceBotMessage = new Audio(cheerMessageUrl.data);

                    setGreetingToShow(greeting);
                }

                showGreeting();

            } else if (donationQueue.length > 0) {
                setIsPlayingAudio(true);
                const donation = popDonation();

                async function showCheer(audioUrl) {
                    const qoinsDonation = donation.amountQoins && donation.amountQoins >= 100;
                    const bigQoinsDonation = Boolean(qoinsDonation && donation.amountQoins >= 1000).valueOf();

                    // Donations without uid are for Qoins Drops alerts and they have an special sound
                    if (donation.uid) {
                        audioAlert = new Audio(qoinsDonation ? qoinsReactionAudio : channelPointReactionAudio);
                        audioAlert.volume = 1
                    } else {
                        audioAlert = new Audio(QoinsDropsAudio);
                        audioAlert.volume = 0.7
                    }

                    if (audioUrl || !donation.repeating) {
                        const voiceToUse = donation.messageExtraData && donation.messageExtraData.voiceAPIName ? donation.messageExtraData.voiceAPIName : 'es-US-Standard-A';

                        if (donation.message) {
                            if (donation.twitchUserName === 'QAPLA' && donation.message === 'Test') {
                                voiceBotMessage = new Audio(TEST_MESSAGE_SPEECH_URL);
                            } else {
                                const messageToRead = bigQoinsDonation ?
                                    t('LiveDonations.bigQoinsDonationMessage', { viewerName: donation.twitchUserName, qoins: donation.amountQoins, message: donation.message })
                                    :
                                    t('LiveDonations.donationMessage', { viewerName: donation.twitchUserName, message: donation.message });

                                window.analytics.track('Cheer received', {
                                    user: donation.twitchUserName,
                                    containsMessage: true,
                                    message: messageToRead
                                });
                                const cheerMessageUrl = await speakCheerMessage(streamerUid, donation.id, messageToRead, voiceToUse, 'en-US');
                                voiceBotMessage = new Audio(audioUrl ? audioUrl : cheerMessageUrl.data);
                            }
                        } else if (bigQoinsDonation) {
                            const messageToRead = `${donation.twitchUserName} sent ${donation.amountQoins} Coins`;

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

                    setDonationToShow(donation);

                    if (donation.emojiRain && donation.emojiRain.emojis) {
                        if (donation.emojiRain.type === EMOTE) {
                            executeEmoteRain(donation.emojiRain.emojis);
                        } else {
                            executeEmojiRain(donation.emojiRain.emojis);
                        }
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
                        const qoinsDonation = donation.amountQoins && donation.amountQoins >= 100;
                        const bigQoinsDonation = Boolean(qoinsDonation && donation.amountQoins >= 1000).valueOf();

                        const messageToRead = bigQoinsDonation ?
                                    t('LiveDonations.bigQoinsDonationMessage', { viewerName: donation.twitchUserName, qoins: donation.amountQoins, message: donation.message })
                                    :
                                    t('LiveDonations.donationMessage', { viewerName: donation.twitchUserName, message: donation.message });

                        const voiceUuid = donation.messageExtraData.voiceAPIName.substring(9);
                        await speakCheerMessageUberDuck(donation.id, messageToRead, voiceUuid);
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
    }, [streamerId, streamerUid, donationQueue, greetingsQueue, listenersAreSetted, isPlayingAudio, reactionsEnabled]);

    function finishReaction(donation) {
        /* setDonationToShow(null);
        setShowEmojiRain(false);
        if (donation.twitchUserName === 'QAPLA' && donation.message === 'Test') {
            removeTestDonation(streamerUid, donation.id);
        } else {
            markDonationAsRead(streamerUid, donation.id);
        }
        setTimeout(() => {
            setIsPlayingAudio(false);
        }, 750); */
    }

    function onReactionFailed(error, errorInfo, reaction) {
        /**
         * We could not play it, we save the error on database, we marked it as read and move on
         * to the next greeting/reaction
         */
        markDonationAsRead(streamerUid, reaction.id);
        setDonationToShow(null);
        setIsPlayingAudio(false);
        logOverlayError(streamerUid, { title: error.toString(), ...errorInfo, reaction });
    }

    function finishGreeting(greetingId) {
        // Mark as read inmediately
        markGreetingAsRead(streamerUid, greetingId);

        // Wait 5 seconds to remove from UI
        setTimeout(() => {
            setGreetingToShow(null);
            setTimeout(() => {
                setIsPlayingAudio(false);
            }, 750);
        }, 5000);
    }

    function onGreetingFailed(error, errorInfo, greeting) {
        /**
         * We could not play it, we save the error on database, we marked it as read and move on
         * to the next greeting/reaction
         */
        markGreetingAsRead(streamerUid, greeting.id);
        setGreetingToShow(null);
        setIsPlayingAudio(false);
        logOverlayError(streamerUid, { title: error.toString(), ...errorInfo, greeting });
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

    const startGreeting = () => {
        voiceBotMessage.play();
    }

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
                        ...qaplaOnOffsets,
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
                    <img src={qaplaOnOffsets.left === 'auto' ? QaplaOnRight : QaplaOnLeft} alt="qapla logo" />
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
                <ErrorBoundary onFail={(error, errorInfo) => onReactionFailed(error, errorInfo, donationToShow)}>
                    <DonationHandler donationToShow={donationToShow}
                        finishReaction={finishReaction}
                        startDonation={startDonation}
                        alertSideRight={alertSideRight}
                        alertOffsets={alertOffsets}
                        happyTalkingAnimation={happyTalkingAnimation.animations} />
                </ErrorBoundary>
            }
            {greetingToShow &&
                <ErrorBoundary onFail={(error, errorInfo) => onGreetingFailed(error, errorInfo, greetingToShow)}>
                    <Greeting {...greetingToShow}
                        // For render timeout
                        onFail={(error, errorInfo) => onGreetingFailed(error, errorInfo, greetingToShow)}
                        alertSideRight={alertSideRight}
                        alertOffsets={alertOffsets}
                        finishGreeting={finishGreeting}
                        startGreeting={startGreeting} />
                </ErrorBoundary>
            }
        </div>
    );
}

const DonationHandler = ({ donationToShow, finishReaction, startDonation, alertSideRight, alertOffsets, happyTalkingAnimation }) => {
    const [clip, setClip] = useState(null);
    const [mediaReady, setMediaReady] = useState(false);
    const [giphyTextReady, setGiphyTextReady] = useState(false);
    const [showDonation, setShowDonation] = useState(false);
    // If the user has avatar and avatar id then mark as not ready otherwise mark as ready
    const [avatarReady, setAvatarReady] = useState(donationToShow.avatar && donationToShow.avatar.avatarId !== '' ? false : true);
    /**
     * Qoins Bubble should only appear if we have a channel points reaction without TTS or if the donation has
     * more than 0 Qoins
     */
    const [showQoinsBubble, setShowQoinsBubble] = useState(donationToShow.uid && ((donationToShow.amountQoins <= 0 && !donationToShow.message) || donationToShow.amountQoins > 0));
    const [muteClip, setMuteClip] = useState(false);
    const { t } = useTranslation();
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
            if (avatarReady && donation.media && donation.messageExtraData && donation.messageExtraData.giphyText && mediaReady && giphyTextReady) {
                displayDonation();
            }

            if (avatarReady && !(donation.messageExtraData && donation.messageExtraData.giphyText) && donation.media && mediaReady) {
                displayDonation();
            }

            if (avatarReady && (!donation.media) && donation.messageExtraData && donation.messageExtraData.giphyText && giphyTextReady) {
                displayDonation();
            }

            if (avatarReady && donation.message && !donation.media && !(donation.messageExtraData && donation.messageExtraData.giphyText)) {
                displayDonation();
            }
        }
    }, [avatarReady, clip, mediaReady, giphyTextReady]);

    useEffect(() => {
        if (showDonation && showQoinsBubble) {
            // If the donation has Qoins
            if (donation.amountQoins > 0) {
                // If the donation has message
                if (donation.message) {
                    // Hide bubble after X time
                    setTimeout(() => {
                        setShowQoinsBubble(false);
                    }, 1645.714);
                }
                // If the donation don´t have message we never hide the bubble
            // If the donation does not have Qoins
            } else {
                // If the donation has message
                if (donation.message) {
                    // Hide bubble inmediately
                    setShowQoinsBubble(false);
                }
            }
        }
    }, [showDonation, showQoinsBubble]);

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

    const avatarShouldTalk = donation.avatar && donation.avatar.avatarId !== '';

    return (
        <div style={{
            position: 'absolute',
            ...alertOffsets,
            opacity: showDonation ? 1 : 0,
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            backgroundColor: '#f0f0',
            paddingTop: '64px',
            paddingBottom: '64px',
            paddingLeft: alertSideRight ? '0px' : '64px',
            paddingRight: alertSideRight ? '64px' : '0px'
        }}>
            {donation.media &&
                <>
                {donation.media && (donation.media.type === MEME || donation.media.type === GIPHY_GIF || donation.media.type === GIPHY_STICKER || donation.media.type === MEMES || donation.media.type === GIPHY_GIFS || donation.media.type === GIPHY_STICKERS) ?
                    <img src={donation.media.url} alt='' style={{
                        aspectRatio: donation.media.width / donation.media.height,
                        display: 'flex',
                        alignSelf: alertSideRight ? 'flex-end' : 'flex-start',
                        maxHeight: '250px',
                        objectFit: 'scale-down'
                    }}
                    onLoad={() => setMediaReady(true)} />
                    :
                    donation.media && (donation.media.type === GIPHY_CLIP || donation.media.type === GIPHY_CLIPS) && clip ?
                        <div style={{
                            display: 'flex',
                            aspectRatio: donation.media.width / donation.media.height,
                            alignSelf: alertSideRight ? 'flex-end' : 'flex-start',
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
            <div style={{
                display: showQoinsBubble ? 'flex' : 'none',
                marginTop: '40px'
            }}>
                {donation.message === '' &&
                    <img src={donation.photoURL}
                        height='120px'
                        width='120px'
                        style={{
                            borderRadius: 100,
                            marginRight: '6px'
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
                        borderRadius: '30px',
                        padding: '24px 24px',
                        alignSelf: alertSideRight ? 'flex-end' : 'flex-start',
                        zIndex: 10
                    }}>
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
                                <div style={{ margin: '0 6px' }}>
                                    {t('LiveDonations.sent')}
                                </div>
                                <b style={{ color: '#0AFFD2', fontWeight: '700', }}>
                                    {`${donation.amountQoins.toLocaleString()} Qoins`}
                                </b>
                                </>
                                :
                                <div style={{ margin: '0 6px' }}>
                                    {t('LiveDonations.reacted')}
                                </div>
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
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                opacity: showQoinsBubble ? 0 : 1
            }}>
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: alertSideRight ? 'flex-end' : 'flex-start'
                }}>
                    {avatarShouldTalk ?
                        <Canvas camera={{
                                position: [0, 1.6871838845728084, 0.403600876626397],
                                aspect: 1
                            }}
                            style={{
                                width: '180px',
                                height: '180px',
                                alignSelf: alertSideRight ? 'flex-end' : 'flex-start'
                            }}>
                            <ambientLight intensity={1} />
                            <directionalLight intensity={0.4} />
                            <OrbitControls />
                            <Suspense fallback={null}>
                                <TalkingAvatarAnimation avatarId={donation.avatar.avatarId}
                                    animations={happyTalkingAnimation}
                                    setAvatarReady={() => setAvatarReady(true)} />
                            </Suspense>
                        </Canvas>
                        :
                        <img src={donation.photoURL}
                            height='120px'
                            width='120px'
                            style={{
                                borderRadius: 100,
                                marginRight: '6px'
                            }} />
                    }
                    {donation.messageExtraData && donation.messageExtraData.giphyText &&
                        <div style={{
                            position: 'absolute',
                            top: '-25px',
                            left: alertSideRight ? undefined : '120px',
                            right: alertSideRight ? '120px' : undefined,
                            display: 'flex',
                            width: '400px'
                        }}>
                            <img src={donation.messageExtraData.giphyText.url} alt='' style={{
                                aspectRatio: donation.messageExtraData.giphyText.width / donation.messageExtraData.giphyText.height,
                                display: 'flex',
                                alignSelf: alertSideRight ? 'flex-end' : 'flex-start',
                                maxHeight: '250px',
                                objectFit: 'scale-down'
                            }}
                            onLoad={() => setGiphyTextReady(true)} />
                        </div>
                    }
                    {(donation.message !== '' && !(donation.messageExtraData && donation.messageExtraData.giphyText)) &&
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            left: alertSideRight ? undefined : '136px',
                            right: alertSideRight ? '136px' : undefined,
                            display: 'flex',
                            width: '400px'
                        }}>
                            <ChatBubbleiOS
                                bubbleColor='#22F'
                                textColor='#FFF'
                                maxWidth='500px'
                                tailRight={alertSideRight}>
                                {donation.message}
                            </ChatBubbleiOS>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

const TalkingAvatarAnimation = (props) => {
    const group = useRef();
    const { scene } = useGLTF(`https://api.readyplayer.me/v1/avatars/${props.avatarId}.glb?meshLod=1&textureAtlas=1024&pose=A&textureSizeLimit=1024`);
    const [avatarMixer] = useState(() => new THREE.AnimationMixer());

    useEffect(() => {
        if (scene) {
            props.setAvatarReady();
        }

        if (props.animations) {
            avatarMixer.stopAllAction();
            const headAnimation = avatarMixer.clipAction(props.animations[0], group.current);
            const talkingAnimation = avatarMixer.clipAction(props.animations[3], group.current);

            headAnimation.fadeIn(.5).play();
            talkingAnimation.fadeIn(.5).play();
        }
    }, [props.animations, avatarMixer, scene]);

    useFrame((state, delta) => {
        state.camera.lookAt(state.camera.position);
        state.camera.updateProjectionMatrix();

        avatarMixer.update(delta);
    });

    return (
        <group ref={group} {...props} dispose={null}>
            <primitive object={scene} />
        </group>
    );
}

const fonts = {
    PolychromeNano: 'https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/Experiments%2FMDPolychrome-Nano.otf?alt=media&token=6747a8d1-9b89-4409-9ca6-e6dc3646c7b0',
    YerkRegulat: 'https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/Experiments%2FYerk-Regular.ttf?alt=media&token=0992539c-4d70-4e2c-bea4-b780df9a6514',
    NichromeUltra: 'https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/Experiments%2FMDNichrome-Ultra.otf?alt=media&token=b0f618c1-fff9-4cc5-89bf-ada84365faa4'
};

const Greeting = ({ id, startGreeting, twitchUsername, animationId, avatarId, alertSideRight, alertOffsets, finishGreeting, onFail }) => {
    const [showGreeting, setShowGreeting] = useState(false);
    const [animationData, setAnimationData] = useState(null);
    const [avatarReady, setAvatarReady] = useState(false);
    const [textReady, setTextReady] = useState(false);
    const [renderTimeout, setRenderTimeout] = useState(null);
    const [textOpts, setTextOpts] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        async function getAnimation() {
            const animationData = await getAvatarAnimationData(animationId);
            if (animationData.exists()) {
                setAnimationData({ ...animationData.val() });

                // Get random font
                const fontsKeys = Object.keys(fonts);
                const fontIndex = Math.floor(Math.random() * fontsKeys.length);
                const font = fontsKeys[fontIndex];

                setTextOpts({
                    ...animationData.val().text[font],
                    name: t('LiveDonations.viewerName', { viewerName: twitchUsername }),
                    font
                });
            } else {
                setAnimationData(undefined);
            }
        }

        if (animationId) {
            getAnimation();
        }
    }, []);

    useEffect(() => {
        if (!showGreeting && avatarReady && textReady) {
            setShowGreeting(true);
            startGreeting();
        }
    }, [avatarReady, textReady, showGreeting]);

    useEffect(() => {
        if (showGreeting) {
            /**
             * Render Timeout error is the only timeout, but it could be duplicated so we remove all
             * the timeouts
             */
            let id = setTimeout(function() {}, 0);

            while (id--) {
                clearTimeout(id);
            }
        } else if (!renderTimeout) {
            setRenderTimeout(
                setTimeout(
                    () => {
                        onFail('Render Timeout', {});
                        clearTimeout(renderTimeout);
                    },
                    30000
                )
            );
        }
    }, [showGreeting, renderTimeout]);

    if (animationData === undefined) {
        throw new Error(`Animation ${animationId} not found`);
    }

    return (
        <div style={{
            position: 'absolute',
            ...alertOffsets,
            opacity: showGreeting ? 1 : 0,
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            backgroundColor: '#f0f0',
            paddingTop: '64px'
        }}>
            {animationData && textOpts &&
                <>
                <div style={{
                    display: 'flex',
                    alignSelf: alertSideRight ? 'flex-end' : 'flex-start',
                    width: '1000px',
                    height: '1000px'
                }}>
                    <Canvas camera={{ position: [
                                animationData.camera.position.x,
                                animationData.camera.position.y,
                                animationData.camera.position.z
                            ], aspect: animationData.camera.aspect ?? 1 }}
                        style={{
                            width: '100%',
                            height: '100%'
                        }}>
                        <ambientLight intensity={1} />
                        <directionalLight intensity={0.4} />
                        <Suspense fallback={null}>
                            <AvatarAnimation animationData={animationData}
                                avatarId={avatarId}
                                showGreeting={showGreeting}
                                setAvatarReady={() => setAvatarReady(true)}
                                finishGreeting={finishGreeting}
                                greetingId={id} />
                        </Suspense>
                        <Suspense fallback={null}>
                            <Text3DTest textOpts={textOpts}
                                showGreeting={showGreeting}
                                setTextReady={() => setTextReady(true)} />
                        </Suspense>
                    </Canvas>
                </div>
                </>
            }
        </div>
    );
}

const AvatarAnimation = (props) => {
    const group = useRef();
    const { scene } = useGLTF(`https://api.readyplayer.me/v1/avatars/${props.avatarId}.glb`);
    const { animations } = useGLTF(props.animationData.url);
    const [avatarMixer] = useState(() => new THREE.AnimationMixer());
    const [cameraReady, setCameraReady] = useState(false);

    useEffect(() => {
        if (scene && !props.showGreeting) {
            props.setAvatarReady();
        }

        if (props.showGreeting && animations && cameraReady) {
            const animation = avatarMixer.clipAction(animations[0], group.current);

            /**
             * If the animation is not infinite and it last more than the voice bot then wait for the animation
             * to end to finish the greeting
             */
            if (!props.animationData.loop && animations[0].duration >= voiceBotMessage.duration) {
                avatarMixer.addEventListener('finished', (e) => {
                    avatarMixer.removeEventListener('finished');
                    props.finishGreeting(props.greetingId);
                });
            /**
             * If the animation is in loop or the voice bot duration is greater than the animation duration
             * then wait for the voice bot to end to finish the greeting
             */
            } else {
                voiceBotMessage.onended = () => {
                    props.finishGreeting(props.greetingId);
                }
            }

            animation.clampWhenFinished = !props.animationData.loop;

            animation.fadeIn(.5).play().setLoop(props.animationData.loop ? THREE.LoopRepeat : THREE.LoopOnce);
        }
    }, [animations, avatarMixer, avatarMixer, cameraReady, scene, props.showGreeting]);

    useFrame((state, delta) => {
        if (props.showGreeting) {
            state.camera.aspect = 1;
            state.camera.rotation.set(
                props.animationData.camera.rotation.x,
                props.animationData.camera.rotation.y,
                props.animationData.camera.rotation.z
            );
            state.camera.position.lerp(
                (new THREE.Vector3(
                        props.animationData.camera.position.x,
                        props.animationData.camera.position.y,
                        props.animationData.camera.position.z
                    )
                ),
                1
            );
            state.camera.updateProjectionMatrix();
        }
        if (!cameraReady) {
            setCameraReady(true);
        }

        avatarMixer.update(delta);
    });

    return (
        <group ref={group} {...props} dispose={null}>
            <primitive object={scene} />
        </group>
    );
}

const Text3DTest = ({ textOpts, setTextReady, showGreeting }) => {
    const textP1 = useRef(null);
    const textP2 = useRef(null);
    const [text1Ready, setText1Ready] = useState(false);
    const [text2Ready, setText2Ready] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        if (!showGreeting && text1Ready /*  && text2Ready */) {
            setTextReady();
        }
        setTimeout(() => {
            setTextReady();
        }, 10000);
    }, [text1Ready, /* text2Ready, */ showGreeting]);

    useFrame((state) => {
        textP1.current.lookAt(state.camera.position);
        textP2.current.lookAt(state.camera.position);
    });

    return (
        <>
        <mesh position={[textOpts.x, textOpts.y, textOpts.z]} onAfterRender={() => setText1Ready(true)}>
            <text {...textOpts}
                font={fonts[textOpts.font]}
                ref={textP1}
                text={textOpts.name}
                anchorX='center'
                anchorY='middle'
                color='#FFF'
                outlineBlur={0}
                outlineOffsetX='-6%'
                outlineOffsetY='6%'
                outlineColor='#7000FF'
                textAlign='center'>
                <meshBasicMaterial attach='material'>
                    <GradientTexture
                        stops={[0, 1]}
                        colors={['#FFB097', '#42FFC7']}
                        center={[.5, .5]}
                        rotation={1.5} />
                </meshBasicMaterial>
            </text>
        </mesh>
        <mesh position={[textOpts.x1, textOpts.y1, textOpts.z1]} onAfterRender={() => setText2Ready(true)}>
            <text {...textOpts}
                font={fonts[textOpts.font]}
                ref={textP2}
                text={t('LiveDonations.viewerArrived')}
                anchorX='center'
                anchorY='middle'
                color='#FFF'
                outlineBlur={0}
                outlineOffsetX='-6%'
                outlineOffsetY='6%'
                outlineColor='#7000FF'
                textAlign='center'>
                <meshBasicMaterial attach='material' />
            </text>
        </mesh>
        </>
    );
}

export default LiveDonations;