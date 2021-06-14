import React from 'react';
import { withStyles, makeStyles, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import ContainedButton from '../ContainedButton/ContainedButton';

const CustomDialog = withStyles((theme) => ({
    paper: {
        backgroundColor: '#0D1021',
        color: '#FFF',
        padding: 16
    }
}))(Dialog);

const useStyles = makeStyles({
    text: {
        color: '#FFF'
    },
    button: {
        background: '#8B46FF !important',
        borderRadius: '1rem',
        fontWeight: 'bold',
        padding: '.75rem 2rem .75rem 2rem',
        color: '#FFF',
        fontSize: '14px',
        marginTop: '2rem'
    }
});

const NewStreamDetailsDialog = ({ open, onClose, userName, submitEvent, date, game, title, descriptions, descriptionsTitle }) => {
    const classes = useStyles();

    return (
        <CustomDialog open={open} onClose={onClose} className={classes.container} fullWidth>
            <DialogTitle>
                We are almost done {userName}!
            </DialogTitle>
            <DialogContent>
                <DialogContentText className={classes.text}>
                    Just confirm the details to continue
                </DialogContentText>
                <DialogContentText className={classes.text}>
                    Date and hour: {date} (local time)
                </DialogContentText>
                <DialogContentText className={classes.text}>
                    Game: {game}
                </DialogContentText>
                {title instanceof Object &&
                    Object.keys(title).map((language) => (
                        <DialogContentText className={classes.text}>
                            Title: {title[language]}
                        </DialogContentText>
                    ))
                }
                {descriptions instanceof Object &&
                    <DialogContentText className={classes.text}>
                        Description:
                        {descriptionsTitle instanceof Object &&
                            Object.keys(descriptionsTitle).map((language) => (
                                <DialogContentText className={classes.text}>
                                    {descriptionsTitle[language]}
                                </DialogContentText>
                            ))
                        }
                        {Object.keys(descriptions).map((language) => (
                            <DialogContentText className={classes.text}>
                                {descriptions[language]}
                            </DialogContentText>
                        ))}
                    </DialogContentText>
                }
            </DialogContent>
            <DialogActions>
                <ContainedButton variant='outlined' onClick={onClose} color="primary">
                    Cancel
                </ContainedButton>
                <ContainedButton variant='outlined' onClick={submitEvent} color="primary" autoFocus>
                    Continue
                </ContainedButton>
            </DialogActions>
        </CustomDialog>
    );
}

export default NewStreamDetailsDialog;