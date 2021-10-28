import React from 'react';
import { makeStyles, Dialog, DialogActions, DialogTitle, DialogContent, DialogContentText } from '@material-ui/core';
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
                Pago realizado con exito
            </DialogTitle>
            <DialogContent>
                <DialogContentText className={classes.whiteColor}>
                    {!finished ?
                        'Espera un momento mientras activamos tu cuenta y arreglamos algunos detalles'
                    :
                        'Listo, tu membresia esta activa, presiona el boton para terminar'
                    }
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                {finished &&
                    <ContainedButton variant='contained'
                        onClick={onClose}
                        className={classes.finishButton}>
                        Terminar
                    </ContainedButton>
                }
            </DialogActions>
        </Dialog>
    );
}

export default ProcessingPaymentDialog;