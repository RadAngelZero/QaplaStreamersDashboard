import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { getStreamsPackages } from '../../services/database';
import { getCurrentLanguage } from '../../utilities/i18n';

const StreamsPackages = () => {
    const [packages, setPackages] = useState({});
    const history = useHistory();

    useEffect(() => {
        async function loadPackages() {
            const packages = await getStreamsPackages();
            setPackages(packages.val());
        }

        loadPackages();
    }, []);

    const userLanguage = getCurrentLanguage();

    return (
        <>
            <h1 style={{ color: '#FFF' }}>Algo</h1>
            {Object.keys(packages).map((packageId) => (
                <div style={{ color: '#FFF' }} onClick={() => history.push(`/streamsCheckout/${packages[packageId].billingPageId}`)}>
                    {packages[packageId].name[userLanguage]}
                    <p style={{ color: '#FFF' }}>
                        {packages[packageId].description[userLanguage]}
                    </p>
                    <p style={{ color: '#FFF' }}>
                        {packages[packageId].price}
                    </p>
                </div>
            ))}
        </>
    );
}

export default StreamsPackages;