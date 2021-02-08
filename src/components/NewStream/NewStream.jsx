import React, { useState, useReducer } from 'react';
import { makeStyles, Grid, FormControlLabel, Radio, RadioGroup, Button, InputAdornment, InputLabel, Accordion, AccordionSummary, AccordionDetails, } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers'
import { useHistory } from 'react-router-dom';
import DayJsUtils from '@date-io/dayjs';
import { createNewStreamRequest } from './../../services/database';

import styles from './NewStream.module.css';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import StreamerSelect from '../StreamerSelect/StreamerSelect';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as ArrowIcon } from './../../assets/Arrow.svg';
import { ReactComponent as TimeIcon } from './../../assets/TimeIcon.svg';
import { ReactComponent as CheckedIcon } from './../../assets/CheckedIcon.svg';
import { ReactComponent as UncheckedIcon } from './../../assets/UncheckedIcon.svg';

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

    const userLang = navigator.language || navigator.userLanguage;

    const classes = useStyles();
    const history = useHistory();

    const optionalDataReducer = (state, action) => {
        switch (action.target.id) {
            case 'eventTitle':
                if (userLang.toLowerCase().includes('es')){
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
                if (userLang.toLowerCase().includes('es')){
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
                if (userLang.toLowerCase().includes('es')){
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

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedGame, setSelectedGame] = useState();
    const [selectedEvent, setSelectedEvent] = useState('exp');
    const [optionalData, optionalDataDispatcher] = useReducer(optionalDataReducer, {})

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };
    const handleGameChange = (game) => {
        setSelectedGame(game.target.value);
    };
    const handleEventTypeChange = (event) => {
        setSelectedEvent(event.target.value);
    };

    const submitEvent = () => {
        if (selectedDate.$d === undefined || !selectedGame) {
            alert('Verifica que todos los campos hayan sido llenados correctamente');
            return;
        }

        const UTCDay = selectedDate.$d.getUTCDate() < 10 ? `0${selectedDate.$d.getUTCDate()}` : selectedDate.$d.getUTCDate();
        const UTCMonth = selectedDate.$d.getUTCMonth() + 1 < 10 ? `0${selectedDate.$d.getUTCMonth() + 1}` : selectedDate.$d.getUTCMonth() + 1;
        let UTCDate = `${UTCDay}-${UTCMonth}-${selectedDate.$d.getUTCFullYear()}`;

        const UTCHour = selectedDate.$d.getUTCHours() < 10 ? `0${selectedDate.$d.getUTCHours()}` : selectedDate.$d.getUTCHours();
        const UTCMinutes = selectedDate.$d.getUTCMinutes() < 10 ? `0${selectedDate.$d.getUTCMinutes()}` : selectedDate.$d.getUTCMinutes();
        let UTCTime = `${UTCHour}:${UTCMinutes}`;

        let timestamp = new Date(
            selectedDate.$d.getFullYear(),
            selectedDate.$d.getMonth(),
            selectedDate.$d.getDate(),
            selectedDate.$d.getHours(),
            selectedDate.$d.getMinutes()
        );

        createNewStreamRequest(user, selectedGame, UTCDate, UTCTime, selectedEvent, timestamp.getTime(), optionalData);
        history.push('/success');
    }

    return (
        <StreamerDashboardContainer user={user}>
            <Grid container>
                <Grid item sm={8}>
                    <h1 className={styles.title}>
                        What are you playing?
                    </h1>
                    <StreamerSelect
                        value={selectedGame}
                        onChange={(game) => handleGameChange(game)}
                        Icon={ArrowIcon}
                        label='Select your game'>
                        <option style={{
                            backgroundColor: '#141833',
                            fontSize: '14px'
                        }} value={null}></option>
                        {games.allGames && Object.entries(games.allGames).map((game) => {
                            if (!game[1].name.toLowerCase().includes('twitch')) {
                                return <option style={{
                                    backgroundColor: '#141833',
                                    fontSize: '14px'
                                }} value={game[0]}>{game[1].name}</option>
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
                                    onChange={(date) => handleDateChange(date)}
                                    minDate={new Date()}
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
                                    value={selectedDate}
                                    placeholder='08:00 AM'
                                    onChange={(date) => setSelectedDate(date)}
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
                            <Grid item sm={2}>
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
                            </Grid>
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
                                    <InputLabel
                                        className={classes.label}
                                    >
                                        Isn't necessary to fill every field of this part, you can left some of them empty and we will do our best to translate or fulfill the missing info
                                    </InputLabel>
                                    <Grid container>
                                        <h2 className={styles.subtitle}>
                                            Event Title
                                        </h2>
                                        <Grid container spacing={4}>
                                            <Grid item className={classes.accordionGridItem}>
                                                <StreamerTextInput
                                                    id={'eventTitle'}
                                                    multiline={true}
                                                    rowsMax={3}
                                                    fullWidth={true}
                                                    value={optionalData.title ? userLang.toLowerCase().includes('es') ? optionalData.title.es : optionalData.title.en : ''}
                                                    onChange={(e) => optionalDataDispatcher({target: e.target})}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid>
                                        <h2 className={styles.subtitle}>
                                            Event Title Description
                                        </h2>
                                        <Grid container spacing={4}>
                                            <Grid item className={classes.accordionGridItem}>
                                                <StreamerTextInput
                                                    id={'eventDescriptionTitle'}
                                                    multiline={true}
                                                    rows={2}
                                                    rowsMax={3}
                                                    fullWidth={true}
                                                    value={optionalData.descriptionsTitle ? userLang.toLowerCase().includes('es') ? optionalData.descriptionsTitle.es : optionalData.descriptionsTitle.en : ''}
                                                    onChange={(e) => optionalDataDispatcher({target: e.target})}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid>
                                        <h2 className={styles.subtitle}>
                                            Event Description
                                        </h2>
                                        <Grid container spacing={4}>
                                            <Grid item className={classes.accordionGridItem}>
                                                <StreamerTextInput
                                                    id={'eventDescription'}
                                                    multiline={true}
                                                    rows={3}
                                                    rowsMax={30}
                                                    fullWidth={true}
                                                    value={optionalData.descriptions ? userLang.toLowerCase().includes('es') ? optionalData.descriptions.es : optionalData.descriptions.en : ''}
                                                    onChange={(e) => optionalDataDispatcher({target: e.target})}
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
                        onClick={submitEvent}>
                        Submit
                    </Button>
                </Grid>
            </Grid>
        </StreamerDashboardContainer>
    );
}

export default NewStream;