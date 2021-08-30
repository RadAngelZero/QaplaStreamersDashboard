import React, { useState, useEffect } from 'react';

import { addStreamerLink, getStreamerLinks } from '../../services/database';
import ContainedButton from '../ContainedButton/ContainedButton';

const AddStreamerLinks = ({  user}) => {
    const [links, setLinks] = useState({});

    useEffect(() => {
        async function loadLinks() {
            getStreamerLinks(user.uid, (links) => {
                setLinks(links.val());
            });
        }

        if (user && user.uid) {
            loadLinks();
        }
    }, [user]);

    const addLink = async () => {
        let url = '';
        do {
            url = prompt('Link:');
            if (!url) {
                return;
            }
        }
        while (!isValidUrl(url));

        await addStreamerLink(user.uid, user.displayName, url, prompt('Texto a mostrar:'));
        alert(`Boton agregado a qapla.streamers/${user.displayName}`);
    }

    const isValidUrl = (url) => {
        const regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;

        return regexp.test(url);
    }

    return (
        <div>
            {!links ?
                <ContainedButton onClick={addLink}>
                    Agrega tu primer link
                </ContainedButton>
                :
                <>
                    {Object.keys(links).map((linkKey) => (
                        <p style={{ color: '#FFF' }}>
                            <a href={links[linkKey].link}>{links[linkKey].title}</a>
                        </p>
                    ))}
                    {(Object.keys(links).length > 0 && Object.keys(links).length < 5) &&
                        <ContainedButton onClick={addLink}>
                            Agrega otro link
                        </ContainedButton>
                    }
                </>
            }
        </div>
    );
}

export default AddStreamerLinks;