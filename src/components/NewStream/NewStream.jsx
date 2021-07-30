import React, { useState, useReducer, useEffect } from 'react';
import { makeStyles, Grid, FormControlLabel, Radio, RadioGroup, Button, InputAdornment, InputLabel, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers'
import { useHistory } from 'react-router-dom';
import DayJsUtils from '@date-io/dayjs';
import { createNewStreamRequest, getStreamerEventsWithDateRange } from './../../services/database';

import styles from './NewStream.module.css';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import StreamerSelect from '../StreamerSelect/StreamerSelect';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as ArrowIcon } from './../../assets/Arrow.svg';
import { ReactComponent as TimeIcon } from './../../assets/TimeIcon.svg';
import { ReactComponent as CheckedIcon } from './../../assets/CheckedIcon.svg';
import { ReactComponent as UncheckedIcon } from './../../assets/UncheckedIcon.svg';
import BackButton from '../BackButton/BackButton';
import NewStreamDetailsDialog from '../NewStreamDetailsDialog/NewStreamDetailsDialog';
import { MONTH_IN_MILISECONDS } from '../../utilities/Constants';

const useStyles = makeStyles((theme) => ({
    label: {
        color: '#FFF',
        fontSize: '14px'
    },
    datePickerLabel: {
        fontSize: '12px',
        color: '#B2B3BD',
        lineHeight: '16px'
    },
    button: {
        color: '#FFF',
        backgroundColor: '#6C5DD3',
        borderRadius: '1rem',
        padding: '1rem 3rem 1rem 3rem'
    },
    dateInput: {
        color: '#FFF',
        marginTop: theme.spacing(1),
        paddingLeft: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        fontWeight: 'bold',
        backgroundColor: '#141833',
        borderRadius: '.5rem',
        fontSize: '14px',
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
    },
    accordionContainer: {
        marginTop: '3%',
    },
    accordion: {
        backgroundColor: '#0D1021',
        width: '66%',
    },
    accordionGridRoot: {
        flex: 1,
        flexGrow: 2,
    },
    accordionGridItem: {
        flex: 1,
        flexGrow: 2,
    },
}));

const NewStream = ({ user, games }) => {
    useEffect(() => {
        if (user && !user.premium) {
            history.push('/profile');
        }
    }, [user]);

    const userLang = navigator.language || navigator.userLanguage;

    const classes = useStyles();
    const history = useHistory();
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

    const optionalDataReducer = (state, action) => {
        switch (action.target.id) {
            case 'eventTitle':
                if (userLang.toLowerCase().includes('es')) {
                    return ({
                        ...state,
                        title: {
                            es: action.target.value
                        }
                    })
                } else {
                    return ({
                        ...state,
                        title: {
                            en: action.target.value
                        }
                    })
                }
            case 'eventDescriptionTitle':
                if (userLang.toLowerCase().includes('es')) {
                    return ({
                        ...state,
                        descriptionsTitle: {
                            es: action.target.value
                        }
                    })
                } else {
                    return ({
                        ...state,
                        descriptionsTitle: {
                            en: action.target.value
                        }
                    })
                }
            case 'eventDescription':
                if (userLang.toLowerCase().includes('es')) {
                    return ({
                        ...state,
                        descriptions: {
                            es: action.target.value
                        }
                    })
                } else {
                    return ({
                        ...state,
                        descriptions: {
                            en: action.target.value
                        }
                    })
                }
            default:
                break;
        }
    }

    // Minimum valid date is 24 hours since the current date
    const minDate = new Date((new Date()).getTime() + 86400000);

    // The default date is the minDate + 15 minutes, to avoid show the error feedback when the streamer open the screen
    const [selectedDate, setSelectedDate] = useState(new Date(minDate.getTime() + 900000));
    const [selectedGame, setSelectedGame] = useState();
    const [selectedEvent, setSelectedEvent] = useState('exp');
    const [stringDate, setStringDate] = useState('');
    const [optionalData, optionalDataDispatcher] = useReducer(optionalDataReducer, {});


    const handleDateChange = (date) => {
        setSelectedDate(date.$d);
    };
    const handleGameChange = (game) => {
        setSelectedGame(game.target.value);
    };
    const handleEventTypeChange = (event) => {
        setSelectedEvent(event.target.value);
    };

    const handleStringDateChange = (event) => {
        setStringDate(event.target.value);
    }

    const openConfirmationDialog = () => setOpenDetailsDialog(true);

    const submitEvent = async () => {
        if (selectedDate < minDate) {
            alert('All requests must be sent at least 24 hours before the stream');
            return;
        }
        if (!selectedGame) {
            alert('Verify that all fields have been filled correctly');
            return;
        }

        /**
         * Check if the selected date is valid to create the event based on the end of a
         * streamer subscription
         */
        if (selectedDate.getTime() <=  user.premiumUntil) {
            let startDate = user.currentBillingPeriod.start;
            let endDate = user.currentBillingPeriod.end;

            // If the event will not be in the current period
            if (selectedDate.getTime() > user.currentBillingPeriod.end) {
                /**
                 * We need to calculate the start and the end timestamps of the period for which the stream is
                 * intended to be created
                 */
                 do {
                    startDate = endDate;
                    endDate = endDate + MONTH_IN_MILISECONDS;
                } while (selectedDate.getTime() > endDate);
            }

            const streamsInSelectedPeriod = await getStreamerEventsWithDateRange(user.uid, startDate, endDate);
            const numberOfStreamsInTheSelectedPeriod = Object.keys(streamsInSelectedPeriod.val()).length;

            /**
             * If the number of streams in the selected period plus 1 (to count the event the streamer is trying to create)
             * is lower or equal to the user limit per month then we create the event
             */
            if (numberOfStreamsInTheSelectedPeriod + 1 <= user.eventsPerMonth) {
                const UTCDay = selectedDate.getUTCDate() < 10 ? `0${selectedDate.getUTCDate()}` : selectedDate.getUTCDate();
                const UTCMonth = selectedDate.getUTCMonth() + 1 < 10 ? `0${selectedDate.getUTCMonth() + 1}` : selectedDate.getUTCMonth() + 1;
                let UTCDate = `${UTCDay}-${UTCMonth}-${selectedDate.getUTCFullYear()}`;

                const UTCHour = selectedDate.getUTCHours() < 10 ? `0${selectedDate.getUTCHours()}` : selectedDate.getUTCHours();
                const UTCMinutes = selectedDate.getUTCMinutes() < 10 ? `0${selectedDate.getUTCMinutes()}` : selectedDate.getUTCMinutes();
                let UTCTime = `${UTCHour}:${UTCMinutes}`;

                await createNewStreamRequest(user, selectedGame, UTCDate, UTCTime, selectedEvent, selectedDate.getTime(), optionalData, (new Date()).getTime(), stringDate);
                history.push('/success');
            } else {
                // Hacer un modal chido para convencerlos de mejorar su plan o comprar eventos aparte
                alert('You have reached the limit of events for this month acording to your subscription');
            }
        } else {
            alert('The selected date is not valid as your plan will expire before it');
        }
    }

    return (
        <StreamerDashboardContainer user={user}>
            <Grid container>
                <Grid item xs={12}>
                    <BackButton onClick={history.goBack} />
                </Grid>
                <Grid item sm={8}>
                    <h1 className={styles.title}>
                        What are you playing?
                    </h1>
                    <StreamerSelect
                        value={selectedGame}
                        onChange={handleGameChange}
                        Icon={ArrowIcon}
                        label='Select your game'>
                        <option style={{
                            backgroundColor: '#141833',
                            fontSize: '14px'
                        }} value={null}></option>
                        {games.allGames && Object.entries(games.allGames).map((game) => {
                            if (!game[1].gameName.toLowerCase().includes('twitch')) {
                                return <option style={{
                                    backgroundColor: '#141833',
                                    fontSize: '14px'
                                }} value={game[0]}>{game[1].gameName}</option>
                            }

                            return null;
                        })}
                    </StreamerSelect>
                    <h1 className={styles.title}>
                        When?
                    </h1>
                    <MuiPickersUtilsProvider utils={DayJsUtils}>
                        <Grid container spacing={4}>
                            <Grid item sm={4}>
                                <InputLabel className={classes.datePickerLabel}>
                                    Date
                                </InputLabel>
                                <KeyboardDatePicker
                                    clearable
                                    disablePast
                                    disableToolbar
                                    autoOk
                                    value={selectedDate}
                                    placeholder='10-10-2021'
                                    onChange={handleDateChange}
                                    defaultValue={new Date()}
                                    minDate={minDate}
                                    minDateMessage='All requests must be sent at least 24 hours before the stream'
                                    format='DD-MM-YY ddd'
                                    keyboardIcon={
                                        <InputAdornment position='end' >
                                            <CalendarIcon />
                                        </InputAdornment>
                                    }
                                    InputProps={{
                                        disableUnderline: true,
                                        className: classes.dateInput
                                    }}
                                    variant={'inline'}
                                    PopoverProps={{
                                        PaperProps: {
                                            className: classes.popover,
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item sm={4}>
                                <InputLabel className={classes.datePickerLabel}>
                                    Time
                                </InputLabel>
                                <KeyboardTimePicker
                                    ampm={false}
                                    disableToolbar
                                    autoOk
                                    error={selectedDate <= minDate}
                                    helperText={selectedDate >= minDate ? '' : 'All requests must be sent at least 24 hours before the stream'}
                                    value={selectedDate}
                                    placeholder='08:00 AM'
                                    onChange={handleDateChange}
                                    min
                                    mask='__:__'
                                    keyboardIcon={
                                        <InputAdornment position='end' >
                                            <TimeIcon />
                                        </InputAdornment>
                                    }
                                    InputProps={{
                                        disableUnderline: true,
                                        className: classes.dateInput
                                    }}
                                    variant={'inline'}
                                    PopoverProps={{
                                        PaperProps: {
                                            className: classes.popover,
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item sm={8}>
                                <InputLabel className={classes.datePickerLabel}>
                                    Confirm your date
                                </InputLabel>
                                <StreamerTextInput placeholder='Example: 15 de abril 16:00 Hora de Ciudad de México'
                                    fullWidth
                                    value={stringDate}
                                    onChange={handleStringDateChange} />
                            </Grid>
                        </Grid>
                    </MuiPickersUtilsProvider>
                    <h1 className={styles.title}>
                        Stream type
                    </h1>
                    <RadioGroup name={'eventType'} value={selectedEvent} onChange={(event) => { handleEventTypeChange(event) }}>
                        <Grid container>
                            <Grid item sm={2}>
                                <FormControlLabel
                                    value={'exp'}
                                    classes={{ label: classes.label }}
                                    control={
                                        <Radio defaultChecked
                                            checkedIcon={<CheckedIcon />}
                                            icon={<UncheckedIcon />}
                                            style={{ backgroundColor: 'transparent' }} />
                                    }
                                    label='Casual (XQ)' />
                            </Grid>
                            {/* <Grid item sm={2}>
                                <FormControlLabel
                                    value={'tournament'}
                                    classes={{ label: classes.label }}
                                    control={
                                        <Radio
                                            checkedIcon={<CheckedIcon />}
                                            icon={<UncheckedIcon />}
                                            style={{ backgroundColor: 'transparent' }} />
                                    }
                                    label='Tournament' />
                            </Grid> */}
                        </Grid>
                    </RadioGroup>
                    <Grid container className={classes.accordionContainer}>
                        <Accordion
                            className={classes.accordion}
                        >
                            <AccordionSummary
                                expandIcon={<ArrowIcon />}
                                id={"moreOptions"}
                                aria-controls="panel1a-content"
                            >
                                <InputLabel
                                    className={classes.label}
                                >
                                    Advanced (optional)
                            </InputLabel>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container direction={'column'} className={classes.accordionGridRoot}>
                                    <InputLabel className={classes.label}>
                                        Feeling creative? Give your stream a cool name. Write it in Spanish! It's OK.
                                    </InputLabel>
                                    <Grid container>
                                        <h1 className={styles.title}>
                                            Stream title
                                        </h1>
                                        <Grid container spacing={4}>
                                            <Grid item className={classes.accordionGridItem}>
                                                <StreamerTextInput
                                                    label='Stream Title'
                                                    placeholder='i.e. Manqueando en Fall Guys'
                                                    id='eventTitle'
                                                    fullWidth={true}
                                                    value={optionalData.title ? userLang.toLowerCase().includes('es') ? optionalData.title.es : optionalData.title.en : ''}
                                                    onChange={(e) => optionalDataDispatcher({ target: e.target })}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <h1 className={styles.title}>
                                        Stream description
                                    </h1>
                                    <Grid>
                                        <Grid container spacing={4}>
                                            <Grid item className={classes.accordionGridItem}>
                                                <StreamerTextInput
                                                    label='Subtitle'
                                                    id={'eventDescriptionTitle'}
                                                    placeholder='Subtitle'
                                                    fullWidth={true}
                                                    value={optionalData.descriptionsTitle ? userLang.toLowerCase().includes('es') ? optionalData.descriptionsTitle.es : optionalData.descriptionsTitle.en : ''}
                                                    onChange={(e) => optionalDataDispatcher({ target: e.target })}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid>
                                        <Grid container spacing={4}>
                                            <Grid item className={classes.accordionGridItem} style={{ marginTop: '1rem' }}>
                                                <StreamerTextInput
                                                    id={'eventDescription'}
                                                    label='Stream Description'
                                                    placeholder='Share what your stream is going to be about.'
                                                    multiline={true}
                                                    rows={3}
                                                    rowsMax={30}
                                                    fullWidth={true}
                                                    value={optionalData.descriptions ? userLang.toLowerCase().includes('es') ? optionalData.descriptions.es : optionalData.descriptions.en : ''}
                                                    onChange={(e) => optionalDataDispatcher({ target: e.target })}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                    <Button
                        className={styles.button}
                        onClick={openConfirmationDialog}>
                        Submit
                    </Button>
                </Grid>
            </Grid>
            <NewStreamDetailsDialog
                open={openDetailsDialog}
                onClose={() => setOpenDetailsDialog(false)}
                submitEvent={submitEvent}
                game={selectedGame}
                date={`${selectedDate.toLocaleDateString()} ${selectedDate.toLocaleTimeString()}`}
                userName={user ? user.displayName : ''}
                {...optionalData} />
        </StreamerDashboardContainer>
    );
}

export default NewStream;