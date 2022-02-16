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
        textTransform: 'none',
        '&:hover': {
            opacity: '.80',
            background: '#29326B44 !important'
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
        paddingBottom: '5px',
        padding: '28px 40px',
        maxWidth: '100%',
        width: '100%',
        margin: '21px 17px 0px 0px',
        [theme.breakpoints.down("xs")]: {
            width: '100%',
            margin: '0px',
            borderRadius: '0px',
            maxHeight: '100%'
        },
        [theme.breakpoints.up("sm")]: {
            width: '440px'
        }
    },
    dialogRoot: {
        zIndex: '0 !important',
        '& .MuiBackdrop-root': {
            backgroundColor: '#02071E80',
            backdropFilter: 'blur(5px)',
            width: '200wh',
            height: '200vh'

        }
    },
    dialogHeaderContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: ''
    },
    balanceCurrencyContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: '23px',
        minWidth: '200px'
    },
    balanceCurrencyValue: {
        display: 'flex',
        color: '#FFF',
        fontSize: '48px',
        lineHeight: '52px',
        fontWeight: 600,
        letterSpacing: '-0.86',
        marginLeft: '12px',
    },
    subDataContainer: {
        marginTop: '30px',
        color: '#8692FF',
        fontWeight: '500',
        fontSize: '14px',
        lineHeight: '17px',
        letterSpacing: '0.35px'
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
        display: 'flex',
        flexDirection: 'column',
        paddingRight: '20px',
        marginRight: '-20px',
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

const ToggleButton = ({ currentValue, value, onChange, label }) => {
    const classes = useStyles();
    const active = currentValue === value;

    return (
        <Button
            className={classes.toggleButton}
            style={{ background: active ? '#29326B' : 'rgba(41, 50, 107, 0)', color: active ? '#FFF' : 'rgba(255, 255, 255, .6)' }}
            onClick={() => onChange(value)}>
            {label || value}
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
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: '200px' }}>
                <div className={classes.balanceCurrencyContainer}>
                    <Icon />
                    <p className={classes.balanceCurrencyValue}>
                        {value || 0}
                    </p>
                </div>
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

const QoinsCheers = ({ qoinsBalance, cheers, messages, setPendingMessages, qlanBalance }) => {
    const classes = useStyles();
    const [balance, setBalance] = useState(qoinsBalance);

    useEffect(() => {
        if (setPendingMessages !== undefined) {
            setPendingMessages(0);
        }
        if (qlanBalance) {
            setBalance(qoinsBalance + qlanBalance);
        }
    }, [setPendingMessages, qlanBalance, qoinsBalance]);

    const showDate = () => {
        const today = new Date();
        /**
         * Not all the browsers supports the parameter "locales" from the function toLocaleDateString
         * https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
         */
        try {
            return today.toLocaleDateString('es-MX');
        } catch (error) {
            return today.toLocaleDateString();
        }
    }

    return (
        <>
            {!messages &&
                <>
                    <RecordsHeader value={balance} Icon={QoinsIcon} />
                    <div className={classes.subDataContainer}>
                        <div style={{ display: 'flex' }}>
                            <p style={{ display: 'flex', width: '62px' }}> Cheers </p>
                            <p style={{ display: 'flex', }}> {qoinsBalance} </p>
                        </div>
                        <div style={{ display: 'flex', marginTop: '30px' }}>
                            <p style={{ display: 'flex', width: '62px' }}> Qlan </p>
                            <p style={{ display: 'flex', }}> {qlanBalance || 0} </p>
                        </div>
                        <p style={{ display: 'flex', color: '#8692FFA6', marginTop: '36px', letterSpacing: '0px' }}>
                            Cheers recibidos al {showDate()}
                        </p>
                    </div>
                </>
            }
            <List className={classes.list} style={{ maxHeight: messages ? '82vh' : '60vh', marginTop: '20px', paddingTop: '0px' }}>
                {Object.keys(cheers).reverse().map((cheerId) => (
                    <>
                        {((messages && cheers[cheerId].message) || (!messages)) &&
                            <ListItem disableGutters style={{ display: 'flex', flexDirection: 'column', padding: '0px', marginBottom: '40px' }}>
                                <div style={{ display: 'flex', width: '100%' }}>
                                    <ListItemAvatar style={{ alignSelf: 'center' }} >
                                        <Avatar alt={cheers[cheerId].twitchUserName}
                                            src={cheers[cheerId].photoURL} />
                                    </ListItemAvatar>
                                    <ListItemText primary={
                                        <div style={{ display: 'flex' }}>
                                            <p>{cheers[cheerId].twitchUserName}</p>
                                            {!cheers[cheerId].read && <div style={{ backgroundColor: '#8DEBFF', alignSelf: 'center', marginLeft: '8px', width: '8px', height: '8px', borderRadius: '8px' }}>
                                            </div>}
                                        </div>
                                    }
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
                                </div>

                                {messages && cheers[cheerId].message &&
                                    <div style={{ background: '#3B4BF9', borderRadius: '2px 20px 20px 20px', padding: '16px 20px 16px 20px', alignSelf: 'flex-start' }}>
                                        <p style={{ color: '#FFF', fontSize: 14, fontWeight: 500, letterSpacing: .35 }}>
                                            {cheers[cheerId].message}
                                        </p>
                                    </div>
                                }
                            </ListItem>}
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
            <div className={classes.subDataContainer}>
                <p style={{ display: 'flex' }}> 200 Qoins = 10 Bits </p>
                <p style={{ display: 'flex', color: '#8692FFA6', marginTop: '36px', letterSpacing: '0px' }}>Bits estimados a entregar con subscripción activa</p>
                <p style={{ display: 'flex', color: '#FFFFFFA6', marginTop: '45px', lineHeight: '17px', fontWeight: '400' }}>Cheers entregados</p>
            </div>

            <List className={classes.list} style={{ maxHeight: '54vh', marginTop: '20px', paddingTop: '0px' }}>
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

const CheersBitsRecordDialog = ({ user, open, onClose, pressed, setPendingMessages }) => {
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
                    let seekUnread = Object.values(cheers.val());
                    let unreadCount = 0;
                    seekUnread.forEach(e => {
                        if (!e.read && e.message) {
                            unreadCount++
                        }
                    });
                    setPendingMessages(unreadCount)
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
                paper: classes.paper,
                root: classes.dialogRoot
            }}
            TransitionProps={{
                onEnter: () => {
                    setValue(pressed)
                }
            }}>
            <DialogContent style={{ padding: '0px', overflow: 'visible' }}>
                <div className={classes.dialogHeaderContainer}>
                    <div style={{ marginRight: 96 }}>
                        <ToggleButton currentValue={value}
                            value='Qoins'
                            onChange={setValue} />
                        <ToggleButton currentValue={value}
                            value='Bits'
                            onChange={setValue} />
                        <ToggleButton currentValue={value}
                            value='Messages'
                            label='Mensajes'
                            onChange={setValue} />
                    </div>
                    <IconButton onClick={onClose} style={{ zIndex: '10', alignSelf: 'flex-start', width: '40px', height: '40px', padding: '0px', marginTop: '-4px', marginRight: '-16px' }} >
                        <CloseIcon style={{ width: '40px', height: '40px' }} />
                    </IconButton>
                </div>
                {value === 'Qoins' &&
                    <QoinsCheers qoinsBalance={user.qoinsBalance || 0}
                        cheers={qoinsCheers}
                        qlanBalance={user.qlanBalance} />
                }
                {value === 'Bits' &&
                    <PaidBits bitsBalance={user.bitsBalance || 0}
                        payments={paymentsHistory}
                        onPeriodChange={loadPaymentsByTimestamp} />
                }
                {value === 'Messages' &&
                    <QoinsCheers qoinsBalance={user.qoinsBalance || 0}
                        messages={true}
                        cheers={qoinsCheers}
                        setPendingMessages={setPendingMessages}
                    />
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