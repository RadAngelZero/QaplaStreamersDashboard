import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import style from "./BarProgressBit.module.css";

import { withStyles } from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress";
import { Dialog, makeStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";

import CasthQutDialog from "../CasthQutDialog/CasthQutDialog";
import CasthQutConfirmDialog from "../CasthQutConfirmDialog/CasthQutConfirmDialog";

const BorderLinearProgress = withStyles((theme) => ({
    root: {
        height: 10,
        borderRadius: 5,
        backgroundColor: "#0D1021",
    },
    bar: {
        borderRadius: 5,
        background:
        "linear-gradient(270deg, #4FF4FF 0%, #924FFF 52.52%, #FF8ADE 100%), #0AFFD2;",
    },
}))(LinearProgress);

const ContButton = withStyles((theme) => ({
  root: {
    backgroundColor: "#3B4BF9",
    fontSize: "12px",
    height: "40px",
    maxWidth: "90px",
    minWidth: "90px",
    fontWeight: "500",
    padding: "16px",
    color: "#FFFFFF",
    textTransform: "none",
    textAlign: "center",
    "&:hover": {
        backgroundColor: "#3B4BF9",
    },
    disabled: {
        color: "#FFFFFF",
    },
    "&:disabled": {
        color: "#ffff",
        opacity: "0.4",
    },
  },
}))(Button);

const BarProgressBit = ({
    user,
    estimatedBits,
    availableBits,
    nextMilestone,
}) => {
  const [open, setOpen] = useState(false);
  const [confirmCashOut, setConfirmCashOut] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [disabledButon, setDisabledButon] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (availableBits <= 0) {
        setDisabledButon(true);
    } else {
        setDisabledButon(false);
    }
  }, [disabledButon, availableBits]);

  const handleOpenDialod = () => {
    setOpen(true);
  };

  const milestoneProgress =
    ((250 - (nextMilestone - estimatedBits)) / 250) * 100;

  return (
    <>
        <div className={style.container}>
            <div className={style.barProgress}>
                <div className={style.titulos}>
                    <p className={style.percentageTitle}>
                        {t("StreamerProfile.BarProgressBit.nextMilestone")}
                    </p>
                    <p className={style.porcentaje}>
                                    {estimatedBits.toLocaleString()} /{" "}
                                    {nextMilestone.toLocaleString()}
                    </p>
                </div>
                <BorderLinearProgress
                    variant="determinate"
                    value={milestoneProgress}/>
            </div>
            <div className={style.puntos}>
                <p>{t("StreamerProfile.BarProgressBit.available")}</p>
                <h2>{availableBits.toLocaleString()}</h2>
            </div>
        </div>
        <ContButton
            disabled={disabledButon}
            onClick={() => {
                handleOpenDialod();
                setConfirmCashOut(false);
        }}
      >
            {t("StreamerProfile.BarProgressBit.cashOut")}
        </ContButton>
        {!confirmCashOut ? (
          <CasthQutDialog
            open={open}
            onClose={() => setOpen(false)}
            user={user}
            amountBits={availableBits}
            setOpen={setOpen}
            setOpenConfirm={setOpenConfirm}
            setConfirmCashOut={setConfirmCashOut}
          />
      ) : (
        <CasthQutDialog
            onClose={() => setOpenConfirm(false)}
            open={openConfirm}
        >
          <CasthQutConfirmDialog
                amountBits={availableBits}
                setOpenConfirm={setOpenConfirm}
            />
        </CasthQutDialog>
      )}
    </>
  );
};

export default BarProgressBit;
