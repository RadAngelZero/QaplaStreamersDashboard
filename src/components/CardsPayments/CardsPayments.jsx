import React from "react";

import { makeStyles, Button } from "@material-ui/core";

import iconTick from "../../assets/Tickgray.svg";

const useStyles = makeStyles(() => ({
    containerCard: {
        maxWidth: "337px",
        minWidth: "337px",
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
        opacity: "0.8",
        maxHeight: "52px",
        minHeight: "52px",
        borderRadius: "10px",
        textTransform: "capitalize",
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
        color:'#00FFDD',
        fontSize: "14px"
    },
    textWhite: {
        color:'#FFFFFF',
        fontSize: "14px"
    }
}));

const CardsPayments = ({
    title,
    price,
    backgroundCards,
    backgroundButon,
    textButon,
    subtitle,
    colorTextButon,
    items,
    paymentPerMonth,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.containerCard}>
        <h1 className={classes.title}>{title}</h1>
        <div
            className={classes.container}
            style={{ background: backgroundCards }}
      >
            <div className={classes.itemContainer}>
                <div style={{ display: "flex", height: "45px", marginBottom: "10px" }}>
                    <h2 className={classes.price}>${price}</h2>
                    <p className={classes.text}>/month</p>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <p style={{ color: "#FFF", fontSize: "13px" }}>{subtitle}</p>
                    <p style={{ color: "#00FFDD", fontSize: "13px" }}>{paymentPerMonth}</p>
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
            <Button
            className={classes.Button}
            style={{ background: backgroundButon, color: colorTextButon }}
            >
            {textButon}
            </Button>
        </div>
    </div>
  );
};

export default CardsPayments;
