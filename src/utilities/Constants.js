/**
 * Twitch API keys
 */
export const TWITCH_CLIENT_ID = '3cwpzmazn716nmz6g1087kh4ciu4sp';
export const TWITCH_SECRET_ID = 'xt2ed1xz00cwglz34fu2m95k77xnj6';

/**
 * Twitch Utils
 */
export const TWITCH_REDIRECT_URI = !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://dashboard.qapla.gg/';

/**
 * Streams Status
 */
export const PENDING_APPROVAL_EVENT_TYPE = 1;
export const SCEHDULED_EVENT_TYPE = 2;
export const PAST_STREAMS_EVENT_TYPE = 3;

export const streamsPlaceholderImages = {
    multiRocket: 'https://rocketleague.media.zestyio.com/rl_platform_keyart_2019.f1cb27a519bdb5b6ed34049a5b86e317.jpg'
};