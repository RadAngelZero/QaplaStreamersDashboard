import React, { useState } from "react";
import {
  Button,
  FormControlLabel,
  makeStyles,
  Radio,
  RadioGroup,
} from "@material-ui/core";

import style from "./ModalQoinsDrops.module.css";
import {ReactComponent as  CheckedIcon}  from "../../assets/Unchecked.svg";
import { ReactComponent as UncheckedIcon }  from "../../assets/Checked.svg";
import  Checkeck  from "../../assets/TickSquareDark.svg";

const useStyles = makeStyles((theme) => ({
    label: {
        fontfamily: "Inter",
        fontstyle: "normal",
        fontweight: "400",
        fontSize: "13px",
        color: "rgba(255, 255, 255, 0.603447)",
    },
    enableButtonRoot: {
        marginTop: 32,
        backgroundColor: '#00FFDD',
        width: '200px',
        height: '56px',
        borderRadius: '16px',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '20px',
        letterSpacing: '0px',
        color: '#0D1021',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#00EACB'
        },
        '&:active': {
            backgroundColor: '#00EACB',
            opacity: '0.9'
        }
    }
}));

const ModalQoinsDrops = ({ stream = null, streamStarted, startStream, enableQoins }) => {
    const [selectedTime, setSelectedTime] = useState(0);
    const classes = useStyles();

    const handleOnClick = async (e) => {
        if (e) {
            e.stopPropagation();
        }

        const streamData = await startStream(selectedTime);

        if (selectedTime === 0) {
            await enableQoins(streamData.qoinsReward);
        }
    };

    return (
        <div className={style.container}>
            <div className={style.secctions_input}>
                <div className={style.titulo}>
                    <p className={style.heading}>
                        🪂 Qoins' Drops
                    </p>
                    <p className={style.subheading}>
                        Set a time for the Qoins' channel reward to show on yor stream
                    </p>
                </div>
                {(!stream && !streamStarted) &&
                    <>
                    <RadioGroup
                    className={style.radioGroup}
                    aria-labelledby="demo-radio-buttons-group-label"
                    name="radio-buttons-group"
                    onChange={(e) => setSelectedTime(Number(e.target.value))}
                    value={selectedTime}
                    >
                        <FormControlLabel value={0}
                            classes={{ label: classes.label }}
                            control={
                            <Radio
                            classes={{ Radio: classes.Radio }}
                                defaultChecked
                                checkedIcon={<UncheckedIcon />}
                                icon={<CheckedIcon />}
                                style={{ backgroundColor: "transparent", padding: 8 }}
                            />
                            }
                            label="Right away"
                        />
                        <FormControlLabel value={30}
                            classes={{ label: classes.label }}
                            control={
                            <Radio
                                defaultChecked
                                checkedIcon={<UncheckedIcon />}
                                icon={<CheckedIcon />}
                                style={{ backgroundColor: "transparent", padding: 8 }}
                            />
                            }
                            label="in 30 min"
                        />
                        <FormControlLabel value={45}
                            classes={{ label: classes.label }}
                            control={
                            <Radio
                                defaultChecked
                                checkedIcon={<UncheckedIcon />}
                                icon={<CheckedIcon />}
                                style={{ backgroundColor: "transparent", padding: 8 }}
                            />
                            }
                            label="in 45 min"
                        />
                        <FormControlLabel value={60}
                            classes={{ label: classes.label }}
                            control={
                            <Radio
                                defaultChecked
                                checkedIcon={<UncheckedIcon />}
                                icon={<CheckedIcon />}
                                style={{ backgroundColor: "transparent", padding: 8 }}
                            />
                            }
                            label="in 1 hour"
                        />
                    </RadioGroup>
                    <Button onClick={handleOnClick}
                        classes={{
                        root: classes.enableButtonRoot
                        }}>
                        Enable Drops
                    </Button>
                    </>
                }
                {!stream && streamStarted &&
                    <div className={style.container_loader}>
                        <p>Setting up drops</p>
                        <div className={style.loader}></div>
                    </div>
                }
                {(stream && !stream.qoinsEnabled) &&
                    <div className={style.loading_End}>
                        <img src={Checkeck} alt="icons"/>
                        <p>Qoins will drop in {selectedTime} mins</p>
                    </div>
                }
            </div>
        </div>
    );
};

export default ModalQoinsDrops;
