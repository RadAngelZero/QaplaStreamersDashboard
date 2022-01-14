import React from 'react';
import { makeStyles, Button } from '@material-ui/core';

const useStyles = makeStyles({
    button: {
        color: '#FFF',
        backgroundColor: '#6C5DD3',
        borderRadius: '1rem',
        padding: '1rem 3rem 1rem 3rem',
        textTransform: 'none',
        fontWeight: 'bold'
    }
});

const ContainedButton = ({ children, onClick, size = 'medium', className = {}, startIcon, endIcon, disabled = false }) => {
    const classes = useStyles();

    return (
        <Button variant='contained'
            size={size}
            disabled={disabled}
            className={[classes.button, className]}
            startIcon={startIcon ?
                startIcon
                :
                null}
            endIcon={endIcon ?
                endIcon
                :
                null}
            onClick={onClick}>
            {children}
        </Button>
    );
}

export default ContainedButton;