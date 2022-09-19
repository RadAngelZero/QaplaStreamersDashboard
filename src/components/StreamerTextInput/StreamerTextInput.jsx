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
        paddingLeft: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        fontWeight: 'bold',
        backgroundColor: '#141833',
        borderRadius: '.5rem',
        color: '#FFF',
        fontSize: '14px',
        height: '56px',
        minWidth: '274px'
    }
}));

const StreamerTextInput = ({ label, classes, placeholder, value, onChange, fullWidth = false, Icon, type, multiline = false, rows = 1, maxRows, rowsMax, containerClassName = {}, labelClassName = {}, textInputClassName = {}, containerStyle = {}, textInputStyle = {}, id = '', disabled = false, onBlur }) => {
    const classesMaterial = useStyles();

    return (
        <div className={containerClassName} style={containerStyle}>
            <InputLabel className={[labelClassName, classesMaterial.label]}>
                {label}
            </InputLabel>
            <InputBase
                disabled={disabled}
                id={id}
                rows={rows}
                maxRows={maxRows}
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
                className={[textInputClassName, classesMaterial.textInput]}
                style={textInputStyle}
                classes={classes}
                fullWidth={fullWidth}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onBlur={onBlur} />
        </div>
    );
}

export default StreamerTextInput;