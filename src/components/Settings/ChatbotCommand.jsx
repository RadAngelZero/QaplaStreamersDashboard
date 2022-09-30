import React, { useState, useEffect } from 'react';
import { Checkbox, makeStyles, Grid, Card, CardMedia, Tooltip, FormControlLabel, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { ReactComponent as CopyIcon } from './../../assets/Copy.svg';

const useStyles = makeStyles(() => ({
    title: {
        color: '#FFFFFF',
        fontSize: '18px',
        fontWeight: '600',
        lineHeight: '32px',
    },
    subTitle: {
        color: '#FFFFFF',
        fontSize: '16px',
        fontWeight: '600',
        lineHeight: '32px',
    },
    text: {
        marginTop: '16px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '16px',
        fontWeight: '400',
    },
}))

const ChatbotCommand = () => {
    const classes = useStyles();
    const [openTooltip1, setOpenTooltip1] = useState(false);
    const [openTooltip2, setOpenTooltip2] = useState(false);


    const copyCommand = () => {
        navigator.clipboard.writeText('!qapla');
        setOpenTooltip1(true);
        setTimeout(() => {
            setOpenTooltip1(false);
        }, 1250);
    }
    const copyMessage = () => {
        navigator.clipboard.writeText('Create your own alerts to react on stream using your channel points! You can use memes, GIFs, stickers, emotes, TTS and more! Download the app: myqap.la/download');
        setOpenTooltip2(true);
        setTimeout(() => {
            setOpenTooltip2(false);
        }, 1250);
    }

    return (
        <div style={{
            marginTop: '60px',
            maxWidth: '633px',

        }}>
            <div>
                <h1 className={classes.title}>Chatbot</h1>
                <p className={classes.text}>Add the Qapla Command to your chatbot and make it easier to share Qapla with your community. <b>Copy and paste in your chatbot</b>.</p>
            </div>
            <div style={{
                marginTop: '28px',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <h1 className={classes.subTitle}>Command</h1>
                    <Tooltip placement='top' open={openTooltip1} title='Copiado'>
                        <CopyIcon style={{
                            width: '20px',
                            height: '22px',
                            cursor: 'pointer',
                            marginLeft: '10px',
                        }}
                            onClick={() => copyCommand()}
                        />
                    </Tooltip>

                </div>
                <p className={classes.text}>!qapla</p>
            </div>
            <div style={{
                marginTop: '28px',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <h1 className={classes.subTitle}>Message</h1>
                    <Tooltip placement='top' open={openTooltip2} title='Copiado'>
                        <CopyIcon style={{
                            width: '20px',
                            height: '22px',
                            cursor: 'pointer',
                            marginLeft: '10px',
                        }}
                            onClick={() => copyMessage()}
                        />
                    </Tooltip>

                </div>
                <p className={classes.text} style={{ maxWidth: '270px' }} >Create your own alerts to react on stream using your channel points! <br /><br /> You can use memes, GIFs, stickers, emotes, TTS and more! <br /><br /> Download the app: <span style={{ color: '#428EFF' }}>myqap.la/download</span></p>
            </div>
            <div style={{
                marginTop: '34px',
            }}>
                <p className={classes.title} >Create your profile link</p>
            </div>
        </div>
    )
}

export default ChatbotCommand;