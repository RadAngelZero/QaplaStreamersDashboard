import React, { useState, useEffect } from 'react';

const GridSelector = ({
    selected = 0,
    onAreaClick,
    rows = 1,
    columns = 1,
    backgroundImage = '',
    children = null,
    Variants = null,
}) => {
    const [grids, setGrids] = useState([]);

    useEffect(() => {
        if (grids.length <= 0) {
            const gridTotal = rows * columns;
            const tempGrids = [];
            for (let i = 0; i < gridTotal; i++) {
                const rowNumber = Math.floor(i / columns);
                const colNumber = Math.floor(i - (rowNumber * columns));
                tempGrids.push({
                    x: colNumber + 1,
                    y: rowNumber + 1
                });
            }

            setGrids(tempGrids);
        }
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
            {grids.map((coordinates, index) =>(
                <div style={{
                    width: `${100 / columns}%`,
                    height: `${100 / rows}%`,
                    backgroundColor: selected !== index ? '#0006' : '#0000',
                    border: `solid 5px ${selected === index ? '#00FFDD' : '#202750'}`,
                    webkitBoxSizing: 'border-box',
                    mozBoxSizing: 'border-box',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                }} onClick={() => onAreaClick(coordinates, index)}>
                    {selected === index && !Variants &&
                        children
                    }
                    {selected === index && Variants &&
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
                </div>
            ))}
        </div>
    )
}

export default GridSelector;