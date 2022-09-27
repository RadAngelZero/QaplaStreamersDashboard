import React, { useState, useEffect } from 'react';
import { Checkbox, makeStyles, Grid, Card, CardMedia, Tooltip, FormControlLabel } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(() => ({

}));

const GridSelector = ({
    selected = 0,
    onAreaClick,
    rows = 1,
    columns = 1,
    backgroundImage = '',
    Chilren = (() => <></>),
    Variants = null,
}) => {
    const [grids, setGrids] = useState([]);

    useEffect(() => {
        let gridTotal = rows * columns;
        for (let i = 0; i < gridTotal; i++) {
            let tempGrids = grids;
            tempGrids.push(i);
            setGrids(tempGrids);
        }
        console.log(grids);
        console.log(Chilren);
    }, [rows, columns, grids]);

    return (
        <div style={{
            display: 'flex',
            flex: 1,
            flexWrap: 'wrap',
            backgroundImage: `url('${backgroundImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
            {grids.map((index) => <div style={{
                // flex: 1,
                width: `${100 / columns}%`,
                height: `${100 / rows}%`,
                backgroundColor: selected !== index ? '#0006' : '#0000',
                border: `solid 5px ${selected === index ? '#00FFDD' : '#202750'}`,
                webkitBoxSizing: 'border-box',
                mozBoxSizing: 'border-box',
                boxSizing: 'border-box',
                // zIndex: 1000,
            }} onClick={() => { onAreaClick(index); console.log(`${index} selected`); }}>
                {selected === index && Variants === null &&
                    <Chilren />
                }
                {selected === index && Variants !== null &&
                    <div style={{
                        display: 'flex',
                        flex: 1,
                        height: '100%',
                    }}>
                        {Variants.map((Variant, i) => {
                            if (i === index) {
                                return (
                                    <Variant />
                                )
                            }
                            return (<></>)
                        })}
                    </div>

                }
            </div>)}
        </div>
    )
}

export default GridSelector;