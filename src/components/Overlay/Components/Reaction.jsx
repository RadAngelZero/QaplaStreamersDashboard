import React, { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useTranslation } from 'react-i18next';

import { getAvatarAnimationData } from '../../../services/database';

import { ReactComponent as Qoin } from './../../../assets/DonatedQoin.svg';
import { ReactComponent as Bits } from './../../../assets/Bits.svg';

import { BITS_DONATION } from '../../../utilities/Constants';

import ChatBubbleiOS from '../../ChatBubbleiOS/ChatBubbleiOS';

// Measures constants
const TALKING_AVATAR_ANIMATION_SIZE = 350;
const AVATAR_GENERIC_ANIMATION_SIZE = 900;
const SEPARATION_FROM_TALKING_AVATAR = 50;

const Reaction = ({
        photoURL,
        avatar,
        message,
        media,
        messageExtraData,
        amountQoins,
        twitchUserName,
        donationType,
        startDonation,
        alertSideRight,
        talkingAnimation,
        reactionsCoordinates
    }) => {
    const avatarShouldTalk = avatar && avatar.avatarId !== '' && !avatar.avatarAnimationId && message !== '';
    const avatarShouldDance = avatar && avatar.avatarId !== '' && avatar.avatarAnimationId;

    const [mediaReady, setMediaReady] = useState(false);
    const [giphyTextReady, setGiphyTextReady] = useState(false);
    const [showDonation, setShowDonation] = useState(false);
    // If the user has avatar and avatar id then mark as not ready otherwise mark as ready
    const [avatarReady, setAvatarReady] = useState((avatarShouldTalk || avatarShouldDance) ? false : true);
    const [animationData, setAnimationData] = useState(null);
    const [showMessage, setShowMessage] = useState(avatar && avatar.avatarId !== '' && avatar.avatarAnimationId ? false : true);
    const [isLoopAnimation, setIsLoopAnimation] = useState(false);

    useEffect(() => {
        if (avatarReady && media && messageExtraData && messageExtraData.giphyText && mediaReady && giphyTextReady) {
            displayDonation();
        }

        if (avatarReady && !(messageExtraData && messageExtraData.giphyText) && media && mediaReady) {
            displayDonation();
        }

        if (avatarReady && (!media) && messageExtraData && messageExtraData.giphyText && giphyTextReady) {
            displayDonation();
        }

        if (avatarReady && message && !media && !(messageExtraData && messageExtraData.giphyText)) {
            displayDonation();
        }

        /**
         * Extreme case, only known use: Testing
         * The reaction is basically empty but can contain a reaction, this will be useful also if in the future
         * we allow empty reactions only containing Qoins or Bits
         */
        if (avatarReady && !message && !media && !(messageExtraData && messageExtraData.giphyText)) {
            displayDonation();
        }
    }, [avatarReady, mediaReady, giphyTextReady]);

    useEffect(() => {
        async function getAnimation() {
            const animationData = await getAvatarAnimationData(avatar.avatarAnimationId);
            if (animationData.exists()) {
                setAnimationData({ ...animationData.val() });
            } else {
                setAnimationData(undefined);
            }
        }

        if (avatar && avatar.avatarId !== '' && avatar.avatarAnimationId) {
            getAnimation();
        }
    }, []);

    const displayDonation = () => {
        setShowDonation(true);
        startDonation();
    }

    const avatarAnimationFinished = (coords) => {
        setShowMessage(true);
    }

    const containsGiphyText = messageExtraData && messageExtraData.giphyText;

    const gifAspectRatio = media ? media.width / media.height : 0;
    const imageWidth = media ? (media.height > 350 ? gifAspectRatio * 350 : gifAspectRatio * media.height) : 0;
    const imageHeight = media ? (media.height > 350 ? 350 : media.height) : 0;

    const includesAvatarAnimation = avatarShouldDance || avatarShouldTalk;

    const contentHorizontalMargin = avatarShouldTalk ? TALKING_AVATAR_ANIMATION_SIZE - SEPARATION_FROM_TALKING_AVATAR : (animationData ? animationData.ttsMargin : 0);

    // Tested with talking avatar, media & Giphy Text
    // Tested with talking avatar, media, Giphy Text & Qoins

    // Tested with animated avatar, media & Giphy Text
    // Tested with animated avatar, media, Giphy Text & Qoins
    if (includesAvatarAnimation && media && message && containsGiphyText) {
        // Includes avatar animated, media, message and Giphy Text
        return (
            <ReactionsContainers reactionsCoordinates={reactionsCoordinates}
                showDonation={showDonation}
                alertSideRight={alertSideRight}
                avatarShouldDance={avatarShouldDance}>
                <ReactionMedia alertSideRight={alertSideRight}
                    media={media}
                    setMediaReady={setMediaReady}
                    avatarShouldDance={avatarShouldDance}
                    avatarShouldTalk={avatarShouldTalk}
                    animatedAvatarMargin={contentHorizontalMargin} />
                <div style={{
                    display: 'flex',
                    flexDirection: alertSideRight ? 'row-reverse' : 'row'
                }}>
                    <ReactionAvatar avatarShouldDance={avatarShouldDance}
                        avatarShouldTalk={avatarShouldTalk}
                        animationData={animationData}
                        alertSideRight={alertSideRight}
                        avatar={avatar}
                        setAvatarReady={setAvatarReady}
                        avatarAnimationFinished={avatarAnimationFinished}
                        setIsLoopAnimation={setIsLoopAnimation}
                        talkingAnimation={talkingAnimation}
                        photoURL={photoURL}
                        containsGiphyText={containsGiphyText}
                        isLoopAnimation={isLoopAnimation} />
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'absolute',
                        left: alertSideRight ? undefined : contentHorizontalMargin,
                        right: alertSideRight ? contentHorizontalMargin : undefined,
                        zIndex: -1,
                        opacity: showMessage ? 1 : 0
                    }}>
                        <GiphyTextMessage messageExtraData={messageExtraData}
                            setGiphyTextReady={setGiphyTextReady}
                            alertSideRight={alertSideRight}
                            showMessage={showMessage} />
                        <DonationBubble twitchUserName={twitchUserName}
                            amountQoins={amountQoins}
                            donationType={donationType}
                            alertSideRight={alertSideRight} />
                    </div>
                </div>
            </ReactionsContainers>
        );
    }

    // Tested with talking avatar, media & Bubble Message
    // Tested with talking avatar, media, Bubble Message & Qoins

    // Tested with animated avatar, media & Bubble Message
    // Tested with animated avatar, media, Bubble Message & Qoins
    if (includesAvatarAnimation && media && message && !containsGiphyText) {
        // Includes avatar animated, media and message but don't have Giphy Text
        return (
            <ReactionsContainers reactionsCoordinates={reactionsCoordinates}
                showDonation={showDonation}
                alertSideRight={alertSideRight}
                avatarShouldDance={avatarShouldDance}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <ReactionMedia alertSideRight={alertSideRight}
                        media={media}
                        setMediaReady={setMediaReady}
                        avatarShouldDance={avatarShouldDance}
                        avatarShouldTalk={avatarShouldTalk}
                        animatedAvatarMargin={contentHorizontalMargin} />
                    <MessageBubble message={message}
                        avatarShouldTalk={avatarShouldTalk}
                        avatarShouldDance={avatarShouldDance}
                        alertSideRight={alertSideRight}
                        showMessage={showMessage}
                        imageWidth={imageWidth}
                        animatedAvatarMargin={contentHorizontalMargin} />
                    <div style={{
                        display: 'flex',
                        flexDirection: alertSideRight ? 'row-reverse' : 'row',
                        position: 'relative'
                    }}>
                        <ReactionAvatar avatarShouldDance={avatarShouldDance}
                            avatarShouldTalk={avatarShouldTalk}
                            animationData={animationData}
                            alertSideRight={alertSideRight}
                            avatar={avatar}
                            setAvatarReady={setAvatarReady}
                            avatarAnimationFinished={avatarAnimationFinished}
                            setIsLoopAnimation={setIsLoopAnimation}
                            talkingAnimation={talkingAnimation}
                            photoURL={photoURL}
                            containsGiphyText={containsGiphyText}
                            isLoopAnimation={isLoopAnimation} />
                        <div style={{
                            marginTop: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            position: 'absolute',
                            left: alertSideRight ? undefined : (avatarShouldDance ? contentHorizontalMargin : TALKING_AVATAR_ANIMATION_SIZE - SEPARATION_FROM_TALKING_AVATAR),
                            right: alertSideRight ? (avatarShouldDance ? contentHorizontalMargin : TALKING_AVATAR_ANIMATION_SIZE - SEPARATION_FROM_TALKING_AVATAR) : undefined,
                            zIndex: -1,
                            opacity: showMessage ? 1 : 0
                        }}>
                            <DonationBubble twitchUserName={twitchUserName}
                                amountQoins={amountQoins}
                                donationType={donationType}
                                alertSideRight={alertSideRight} />
                        </div>
                    </div>
                </div>
            </ReactionsContainers>
        );
    }

    // Tested with animated avatar, media
    // Tested with animated avatar, media & Qoins
    if (includesAvatarAnimation && media && !message) {
        // Includes avatar animated and media but don't have message
        return (
            <ReactionsContainers reactionsCoordinates={reactionsCoordinates}
                showDonation={showDonation}
                alertSideRight={alertSideRight}
                avatarShouldDance={avatarShouldDance}>
                <ReactionMedia alertSideRight={alertSideRight}
                    media={media}
                    setMediaReady={setMediaReady}
                    avatarShouldDance={avatarShouldDance}
                    avatarShouldTalk={avatarShouldTalk}
                    animatedAvatarMargin={contentHorizontalMargin} />
                <div style={{
                    display: 'flex',
                    flexDirection: alertSideRight ? 'row-reverse' : 'row'
                }}>
                    <ReactionAvatar avatarShouldDance={avatarShouldDance}
                        avatarShouldTalk={avatarShouldTalk}
                        animationData={animationData}
                        alertSideRight={alertSideRight}
                        avatar={avatar}
                        setAvatarReady={setAvatarReady}
                        avatarAnimationFinished={avatarAnimationFinished}
                        setIsLoopAnimation={setIsLoopAnimation}
                        talkingAnimation={talkingAnimation}
                        photoURL={photoURL}
                        containsGiphyText={containsGiphyText}
                        isLoopAnimation={isLoopAnimation} />
                    <div style={{
                        marginTop: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        position: 'absolute',
                        left: alertSideRight ? undefined : (avatarShouldDance ? contentHorizontalMargin : TALKING_AVATAR_ANIMATION_SIZE - SEPARATION_FROM_TALKING_AVATAR),
                        right: alertSideRight ? (avatarShouldDance ? contentHorizontalMargin : TALKING_AVATAR_ANIMATION_SIZE - SEPARATION_FROM_TALKING_AVATAR) : undefined,
                        zIndex: -1,
                        opacity: showMessage ? 1 : 0
                    }}>
                        <DonationBubble twitchUserName={twitchUserName}
                            amountQoins={amountQoins}
                            donationType={donationType}
                            alertSideRight={alertSideRight} />
                    </div>
                </div>
            </ReactionsContainers>
        );
    }

    // Tested with talking avatar, & Giphy Text
    // Tested with talking avatar, Giphy Text & Qoins

    // Tested with animated avatar, & Giphy Text
    // Tested with animated avatar, Giphy Text & Qoins
    if (includesAvatarAnimation && !media && message && containsGiphyText) {
        // Includes avatar animated, message and Giphy Text but don't have media
        return (
            <ReactionsContainers reactionsCoordinates={reactionsCoordinates}
                showDonation={showDonation}
                alertSideRight={alertSideRight}
                avatarShouldDance={avatarShouldDance}>
                <div style={{
                    display: 'flex',
                    flexDirection: alertSideRight ? 'row-reverse' : 'row'
                }}>
                    <div style={{
                        /**
                         * Margin necessary to align avatar (talking and animated) with Giphy Text
                         */
                        marginTop: '50px'
                    }}>
                        <ReactionAvatar avatarShouldDance={avatarShouldDance}
                            avatarShouldTalk={avatarShouldTalk}
                            animationData={animationData}
                            alertSideRight={alertSideRight}
                            avatar={avatar}
                            setAvatarReady={setAvatarReady}
                            avatarAnimationFinished={avatarAnimationFinished}
                            setIsLoopAnimation={setIsLoopAnimation}
                            talkingAnimation={talkingAnimation}
                            photoURL={photoURL}
                            containsGiphyText={containsGiphyText}
                            isLoopAnimation={isLoopAnimation} />
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'absolute',
                        left: alertSideRight ? undefined : contentHorizontalMargin + 32,
                        right: alertSideRight ? contentHorizontalMargin + 32 : undefined,
                        zIndex: -1,
                        opacity: showMessage ? 1 : 0
                    }}>
                        <GiphyTextMessage messageExtraData={messageExtraData}
                            setGiphyTextReady={setGiphyTextReady}
                            alertSideRight={alertSideRight}
                            showMessage={showMessage} />
                        <DonationBubble twitchUserName={twitchUserName}
                            amountQoins={amountQoins}
                            donationType={donationType}
                            alertSideRight={alertSideRight} />
                    </div>
                </div>
            </ReactionsContainers>
        );
    }

    // Tested with talking avatar, & Bubble Message
    // Tested with talking avatar, Bubble Message & Qoins

    // Tested with animated avatar, & Bubble Message
    // Tested with animated avatar, Bubble Message & Qoins
    if (includesAvatarAnimation && !media && message && !containsGiphyText) {
        // Includes avatar animated and message but don't have media nor Giphy Text
        return (
            <ReactionsContainers reactionsCoordinates={reactionsCoordinates}
                showDonation={showDonation}
                alertSideRight={alertSideRight}
                avatarShouldDance={avatarShouldDance}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <MessageBubble message={message}
                        avatarShouldTalk={avatarShouldTalk}
                        avatarShouldDance={avatarShouldDance}
                        alertSideRight={alertSideRight}
                        showMessage={showMessage}
                        imageWidth={imageWidth}
                        animatedAvatarMargin={contentHorizontalMargin} />
                    <div style={{
                        display: 'flex',
                        flexDirection: alertSideRight ? 'row-reverse' : 'row'
                    }}>
                        <ReactionAvatar avatarShouldDance={avatarShouldDance}
                            avatarShouldTalk={avatarShouldTalk}
                            animationData={animationData}
                            alertSideRight={alertSideRight}
                            avatar={avatar}
                            setAvatarReady={setAvatarReady}
                            avatarAnimationFinished={avatarAnimationFinished}
                            setIsLoopAnimation={setIsLoopAnimation}
                            talkingAnimation={talkingAnimation}
                            photoURL={photoURL}
                            containsGiphyText={containsGiphyText}
                            isLoopAnimation={isLoopAnimation} />
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            marginTop: '16px',
                            position: 'absolute',
                            left: alertSideRight ? undefined : contentHorizontalMargin,
                            right: alertSideRight ? contentHorizontalMargin : undefined,
                            zIndex: -1,
                            opacity: showMessage ? 1 : 0
                        }}>
                            <DonationBubble twitchUserName={twitchUserName}
                                amountQoins={amountQoins}
                                donationType={donationType}
                                alertSideRight={alertSideRight} />
                        </div>
                    </div>
                </div>
            </ReactionsContainers>
        );
    }

    // Tested with media & Giphy Text
    // Tested with media, Giphy Text & Qoins
    if (!includesAvatarAnimation && media && message && containsGiphyText) {
        // Do not include avatar animated but has media, message and Giphy Text
        return (
            <ReactionsContainers reactionsCoordinates={reactionsCoordinates}
                showDonation={showDonation}
                alertSideRight={alertSideRight}
                avatarShouldDance={avatarShouldDance}>
                <ReactionMedia alertSideRight={alertSideRight}
                    media={media}
                    setMediaReady={setMediaReady}
                    avatarShouldDance={avatarShouldDance}
                    avatarShouldTalk={avatarShouldTalk} />
                <div style={{
                    display: 'flex',
                    flexDirection: alertSideRight ? 'row-reverse' : 'row',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-end'
                    }}>
                        <ReactionAvatar avatarShouldDance={avatarShouldDance}
                            avatarShouldTalk={avatarShouldTalk}
                            animationData={animationData}
                            alertSideRight={alertSideRight}
                            avatar={avatar}
                            setAvatarReady={setAvatarReady}
                            avatarAnimationFinished={avatarAnimationFinished}
                            setIsLoopAnimation={setIsLoopAnimation}
                            talkingAnimation={talkingAnimation}
                            photoURL={photoURL}
                            containsGiphyText={containsGiphyText}
                            isLoopAnimation={isLoopAnimation} />
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginLeft: alertSideRight ? 0 : '24px',
                        marginRight: alertSideRight ? '24px' : 0
                    }}>
                        <GiphyTextMessage messageExtraData={messageExtraData}
                            setGiphyTextReady={setGiphyTextReady}
                            alertSideRight={alertSideRight}
                            showMessage={showMessage} />
                        <DonationBubble twitchUserName={twitchUserName}
                            amountQoins={amountQoins}
                            donationType={donationType}
                            alertSideRight={alertSideRight} />
                    </div>
                </div>
            </ReactionsContainers>
        );
    }

    // Tested with media & Bubble Message
    // Tested with media, Bubble Message & Qoins
    if (!includesAvatarAnimation && media && message && !containsGiphyText) {
        // Do not include avatar animated nor Giphy Text but has media and message
        return (
            <ReactionsContainers reactionsCoordinates={reactionsCoordinates}
                showDonation={showDonation}
                alertSideRight={alertSideRight}
                avatarShouldDance={avatarShouldDance}>
                <ReactionMedia alertSideRight={alertSideRight}
                    media={media}
                    setMediaReady={setMediaReady}
                    avatarShouldDance={avatarShouldDance}
                    avatarShouldTalk={avatarShouldTalk} />
                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <MessageBubble message={message}
                        avatarShouldTalk={avatarShouldTalk}
                        avatarShouldDance={avatarShouldDance}
                        alertSideRight={alertSideRight}
                        showMessage={showMessage}
                        imageWidth={imageWidth}
                        animatedAvatarMargin={contentHorizontalMargin} />
                    <div style={{
                        display: 'flex',
                        flexDirection: alertSideRight ? 'row-reverse' : 'row'
                    }}>
                        <div style={{
                            marginTop: '-60px'
                        }}>
                            <ReactionAvatar avatarShouldDance={avatarShouldDance}
                                avatarShouldTalk={avatarShouldTalk}
                                animationData={animationData}
                                alertSideRight={alertSideRight}
                                avatar={avatar}
                                setAvatarReady={setAvatarReady}
                                avatarAnimationFinished={avatarAnimationFinished}
                                setIsLoopAnimation={setIsLoopAnimation}
                                talkingAnimation={talkingAnimation}
                                photoURL={photoURL}
                                containsGiphyText={containsGiphyText}
                                isLoopAnimation={isLoopAnimation} />
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            marginTop: '16px',
                            /**
                             * To align with bubble and media
                             */
                            marginLeft: alertSideRight ? 0 : '24px',
                            marginRight: alertSideRight ? '24px' : 0
                        }}>
                            <DonationBubble twitchUserName={twitchUserName}
                                amountQoins={amountQoins}
                                donationType={donationType}
                                alertSideRight={alertSideRight} />
                        </div>
                    </div>
                </div>
            </ReactionsContainers>
        );
    }

    // Tested with media
    // Tested with media & Qoins
    if (!includesAvatarAnimation && media && !message) {
        // Do not include avatar animated nor message but have media
        return (
            <ReactionsContainers reactionsCoordinates={reactionsCoordinates}
                showDonation={showDonation}
                alertSideRight={alertSideRight}
                avatarShouldDance={avatarShouldDance}>
                <div style={{
                    display: 'flex',
                    flexDirection: alertSideRight ? 'row-reverse' : 'row'
                }}>
                    <div style={{
                        marginTop: amountQoins ? `${imageHeight - 60}px` : `${imageHeight - 120}px`,
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}>
                        <ReactionAvatar avatarShouldDance={avatarShouldDance}
                            avatarShouldTalk={avatarShouldTalk}
                            animationData={animationData}
                            alertSideRight={alertSideRight}
                            avatar={avatar}
                            setAvatarReady={setAvatarReady}
                            avatarAnimationFinished={avatarAnimationFinished}
                            setIsLoopAnimation={setIsLoopAnimation}
                            talkingAnimation={talkingAnimation}
                            photoURL={photoURL}
                            containsGiphyText={containsGiphyText}
                            isLoopAnimation={isLoopAnimation} />
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginLeft: alertSideRight ? 0 : '24px',
                        marginRight: alertSideRight ? '24px' : 0
                    }}>
                        <div style={{
                            /**
                             * ReactionMedia has 144px of margin because is needed in some cases, so here we "remove that margin"
                             * by applying a negative margin in the same direction
                             */
                            marginLeft: alertSideRight ? undefined : '-144px',
                            marginRight: alertSideRight ? '-144px' : undefined
                        }}>
                            <ReactionMedia alertSideRight={alertSideRight}
                                media={media}
                                setMediaReady={setMediaReady}
                                avatarShouldDance={avatarShouldDance}
                                avatarShouldTalk={avatarShouldTalk} />
                        </div>
                        {amountQoins ?
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%',
                                // 60px - 16px of margin
                                height: '44px',
                                marginTop: '16px',
                                justifyContent: 'flex-end'
                            }}>
                                <DonationBubble twitchUserName={twitchUserName}
                                    amountQoins={amountQoins}
                                    donationType={donationType}
                                    alertSideRight={alertSideRight} />
                            </div>
                            :
                            null
                        }
                    </div>
                </div>
            </ReactionsContainers>
        );
    }

    // Tested with Giphy Text
    // Tested with Giphy Text & Qoins
    if (!includesAvatarAnimation && !media && message && containsGiphyText) {
        // Do not include avatar animated nor media but have message and Giphy Text
        return (
            <ReactionsContainers reactionsCoordinates={reactionsCoordinates}
                showDonation={showDonation}
                alertSideRight={alertSideRight}
                avatarShouldDance={avatarShouldDance}>
                <div style={{
                    display: 'flex',
                    flexDirection: alertSideRight ? 'row-reverse' : 'row'
                }}>
                    <div style={{
                            display: 'flex',
                            alignItems: 'flex-end'
                        }}>
                        <ReactionAvatar avatarShouldDance={avatarShouldDance}
                            avatarShouldTalk={avatarShouldTalk}
                            animationData={animationData}
                            alertSideRight={alertSideRight}
                            avatar={avatar}
                            setAvatarReady={setAvatarReady}
                            avatarAnimationFinished={avatarAnimationFinished}
                            setIsLoopAnimation={setIsLoopAnimation}
                            talkingAnimation={talkingAnimation}
                            photoURL={photoURL}
                            containsGiphyText={containsGiphyText}
                            isLoopAnimation={isLoopAnimation} />
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginLeft: alertSideRight ? 0 : '24px',
                        marginRight: alertSideRight ? '24px' : 0
                    }}>
                        <GiphyTextMessage messageExtraData={messageExtraData}
                            setGiphyTextReady={setGiphyTextReady}
                            alertSideRight={alertSideRight}
                            showMessage={showMessage} />
                        <DonationBubble twitchUserName={twitchUserName}
                            amountQoins={amountQoins}
                            donationType={donationType}
                            alertSideRight={alertSideRight} />
                    </div>
                </div>
            </ReactionsContainers>
        );
    }

    // Tested with Bubble message
    // Tested with Bubble message & Qoins
    if (!includesAvatarAnimation && !media && message && !containsGiphyText) {
        // Do not include avatar animated nor media nor Giphy Text but have message
        return (
            <ReactionsContainers reactionsCoordinates={reactionsCoordinates}
                showDonation={showDonation}
                alertSideRight={alertSideRight}
                avatarShouldDance={avatarShouldDance}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <MessageBubble message={message}
                        avatarShouldTalk={avatarShouldTalk}
                        avatarShouldDance={avatarShouldDance}
                        alertSideRight={alertSideRight}
                        showMessage={showMessage}
                        imageWidth={imageWidth}
                        animatedAvatarMargin={contentHorizontalMargin} />
                    <div style={{
                        display: 'flex',
                        flexDirection: alertSideRight ? 'row-reverse' : 'row'
                    }}>
                        <div style={{
                            marginTop: '-60px'
                        }}>
                            <ReactionAvatar avatarShouldDance={avatarShouldDance}
                                avatarShouldTalk={avatarShouldTalk}
                                animationData={animationData}
                                alertSideRight={alertSideRight}
                                avatar={avatar}
                                setAvatarReady={setAvatarReady}
                                avatarAnimationFinished={avatarAnimationFinished}
                                setIsLoopAnimation={setIsLoopAnimation}
                                talkingAnimation={talkingAnimation}
                                photoURL={photoURL}
                                containsGiphyText={containsGiphyText}
                                isLoopAnimation={isLoopAnimation} />
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            marginTop: '16px',
                            marginLeft: alertSideRight ? 0 : '24px',
                            marginRight: alertSideRight ? '24px' : 0
                        }}>
                            <DonationBubble twitchUserName={twitchUserName}
                                amountQoins={amountQoins}
                                donationType={donationType}
                                alertSideRight={alertSideRight} />
                        </div>
                    </div>
                </div>
            </ReactionsContainers>
        );
    }

    return null;
}

export default Reaction;

const ReactionsContainers = ({ children, reactionsCoordinates, showDonation, alertSideRight, avatarShouldDance }) => {
    let alignItems = 'flex-start';
    let justifyContent = 'flex-start';

    if (reactionsCoordinates) {
        switch(reactionsCoordinates.x) {
            case 1:
                alignItems = 'flex-start';
                break;
            case 2:
                alignItems = 'center';
                break;
            case 3:
                alignItems = 'flex-end';
                break;
            default:
                break;
        }

        switch(reactionsCoordinates.y) {
            case 1:
                justifyContent = 'flex-start';
                break;
            case 2:
                justifyContent = 'center';
                break;
            case 3:
                justifyContent = 'flex-end';
                break;
            default:
                break;
        }
    }

    return (
        <div style={{
            opacity: showDonation ? 1 : 0,
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            backgroundColor: 'transparent',
            padding: '32px',
            paddingLeft: alertSideRight ? undefined : (avatarShouldDance ? '160px' : '32px'),
            paddingRight: alertSideRight ? (avatarShouldDance ? '160px' : '32px') : undefined,
            alignItems
        }}>
            <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent
            }}>
                {children}
            </div>
        </div>
    );
}

const ReactionMedia = ({
    alertSideRight,
    media,
    setMediaReady,
    avatarShouldTalk,
    avatarShouldDance,
    animatedAvatarMargin
}) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: alertSideRight ? undefined : (avatarShouldTalk ? `${TALKING_AVATAR_ANIMATION_SIZE - SEPARATION_FROM_TALKING_AVATAR}px` : avatarShouldDance ? `${animatedAvatarMargin}px` : '144px'),
            marginRight: alertSideRight ? (avatarShouldTalk ? `${TALKING_AVATAR_ANIMATION_SIZE - SEPARATION_FROM_TALKING_AVATAR}px` : avatarShouldDance ? `${animatedAvatarMargin}px` : '144px') : undefined
        }}>
            <div style={{
                    width: '100%',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: alertSideRight ? 'flex-end' : 'flex-start'
                }}>
                <img src={media.url}
                    alt='User Meme'
                    style={{
                        aspectRatio: media.width / media.height,
                        display: 'flex',
                        alignSelf: alertSideRight ? 'flex-end' : 'flex-start',
                        height: media.height,
                        maxHeight: '350px',
                        objectFit: 'scale-down',
                        borderRadius: '24px'
                    }}
                    onLoad={() => setMediaReady(true)} />
            </div>
        </div>
    );
}

const MessageBubble = ({
    message,
    avatarShouldTalk,
    avatarShouldDance,
    alertSideRight,
    showMessage,
    imageWidth,
    animatedAvatarMargin
}) => {
    return (
        <div style={{
            marginTop: '24px',
            marginLeft: alertSideRight ? undefined : (avatarShouldTalk ? `${TALKING_AVATAR_ANIMATION_SIZE - SEPARATION_FROM_TALKING_AVATAR}px` : avatarShouldDance ? `${animatedAvatarMargin}px` : '144px'),
            marginRight: alertSideRight ? (avatarShouldTalk ? `${TALKING_AVATAR_ANIMATION_SIZE - SEPARATION_FROM_TALKING_AVATAR}px` : avatarShouldDance ? `${animatedAvatarMargin}px` : '144px') : undefined,
        }}>
            {message !== '' ?
                <div style={{
                    display: 'flex',
                    justifyContent: alertSideRight ? 'flex-end' : 'flex-start',
                    opacity: showMessage ? 1 : 0
                }}>
                    <ChatBubbleiOS
                        bubbleColor='#22F'
                        textColor='#FFF'
                        maxWidth={imageWidth > 455 ? `${imageWidth}px` : '455px'}
                        tailRight={alertSideRight}>
                        {message}
                    </ChatBubbleiOS>
                </div>
                :
                null
            }
        </div>
    );
}

const GiphyTextMessage = ({
    messageExtraData,
    setGiphyTextReady,
    alertSideRight,
    showMessage
}) => {
    return (
        <div style={{
            display: 'flex',
            width: 'fit-content',
            justifyContent: alertSideRight ? 'flex-end' : 'flex-start',
            opacity: showMessage ? 1 : 0,
        }}>
            <img src={messageExtraData.giphyText.url} alt='' style={{
                aspectRatio: messageExtraData.giphyText.width / messageExtraData.giphyText.height,
                display: 'flex',
                alignSelf: alertSideRight ? 'flex-end' : 'flex-start',
                maxHeight: '300px',
                objectFit: 'scale-down'
            }}
            onLoad={() => setGiphyTextReady(true)} />
        </div>
    );
}

const ReactionAvatar = ({
    avatarShouldDance,
    avatarShouldTalk,
    alertSideRight,
    animationData,
    avatar,
    setAvatarReady,
    avatarAnimationFinished,
    setIsLoopAnimation,
    isLoopAnimation,
    talkingAnimation,
    photoURL,
    containsGiphyText
}) => {
    const getGradientString = (colors) => {
        let colorString = '';
        colors.forEach((color, index) => {
            if (index !== colors.length - 1) {
                colorString += `${color},`;
            } else {
                colorString += `${color}`;
            }
        });

        return colorString;
    }

    // Multiple returns instead of ternary operator because we have a lot of possibilities

    if (avatarShouldDance) {
        return (
            <Canvas
                style={{
                    marginTop: isLoopAnimation ? '-75px' : '-150px',
                    width: AVATAR_GENERIC_ANIMATION_SIZE,
                    height: AVATAR_GENERIC_ANIMATION_SIZE / 2,
                    marginLeft: alertSideRight ? undefined : (isLoopAnimation ? '-300px' : '-475px'),
                    marginRight: alertSideRight ? (isLoopAnimation ? '-300px' : '-475px') : undefined,
                    alignSelf: 'flex-end',
                    transform: alertSideRight ? undefined : 'rotateY(180deg)'
                }}>
                <ambientLight intensity={1} />
                <directionalLight intensity={0.4} />
                {animationData &&
                    <Suspense fallback={null}>
                        <AvatarAnimationReaction animationData={animationData}
                            avatarId={avatar.avatarId}
                            playAnimation={true}
                            setAvatarReady={() => setAvatarReady(true)}
                            showMessage={avatarAnimationFinished}
                            setIsLoopAnimation={setIsLoopAnimation} />
                    </Suspense>
                }
            </Canvas>
        );
    }

    if (avatarShouldTalk) {
        return (
            <Canvas camera={{
                    position: [0, 1.6871838845728084, 0.403600876626397],
                    aspect: 1
                }}
                style={{
                    marginTop: containsGiphyText ? 0 : '-100px',
                    width: TALKING_AVATAR_ANIMATION_SIZE,
                    height: TALKING_AVATAR_ANIMATION_SIZE - 50,
                    alignSelf: 'flex-end'
                }}>
                <ambientLight intensity={1} />
                <directionalLight intensity={0.4} />
                <Suspense fallback={null}>
                    <TalkingAvatarAnimation avatarId={avatar.avatarId}
                        animations={talkingAnimation}
                        setAvatarReady={() => setAvatarReady(true)} />
                </Suspense>
            </Canvas>
        );
    }

    if (avatar) {
        return (
            <img src={`https://api.readyplayer.me/v1/avatars/${avatar.avatarId}.png?scene=fullbody-portrait-v1-transparent`}
                height='120px'
                width='120px'
                style={{
                    marginBottom: 0,
                    borderRadius: 100,
                    alignSelf: 'center',
                    background: avatar.avatarBackground ?
                        `linear-gradient(${avatar.avatarBackground.angle}deg, ${getGradientString(avatar.avatarBackground.colors)})`
                        :
                        `linear-gradient(95.16deg, #FF669D, #9746FF)`
                }} />
        );
    }

    return (
        <img src={photoURL}
            height='120px'
            width='120px'
            style={{
                borderRadius: 100
            }} />
    );
}

const DonationBubble = ({
    twitchUserName,
    amountQoins,
    donationType,
    alertSideRight
}) => {
    const { t } = useTranslation();

    if (amountQoins) {
        return (
            <p style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#00FFDD',
                width: 'fit-content',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: alertSideRight ? 'flex-end' : 'flex-start'
            }}>
                {twitchUserName}
                <span style={{
                    color: '#FFF',
                    margin: '0 8px'
                }}>
                    {t('LiveDonations.sent')}
                </span>
                {`${amountQoins.toLocaleString()} ${donationType === BITS_DONATION ? ' Bits' : ' Qoins'}`}
                <div style={{ marginLeft: '10px', display: 'flex', alignSelf: 'center' }}>
                    {donationType === BITS_DONATION ?
                        <Bits style={{ display: 'flex', width: '38px', height: '38px' }} />
                        :
                        <Qoin style={{ display: 'flex', width: '38px', height: '38px' }} />
                    }
                </div>
            </p>
        );
    }

    return null;
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

const AvatarAnimationReaction = (props) => {
    const group = useRef();
    const avatarRef = useRef();
    const { scene } = useGLTF(`https://api.readyplayer.me/v1/avatars/${props.avatarId}.glb`);
    const { animations } = useGLTF(props.animationData.url);
    const [avatarMixer] = useState(() => new THREE.AnimationMixer());
    const [cameraReady, setCameraReady] = useState(false);

    useEffect(() => {
        if (scene) {
            props.setAvatarReady();
        }

        if (props.playAnimation && animations && cameraReady) {
            const animation = avatarMixer.clipAction(animations[0], group.current);

            if (!props.animationData.loop) {
                avatarMixer.addEventListener('finished', (e) => {
                    avatarMixer.removeEventListener('finished');
                    props.showMessage(group.current.position);
                });
            } else {
                props.showMessage();
            }

            animation.clampWhenFinished = !props.animationData.loop;
            props.setIsLoopAnimation(props.animationData.loop);

            animation.fadeIn(.5).play().setLoop(props.animationData.loop ? THREE.LoopRepeat : THREE.LoopOnce);
        }
    }, [animations, avatarMixer, avatarMixer, cameraReady, scene, props.playAnimation]);

    useFrame((state, delta) => {
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
        if (!cameraReady) {
            setCameraReady(true);
        }

        avatarMixer.update(delta);
    });

    return (
        <group ref={group} {...props} dispose={null}>
            <primitive object={scene} ref={avatarRef} />
        </group>
    );
}