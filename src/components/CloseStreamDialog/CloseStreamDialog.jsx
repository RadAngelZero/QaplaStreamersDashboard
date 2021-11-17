import React, { useEffect } from 'react';
import { makeStyles, Dialog, DialogTitle, DialogContent, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(() => ({
    paper: {
        background: 'linear-gradient(0deg, #0D1021, #0D1021), #141735',
        borderRadius: 20,
        paddingLeft: 16,
        paddingTop: 8,
        paddingBottom: 24
    },
    whiteColor: {
        color: '#FFF'
    },
    finishButton: {
        margin: 16
    }
}));

const CloseStreamDialog = ({ open, onClose, children, finished }) => {
    const classes = useStyles();
    const { t } = useTranslation();

    useEffect(() => {
        if (finished) {
            setTimeout(() => {
                onClose();
            }, 3000);
        }
    }, [finished, onClose]);

    return (
        <Dialog open={open}
            fullWidth
            maxWidth='sm'
            classes={{
                scrollPaper: classes.scrollPaper,
                paper: classes.paper
            }}>
            <DialogTitle className={classes.whiteColor}>
                {t('handleStream.closingStreamSteps.closing')}
            </DialogTitle>
            <DialogContent>
                {children}
                {finished &&
                    <Typography className={classes.whiteColor}>
                        {t('handleStream.closingStreamSteps.streamSuccesfulyClosed')}
                    </Typography>
                }
            </DialogContent>
        </Dialog>
    );
}

export default CloseStreamDialog;