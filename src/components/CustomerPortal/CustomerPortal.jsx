import React, { useEffect } from 'react';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';

const CustomerPortal = ({ user }) => {

    useEffect(() => {
        if (user && user.uid && user.email) {
            window.servicebotSettings = {
                billing_page_id: 'J5khxNEE915ctHrYxHdS',
                email: user.email
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
    }, [user]);

    return (
        <StreamerDashboardContainer user={user}>
            <div id="billflow-embed"></div>
        </StreamerDashboardContainer>
    );
}

export default CustomerPortal;