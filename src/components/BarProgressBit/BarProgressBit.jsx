import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import style from "./BarProgressBit.module.css";

import { withStyles } from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress";
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

const BarProgressBit = ({ user, estimatedBits, availableBits, nextMilestone }) => {
    const [open, setOpen] = useState(false);
    const [confirmCashOut, setConfirmCashOut] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [disabledButon, setDisabledButon] = useState(false);
    const [bitsToDeliver, setBitsToDeliver] = useState(0);
    const { t } = useTranslation();

    useEffect(() => {
        if (availableBits <= 0) {
            setDisabledButon(true);
        } else {
            setBitsToDeliver(availableBits);
            setDisabledButon(false);
        }
    }, [disabledButon, availableBits]);

    const handleOpenDialod = () => {
        setOpen(true);
    };

    const nextLevel = user && user.premium ? 50 : 500;
    const milestoneProgress = ((nextLevel - (nextMilestone - estimatedBits)) / nextLevel) * 100;

    return (
    <>
        <div className={style.container}>
            <div className={style.barProgress}>
                <div className={style.titles}>
                    <p className={style.percentageTitle}>
                        {t("StreamerProfile.BarProgressBit.nextMilestone")}
                    </p>
                    <p className={style.percentage}>
                        {estimatedBits.toLocaleString()} /{" "}
                        {nextMilestone.toLocaleString()}
                    </p>
                </div>
                <BorderLinearProgress
                    variant="determinate"
                    value={milestoneProgress}/>
            </div>
            <div className={style.available}>
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
            <CasthQutConfirmDialog
                onClose={() => setOpenConfirm(false)}
                open={openConfirm}
                amountBits={bitsToDeliver}
                setOpenConfirm={setOpenConfirm}
            />
        )}
    </>
    );
};

export default BarProgressBit;
