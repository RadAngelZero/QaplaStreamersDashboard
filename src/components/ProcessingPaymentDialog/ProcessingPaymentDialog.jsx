import React from 'react';
import { makeStyles, Dialog, DialogActions, DialogTitle, DialogContent, DialogContentText } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import ContainedButton from '../ContainedButton/ContainedButton';

const useStyles = makeStyles(() => ({
    paper: {
        background: 'linear-gradient(0deg, #0D1021, #0D1021), #141735',
        borderRadius: 20,
        paddingLeft: 16,
        paddingTop: 8
    },
    whiteColor: {
        color: '#FFF'
    },
    finishButton: {
        margin: 16
    }
}));

const ProcessingPaymentDialog = ({ open, finished = false, onClose }) => {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <Dialog open={open}
            onClose={() => {}}
            fullWidth
            maxWidth='sm'
            classes={{
                scrollPaper: classes.scrollPaper,
                paper: classes.paper
            }}>
            <DialogTitle className={classes.whiteColor}>
                {t('ProcessingPaymentDialog.successfulPayment')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText className={classes.whiteColor}>
                    {!finished ?
                        t('ProcessingPaymentDialog.activatingAccount')
                    :
                        t('ProcessingPaymentDialog.membershipReady')

                    }
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                {finished &&
                    <ContainedButton variant='contained'
                        onClick={onClose}
                        className={classes.finishButton}>
                        {t('ProcessingPaymentDialog.finish')}
                    </ContainedButton>
                }
            </DialogActions>
        </Dialog>
    );
}

export default ProcessingPaymentDialog;