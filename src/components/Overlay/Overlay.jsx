import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as THREE from 'three';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Text } from 'troika-three-text';
import { useGLTF, GradientTexture } from '@react-three/drei';
import { useTranslation } from 'react-i18next';

import {
    listenToUserStreamingStatus,
    getStreamerUidWithTwitchId,
    listenForUnreadStreamerCheers,
    markDonationAsRead,
    removeListenerForUnreadStreamerCheers,
    listenForTestCheers,
    removeTestDonation,
    listenToStreamerAlertsSettings,
    markOverlayAsActive,
    onLiveDonationsDisconnect,
    listenForUberduckAudio,
    removeListenerForUberduckAudio,
    listenForUnreadUsersGreetings,
    removeListenerForUnreadUsersGreetings,
    markGreetingAsRead,
    getAvatarAnimationData,
    logOverlayError,
    listenStreamerDashboardUserLanguage
} from '../../services/database';
import channelPointReactionAudio from '../../assets/channelPointReactionAudio.mp3';
import qoinsReactionAudio from '../../assets/qoinsReactionAudio.mp3';
import QoinsDropsAudio from '../../assets/siu.mp3';
import { speakCheerMessage, speakCheerMessageUberDuck } from '../../services/functions';
import {
    BITS_DONATION,
    EMOTE_EXPLOSION,
    EMOTE_FIREWORKS,
    EMOTE_RAIN,
    EMOTE_TUNNEL,
    GIPHY_CLIP,
    GIPHY_CLIPS,
    TALKING_AVATAR_ANGRY,
    TALKING_AVATAR_HAPPY,
    TALKING_AVATAR_SAD,
    TEST_MESSAGE_SPEECH_URL
} from '../../utilities/Constants';
import QaplaOnLeft from '../../assets/Qapla-On-Overlay-Left.png';
import QaplaOnRight from '../../assets/Qapla-On-Overlay-Right.png';
import { getCheerVoiceMessage } from '../../services/storage';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import { changeLanguage, getCurrentLanguage } from '../../utilities/i18n';
import Reaction from './Components/Reaction';
import { emoteExplosion, emoteTunnel, startEmoteFireworks, startEmoteRain, startMatterEngine } from '../../utilities/OverlayEmotesAnimation';

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
    const [reactionsEnabled, setReactionsEnabled] = useState(true);
    const [alertOffsets, setAlertOffsets] = useState({ top: 0, left: 0 });
    const [reactionsCoordinates, setReactionsCoordinates] = useState({ x: 0, y: 0 });
    const [qaplaOnOffsets, setQaplaOnOffsets] = useState({ left: 0, right: 0, bottom: 0 });
    const angryTalkingAnimation = useGLTF('https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/AvatarsAnimations%2FTalkingAvatarAngry.glb?alt=media&token=fae7a5b2-c247-456a-ab2c-222e7dc38077');
    const happyTalkingAnimation = useGLTF('https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/AvatarsAnimations%2FTalkingAvatarHappy.glb?alt=media&token=2c2d24f1-a8bf-47be-850f-06eeda6fe885');
    const sadTalkingAnimation = useGLTF('https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/AvatarsAnimations%2FTalkingAvatarSad.glb?alt=media&token=f1174119-0bf7-480c-9a35-6e7c67cb57e6');
    const emoteExplosionContainer = useRef();
    const emoteTunelContainer = useRef();
    const matterjsContainer = useRef();
    const matterjsEngine = useRef();
    const { streamerId } = useParams();
    const { t } = useTranslation();

    useEffect(() => {
        startMatterEngine(matterjsContainer, matterjsEngine);
    }, []);

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
                            setReactionsCoordinates(streamerSettings.val().reactionCoordinates);
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
                                    alertsOffsets.left = '50%';
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
                changeLanguage(language.exists() ? language.val() : 'es');
            });
        }

        if (streamerUid && !listenersAreSetted) {
            listenToUserStreamingStatus(streamerUid, (isStreaming) => {
                setListenersAreSetted(true);
                loadLanguage();
                if (isStreaming.exists() && isStreaming.val()) {
                    loadGreetings();
                    loadDonations();
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
                        const voiceToUse = donation.messageExtraData && donation.messageExtraData.voiceAPIName ? donation.messageExtraData.voiceAPIName : (getCurrentLanguage() === 'en' ? 'en-US-Standard-C' : 'es-US-Standard-A');

                        if (donation.message) {
                            if (donation.twitchUserName === 'QAPLA' && donation.message === 'Test') {
                                voiceBotMessage = new Audio(TEST_MESSAGE_SPEECH_URL);
                            } else {
                                const messageToRead = bigQoinsDonation ?
                                        donation.donationType === BITS_DONATION ?
                                            t('LiveDonations.bigBitsDonationMessage', { viewerName: donation.twitchUserName, bits: donation.amountQoins, message: donation.message })
                                            :
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
                            const messageToRead = donation.donationType === BITS_DONATION ?
                                t('LiveDonations.bitsWithoutMessage', { viewerName: donation.twitchUserName, bits: donation.amountQoins })
                                :
                                t('LiveDonations.qoinsWithoutMessage', { viewerName: donation.twitchUserName, qoins: donation.amountQoins });

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

                    // Set avatar talking animation to show if necessary
                    let talkingAnimation = happyTalkingAnimation.animations;

                    switch (donation.talkingAnimationId) {
                        case TALKING_AVATAR_ANGRY:
                            talkingAnimation = angryTalkingAnimation.animations;
                            break;
                        case TALKING_AVATAR_HAPPY:
                            talkingAnimation = happyTalkingAnimation.animations;
                            break;
                        case TALKING_AVATAR_SAD:
                            talkingAnimation = sadTalkingAnimation.animations;
                            break;
                        default:
                            break;
                    }

                    setDonationToShow({
                        ...donation,
                        talkingAnimation
                    });

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
        setDonationToShow(null);
        emoteExplosionContainer.current.innerHTML = '';
        if (donation.twitchUserName === 'QAPLA' && donation.message === 'Test') {
            removeTestDonation(streamerUid, donation.id);
        } else {
            markDonationAsRead(streamerUid, donation.id);
        }
        setTimeout(() => {
            setIsPlayingAudio(false);
        }, 500);
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

        const emoteAnimation = donationToShow.emojiRain;

        if (emoteAnimation && emoteAnimation.emojis) {
            const reactionDurationInSeconds = ((!donationToShow.message && !bigQoinsDonation) ? audioAlert.duration : voiceBotMessage.duration) + 5;
            const animationId = emoteAnimation.animationId;

            switch (animationId) {
                case EMOTE_RAIN:
                    startEmoteRain(matterjsEngine.current, emoteAnimation.emojis, reactionDurationInSeconds);
                    break;
                case EMOTE_EXPLOSION:
                    emoteExplosion(emoteExplosionContainer.current, emoteAnimation.emojis)
                    break;
                case EMOTE_TUNNEL:
                    emoteTunnel(emoteTunelContainer.current, emoteAnimation.emojis, reactionDurationInSeconds);
                    break;
                case EMOTE_FIREWORKS:
                    startEmoteFireworks(matterjsEngine.current, emoteAnimation.emojis, reactionDurationInSeconds);
                    break;
                default:
                    // Could not find animation id but we have emotes, show emote rain
                    startEmoteRain(matterjsEngine.current, emoteAnimation.emojis, reactionDurationInSeconds);
                    break;
            }
        }

        if (bigQoinsDonation) {
            voiceBotMessage.play();
        } else if ((!donationToShow.media || donationToShow.media.type !== GIPHY_CLIP || donationToShow.media.type !== GIPHY_CLIPS)) {
            if (donationToShow.message) {
                voiceBotMessage.play();
            } else {
                audioAlert.play();
            }
        }
    }

    const startGreeting = () => {
        voiceBotMessage.play();
    }

    return (
        <div style={{ display: 'flex', backgroundColor: 'transparent', height: '100vh', width: '100%' }}>
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
            <div id='emote-explosion-container' ref={emoteExplosionContainer} style={{ overflow: 'hidden' }} />
            <div id='emote-tunel-container' style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            }} ref={emoteTunelContainer} />
            <div id='matterjs-container' style={{
                position: 'absolute',
                top: 0,
                left: 0
            }} ref={matterjsContainer}>
                <canvas width={document.body.clientWidth} height={document.body.clientWidth} id='matterjs-canvas'>
                </canvas>
            </div>
            {donationToShow &&
                <ErrorBoundary onFail={(error, errorInfo) => onReactionFailed(error, errorInfo, donationToShow)}>
                    <Reaction {...donationToShow}
                        startDonation={startDonation}
                        alertSideRight={alertSideRight}
                        reactionsCoordinates={reactionsCoordinates} />
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