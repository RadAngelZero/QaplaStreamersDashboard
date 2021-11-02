import React, { useState, useEffect } from 'react';
import { makeStyles, Dialog, DialogContent } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

import { saveSubscriptionInformation, updateSubscriptionDetails } from '../../services/database';
import ProcessingPaymentDialog from '../ProcessingPaymentDialog/ProcessingPaymentDialog';

let userIsTryingToSubscribe = false;

const useStyles = makeStyles(() => ({
    paper: {
        background: 'transparent',
        boxShadow: 'none',
        borderRadius: 20,
        paddingLeft: 16,
        paddingTop: 8
    },
    whiteColor: {
        color: '#FFF'
    }
}));

const SubscriptionCheckout = ({ user, open, onClose, billingPageId }) => {
    const [openProcessingPaymentDialog, setOpenProcessingPaymentDialog] = useState(false);
    const [paymentProcessed, setPaymentProcessed] = useState(false);

    const classes = useStyles();
    const history = useHistory();

    useEffect(() => {
        if (user && user.uid && user.email && billingPageId) {
            window.servicebotSettings = {
                billing_page_id: billingPageId,
                email: user.email,
                handleResponse: async function(payload) {
                    switch (payload.event) {
                        case 'create_subscription':
                            if (payload.response && payload.response.customer && payload.response.customer.id) {
                                setOpenProcessingPaymentDialog(true);
                                userIsTryingToSubscribe = true;
                                await saveSubscriptionInformation(user.uid, payload.response.customer.id, payload.response.current_period_start * 1000, payload.response.current_period_end * 1000);
                            }
                            break;
                        case 'post_load_billing':
                            if (userIsTryingToSubscribe && payload.response && payload.response.currentConfig && payload.response.currentConfig.productData && payload.response.currentConfig.productData[0] && payload.response.currentConfig.productData[0].metadata) {
                                const subscriptionDetails = payload.response.currentConfig.productData[0].metadata;

                                await updateSubscriptionDetails(user.uid, subscriptionDetails);
                                setPaymentProcessed(true);
                            }
                            break;
                        case 'resubscribe':
                            if (payload.response && payload.response.customer) {
                                setOpenProcessingPaymentDialog(true);
                                userIsTryingToSubscribe = true;
                                await saveSubscriptionInformation(user.uid, payload.response.customer, payload.response.current_period_start * 1000, payload.response.current_period_end * 1000);
                            }
                            break;
                        default:
                            break;
                    }
                }
            };
            (function () {
                var s = document.createElement("script")
                s.src = 'https://js.billflow.io/billflow-embed.js';
                s.async = true
                s.type = "text/javascript"
                var x = document.getElementsByTagName("script")[0]
                x.parentNode.insertBefore(s, x)
            })();
        }
    }, [user, history, userIsTryingToSubscribe, billingPageId]);

    return (
        <>
            {!paymentProcessed &&
                <Dialog open={open}
                    onClose={!openProcessingPaymentDialog ? onClose : () => {}}
                    fullWidth
                    maxWidth='md'
                    classes={{
                        scrollPaper: classes.scrollPaper,
                        paper: classes.paper
                    }}>
                    <DialogContent>
                        <div id="billflow-embed"></div>
                    </DialogContent>
                </Dialog>
            }
            <ProcessingPaymentDialog open={openProcessingPaymentDialog}
                finished={paymentProcessed}
                onClose={() => { setOpenProcessingPaymentDialog(false); history.push('/profile') }} />
        </>
    );
}

export default SubscriptionCheckout;