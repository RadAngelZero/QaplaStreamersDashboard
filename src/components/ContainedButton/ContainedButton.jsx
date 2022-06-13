import React from 'react';
import { makeStyles, Button } from '@material-ui/core';

const useStyles = makeStyles({
    buttonPurple: {
        '&:hover': {
            backgroundColor: '#5348a3',
            boxShadow: 'none',
        },
        color: '#FFF',
        backgroundColor: '#6C5DD3',
        borderRadius: '1rem',
        padding: '1rem 3rem 1rem 3rem',
        textTransform: 'none',
        fontWeight: 'bold'
    },
    buttonGreen: {
        '&:hover': {
            backgroundColor: '#0dd6b1 !important',
            boxShadow: 'none',
        },
        color: '#FFF',
        backgroundColor: '#0AFFD2',
        borderRadius: '1rem',
        padding: '1rem 3rem 1rem 3rem',
        textTransform: 'none',
        fontWeight: 'bold'
    },
    buttonBlue: {
        '&:hover': {
            backgroundColor: '#5348a3 !important',
            boxShadow: 'none',
        },
        color: '#FFF',
        backgroundColor: '#6C5DD3',
        borderRadius: '1rem',
        padding: '1rem 3rem 1rem 3rem',
        textTransform: 'none',
        fontWeight: 'bold'
    }
});

const ContainedButton = ({ children, onClick, size = 'medium', className = {}, style, startIcon, endIcon, disabled = false, type = 'button', buttonColor = 0 }) => {
    const classes = useStyles();

    return (
        <Button variant='contained'
            type={type}
            size={size}
            disabled={disabled}
            className={buttonColor === 0 ? [classes.buttonPurple, className] : buttonColor === 1 ? [classes.buttonGreen, className] : [classes.buttonBlue, className]}
            startIcon={startIcon ?
                startIcon
                :
                null}
            endIcon={endIcon ?
                endIcon
                :
                null}
            onClick={onClick}
            style={style}>
            {children}
        </Button>
    );
}

export default ContainedButton;