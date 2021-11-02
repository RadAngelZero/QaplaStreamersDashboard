import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router';
import dayjs from 'dayjs';
import { addBoughtStreamsToStreamer } from '../../services/database';
var utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

let userIsTryingToBuy = false;

const StreamsPackagesCheckout = ({ user }) => {
    const history = useHistory();
    const { billingPageId } = useParams();

    useEffect(() => {
        if (billingPageId && user && user.uid && user.email) {
            window.servicebotSettings = {
                billing_page_id: billingPageId,
                email: user.email,
                handleResponse: async function(payload) {
                    console.log(payload.event);
                    switch (payload.event) {
                        case 'create_invoice':
                            userIsTryingToBuy = true;
                            break;
                        case 'post_load_billing':
                            if (userIsTryingToBuy && payload.response.currentConfig && payload.response.currentConfig.productData && payload.response.currentConfig.productData[0] && payload.response.currentConfig.productData[0].metadata) {
                                console.log(payload.response.currentConfig.productData[0].metadata);
                                const expirationDate = dayjs.utc().add(5, 'month').endOf('month').toDate();
                                await addBoughtStreamsToStreamer(user.uid, parseInt(payload.response.currentConfig.productData[0].metadata.boughtStreams), expirationDate.getTime());
                                history.push('/profile');
                            }
                            break;
                        case 'resubscribe':
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
    }, [user, billingPageId, history]);

    return (
        <div id="billflow-embed"></div>
    );
}

export default StreamsPackagesCheckout;