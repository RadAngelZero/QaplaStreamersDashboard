import React, { useState, useReducer, useEffect } from 'react';
import { makeStyles, Grid, Button, InputAdornment, InputLabel, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers'
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DayJsUtils from '@date-io/dayjs';

import { addToStreamsRequestedOnStreamsPackage, addToStreamsRequestedOnSubscriptionDetails, createNewStreamRequest, removeStreamPackageOfStreamer, updateStreamerProfile } from './../../services/database';
import styles from './NewStream.module.css';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import StreamerSelect from '../StreamerSelect/StreamerSelect';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as ArrowIcon } from './../../assets/Arrow.svg';
import { ReactComponent as TimeIcon } from './../../assets/TimeIcon.svg';
import BackButton from '../BackButton/BackButton';
import NewStreamSuccessDialog from './NewStreamSuccessDialog';
import RequestActivation from '../RequestActivation/RequestActivation';
import { getTwitchUserDataCloudFunction } from '../../services/functions';

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
        '& .MuiInputAdornment-root': {
            width: '20px',
            marginLeft: '-6px',
            marginRight: '18px',
            zIndex: '10'
        }
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
        '& .MuiPickersToolbar-toolbar': {
            borderRadius: '20px'
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
    const { t } = useTranslation();
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [selectedGame, setSelectedGame] = useState();
    const [selectedEvent, setSelectedEvent] = useState('exp');
    const [stringDate, setStringDate] = useState('');
    const [clockOpen, setClockOpen] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [gamesData, setGamesData] = useState([]);
    const [showAccountActviation, setShowAccountActviation] = useState(false);
    const [lockSendButton, setLockSendButton] = useState(false);

    useEffect(() => {
        let gameList = [];

        if (games.allGames) {
            gameList = Object.keys(games.allGames).map((gameKey) => ({ gameKey, ...games.allGames[gameKey] })).sort((a, b) => {
                if (a.gameName < b.gameName) {
                    return -1;
                }
                if (a.gameName > b.gameName) {
                    return 1;
                }

                return 0;
            });
            let tempGamesData = []
            gameList.forEach(game => {
                tempGamesData.push({
                    value: game.gameKey,
                    label: game.gameName
                })
            });
            setGamesData(tempGamesData)
        }
    }, [games.allGames, user]);

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

    const [optionalData, optionalDataDispatcher] = useReducer(optionalDataReducer, {});

    // Minimum valid date is 24 hours since the current date
    const minDate = new Date((new Date()).getTime() + 86400000);

    // The default date is the minDate + 15 minutes, to avoid show the error feedback when the streamer open the screen
    const [selectedDate, setSelectedDate] = useState(new Date(minDate.getTime() + 900000));
    const [displayDate, setDisplayDate] = useState(new Date(minDate.getTime() + 900000));

    const handleDateChange = (date) => {
        try {
            setSelectedDate(date.$d);

        } catch (e) { console.log(e) }

        setDisplayDate(date)
    };
    const handleGameChange = (game) => {
        setSelectedGame(game);
    };
    const handleEventTypeChange = (event) => {
        setSelectedEvent(event.target.value);
    };

    const handleStringDateChange = (event) => {
        setStringDate(event.target.value);
    }

    const openSuccessWindow = () => {
        submitEvent();
    };

    const submitEvent = async () => {
        setLockSendButton(true);
        if (user.broadcasterType === '') {
            setLockSendButton(false);
            return alert(t('NewStream.alerts.noChannelPoints'));
        }

        if (!user.premium && !user.freeTrial) {
            setLockSendButton(false);
            return setShowAccountActviation(true);
        }

        if (selectedDate < minDate) {
            setLockSendButton(false);
            alert(t('NewStream.alerts.before24h'));
            return;
        }
        if (!selectedGame) {
            setLockSendButton(false);
            alert(t('NewStream.alerts.missingData'));
            return;
        }

        if (user.currentPeriod) {
            const { endDate } = user.currentPeriod;

            /**
             * Check if the selected date is valid to create the event based on the end of the streamer subscription
             */
            if (selectedDate.getTime() <= endDate) {

                const numberOfStreamsInTheSelectedPeriod = user.subscriptionDetails.streamsRequested || 0;

                let userCanCreateStream = numberOfStreamsInTheSelectedPeriod + 1 <= parseInt(user.subscriptionDetails.streamsIncluded);

                if (!userCanCreateStream) {
                    if (user.boughtStreams) {
                        /**
                         * Check for packages of streams bought by the streamer, if some package has not expired and has not used the total amount of streams bought
                         * the user can create the stream, this function will also remove expired packages or packages that has been already used
                         */
                        userCanCreateStream = Object.keys(user.boughtStreams).some((streamsPackageId) => {
                            if (selectedDate.getTime() <= user.boughtStreams[streamsPackageId].expirationTimestamp && (!user.boughtStreams[streamsPackageId].streamsRequested || user.boughtStreams[streamsPackageId].streamsRequested + 1 <= user.boughtStreams[streamsPackageId].boughtStreams)) {
                                addToStreamsRequestedOnStreamsPackage(user.uid, streamsPackageId);
                                return true;
                            } else {
                                removeStreamPackageOfStreamer(user.uid, streamsPackageId);
                            }
                        });
                    }
                } else {
                    addToStreamsRequestedOnSubscriptionDetails(user.uid);
                }

                /**
                 * If the number of streams in the selected period plus 1 (to count the event the streamer is trying to create)
                 * is lower or equal to the user limit per month then we create the event
                 */
                if (userCanCreateStream) {
                    const UTCDay = selectedDate.getUTCDate() < 10 ? `0${selectedDate.getUTCDate()}` : selectedDate.getUTCDate();
                    const UTCMonth = selectedDate.getUTCMonth() + 1 < 10 ? `0${selectedDate.getUTCMonth() + 1}` : selectedDate.getUTCMonth() + 1;
                    let UTCDate = `${UTCDay}-${UTCMonth}-${selectedDate.getUTCFullYear()}`;

                    const UTCHour = selectedDate.getUTCHours() < 10 ? `0${selectedDate.getUTCHours()}` : selectedDate.getUTCHours();
                    const UTCMinutes = selectedDate.getUTCMinutes() < 10 ? `0${selectedDate.getUTCMinutes()}` : selectedDate.getUTCMinutes();
                    let UTCTime = `${UTCHour}:${UTCMinutes}`;

                    let streamerData = {
                        displayName: user.displayName,
                        login: user.login,
                        photoUrl: user.photoUrl
                    };

                    const userData = await getTwitchUserDataCloudFunction(user.id);
                    if (userData && userData.data) {
                        streamerData = {
                            displayName: userData.data.display_name,
                            login: userData.data.login,
                            photoUrl: userData.data.profile_image_url
                        };

                        await updateStreamerProfile(user.uid, {
                            displayName: userData.data.display_name,
                            login: userData.data.login,
                            photoUrl: userData.data.profile_image_url,
                            broadcasterType: userData.data.broadcaster_type
                        });
                    }

                    await createNewStreamRequest(user.uid, streamerData, selectedGame, UTCDate, UTCTime, selectedEvent, selectedDate.getTime(), optionalData, (new Date()).getTime(), stringDate);

                    window.analytics.track('Stream requested', {
                        selectedGame,
                        selectedDate: selectedDate.getTime(),
                        uid: user.uid
                    });
                    setOpenSuccessDialog(true);
                } else {
                    setShowAccountActviation(true);
                }
            } else {
                alert(t('NewStream.alerts.beforePlanExpiration'));
            }
        } else {
            setShowAccountActviation(true);
        }
    }

    const successActivation = async () => {
        const UTCDay = selectedDate.getUTCDate() < 10 ? `0${selectedDate.getUTCDate()}` : selectedDate.getUTCDate();
        const UTCMonth = selectedDate.getUTCMonth() + 1 < 10 ? `0${selectedDate.getUTCMonth() + 1}` : selectedDate.getUTCMonth() + 1;
        let UTCDate = `${UTCDay}-${UTCMonth}-${selectedDate.getUTCFullYear()}`;

        const UTCHour = selectedDate.getUTCHours() < 10 ? `0${selectedDate.getUTCHours()}` : selectedDate.getUTCHours();
        const UTCMinutes = selectedDate.getUTCMinutes() < 10 ? `0${selectedDate.getUTCMinutes()}` : selectedDate.getUTCMinutes();
        let UTCTime = `${UTCHour}:${UTCMinutes}`;

        let streamerData = {
            displayName: user.displayName,
            login: user.login,
            photoUrl: user.photoUrl
        };

        const userData = await getTwitchUserDataCloudFunction(user.id);
        if (userData && userData.data) {
            streamerData = {
                displayName: userData.data.display_name,
                login: userData.data.login,
                photoUrl: userData.data.profile_image_url
            };

            await updateStreamerProfile(user.uid, {
                displayName: userData.data.display_name,
                login: userData.data.login,
                photoUrl: userData.data.profile_image_url,
                broadcasterType: userData.data.broadcaster_type
            });
        }

        await createNewStreamRequest(user.uid, streamerData, selectedGame, UTCDate, UTCTime, selectedEvent, selectedDate.getTime(), optionalData, (new Date()).getTime(), stringDate);
        await addToStreamsRequestedOnSubscriptionDetails(user.uid);

        updateStreamerProfile(user.uid, streamerData);

        window.analytics.track('Free trial started', {
            uid: user.uid
        });
        history.push('/success');
    }

    if (!showAccountActviation) {
        return (
            <StreamerDashboardContainer user={user}>
                <Grid container>
                    <Grid item xs={12}>
                        <BackButton onClick={history.goBack} />
                    </Grid>
                    <Grid item sm={8}>
                        <h1 className={styles.title}>
                            {t('NewStream.whatAreYouPlaying')}
                        </h1>
                        <div style={{
                            display: 'flex',
                            height: '58px',
                            marginTop: '20px'
                        }}>
                            <StreamerSelect
                                data={gamesData}
                                value={selectedGame}
                                onChange={handleGameChange}
                                initialLabel={t('NewStream.selectYourGame')}
                                maxHeightOpen={'200px'}
                                overflowX={'hidden'}
                                style={{
                                    minHeight: '58px'
                                }} />
                        </div>
                        <h1 className={styles.title}>
                            {t('NewStream.when')}
                        </h1>
                        <MuiPickersUtilsProvider utils={DayJsUtils}>
                            <Grid container spacing={4} style={{ marginTop: '2px' }}>
                                <Grid item sm={4} style={{ minWidth: '175px', }}>
                                    <InputLabel className={classes.datePickerLabel} >
                                        {t('NewStream.date')}
                                    </InputLabel>
                                    <KeyboardDatePicker
                                        open={calendarOpen}
                                        onClick={() => setCalendarOpen(true)}
                                        onOpen={() => { }}
                                        onClose={() => setCalendarOpen(false)}
                                        clearable
                                        disablePast
                                        disableToolbar
                                        autoOk
                                        value={displayDate}
                                        placeholder='10-10-2021'
                                        onChange={handleDateChange}
                                        defaultValue={new Date()}
                                        minDate={minDate}
                                        minDateMessage={t('NewStream.alerts.before24h')}
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
                                <Grid item sm={4} style={{ minWidth: '175px' }}>
                                    <InputLabel className={classes.datePickerLabel}>
                                        {t('NewStream.time')}
                                    </InputLabel>
                                    <KeyboardTimePicker
                                        open={clockOpen}
                                        onClick={() => setClockOpen(true)}
                                        onOpen={() => { }}
                                        onClose={() => setClockOpen(false)}
                                        autoOk
                                        error={selectedDate <= minDate}
                                        helperText={selectedDate >= minDate ? '' : t('NewStream.alerts.before24h')}
                                        value={displayDate}
                                        placeholder='08:00 AM'
                                        onChange={handleDateChange}
                                        // mask='__:__ _M'
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
                                {/* <Grid item sm={8} style={{ width: '90%', minWidth: '330px' }}>
                                    <InputLabel className={classes.datePickerLabel}>
                                        {t('NewStream.confirmDate')}
                                    </InputLabel>
                                    <StreamerTextInput placeholder={t('NewStream.confirmDatePlaceholder')}
                                        fullWidth
                                        value={stringDate}
                                        onChange={handleStringDateChange} />
                                </Grid> */}
                            </Grid>
                        </MuiPickersUtilsProvider>
                        {/* <h1 className={styles.title}>
                            {t('NewStream.streamType')}
                        </h1> */}
                        {/* <RadioGroup name={'eventType'} value={selectedEvent} onChange={(event) => { handleEventTypeChange(event) }}>
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
                                        label={t('NewStream.streamTypes.casual')} />
                                </Grid>
                            </Grid>
                        </RadioGroup> */}
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
                                        {t('NewStream.advanced')}
                                    </InputLabel>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container direction={'column'} className={classes.accordionGridRoot}>
                                        <InputLabel className={classes.label}>
                                            {t('NewStream.feelingCreative')}
                                        </InputLabel>
                                        <Grid container>
                                            <h1 className={styles.title}>
                                                {t('NewStream.streamTitle')}
                                            </h1>
                                            <Grid container spacing={4}>
                                                <Grid item className={classes.accordionGridItem} style={{marginTop: '10px'}}>
                                                    <StreamerTextInput
                                                        label={t('NewStream.streamTitle')}
                                                        placeholder={t('NewStream.streamTitlePlaceholder')}
                                                        id='eventTitle'
                                                        fullWidth={true}
                                                        value={optionalData.title ? userLang.toLowerCase().includes('es') ? optionalData.title.es : optionalData.title.en : ''}
                                                        onChange={(e) => optionalDataDispatcher({ target: e.target })}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <h1 className={styles.title}>
                                            {t('NewStream.streamDescription')}
                                        </h1>
                                        {/* <Grid>
                                            <Grid container spacing={4}>
                                                <Grid item className={classes.accordionGridItem}>
                                                    <StreamerTextInput
                                                        label={t('NewStream.subtitle')}
                                                        id={'eventDescriptionTitle'}
                                                        placeholder={t('NewStream.subtitle')}
                                                        fullWidth={true}
                                                        value={optionalData.descriptionsTitle ? userLang.toLowerCase().includes('es') ? optionalData.descriptionsTitle.es : optionalData.descriptionsTitle.en : ''}
                                                        onChange={(e) => optionalDataDispatcher({ target: e.target })}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid> */}
                                        <Grid>
                                            <Grid container spacing={4}>
                                                <Grid item className={classes.accordionGridItem} style={{ marginTop: '10px' }}>
                                                    <StreamerTextInput
                                                        id={'eventDescription'}
                                                        label={t('NewStream.streamDescription')}
                                                        placeholder={t('NewStream.descriptionPlaceholder')}
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
                            disabled={lockSendButton}
                            className={styles.button}
                            onClick={openSuccessWindow}>
                            {t('NewStream.submit')}
                        </Button>
                    </Grid>
                </Grid>
                <NewStreamSuccessDialog
                    open={openSuccessDialog}
                    onClose={() => history.push('/profile')}
                    mainPage={() => history.push('/profile')}
                />
            </StreamerDashboardContainer>
        );
    } else {
        return <RequestActivation user={user} onSuccessActivation={successActivation} />
    }
}

export default NewStream;