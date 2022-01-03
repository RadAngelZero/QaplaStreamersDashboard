import React, { useEffect } from 'react';
import { getBillflowHMAC } from '../../services/functions';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';

const CustomerPortal = ({ user }) => {

    useEffect(() => {
        async function loadBillflow() {
            if (user && user.uid && user.stripeCustomerId) {
                const userHmac = await getBillflowHMAC(user.stripeCustomerId);
                window.servicebotSettings = {
                    billing_page_id: 'J5khxNEE915ctHrYxHdS',
                    customer_id: user.stripeCustomerId,
                    hash: userHmac.data
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
        }

        loadBillflow();
    }, [user]);

    return (
        <StreamerDashboardContainer user={user}>
            <div id="billflow-embed"></div>
        </StreamerDashboardContainer>
    );
}

export default CustomerPortal;