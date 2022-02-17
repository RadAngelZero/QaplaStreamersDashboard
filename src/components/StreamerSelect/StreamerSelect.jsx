import React, { useEffect, useState } from 'react';
import {
    makeStyles,
    InputBase,
    NativeSelect,
    InputLabel,
    List,
    ListItem,
    ListItemText
} from '@material-ui/core';

import { ReactComponent as ArrowIcon } from './../../assets/Arrow.svg';

const useStyles = makeStyles({
    label: {
        fontSize: '12px',
        color: '#B2B3BD',
        lineHeight: '16px'
    },
    input: {
        display: 'flex',
        position: 'absolute',
        zIndex: 90,
        overflow: 'hidden',
        fontWeight: 'bold',
        backgroundColor: '#141833',
        borderRadius: '16px',
        color: '#FFF',
        fontSize: '14px',
    },
    icon: {
        color: 'transparent',
        marginTop: 8,
        marginRight: 8,
        marginLeft: 8
    }
});

const StreamerSelect = ({ children, style, label, Icon, value, onChange, data, maxHeightOpen, overflowX, overflowY, initialLabel }) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false)
    const [selectedLabel, setSelectedLabel] = useState(initialLabel || '')

    useEffect(() => {
        if (data) {
            data.forEach(e => {
                if (e.value === value) setSelectedLabel(e.label)
            });
        }
    })

    return (
        <div className={classes.input} style={style}>
            <List style={{ display: 'flex', flexDirection: 'column', padding: '0px', width: '100%', minHeight: '58px' }}>
                <ListItem button onClick={() => { setOpen(!open); console.log(data) }} style={{ minHeight: '58px' }}>
                    <ListItemText primary={selectedLabel} primaryTypographyProps={{
                        style: {
                            fontFamily: 'Inter'
                        }
                    }} />
                    <div style={{ width: '10px' }} />
                    <ArrowIcon style={{
                        transform: open ? 'rotate(180deg)' : ''
                    }} />
                </ListItem>
                <div style={{
                    height: open ? maxHeightOpen || '' : '0px',
                    overflowX: overflowX || 'scroll',
                    overflowY: overflowY || 'scroll',
                    marginTop: '-10px'
                }}>
                    <List style={{
                        padding: '0px',
                    }}>
                        {data && data.map((dat) => {
                            return (
                                <>
                                    {value !== dat.value &&
                                        <ListItem button onClick={() => { onChange(dat.value); setOpen(false) }}>
                                            <ListItemText primary={dat.label} />
                                        </ListItem>
                                    }
                                </>
                            )
                        })}
                    </List>
                </div>
            </List>
        </div >
    );
}

export default StreamerSelect;