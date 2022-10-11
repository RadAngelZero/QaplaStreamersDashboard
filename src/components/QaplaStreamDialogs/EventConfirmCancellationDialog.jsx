import React, { useState } from 'react';
import { Button, Dialog, DialogContent, makeStyles, TextField } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { ReactComponent as CloseIcon } from './../../assets/CloseIcon.svg';
import { notifyAboutStreamToFollowersAndParticipants } from '../../services/functions';

const useStyles = makeStyles((theme) => ({
    dialogContainer: {
        backdropFilter: 'blur(50px)'
    },
    dialogRoot: {
    },
    paper: {
        backgroundColor: '#141833',
        color: '#FFF',
        overflow: 'visible',
        borderRadius: '35px',
        padding: '64px',
        paddingBottom: '48px',
        minWidth: 'min-content'
    },
    closeButton: {
        '&:hover': {
            cursor: 'pointer'
        }
    },
    dialogTitle: {
        fontSize: '18px',
        fontWeight: '600',
        lineHeight: '32px',
        textAlign: 'center',
        maxWidth: '220px',
        marginBottom: '8px'
    },
    dialogDescription: {
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '22px',
        color: '#8F9BBA',
        textAlign: 'center',
        maxWidth: '300px'
    },
    textInputContainer: {
        width: '386px',
        fontSize: 12,
        letterSpacing: .49,
        fontWeight: '400',
        backgroundColor: '#202750',
        paddingLeft: '16px',
        paddingRight: '24px',
        paddingTop: 16,
        lineHeight: `22px`,
        marginTop: 0,
        color: '#FFF',
        borderRadius: '16px'
    },
    cancelStreamButton: {
        marginTop: '32px',
        width: '100%',
        backgroundColor: '#FF006B',
        borderRadius: '16px',
        fontSize: '16px',
        fontWeight: '600',
        lineHeight: '22px',
        letterSpacing: '0.49px',
        paddingTop: '19px',
        paddingBottom: '19px',
        color: '#FFF',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#FF006B',
            opacity: 0.9
        }
    }
}));

const EventConfirmCancellationDialog = ({ streamerUid, streamId, streamTitle = '', streamerName, open, onClose, cancelStream }) => {
    const [message, setMessage] = useState('');
    const classes = useStyles();
    const { t } = useTranslation();

    const cancel = () => {
        notifyAboutStreamToFollowersAndParticipants(streamId,
            streamerUid,
            {
                es: `🚨 ${streamerName} ha cancelado su stream`,
                en: `🚨 ${streamerName}'s stream has been canceled`
            },
            {
                es: message ? message : `El stream ${streamTitle} no podrá llevarse a cabo 😢`,
                en: message ? message :`${streamerName} won't be able to stream ${streamTitle} 😢`
            },
            'cancelations'
        );

        cancelStream();
    }

    return (
        <Dialog onClose={onClose} open={open} classes={{
            container: classes.dialogContainer,
            root: classes.dialogRoot,
            paper: classes.paper
        }}>
            <DialogContent style={{ padding: '0px' }}>
                <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                    <CloseIcon onClick={onClose} className={classes.closeButton} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p className={classes.dialogTitle}>
                        {t('QaplaStreamDialogs.EventConfirmCancellationDialog.title')}
                    </p>
                    <p className={classes.dialogDescription}>
                        {t('QaplaStreamDialogs.EventConfirmCancellationDialog.description')}
                    </p>
                    <div style={{ marginTop: '32px' }} />
                    <TextField multiline
                        maxRows={6}
                        rows={6}
                        placeholder={t('QaplaStreamDialogs.EventConfirmCancellationDialog.customMessagePlaceholder')}
                        value={message}
                        onChange={(e) => e.target.value.length <= 140 ? setMessage(e.target.value) : null}
                        InputProps={{ disableUnderline: true, className: classes.textInputContainer }}
                        fullWidth />
                    <Button className={classes.cancelStreamButton} onClick={cancel}>
                        {t('QaplaStreamDialogs.EventConfirmCancellationDialog.cancelStream')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default EventConfirmCancellationDialog;