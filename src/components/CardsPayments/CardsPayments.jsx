import React from "react";
import { makeStyles, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import iconTick from "../../assets/Tickgray.svg";

const useStyles = makeStyles(() => ({
    containerCard: {
        maxWidth: "320px",
        minWidth: "320px",
        maxHeight: "513px",
        minHeight: "513px",
        margin: "15px",
    },
    container: {
        maxHeight: "447px",
        minHeight: "447px",
        marginTop: "30px",
        borderRadius: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
    },
    itemContainer: {
        padding: "34px 40px 0px 40px",
        maxWidth: "240px",
        minWidth: "240px",
    },
    title: {
        fontSize: "30px",
        lineHeight: "36px",
        fontWeight: "700",
        color: "#ffffff",
        textAlign: "center",
    },
    items: {
        marginTop: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    Button: {
        maxWidth: "257px",
        minWidth: "257px",
        marginBottom: "30px",
        maxHeight: "52px",
        minHeight: "52px",
        borderRadius: "10px",
        textTransform: "none",
        fontWeight: '700',
        '&:hover': {
            opacity: 0.9
        },
        '&:disabled': {
            opacity: 0.4
        }
    },
    price: {
        color: "#FFF",
        marginBottom: "6px",
    },
    text: {
        display: "flex",
        alignItems: "end",
        color: "#FFFFFF",
        fontWeight: "500",
    },
    textGreen:{
        fontWeight: '600',
        color:'#00FFDD',
        fontSize: "14px"
    },
    textWhite: {
        fontWeight: '400',
        color:'#FFFFFF',
        fontSize: "14px"
    }
}));

const CardsPayments = ({
    title,
    price,
    backgroundCards = '#141833',
    backgroundButon,
    textButon,
    subtitle,
    colorTextButon,
    items,
    paymentPerMonth,
    disableButton = false
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.containerCard}>
        <h1 className={classes.title}>{title}</h1>
        <div
            className={classes.container}
            style={{ background: backgroundCards }}
      >
            <div className={classes.itemContainer}>
                <div style={{ display: "flex", height: "45px", marginBottom: "10px" }}>
                    <h2 className={classes.price}>${Number.isInteger(price) ? price : price.toString().substring(0, price.toString().indexOf('.') + 3)}</h2>
                    <p className={classes.text}>/{t('PlanPicker.plansPeriods.monthly')}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <p style={{ color: "rgba(255, 255, 255, .8)", fontSize: "13px", marginRight: '4px' }}>
                        {subtitle}
                    </p>
                    <p style={{ color: "#00FFDD", fontSize: "13px", fontWeight: '600' }}>{paymentPerMonth}</p>
                </div>
                <div className={classes.items}>
                    {items.map((el) => (
                        <div style={{ display: "flex", gap: "10px" }}>
                            <img src={iconTick} alt="icon" />
                            <p className={el.color? classes.textGreen : classes.textWhite}>{el.text}</p>
                        </div>
                ))}
                </div>
            </div>
            <Button className={classes.Button}
                disabled={disableButton}
                type='submit'
                style={{ background: backgroundButon, color: colorTextButon }}>
                {textButon}
            </Button>
        </div>
    </div>
  );
};

export default CardsPayments;
