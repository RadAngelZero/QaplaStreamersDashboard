import React, { useState } from 'react';
import { Button, CircularProgress, Dialog, withStyles } from '@material-ui/core';

import { ReactComponent as Close } from './../../assets/CloseIcon.svg';
import styles from './BuySubscriptionDialog.module.css';

const PremiumDialog = withStyles(() => ({
    root: {
    },
    paper: {
        backgroundColor: '#141833',
        borderRadius: '35px',
        flexDirection: 'row',
        overflow: 'hidden',
        maxWidth: 'min-content',
    },
}))(Dialog);

const StartFreeTrialButton = withStyles(() => ({
    root: {
        display: 'flex',
        backgroundColor: '#3B4BF9',
        padding: '20px 16px',
        borderRadius: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        textTransform: 'none',
        width: '300px',
        marginTop: '32px',
        height: '60px',
        boxShadow: '0px 20px 40px -10px rgba(59, 75, 249, 0.4)',
        '&:hover': {
            opacity: 0.8,
            backgroundColor: '#3B4BF9'
        },
        '&:active': {
            opacity: 0.6,
            backgroundColor: '#3B4BF9'

        },
        webkitBoxSizing: 'border-box', /* Safari/Chrome, other WebKit */
        mozBoxSizing: 'border-box',    /* Firefox, other Gecko */
        boxSizing: 'border-box',       /* Opera/IE 8+ */
    },
    label: {
        display: 'flex',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '600',
        lineHeight: '19px',
        letterSpacing: '0.492000013589859px',
        justifyContent: 'center',
    },
}))(Button);

const BuySubscriptionDialog = ({ user, open, onClose }) => {
    const [loadingBillingRequest, setLoadingBillingRequest] = useState(false);

    const startFreeTrial = async () => {
        setLoadingBillingRequest(true);
        // If free trial field exists, it means the user already made a free trial
        // TODO: Replace cloud functions with production url's
        if (user.freeTrial !== undefined) {
            return window.location.replace(`http://127.0.0.1:5001/qapplaapp/us-central1/streamerSubscriptionCheckoutIntent?uid=${user.uid}&stripeCustomerId=${user.stripeCustomerId}`);
        }

        return window.location.replace(`http://127.0.0.1:5001/qapplaapp/us-central1/activateUserFreeTrial?uid=${user.uid}`);
    }

    return (
        <PremiumDialog open={open} onClose={onClose}>
            <div className={styles.goPremiumFancyContainer}>
                <p className={styles.goPremiumMainTitle}>
                    Retain your Twitch subscribers
                </p>
                <img src='https://media.giphy.com/media/UV4YhmkUDTfaUPopRN/giphy.gif' alt='Cool alien abducting pizza' style={{
                    marginTop: '43px',
                    width: '264px',
                }} />
            </div>
            <div className={styles.goPremiumInfoContainer}>
                <div className={styles.goPremiumCloseIconContainer} onClick={onClose}>
                    <Close style={{ width: '40px', height: '40px' }} />
                </div>
                <p className={styles.goPremiumHeading}>
                    $5
                </p>
                <p className={styles.goPremiumCaption}>
                    per month
                </p>
                <p className={styles.goPremiumSubheading} style={{ marginTop: '32px' }}>
                    Add value to your Twitch subscription letting your Subs interact for less or for free
                </p>
                <p className={styles.goPremiumDescription} style={{ marginTop: '8px' }}>
                    Set a preferential reaction price configuration for channel subscribers than regular viewers
                </p>
                <p className={styles.goPremiumSubheading} style={{ marginTop: '24px' }}>
                    Also includes:
                </p>
                <p className={styles.goPremiumDescription} style={{ marginTop: '8px' }}>
                    50 Bits minimum cash out (10 times lower)
                </p>
                <div style={{ marginTop: '5.5px', display: 'flex' }}>
                    <p className={styles.goPremiumDescription} >
                        Add a mod to your dashboard
                    </p>
                    <div className={styles.goPremiumSoonBorder}>
                        <div className={styles.goPremiumSoonInnerContainer}>
                            <p className={styles.goPremiumSoonText}>
                                Soon
                            </p>
                        </div>

                    </div>
                </div>
                <StartFreeTrialButton onClick={startFreeTrial} disabled={loadingBillingRequest}>
                    {loadingBillingRequest ?
                        <CircularProgress style={{ color: '#FFF' }} />
                        :
                        (user && user.freeTrial !== undefined) ?
                            'Resume subscription'
                            :
                            'Start 30-Day Free Trial'
                    }
                </StartFreeTrialButton>
            </div>
        </PremiumDialog>
    );
}

export default BuySubscriptionDialog;