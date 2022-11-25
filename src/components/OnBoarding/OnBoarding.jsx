import React, { useState, useEffect } from "react";
import { makeStyles, Button, Checkbox } from "@material-ui/core";
import { useTranslation } from 'react-i18next';

import styles from './OnBoarding.module.css';
import { ReactComponent as CopyIcon } from './../../assets/CopyPaste.svg';
import { useHistory } from "react-router-dom";
import { createInteractionsReward } from "../../services/interactionsQapla";
import { writeTestCheer } from "../../services/database";
import { CHEERS_URI } from "../../utilities/Constants";
import { notifyBugToDevelopTeam } from "../../services/discord";

import { ReactComponent as Unchecked } from './../../assets/Unchecked.svg';
import { ReactComponent as Checked } from './../../assets/Checked.svg';

const useStyles = makeStyles((theme) => ({
    button: {
        backgroundColor: '#00FFDD',
        color: '#141833',
        width: '390px',
        height: '60px',
        fontSize: '16px',
        fontWeight: '600',
        lineHeight: '22px',
        letterSpacing: '0.492000013589859px',
        textTransform: 'none',
        borderRadius: '16px',
        '&:hover': {
            backgroundColor: '#00EACB'
        },
    },
    copyOverlayLinkButton: {
        backgroundColor: '#202750',
        display: 'flex',
        marginTop: '32px',
        borderRadius: '8px',
        width: '346px',
        height: '45px',
        alignItems: 'center',
        padding: '0',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#202750'
        },
    },
    testButton: {
        backgroundColor: '#3B4BF9',
        color: '#fff',
        width: '346px',
        height: '60px',
        fontsize: '16px',
        fontWeight: '600',
        lineHeight: '22px',
        letterSpacing: '0.492000013589859px',
        textTransform: 'none',
        borderRadius: '16px',
        '&:hover': {
            backgroundColor: '#2E3BC9'
        },
    },
}));

const OnBoarding = ({ user }) => {
    const classes = useStyles();
    const history = useHistory();
    const [step, setStep] = useState(0);
    const [channelPointsRewardCost, setChannelPointsRewardCost] = useState(2000);
    const [errorCode, setErrorCode] = useState(0);
    const [overlayLinkCopied, setOverlayLinkCopied] = useState(false);
    const [streamerOverlayLink, setStreamerOverlayLink] = useState(CHEERS_URI);
    const [stepIndicator, setStepIndicator] = useState(0);
    const [acceptPolicies, setAcceptPolicies] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        if (user && user.id) {
            setStreamerOverlayLink(`${CHEERS_URI}/${user.id}`);
        }
    }, [user]);

    const handleMainButton = () => {
        if (step === -1) {
            return openDiscordSupport();
        }
        if (step === 0) { // Welcome
            setStepIndicator(1);
        }
        if (step === 1) { // Set channel points cost and create reward
            return createChannelPointsRewards();
        }
        if (step === 3) {
            setStepIndicator(2);
        }
        if (step === 5) {
            return history.push('/profile');
        }

        setStep(step + 1);
    }

    const openDiscordSupport = () => {
        window.open('https://discord.gg/2UMQ6ZXPkq', '_blank');
    }

    const createChannelPointsRewards = async () => {
        setStep(step + 1);

        const result = await createInteractionsReward(user.uid, user.id, user.refreshToken, 'Qapla Reaction', channelPointsRewardCost);
        if (result !== undefined) {
            if (result.reward.status === 200) {
                if (result.webhookSubscription) {
                    onSuccessfullChannelPointsCreation();
                } else {
                    notifyBugToDevelopTeam(`${user.uid} Reward webhook creation error`);
                    onErrorChannelPointsCreation(500);
                }
            } else {
                notifyBugToDevelopTeam(`${user.uid} Reactions reward creation error: ` + JSON.stringify(result.reward));
                onErrorChannelPointsCreation(result.reward.status);
            }
        } else {
            notifyBugToDevelopTeam(`${user.uid} Reactions reward creation error: error 0 (auth token expired)`);
            onErrorChannelPointsCreation(0);
        }
    }

    const onSuccessfullChannelPointsCreation = () => {
        setStep(step + 2);
    }

    const onErrorChannelPointsCreation = (eC) => {
        setErrorCode(eC);
        setStep(-1);
    }

    const handleChannePointsRewardCostChange = (e) => {
        setChannelPointsRewardCost(e.target.value);
    }

    const handleCopyOverlayLink = () => {
        copyCheersURL();
        setOverlayLinkCopied(true);
    }

    const handleTestOverlay = () => {
        writeTestCheer(user.uid);
    }

    const copyCheersURL = () => {
        navigator.clipboard.writeText(streamerOverlayLink);
    }

    const handlePoliciesCheckbox = () => setAcceptPolicies(!acceptPolicies);

    return (
        <div style={{
            background: 'conic-gradient(from 134.88deg at 50.55% 49.24%, #5600E1 -61.47deg, #373FFF 26.68deg, #A534FE 167.74deg, #B518FF 197.3deg, #5600E1 298.53deg, #373FFF 386.68deg), rgba(3, 7, 34, 0.95)',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
        }}>
            <div style={{
                marginTop: 24,
                position: 'relative',
                display: 'flex',
                backgroundColor: '#141833',
                width: '450px',
                height: step === 4 ? '402px' : '256px',
                borderRadius: '35px',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                zIndex: 500,
            }}>
                {step === -1 &&
                    <>
                        <img src={`https://media.giphy.com/media/51Uiuy5QBZNkoF3b2Z/giphy.gif`} alt={`Scared Dog`}
                            style={{
                                position: 'absolute',
                                bottom: 190, // 256 - 23 (height of container - hidden part of the image)
                                width: '238px',
                                height: '239px',
                                zIndex: '1000',
                            }}
                        />
                    </>
                }
                {step === 0 &&
                    <>
                        <img src={`https://media.giphy.com/media/yQssIXdTQlbN3EEPYj/giphy.gif`} alt={`Barnaby on PC`}
                            style={{
                                zIndex: -1,
                                position: 'absolute',
                                bottom: 256, // 256 - 23 (height of container - hidden part of the image)
                                width: '334px',
                                height: '179px',
                                resize: ''
                            }}
                        />
                    </>
                }
                {step === 1 &&
                    <>
                        <img src='https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/OnboardingGifs%2Fchannelpoints-pink.gif?alt=media&token=f5ca8128-99cc-4d03-9257-e5e6f960cac4'
                            alt='channel points'
                            style={{
                                position: 'absolute',
                                width: '269px',
                                height: '134px',
                                transform: 'rotate(-15deg)',
                                bottom: 256, // 256 (height of container)
                            }}
                        />
                        <img src={`https://media.giphy.com/media/3oFzlW8dht4DdvwBqg/giphy.gif`} alt={`Barnaby Looking`}
                            style={{
                                position: 'absolute',
                                width: '162px',
                                height: '151px',
                                zIndex: '1000',
                                transform: 'rotate(-3.45deg)',
                                bottom: 244, // 256 - 12 (height of container - hidden part of the image)
                            }}
                        />
                    </>
                }
                {step === 2 &&
                    <>
                        <img src='https://media.giphy.com/media/3o752nnUPE7OzLeSVW/giphy.gif' alt={`Barnaby Working`}
                            style={{
                                position: 'absolute',
                                bottom: 256, // 256 - 8 (height of container - hidden part of the image)
                                width: '206px',
                                height: '135px',
                                zIndex: '1',
                            }}
                        />
                    </>
                }
                {step === 3 &&
                    <>
                        <img src='https://media.giphy.com/media/xULW8v7LtZrgcaGvC0/giphy.gif' alt={`Barnaby Says Thanks`}
                            style={{
                                position: 'absolute',
                                bottom: 190, // 256 - 66 (height of container - visible part of the image over the card)
                                width: '239px',
                                height: '239px',
                                zIndex: '1000',
                            }}
                        />
                    </>
                }
                {step === 4 &&
                    <>
                        <img src='https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/OnboardingGifs%2Foverlay.gif?alt=media&token=178044eb-f697-44ad-860c-81e93741d276'
                            alt='overlay'
                            style={{
                                position: 'absolute',
                                bottom: 402, // 402 - 66 (height of container)
                                width: '300px',
                                height: '150px',
                            }}
                        />
                        <img src={`https://media.giphy.com/media/3oFzlW8dht4DdvwBqg/giphy.gif`} alt={`Barnaby Looking`}
                            style={{
                                position: 'absolute',
                                bottom: 390, // 256 - 12 (height of container - hidden part of the image)
                                width: '162px',
                                height: '151px',
                                zIndex: '1000',
                                transform: 'rotate(-3.45deg)',
                            }}
                        />
                    </>
                }
                {step === -1 &&
                    <>
                        <p style={{ marginTop: '20px' }} className={styles.headerText}>
                            {t('Onboarding.errorTitle', { errorCode })}
                        </p>
                        <p className={`${styles.subText} ${styles.subTextMartinTop} ${styles.alignTextCenter}`}>
                            {t('Onboarding.errorDescription')}
                        </p>
                    </>
                }
                {step === 0 &&
                    <>
                        <p className={styles.headerText}>
                            {t('Onboarding.letsSetUp')}
                        </p>
                        <ul>
                            <li className={styles.subText}>
                                {t('Onboarding.processDescriptionP1')}
                            </li>
                            <li className={`${styles.subText} ${styles.liMargin}`}>
                                {t('Onboarding.processDescriptionP2')}
                            </li>
                        </ul>
                    </>
                }
                {step === 1 &&
                    <>
                        <p className={styles.headerText}>
                            {t('Onboarding.setRewardCost')}
                        </p>
                        <p className={`${styles.subText} ${styles.subTextMartinTop} ${styles.alignTextCenter}`}>
                            {t('Onboarding.setRewardCostDescription')}
                        </p>
                        <div className={styles.qoinsMainContainer}>
                            <div className={styles.qoinsSubContainer}>
                                <input
                                    className={styles.qoins}
                                    value={channelPointsRewardCost}
                                    onChange={handleChannePointsRewardCostChange}

                                />
                            </div>
                        </div>
                    </>
                }
                {step === 2 &&
                    <>
                        <h1 className={styles.gradientText}>
                            {t('Onboarding.workingOnRequest')}
                        </h1>
                    </>
                }
                {step === 3 &&
                    <>
                        <h1 className={styles.gradientText}>
                            {t('Onboarding.rewardCreated')}
                        </h1>
                    </>
                }
                {step === 4 &&
                    <>
                        <h1 className={styles.headerText}>
                            {t('Onboarding.addReactionsToOverlay')}
                        </h1>
                        <p className={`${styles.subText} ${styles.subTextMartinTop} ${styles.alignTextCenter}`}>
                            {t('Onboarding.copyLink')}
                        </p>
                        <div style={{
                            marginTop: '32px',
                            display: 'flex',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'row',
                            }}>
                                <p className={styles.overlayResText}>
                                    {t('Onboarding.width')}
                                </p>
                                <div className={styles.overlayResNumbContainer}>
                                    <p className={styles.overlayResNumb}>
                                        1920
                                    </p>
                                </div>
                            </div>
                            <div style={{
                                marginLeft: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'row',
                            }}>
                                <p className={styles.overlayResText}>
                                    {t('Onboarding.height')}
                                </p>
                                <div className={styles.overlayResNumbContainer}>
                                    <p className={styles.overlayResNumb}>
                                        1080
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button
                            disableRipple
                            onClick={handleCopyOverlayLink}
                            className={classes.copyOverlayLinkButton}>
                            <p style={{
                                color: '#6C5DD3',
                                fontSize: '12px',
                                fontWeight: '500',
                                lineHeight: '24px',
                                textAlign: 'center',
                                flexGrow: 1,
                            }}>
                                {streamerOverlayLink}
                            </p>
                            <CopyIcon style={{
                                justifySelf: 'flex-end',
                            }} />
                        </Button>
                        <div style={{
                            marginTop: '32px',
                        }}>
                            {overlayLinkCopied ?
                                <Button
                                    onClick={handleTestOverlay}
                                    className={classes.testButton}>
                                    {t('Onboarding.testOverlay')}
                                </Button>
                                :
                                <div style={{ height: '60px' }} />
                            }
                        </div>
                    </>
                }
                {step === 5 &&
                    <>
                        <img src={`https://media.giphy.com/media/3o751SMzZ5TjLWInoQ/giphy.gif`} alt={`Barnaby Thats Rad`}
                            style={{
                                position: 'absolute',
                                bottom: 135, // 256 - 121
                                width: '351px',
                                height: '220px',
                                marginTop: '-100px',
                            }}
                        />
                        <img src='https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/OnboardingGifs%2Fyou%2520are%2520set.gif?alt=media&token=0c285185-9be1-4f56-ae8e-efd67a7e2099'
                            alt={`you're set`}
                            style={{
                                position: 'absolute',
                                bottom: 24, // 256 - 121
                                width: '400px',
                                height: '107px',
                            }}
                        />
                    </>
                }
            </div>
            <div
                style={{
                    marginTop: 24,
                }}>
                <Button
                    disabled={step === 2 || (step === 4 && !overlayLinkCopied) || (step === 0 && !acceptPolicies)}
                    onClick={handleMainButton}
                    className={classes.button}
                >
                    {step === -1 &&
                        <>
                            {t('Onboarding.goToDiscord')}
                        </>
                    }
                    {step === 0 &&
                        <>
                            {t('Onboarding.letsGo')}
                        </>
                    }
                    {step === 1 &&
                        <>
                            {t('Onboarding.createCustomReward')}
                        </>
                    }
                    {step === 2 &&
                        <>
                            {t('Onboarding.waitABit')}
                        </>
                    }
                    {step === 3 &&
                        <>
                            {t('Onboarding.finishSetUp')}
                        </>
                    }
                    {step === 4 &&
                        <>
                            {overlayLinkCopied ?
                                t('Onboarding.finishSetUp')
                                :
                                t('Onboarding.copyToTest')
                            }
                        </>
                    }
                    {step === 5 &&
                        <>
                            {t('Onboarding.goToDashboard')}
                        </>
                    }
                </Button>
            </div>
            {step !== 5 &&
                <div style={{
                    display: 'flex',
                    position: 'absolute',
                    bottom: 72,
                }}>
                    <div style={{
                        backgroundColor: stepIndicator === 0 ? '#00FEDF' : '#00FEDF8A',
                        height: '8px',
                        width: stepIndicator === 0 ? '28px' : '8px',
                        borderRadius: '4px',
                        margin: '0px 6.5px',
                    }} />
                    <div style={{
                        backgroundColor: stepIndicator === 1 ? '#00FEDF' : '#00FEDF8A',
                        height: '8px',
                        width: stepIndicator === 1 ? '28px' : '8px',
                        borderRadius: '4px',
                        margin: '0px 6.5px',

                    }} />
                    <div style={{
                        backgroundColor: stepIndicator === 2 ? '#00FEDF' : '#00FEDF8A',
                        height: '8px',
                        width: stepIndicator === 2 ? '28px' : '8px',
                        borderRadius: '4px',
                        margin: '0px 6.5px',
                    }} />
                </div>
            }
            {step === 0 &&
                <div style={{ position: 'absolute', bottom: 24, display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                        icon={<Unchecked />}
                        checkedIcon={<Checked />}
                        onChange={handlePoliciesCheckbox}
                        checked={acceptPolicies}
                        style={{ paddingRight: '0px' }}
                    />
                    <div style={{ opacity: acceptPolicies ? 1 : 0.7, color: '#FFF', paddingLeft: '6px' }}>
                        {t('Onboarding.policiesP1')}
                        <a href={t('Onboarding.termsOfUseUrl')} target="_blank"
                            rel="noreferrer"
                            style={{ color: '#00FFDD', marginLeft: 4, marginRight: 4, textDecoration: 'none' }}>
                            {t('Onboarding.policiesP2')}
                        </a>
                        {t('Onboarding.policiesP3')}
                        <a href={t('Onboarding.privacyPolicy')}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#00FFDD', marginLeft: 4, textDecoration: 'none' }}>
                            {t('Onboarding.policiesP4')}
                        </a>
                    </div>
                </div>
            }
        </div>
    )

}

export default OnBoarding;