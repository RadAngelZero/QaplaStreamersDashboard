import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { listenToUserStreamingStatus, getStreamerUidWithTwitchId, listenForUnreadStreamerCheers, markDonationAsRead, removeListenerForUnreadStreamerCheers } from '../../services/database';
import { ReactComponent as QaplaLogo } from './../../assets/QaplaLogo.svg';

const LiveDonations = () => {
    const [streamerUid, setStreamerUid] = useState('');
    const [donationQueue, setDonationQueue] = useState([]);
    const [donationToShow, setDonationToShow] = useState(null);
    const [listenersAreSetted, setListenersAreSetted] = useState(false);
    const { streamerId } = useParams();

    useEffect(() => {
        const pushDonation = (donation) => {
            setDonationQueue((array) => [donation, ...array]);
        }

        const popDonation = () => {
            const indexToPop = donationQueue.length - 1;
            const donationToPop = donationQueue[indexToPop];
            setDonationQueue(donationQueue.filter((donation) => donation.id !== donationQueue[indexToPop].id));

            return donationToPop;
        }

        async function getStreamerUid() {
            if (streamerId) {
                setStreamerUid(await getStreamerUidWithTwitchId(streamerId));
            }
        }

        async function loadDonations() {
            listenForUnreadStreamerCheers(streamerUid, (donation) => {
                pushDonation({ ...donation.val(), id: donation.key });
            });
            setListenersAreSetted(true);
        }

        if (streamerUid && !listenersAreSetted) {
            listenToUserStreamingStatus(streamerUid, (isStreaming) => {
                if (isStreaming.exists() && isStreaming.val()) {
                    setTimeout(() => {
                        loadDonations();
                    }, 1000);
                } else {
                    removeListenerForUnreadStreamerCheers(streamerUid);
                }
            });
        }

        if (donationQueue.length > 0) {
            setTimeout(() => {
                const donation = popDonation();
                setDonationToShow(donation);
                markDonationAsRead(streamerUid, donation.id);
            }, 2500);
        } else {
            setTimeout(() => {
                setDonationToShow(null);
            }, 2500);
        }

        if (!streamerUid) {
            getStreamerUid();
        }
    }, [streamerId, streamerUid, donationQueue, listenersAreSetted]);

    document.body.style.backgroundColor = 'transparent';

    return (
        <div style={{ backgroundColor: 'transparent', height: '100vh', width: '100vw' }}>
            {donationToShow &&
                <>
                    <QaplaLogo /> {donationToShow.userName} ha donado {donationToShow.amountQoins} Qoins
                </>
            }
        </div>
    );
}

export default LiveDonations;