import React from 'react';
import {
    makeStyles,
    InputBase,
    InputAdornment,
    InputLabel
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    label: {
        fontSize: '12px',
        color: '#B2B3BD',
        lineHeight: '16px'
    },
    textInput: {
        marginTop: theme.spacing(1),
        paddingLeft: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        fontWeight: 'bold',
        backgroundColor: '#141833',
        borderRadius: '.5rem',
        color: '#FFF',
        fontSize: '14px'
    }
}));

const StreamerTextInput = ({ label, placeholder, value, onChange, fullWidth = false, Icon, type, multiline = false, rows = 1, rowsMax, containerClassName = {}, textInputClassName = {}, id='' }) => {
    const classes = useStyles();

    return (
        <div className={containerClassName}>
            <InputLabel className={classes.label}>
                {label}
            </InputLabel>
            <InputBase
                id={id}
                rows={rows}
                rowsMax={rowsMax}
                multiline={multiline}
                type={type}
                endAdornment={Icon ?
                    <InputAdornment position='end'>
                        {Icon}
                    </InputAdornment>
                    :
                    null
                }
                variant='outlined'
                label={label}
                className={[textInputClassName, classes.textInput]}
                fullWidth={fullWidth}
                placeholder={placeholder}
                value={value}
                onChange={onChange} />
        </div>
    );
}

export default StreamerTextInput;