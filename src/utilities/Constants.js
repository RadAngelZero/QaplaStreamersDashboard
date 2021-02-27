import AmongUSImage from './../assets/AmongUs.jpg';
import BrawlImage from './../assets/BrawlStars.jpg';
import ClashImage from './../assets/Clash.jpg';
import CoDMobileImage from './../assets/CoDMobile.jpg';
import CupHeadImage from './../assets/CupHead.jpg';
import DBDImage from './../assets/DBD.jpg';
import DSIIImage from './../assets/DSII.jpg';
import FallGuysImage from './../assets/FallGuys.jpg';
import FortniteImage from './../assets/Fortnite.jpg';
import FreeFireImage from './../assets/FreeFire.jpg';
import GenImage from './../assets/Gen.jpg';
import GTAVImage from './../assets/GTAV.jpg';
import HaloImage from './../assets/Halo.jpg';
import HollowKnightImage from './../assets/HollowKnight.jpg';
import JustChatImage from './../assets/JustChat.jpg';
import LOLImage from './../assets/LOL.jpg';
import MediumImage from './../assets/Medium.jpg';
import MinecraftImage from './../assets/Minecraft.jpg';
import PokemonImage from './../assets/Pokemon.jpg';
import QWImage from './../assets/QW.jpg';
import RocketLeagueImage from './../assets/RocketLeague.jpg';
import SmashImage from './../assets/Smash.jpg';
import TFTImage from './../assets/TFT.jpg';
import ValorantImage from './../assets/Valorant.jpg';
import WarzoneImage from './../assets/Warzone.jpg';


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
    DBD: DBDImage,
    DS: DSIIImage,
    FallGuys: FallGuysImage,
    GTAV: GTAVImage,
    HollowKnight: HollowKnightImage,
    aClash: ClashImage,
    amongUs: AmongUSImage,
    casual: GenImage,
    cupHead: CupHeadImage,
    justChat: JustChatImage,
    mCod: CoDMobileImage,
    medium: MediumImage,
    minecraft: MinecraftImage,
    multiRocket: RocketLeagueImage,
    pBrawl: BrawlImage,
    pFortnite: FortniteImage,
    pFreeFire: FreeFireImage,
    pWarzone: WarzoneImage,
    pcLol: LOLImage,
    pokemon: PokemonImage,
    qw: QWImage,
    swSmash: SmashImage,
    tft: TFTImage,
    valorant: ValorantImage,
    xHalo: HaloImage
};