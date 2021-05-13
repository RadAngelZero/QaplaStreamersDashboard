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

import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as TimeIcon } from './../../assets/TimeIcon.svg';
import { ReactComponent as ProfileIcon } from './../../assets/ProfileIcon.svg';
import { ReactComponent as EyeIcon } from './../../assets/EyeIcon.svg';
import { ReactComponent as DownloadIcon } from './../../assets/DownloadIcon.svg';

import ContainedButton from '../ContainedButton/ContainedButton';
import BackButton from '../BackButton/BackButton';
import { SCEHDULED_EVENT_TYPE, PAST_STREAMS_EVENT_TYPE } from '../../utilities/Constants';
import { loadApprovedStreamTimeStamp, getStreamParticipantsList, getStreamTitle, getPastStreamTitle, updateStreamDate } from '../../services/database';
import { sednPushNotificationToTopic } from '../../services/functions';

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: '24px',
        color: '#FFF'
    },
    description: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.60)',
        lineHeight: '18px',
        paddingRight: '2rem',
        marginBottom: '2rem'
    },
    datePickerLabel: {
        fontSize: '12px',
        color: '#B2B3BD',
        lineHeight: '16px'
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
    button: {
        marginTop: '2.5rem'
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
    }
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
        <>
            <p className={classes.title}>
                {title}
            </p>
            <p className={classes.description}>
                {description}
            </p>
        </>
    );
};

const EditStreamerEvent = ({ user }) => {
    const { streamType } = useLocation().state;
    const { streamId } = useParams();
    const [title, setTitle] = useState({ en: '', es: '' });
    const [date, setDate] = useState(null);
    const [maxTimeToAcceptUpdates, setMaxTimeToAcceptUpdates] = useState(0);
    const [notificationBody, setNotificationBody] = useState('');
    const [participantsList, setParticipantsList] = useState({});
    const classes = useStyles();
    const history = useHistory();

    useEffect(() => {
        async function setStreamData() {
            if (streamType === SCEHDULED_EVENT_TYPE) {
                const timeStamp = await loadApprovedStreamTimeStamp(streamId);
                if (timeStamp.exists()) {
                    setDate(new Date(timeStamp.val()));
                    setMaxTimeToAcceptUpdates(timeStamp.val() - 600000);
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
            if (streamType === SCEHDULED_EVENT_TYPE) {
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
            alert('Notification sent');
            setNotificationBody('');
        } catch (error) {
            alert('Error sending notification. Try again later');
        }
    }

    const onChangeNotificationBody = (e) => {
        const body = e.target.value;
        if (body.length <= 140) {
            setNotificationBody(body);
        }
    }

    const saveDate = () => {
        if (date.$d) {
            const dateRef = new Date(date.$d);
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

            updateStreamDate(user.uid, streamId, UTCDate, UTCHour, localDate, localHour, dateRef.getTime());
        } else {
            alert('Please verify that you have selected a different date and/or hour');
        }
    }

    return (
        <StreamerDashboardContainer user={user}>
            <Grid container>
                <Hidden smDown>
                    <Grid xs={12}>
                        <BackButton label={title && title['en'] ? title['en'] : ''}
                            onClick={history.goBack} />
                    </Grid>
                </Hidden>
                {streamType === SCEHDULED_EVENT_TYPE &&
                    <>
                        <Grid xs={6}>
                            <SectionHeader title='Edit'
                                description='A notification will be sent to the participants of any changes. We recommend not changing the date or time often tho, a consistent schedule drives more traffic to your live streams.' />
                            <Grid item sm={12}>
                                <Grid container>
                                    <MuiPickersUtilsProvider utils={DayJsUtils}>
                                        <Grid container>
                                            <Grid item sm={6} spacing={4}>
                                                <InputLabel className={classes.datePickerLabel}>
                                                    Date
                                                </InputLabel>
                                                <KeyboardDatePicker
                                                    disabled={maxTimeToAcceptUpdates === 0 || new Date().getTime() >= maxTimeToAcceptUpdates}
                                                    clearable
                                                    disablePast
                                                    disableToolbar
                                                    autoOk
                                                    value={date}
                                                    placeholder='10-10-2021'
                                                    onChange={setDate}
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
                                            <Grid item sm={6}>
                                                <InputLabel className={classes.datePickerLabel}>
                                                    Time
                                                </InputLabel>
                                                <KeyboardTimePicker
                                                    disabled={maxTimeToAcceptUpdates === 0 || new Date().getTime() >= maxTimeToAcceptUpdates}
                                                    ampm={false}
                                                    disableToolbar
                                                    autoOk
                                                    value={date}
                                                    placeholder='08:00 AM'
                                                    onChange={setDate}
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
                                    <ContainedButton className={classes.button}
                                        onClick={saveDate}
                                        disabled={maxTimeToAcceptUpdates === 0 || new Date().getTime() >= maxTimeToAcceptUpdates}>
                                        Save Changes
                                    </ContainedButton>
                                </Grid>
                                <Grid item md={12}>
                                    <SectionHeader title='Notifications'
                                        description='You can send participants two custom notifications to share any relevant information about your stream. Make them short and only send important notices. Spaming  can have a negative impact on your stream.' />
                                    <StreamerTextInput placeholder='140 character limit'
                                        multiline
                                        rows={3}
                                        fullWidth
                                        textInputClassName={classes.textArea}
                                        containerClassName={classes.containerTextArea}
                                        value={notificationBody}
                                        onChange={onChangeNotificationBody} />
                                    <br/>
                                    <ContainedButton className={classes.button}
                                        onClick={sendNotification}>
                                        Send
                                    </ContainedButton>
                                </Grid>
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
                    <SectionHeader title='Participants' />
                    <TableContainer className={classes.tableContainer}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCellStyled align='center' padding='checkbox'>
                                        <ProfileIcon />
                                    </TableCellStyled>
                                    <TableCellStyled className={classes.tableHead}>Twitch Username</TableCellStyled>
                                    <TableCellStyled className={classes.tableHead}>Game Username</TableCellStyled>
                                    <TableCellStyled className={classes.tableHead}>Qapla Username</TableCellStyled>
                                    <TableCellStyled className={classes.participantsColumn}>
                                        <EyeIcon /> <p>{Object.keys(participantsList).length}</p>
                                    </TableCellStyled>
                                    <TableCellStyled className={classes.tableHead}>
                                        <ContainedButton
                                            startIcon={<DownloadIcon />}>
                                            Download List
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