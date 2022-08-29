import React, { useState } from "react";

import style from "./ModalQoinsDrops.module.css";



import {ReactComponent as  CheckedIcon}  from "../../assets/Unchecked.svg";
import { ReactComponent as UncheckedIcon }  from "../../assets/TickSquare.svg";
import  Checkeck  from "../../assets/TickSquareDark.svg";

import {
  FormControlLabel,
  makeStyles,
  Radio,
  RadioGroup,
} from "@material-ui/core";



const useStyles = makeStyles((theme) => ({
  label: {
    fontfamily: "Inter",
    fontstyle: "normal",
    fontweight: "400",
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.603447)",
  },

}));




const ModalQoinsDrops = () => {
  const [loanding, setLoading] = useState(false);
  const [loadingEnd, setLoadingEnd] = useState(false);
  const classes = useStyles();

  

  const handleOnClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoadingEnd(true);
    }, 4000);
  };




  return (
    <div className={style.containerModal}>
      <div className={style.container}>
        <div className={style.secctions_input}>
          <div className={style.titulo}>
            <h1>🪂 Qoins' Drops</h1>
            <p>
              Set a time for the Qoins' channel reward to show on yor stream
            </p>
          </div>
          {!loadingEnd ? (
            <>
              
                <RadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  name="radio-buttons-group"
                >
                  <FormControlLabel
                    value="Right away"
                    classes={{ label: classes.label }}
                    control={
                      <Radio
                      classes={{Radio: classes.Radio}}
                        defaultChecked
                        checkedIcon={<UncheckedIcon />}
                        icon={<CheckedIcon />}
                        style={{ backgroundColor: "transparent" }}
                      />
                    }
                    label="Right away"
                  />
                  <FormControlLabel
                    value="in 30 min"
                    classes={{ label: classes.label }}
                    control={
                      <Radio
                        defaultChecked
                        checkedIcon={<UncheckedIcon />}
                        icon={<CheckedIcon />}
                        style={{ backgroundColor: "transparent" }}
                      />
                    }
                    label="in 30 min"
                  />
                  <FormControlLabel
                    value="in 45 min"
                    classes={{ label: classes.label }}
                    control={
                      <Radio
                        defaultChecked
                        checkedIcon={<UncheckedIcon />}
                        icon={<CheckedIcon />}
                        style={{ backgroundColor: "transparent" }}
                      />
                    }
                    label="in 45 min"
                  />
                  <FormControlLabel
                    value="in 1 hour"
                    classes={{ label: classes.label }}
                    control={
                      <Radio
                        defaultChecked
                        checkedIcon={<UncheckedIcon />}
                        icon={<CheckedIcon />}
                        style={{ backgroundColor: "transparent" }}
                      />
                    }
                    label="in 1 hour"
                  />
                </RadioGroup>
              
              <div>
                {!loanding ? (
                  <button onClick={handleOnClick} className={style.button}>
                    Enable Drops
                  </button>
                ) : (
                  <div className={style.container_loader}>
                    
                    <p>Setting up drops</p>
                    <div className={style.loader}></div>
                  </div>
                )}
              </div>{" "}
            </>
          ) : (
            <div className={style.loading_End}>
              <img src={Checkeck} alt="icons"/>
              <p>Qoins will drop in 30 min</p>
            </div>
          )}
        </div>
      </div>

      <p className={style.extraData}>
        Exploring Astraland 🌙 /30 Apri/10:30 p.m.
      </p>
    </div>
  );
};

export default ModalQoinsDrops;
