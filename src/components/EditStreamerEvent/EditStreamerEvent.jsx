import React, { useState, useEffect } from 'react';
import {
    makeStyles,
    Grid,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    withStyles,
    Avatar,
    Hidden,
    InputLabel,
    InputAdornment
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useParams, useLocation } from 'react-router';
import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers'
import DayJsUtils from '@date-io/dayjs';
import { useTranslation } from 'react-i18next'

import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as TimeIcon } from './../../assets/TimeIcon.svg';
import { ReactComponent as ProfileIcon } from './../../assets/ProfileIcon.svg';
import { ReactComponent as EyeIcon } from './../../assets/EyeIcon.svg';
import { ReactComponent as DownloadIcon } from './../../assets/DownloadIcon.svg';

import ContainedButton from '../ContainedButton/ContainedButton';
import BackButton from '../BackButton/BackButton';
import { SCHEDULED_EVENT_TYPE, PAST_STREAMS_EVENT_TYPE } from '../../utilities/Constants';
import { loadApprovedStreamTimeStamp, getStreamParticipantsList, getStreamTitle, getPastStreamTitle, updateStreamDate } from '../../services/database';
import { sednPushNotificationToTopic } from '../../services/functions';
import { notifyUpdateToQaplaAdmins } from '../../services/discord';

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: '24px',
        color: '#FFF'
    },
    description: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.60)',
        lineHeight: '18px',
        paddingRight: '16px',
        marginTop: '16px'
    },
    datePickerLabel: {
        fontSize: '12px',
        color: '#B2B3BD',
        lineHeight: '16px'
    },
    button: {
        marginTop: '32px'
    },
    containerTextArea: {
        marginRight: '2.5rem'
    },
    textArea: {
        paddingTop: '1rem'
    },
    tableHead: {
        fontSize: '16px !important',
        color: '#808191 !important',
        fontWeight: 'bold'
    },
    participantsColumn: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    tableRow: {
        backgroundColor: 'rgba(20, 24, 51, .5)'
    },
    tableRowOdd: {
        backgroundColor: 'transparent'
    },
    firstCell: {
        borderRadius: '1rem 0 0 1rem',
    },
    lastCell: {
        borderRadius: '0 1rem 1rem 0',
    },
    avatar: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        marginLeft: '.25rem'
    },
    tableContainer: {
        marginBottom: 16
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
}));

const TableCellStyled = withStyles(() => ({
    root: {
        borderColor: 'transparent',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        fontSize: '14px',
        color: '#FFFFFF'
    }
}))(TableCell);

const SectionHeader = ({ title, description }) => {
    const classes = useStyles();

    return (
        <div style={{ marginTop: '48px' }}>
            <p className={classes.title}>
                {title}
            </p>
            <p className={classes.description}>
                {description}
            </p>
        </div>
    );
};

const EditStreamerEvent = ({ user }) => {
    const { streamType } = useLocation().state;
    const { streamId } = useParams();
    const [title, setTitle] = useState({ en: '', es: '' });
    const [selectedDate, setSelectedDate] = useState(new Date(1655251661000));
    const [displayDate, setDisplayDate] = useState(new Date(1655251661000))
    const [firstTimestamp, setFirstTimestamp] = useState(new Date(1655251661000))
    const [notificationBody, setNotificationBody] = useState('');
    const [participantsList, setParticipantsList] = useState({});
    const [clockOpen, setClockOpen] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [minDateToAllowUpdates, setMinDateToAllowUpdates] = useState(new Date((new Date()).getTime() + 300000));
    const { t } = useTranslation();
    const classes = useStyles();
    const history = useHistory();

    useEffect(() => {
        async function setStreamData() {
            if (streamType === SCHEDULED_EVENT_TYPE) {
                const timeStamp = await loadApprovedStreamTimeStamp(streamId);
                if (timeStamp.exists()) {
                    setSelectedDate(new Date(timeStamp.val()));
                    setDisplayDate(new Date(timeStamp.val()));
                    setFirstTimestamp(new Date(timeStamp.val()));
                    setMinDateToAllowUpdates(new Date(timeStamp.val() - 300000));
                }
            }
        }

        async function setStreamParticipantsList() {
            const participantsList = await getStreamParticipantsList(streamId);
            if (participantsList.exists()) {
                setParticipantsList(participantsList.val());
            }
        }

        async function setStreamTitle() {
            if (streamType === SCHEDULED_EVENT_TYPE) {
                const title = await getStreamTitle(streamId);
                setTitle(title.val());
            } else if (streamType === PAST_STREAMS_EVENT_TYPE) {
                if (user.uid) {
                    const title = await getPastStreamTitle(user.uid, streamId);
                    setTitle(title.val());
                }
            }
        }

        setStreamData();
        setStreamParticipantsList();
        setStreamTitle();
    }, [streamId, streamType, user]);

    const sendNotification = async () => {
        const bodys = {
            es: notificationBody,
            en: notificationBody
        };

        const titles = {
            es: title['en'],
            en: title['en']
        };

        try {
            sednPushNotificationToTopic(streamId, titles, bodys);
            alert(t('EditStream.alerts.sent'));
            setNotificationBody('');
        } catch (error) {
            alert(t('EditStream.alerts.errorSent'));
        }
    }

    const onChangeNotificationBody = (e) => {
        const body = e.target.value;
        if (body.length <= 140) {
            setNotificationBody(body);
        }
    }

    const saveDate = async () => {
        if (selectedDate) {
            const minValidDate = new Date().getTime() + 300000;
            if (selectedDate.getTime() >= minValidDate) {
                const dateRef = new Date(selectedDate);
                const UTCDay = dateRef.getUTCDate() < 10 ? `0${dateRef.getUTCDate()}` : dateRef.getUTCDate();
                const UTCMonth = dateRef.getUTCMonth() + 1 < 10 ? `0${dateRef.getUTCMonth() + 1}` : dateRef.getUTCMonth() + 1;
                let UTCDate = `${UTCDay}-${UTCMonth}-${dateRef.getUTCFullYear()}`;

                const UTCHours = dateRef.getUTCHours() < 10 ? `0${dateRef.getUTCHours()}` : dateRef.getUTCHours();
                const UTCMinutes = dateRef.getUTCMinutes() < 10 ? `0${dateRef.getUTCMinutes()}` : dateRef.getUTCMinutes();
                let UTCHour = `${UTCHours}:${UTCMinutes}`;

                const localDay = dateRef.getDate() < 10 ? `0${dateRef.getDate()}` : dateRef.getDate();
                const localMonth = dateRef.getMonth() + 1 < 10 ? `0${dateRef.getMonth() + 1}` : dateRef.getMonth() + 1;
                let localDate = `${localDay}-${localMonth}-${dateRef.getFullYear()}`;

                const localHours = dateRef.getHours() < 10 ? `0${dateRef.getHours()}` : dateRef.getHours();
                const localMinutes = dateRef.getMinutes() < 10 ? `0${dateRef.getMinutes()}` : dateRef.getMinutes();
                let localHour = `${localHours}:${localMinutes}`;

                await updateStreamDate(user.uid, streamId, UTCDate, UTCHour, localDate, localHour, dateRef.getTime());
                notifyUpdateToQaplaAdmins(streamId, user.displayName, dateRef);
                alert(t('EditStream.alerts.updated'));
            } else {
                alert(t('EditStream.alerts.errorDate'))
            }
        } else {
            alert(t('EditStream.alerts.errorDate'));
        }
    }

    const handleDateChange = (date) => {
        try {
            setSelectedDate(date.$d);

        } catch (e) { console.log(e) }

        setDisplayDate(date)
    };

    return (
        <StreamerDashboardContainer user={user}>
            <Grid container>
                <Grid xs={12}>
                    <BackButton label={title && title['en'] ? title['en'] : ''}
                        onClick={history.goBack} />
                </Grid>
                {streamType === SCHEDULED_EVENT_TYPE &&
                    <>
                        <Grid xs={6}>
                            <SectionHeader
                                title={t('EditStream.change')}
                                description={t('EditStream.changeDesc')} />
                            <Grid item sm={12}>
                                <Grid container>
                                    {selectedDate === null ? // to secure that dateState.getTime() isn't from a null
                                        <></>
                                        :
                                        <MuiPickersUtilsProvider utils={DayJsUtils}>
                                            <Grid container style={{
                                                marginTop: '24px'
                                            }}>
                                                <Grid item sm={7} md={4} spacing={4}>
                                                    <InputLabel className={classes.datePickerLabel}>
                                                        {t('NewStream.date')}
                                                    </InputLabel>
                                                    <KeyboardDatePicker
                                                        disabled={(new Date()).getTime() >= minDateToAllowUpdates.getTime()}
                                                        open={calendarOpen}
                                                        onClick={() => (new Date()).getTime() >= minDateToAllowUpdates.getTime() ? {} : setCalendarOpen(true)}
                                                        onClose={() => setCalendarOpen(false)}
                                                        clearable
                                                        disablePast
                                                        disableToolbar
                                                        autoOk
                                                        value={displayDate}
                                                        placeholder='10-10-2021'
                                                        onChange={handleDateChange}
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
                                                <div style={{ minWidth: '16px' }} />
                                                <Grid item sm={7} md={4}>
                                                    <InputLabel className={classes.datePickerLabel}>
                                                        {t('NewStream.time')}
                                                    </InputLabel>
                                                    <KeyboardTimePicker
                                                        open={clockOpen}
                                                        onClick={() => (new Date()).getTime() >= minDateToAllowUpdates.getTime() ? {} : setClockOpen(true)}
                                                        onOpen={() => { }}
                                                        onClose={() => setClockOpen(false)}
                                                        disabled={(new Date()).getTime() >= minDateToAllowUpdates.getTime()}
                                                        autoOk
                                                        error={(new Date()).getTime() >= minDateToAllowUpdates.getTime()}
                                                        helperText={(new Date()).getTime() >= minDateToAllowUpdates.getTime() ? t('EditStream.alerts.updatesPolicy') : ''}
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
                                            </Grid>
                                        </MuiPickersUtilsProvider>
                                    }
                                    <ContainedButton className={classes.button}
                                        onClick={saveDate}
                                        disabled={(new Date()).getTime() >= minDateToAllowUpdates || selectedDate.getTime() === firstTimestamp.getTime()}>
                                        {t('EditStream.save')}
                                    </ContainedButton>
                                </Grid>
                            </Grid>
                            <SectionHeader title={t('EditStream.sendMessage')}
                                description={t('EditStream.sendMessageDesc')} />
                            <Grid item md={12} style={{
                                marginTop: '24px'
                            }}>
                                <StreamerTextInput placeholder={t('EditStream.limit')}
                                    multiline
                                    rows={3}
                                    fullWidth
                                    textInputClassName={classes.textArea}
                                    containerClassName={classes.containerTextArea}
                                    value={notificationBody}
                                    onChange={onChangeNotificationBody} />
                                <ContainedButton className={classes.button}
                                    onClick={sendNotification}>
                                    {t('QaplaStreamDialogs.EventManagementDialog.send')}
                                </ContainedButton>
                            </Grid>
                        </Grid>
                        {/** To define how this section is going to work
                            <Grid xs={6}>
                                <SectionHeader title='Private Rooms'
                                    description='If you are hosting a private room and want to give access to the participants of the event, you can share the ID with them directly in the Qapla app. Participants will get a notification to see the ID.' />
                                <StreamerTextInput label='ID'
                                    placeholder='ID' />
                                <br/>
                                <ContainedButton className={classes.button}>
                                    Send
                                </ContainedButton>
                            </Grid>
                        */}
                    </>
                }
                <Grid xs={12}>
                    <SectionHeader title={t('EditStream.participants')} />
                    <TableContainer className={classes.tableContainer}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCellStyled align='center' padding='checkbox'>
                                        <ProfileIcon />
                                    </TableCellStyled>
                                    <TableCellStyled className={classes.tableHead}>{t('EditStream.table.twitch')}</TableCellStyled>
                                    <TableCellStyled className={classes.tableHead}>{t('EditStream.table.game')}</TableCellStyled>
                                    <TableCellStyled className={classes.tableHead}>{t('EditStream.table.qapla')}</TableCellStyled>
                                    <TableCellStyled className={classes.participantsColumn}>
                                        <EyeIcon /> <p>{Object.keys(participantsList).length}</p>
                                    </TableCellStyled>
                                    <TableCellStyled className={classes.tableHead}>
                                        <ContainedButton
                                            startIcon={<DownloadIcon />}>
                                            {t('EditStream.table.download')}
                                        </ContainedButton>
                                    </TableCellStyled>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(participantsList).map((participantUid, index) => (
                                    <TableRow className={index % 2 === 0 ? classes.tableRow : classes.tableRowOdd}
                                        key={`Participant-${participantUid}`}>
                                        <TableCellStyled align='center' className={classes.firstCell}>
                                            <Avatar className={classes.avatar} />
                                        </TableCellStyled>
                                        <TableCellStyled>
                                            {participantsList[participantUid].userName}
                                        </TableCellStyled>
                                        <TableCellStyled>
                                            {participantsList[participantUid].userName}
                                        </TableCellStyled>
                                        <TableCellStyled className={classes.lastCell}>
                                            {participantsList[participantUid].userName}
                                        </TableCellStyled>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </StreamerDashboardContainer>
    );
}

export default EditStreamerEvent;