import React, { useEffect, useState } from 'react';
import { Button, Card, CardActionArea, CardActions, CardMedia, Container, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useTranslation } from 'react-i18next';

import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { getQStoreItems } from '../../services/database';

const useStyles = makeStyles({
    container: {
        paddingLeft: 92,
        paddingTop: 60,
        paddingRight: 24,
        marginLeft: 0
    },
    title: {
        fontSize: 30,
        fontWeight: '500',
        color: '#FFF'
    },
    description: {
        marginTop: 24,
        fontWeight: 400,
        fontSize: 14,
        lineHeight: '20px',
        letterSpacing: .35,
        color: 'rgba(255, 255, 255, .8)',
        maxWidth: 520
    },
    media: {
        height: 200,
        borderRadius: 24,
        backgroundSize: 'cover'
    },
    card: {
        maxWidth: 200,
        backgroundColor: 'transparent',
        boxShadow: 'none',
    },
    productButton: {
        background: 'linear-gradient(0deg, #3B4BF9, #3B4BF9), #FF006B',
        fontWeight: '600',
        fontSize: 11,
        letterSpacing: .492,
        width: '100%',
        marginTop: 35,
        color: '#FFF',
        fontFamily: 'Inter',
        borderRadius: 8,
        textTransform: 'none'
    },
    goalButton: {
        background: 'linear-gradient(0deg, #00FFDD, #00FFDD), linear-gradient(0deg, #3B4BF9, #3B4BF9), #FF006B',
        fontWeight: '600',
        fontSize: 11,
        letterSpacing: .492,
        width: '100%',
        marginTop: 35,
        color: '#0D1021',
        fontFamily: 'Inter',
        borderRadius: 8,
        textTransform: 'none'
    }
});

const ProductCard = ({ image }) => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card classes={{ root: classes.card }}>
                <CardActionArea>
                    <CardMedia className={classes.media} image={image} />
                </CardActionArea>
                <CardActions>
                    <Button target='_blank' href='https://discord.gg/q7tc2A6z' size='large' variant='contained' classes={{ root: classes.productButton }}>
                        {t('QStore.acquire')}
                    </Button>
                </CardActions>
            </Card>
        </Grid>
    );
}

const QStore = ({ user }) => {
    const classes = useStyles();
    const { t } = useTranslation();

    const [storeItems, setStoreItems] = useState(null);

    useEffect(() => {
        async function loadStoreItems() {
            const items = await getQStoreItems();

            setStoreItems(items.val() || {});
        }

        if (!storeItems) {
            loadStoreItems();
        }
    }, [storeItems]);

    return (
        <StreamerDashboardContainer user={user}>
            <Container maxWidth='lg' className={classes.container}>
            {user ?
                <Grid container spacing={8}>
                    <Grid item xs={12}>
                        <h1 className={classes.title}>
                            {t('QStore.QStore')}
                        </h1>
                        <p className={classes.description}>
                            {t('QStore.description')}
                        </p>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card classes={{ root: classes.card }}>
                            <CardActionArea>
                                <CardMedia className={classes.media} image='https://imageio.forbes.com/specials-images/imageserve/5fd2263efcf061ccad6f7d95/0x0.jpg?format=jpg&width=1200' />
                            </CardActionArea>
                            <CardActions>
                                <Button target='_blank' href='https://discord.gg/q7tc2A6z' size='large' variant='contained' classes={{ root: classes.goalButton }}>
                                    {t('QStore.setGoal')}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    {storeItems && Object.keys(storeItems).sort((a, b) => storeItems[a].priority - storeItems[b].priority).map((itemKey) => (
                        <ProductCard image={storeItems[itemKey].image} />
                    ))}
                </Grid>
            :
                null
            }
            </Container>
        </StreamerDashboardContainer>
    );
}

export default QStore;