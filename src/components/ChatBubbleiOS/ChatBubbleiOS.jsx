import React, { useEffect, useState } from 'react';

import styles from './ChatBubbleiOS.module.css';

const ChatBubbleiOS = ({ children, bubbleColor = '#22f', textColor = '#fff', maxWidth = '255px', tailRight = false }) => {
    const [bubbleColors, setBubbleColors] = useState(`
        :root {
            --bubble-color: #22f;
            --text-color: #fff;
        }
        p {
            max-width: 255px;
        }
    `);

    useEffect(() => {
        setBubbleColors(`
            :root {
                --bubble-color: ${bubbleColor};
                --text-color: ${textColor};
            }
            p {
                max-width: ${maxWidth};
            }
        `)
    }, [bubbleColor, textColor])

    return (
        <p className={tailRight ? styles.tailRight : styles.tailLeft}>
            <style>{bubbleColors}</style>
            {children}
        </p>
    );
}

export default ChatBubbleiOS;