import React, { useState, useEffect } from 'react';
import { makeStyles, Slide, Button, Dialog, DialogContent, IconButton, List, ListItem, ListItemAvatar, Avatar, ListItemText, Box } from '@material-ui/core';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import DayJsUtils from '@date-io/dayjs';
import { useTranslation } from 'react-i18next';

import { ReactComponent as CloseIcon } from './../../assets/CloseIcon.svg';
import { ReactComponent as QoinsIcon } from './../../assets/QoinsIcon.svg';
import { ReactComponent as BitsIcon } from './../../assets/BitsIcon.svg';
import { ReactComponent as DonatedQoinIcon } from './../../assets/DonatedQoin.svg';
import { getPeriodStreamerPayments, listenForLastStreamerCheers, removeListenerForLastStreamerCheers } from '../../services/database';

const useStyles = makeStyles((theme) => ({
    toggleButton: {
        borderRadius: 6,
        textAlign: 'center',
        marginRight: 8,
        fontSize: 17,
        fontStyle: 'normal',
        fontWeight: 600,
        paddingLeft: 16,
        paddingRight: 16,
        '&:hover': {
            opacity: '.80'
        }
    },
    scrollPaper: {
        alignItems: 'flex-start',
        justifyContent: 'flex-end'
    },
    paper: {
        height: '100vh',
        background: 'linear-gradient(0deg, #0D1021, #0D1021), #141735',
        borderRadius: 20,
        paddingLeft: 16,
        paddingTop: 8,
        [theme.breakpoints.down("sm")]: {
            width: '100vw'
        },
        [theme.breakpoints.up("md")]: {
            width: '33vw'
        }
    },
    dialogHeaderContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    balanceCurrencyContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16
    },
    balanceCurrencyValue: {
        color: '#FFF',
        fontSize: 30,
        lineHeight: 0,
        fontWeight: 600,
        marginRight: 8
    },
    periodText: {
        color: 'rgba(134, 146, 255, 0.65)',
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: .35,
        marginBottom: 16,
        cursor: 'pointer'
    },
    qoinsDonationPrimaryText: {
        fontSize: 18,
        fontWeight: 600,
        color: '#FFF'
    },
    qoinsCheersecondaryText: {
        fontSize: 14,
        fontWeight: 500,
        color: 'rgba(255, 255, 255, .65)'
    },
    qoinDonationValueContainer: {
        display: 'flex',
        alignSelf: 'flex-start',
        alignItems: 'center',
        marginTop: 6
    },
    qoinDonationValueText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 600,
        marginRight: 4
    },
    list: {
        maxHeight: '60vh',
        position: 'relative',
        overflow: 'auto'
    },
    periodPicker: {
        color: '#FFF',
    },
    popover: {
        backgroundColor: '#141833',
        color: 'white',
        padding: '15px',
        '& .MuiPickersCalendarHeader-switchHeader': {
            '& .MuiIconButton-root:hover': {
                backgroundColor: '#707070'
            }
        },

        '& .MuiButtonBase-root:hover:not(.MuiPickersDay-daySelected)': {
            backgroundColor: '#3f51b5',
        },
        '& .MuiPickersDay-day': {
            color: 'white'
        },
        '& .MuiPickersDay-daySelected': {
            backgroundColor: '#00beff',
            color: '#000'
        },
        '& .MuiPickersDay-dayDisabled': {
            color: 'gray'
        },
        '& .MuiPickersCalendarHeader-dayLabel': {
            color: 'white'
        },
        '& .MuiPickersClockNumber-clockNumber': {
            color: 'white'
        },
        '& .MuiPickersClockPointer-pointer': {
            backgroundColor: '#00beff',
            '& .MuiPickersClockPointer-noPoint': {
                borderColor: '#00beff',
            },
            '& .MuiPickersClockPointer-thumb': {
                borderColor: '#00beff',
            }
        },
        '& .MuiPickersClockNumber-clockNumberSelected': {
            color: '#000'
        }
    }
}));

const DialoogTransaction = React.forwardRef(function Transition(props, ref) {
    return <Slide direction='left' ref={ref} {...props} />;
});

const ToggleButton = ({ currentValue, value, onChange }) => {
    const classes = useStyles();
    const active = currentValue === value;

    return (
        <Button
            className={classes.toggleButton}
            style={{ background: active ? '#29326B' : 'rgba(41, 50, 107, 0)', color: active ? '#FFF' : 'rgba(255, 255, 255, .6)' }}
            onClick={() => onChange(value)}>
            {value}
        </Button>
    );
};

const RecordsHeader = ({ value, Icon, showPeriod, onPeriodChange }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [openMonthPicker, setOpenMonthPicker] = useState(false);
    const { t } = useTranslation();
    const classes = useStyles();

    const monthsArray = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    const handleDateChange = (date) => {
        setSelectedDate(date.$d);
        setOpenMonthPicker(false);
        if (onPeriodChange) {
            onPeriodChange(date.$d);
        }
    }

    return (
        <>
            <div className={classes.balanceCurrencyContainer}>
                <p className={classes.balanceCurrencyValue}>
                    {value || 0}
                </p>
                <Icon />
            </div>
            {showPeriod &&
                <MuiPickersUtilsProvider utils={DayJsUtils}>
                    {/**
                     * Box hides the TextField of the picker but allows the user to open
                     * the dialog to select the period
                     */}
                    <Box component='div' visibility='hidden'>
                        <DatePicker format='MM'
                            disableFuture
                            disableToolbar
                            variant='inline'
                            views={['month']}
                            open={openMonthPicker}
                            openTo='month'
                            value={selectedDate}
                            onChange={handleDateChange}
                            PopoverProps={{
                                PaperProps: {
                                    className: classes.popover
                                }
                            }} />
                    </Box>
                    <div className={classes.periodText} onClick={() => setOpenMonthPicker(true)}>
                        {t('CheersBitsRecordDialog.period')} {t(`months.${monthsArray[selectedDate.getMonth()]}`)} {selectedDate.getFullYear()}
                    </div>
                </MuiPickersUtilsProvider>
            }
        </>
    );
}

const QoinsCheers = ({ qoinsBalance, cheers }) => {
    const classes = useStyles();

    return (
        <>
            <RecordsHeader value={qoinsBalance} Icon={QoinsIcon} />
            <List className={classes.list}>
                {Object.keys(cheers).reverse().map((cheerId) => (
                    <>
                        <ListItem disableGutters>
                            <ListItemAvatar>
                                <Avatar alt={cheers[cheerId].userName}
                                    src={cheers[cheerId].photoURL} />
                            </ListItemAvatar>
                            <ListItemText primary={cheers[cheerId].userName}
                                secondary={formatDate(cheers[cheerId].timestamp)}
                                classes={{
                                    primary: classes.qoinsDonationPrimaryText,
                                    secondary: classes.qoinsCheersecondaryText
                                }} />
                            <div className={classes.qoinDonationValueContainer}>
                                <div className={classes.qoinDonationValueText}>
                                    {cheers[cheerId].amountQoins}
                                </div>
                                <DonatedQoinIcon />
                            </div>
                        </ListItem>
                        {cheers[cheerId].message &&
                            <div style={{ background: '#3B4BF9', borderRadius: '20px 20px 20px 2px', padding: '16px 20px 16px 20px' }}>
                                <p style={{ color: '#FFF', fontSize: 14, fontWeight: 500, letterSpacing: .35 }}>
                                    {cheers[cheerId].message}
                                </p>
                            </div>
                        }
                    </>
                ))}
            </List>
        </>
    );
}

const PaidBits = ({ bitsBalance, payments, onPeriodChange }) => {
    const classes = useStyles();

    return (
        <>
            <RecordsHeader value={bitsBalance}
                Icon={BitsIcon}
                showPeriod
                onPeriodChange={onPeriodChange} />
            <List className={classes.list}>
                {Object.keys(payments).reverse().map((paymentId) => (
                    <ListItem disableGutters>
                        <ListItemText primary={payments[paymentId].currency}
                            secondary={formatDate(payments[paymentId].timestamp)}
                            classes={{
                                primary: classes.qoinsDonationPrimaryText,
                                secondary: classes.qoinsCheersecondaryText
                            }} />
                        <div className={classes.qoinDonationValueContainer}>
                            <div className={classes.qoinDonationValueText}>
                                {payments[paymentId].amount}
                            </div>
                        </div>
                    </ListItem>
                ))}
            </List>
        </>
    );
}

const CheersBitsRecordDialog = ({ user, open, onClose }) => {
    const [value, setValue] = useState('Qoins');
    const [qoinsCheers, setQoinsCheers] = useState({});
    const [paymentsHistory, setPaymentsHistory] = useState({});
    const classes = useStyles();

    useEffect(() => {
        async function loadDefaultPayments() {
            const date = new Date();
            date.setDate(1);
            date.setHours(0, 0, 0, 0);
            const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 59);
            const payments = await getPeriodStreamerPayments(user.uid, date.getTime(), lastDayOfMonth.getTime());
            setPaymentsHistory(payments.val() || {});
        }

        if (user && user.uid) {
            listenForLastStreamerCheers(user.uid, 20, (cheers) => {
                if (cheers.exists()) {
                    setQoinsCheers(cheers.val());
                }
            });

            loadDefaultPayments();
        }


        return () => {
            if (user && user.uid) {
                removeListenerForLastStreamerCheers(user.uid);
            }
        };
    }, [user]);

    const loadPaymentsByTimestamp = async (timestamp) => {
        const date = new Date(timestamp);
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 59);
        const payments = await getPeriodStreamerPayments(user.uid, date.getTime(), lastDayOfMonth.getTime());
        setPaymentsHistory(payments.val() || {});
    }

    return (
        <Dialog open={open}
            onClose={onClose}
            scroll='paper'
            TransitionComponent={DialoogTransaction}
            classes={{
                scrollPaper: classes.scrollPaper,
                paper: classes.paper
            }}>
            <DialogContent>
                <div className={classes.dialogHeaderContainer}>
                    <div style={{ marginRight: 96 }}>
                        <ToggleButton currentValue={value}
                            value='Qoins'
                            onChange={setValue} />
                        <ToggleButton currentValue={value}
                            value='Bits'
                            onChange={setValue} />
                    </div>
                    <IconButton onClick={onClose}>
                        <CloseIcon style={{ alignSelf: 'flex-end' }} />
                    </IconButton>
                </div>
                {value === 'Qoins' &&
                    <QoinsCheers qoinsBalance={user.qoinsBalance || 0}
                    cheers={qoinsCheers} />
                }
                {value === 'Bits' &&
                    <PaidBits bitsBalance={user.bitsBalance || 0}
                    payments={paymentsHistory}
                    onPeriodChange={loadPaymentsByTimestamp} />
                }
            </DialogContent>
        </Dialog>
    );
}

function formatDate(timestamp) {
    const paymentDate = new Date(timestamp);

    const date = paymentDate.getDate() >= 10 ? paymentDate.getDate() : `0${paymentDate.getDate()}`;
    const month = (paymentDate.getMonth() + 1) >= 10 ? (paymentDate.getMonth() + 1) : `0${(paymentDate.getMonth() + 1)}`;

    return `${date}/${month}/${paymentDate.getFullYear()}`;
}

export default CheersBitsRecordDialog;