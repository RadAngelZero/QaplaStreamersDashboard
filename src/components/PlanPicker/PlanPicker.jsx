import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { saveSubscriptionInformation, updateSubscriptionDetails } from '../../services/database';

let userIsTryingToSubscribe = false;

const PlanPicker = ({ user }) => {
    const history = useHistory();

    useEffect(() => {
        if (user && user.uid && user.email) {
            window.servicebotSettings = {
                billing_page_id: "Aa72ZPxyx4yH5F9HJAC7",
                email: user.email,
                handleResponse: async function(payload) {
                    switch (payload.event) {
                        case 'create_subscription':
                            if (payload.response && payload.response.customer && payload.response.customer.id) {
                                userIsTryingToSubscribe = true;
                                await saveSubscriptionInformation(user.uid, payload.response.customer.id, payload.response.current_period_start * 1000, payload.response.current_period_end * 1000);
                            }
                            break;
                        case 'post_load_billing':
                            if (userIsTryingToSubscribe && payload.response && payload.response.billingData.products && payload.response.billingData.products[0]) {
                                const subscriptionDetails = payload.response.billingData.products[0].metadata;

                                await updateSubscriptionDetails(user.uid, subscriptionDetails);
                                history.push('/profile');
                            }
                            break;
                        case 'resubscribe':
                            if (payload.response && payload.response.customer) {
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
    }, [user, history, userIsTryingToSubscribe]);

    return (
        <div id="billflow-embed"></div>
    );
}

export default PlanPicker;
