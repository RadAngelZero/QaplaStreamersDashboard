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
import AvengersImage from './../assets/Avengers.jpg';
import BetrayalImage from './../assets/Betrayal.jpg';
import StumbleGuysImage from './../assets/StumbleGuys.jpg';
import KukoroImage from './../assets/Kukoro.jpg';
import MarblesImage from './../assets/Marbles.jpg';
import GOWImage from './../assets/GOW.jpg';
import ApexImage from './../assets/Apex.jpg';
import AnimalCrossingImage from './../assets/AnimalCrossing.jpg';
import SWBattlefrontIIImage from './../assets/SWBattlefrontII.jpg';
import ProjectZomboidImage from './../assets/ProjectZomboid.jpg';
import WoWImage from './../assets/WoW.jpg';
import KTaneImage from './../assets/KTANE.jpg';
import GolfItImage from './../assets/GolfIt.jpg';
import LittleNightmaresImage from './../assets/LittleNightmares.jpg';
import StreamRaidersImage from './../assets/StreamRaiders.jpg';
import SeaOfThievesImage from './../assets/SeaOfThieves.jpg';
import MarioKartImage from './../assets/MarioKart.jpg';
import AgarIoImage from './../assets/Agario.jpg';
import TetrIoImage from './../assets/Tetrio.jpg';
import OverwatchImage from './../assets/Overwatch.jpg';
import OvercookedImage from './../assets/Overcooked.jpg';
import DeadCellsImage from './../assets/DeadCells.jpg';
import GenshinImpactImage from './../assets/GenshinImpact.jpg';
import AxieInfinityImage from './../assets/AxieInfinity.jpg';
import MusicImage from './../assets/Music.jpg';
import SpidermanMMImage from './../assets/SpidermanMM.jpg';
import GhostOfTsushimaImage from './../assets/GhostOfTsushima.jpg';
import StreamRacerImage from './../assets/StreamRacer.jpg';
import TheLastOfUsImage from './../assets/TheLastOfUs.jpg';
import MetalSlugImage from './../assets/MetalSlug.jpeg';
import BrawlhallaImage from './../assets/Brawlhalla.jpeg';
import NewWorldImage from './../assets/NewWorld.jpeg';
import WarframeImage from './../assets/Warframe.jpeg';
import MarioPartyImage from './../assets/MarioParty.jpeg';
import PhasmophobiaImage from './../assets/Phasmophobia.jpeg';
import ClashMiniImage from './../assets/ClashMiniImage.jpg';

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
 * Alert Side Selection
 */
export const LEFT = 'LEFT';
export const RIGHT = 'RIGHT';

/**
 * Subscription Types
 */
export const MONTHLY = 'monthly';
export const QUARTERLY = 'quarterly';
export const YEARLY = 'yearly';

/**
 * Valid media type for cheers
 */
export const IMAGE = 'IMAGE';

/**
 * Streams Status
 */
export const PENDING_APPROVAL_EVENT_TYPE = 1;
export const SCHEDULED_EVENT_TYPE = 2;
export const PAST_STREAMS_EVENT_TYPE = 3;

/**
 * Type of UserStreamsRewards
 */
export const XQ = 'xq';
export const QOINS = 'qoins';

/**
 * Type of users
 */
export const PREMIUM = 'premium';
export const FREE_USER = 'freeUser';

/**
 * Twitch PubSub connections status
 */
export const TWITCH_PUBSUB_UNCONNECTED = 0;
export const TWITCH_PUBSUB_CONNECTED = 1;
export const TWITCH_PUBSUB_CONNECTION_LOST = -1;

/**
 * Twitch webhooks info
 */
 export const webhookStreamOnline = {
    type: 'stream.online',
    callback: 'https://us-central1-qapplaapp.cloudfunctions.net/userStreamOnline'
};

export const webhookStreamOffline = {
    type: 'stream.offline',
    callback: 'https://us-central1-qapplaapp.cloudfunctions.net/userStreamOffline'
};

export const XQRewardRedemption = {
    type: 'channel.channel_points_custom_reward_redemption.add',
    callback: 'https://us-central1-qapplaapp.cloudfunctions.net/XQRewardRedeemed'
};

export const QoinsRewardRedemption = {
    type: 'channel.channel_points_custom_reward_redemption.add',
    callback: 'https://us-central1-qapplaapp.cloudfunctions.net/QoinsRewardRedeemed'
};

export const HOUR_IN_MILISECONDS = 3600000;

/**
 * Qapla profiles random backgrounds gradients
 */
export const PROFILE_BACKGROUND_GRADIENTS = [
    { angle: 98, colors: ['#2D07FA', '#A716EE'] },
    { angle: 262, colors: ['#00FEC1', '#FA00FF'] },
    { angle: 98, colors: ['#FF2B77', '#E5E91E'] },
    { angle: 98, colors: ['#00E0FF', '#2E08FB'] },
    { angle: 98, colors: ['#00FF75', '#7516EF'] },
];

/**
 * Min length for streamer public profile elements
 */
export const MIN_BIO_LENGTH = 100;
export const MIN_TAGS = 3;

/**
 * Reward types
 */
export const XQ_REWARD = 'xqReward';
export const QOINS_REWARD = 'qoinsReward';

/**
 * Streamers Profiles constants
 */
export const MAX_ROWS_IN_BIO = 5;

export const TEST_MESSAGE_SPEECH_URL = 'https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/CheersTestAudios%2FTest.mp3?alt=media&token=3a77f0c1-e5ce-445a-a848-cd5a00a4c361';

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
    xHalo: HaloImage,
    AvengerSquare: AvengersImage,
    Betrayal: BetrayalImage,
    StumbleGuys: StumbleGuysImage,
    Kukoro: KukoroImage,
    Marbles: MarblesImage,
    GearsofWar: GOWImage,
    Apex: ApexImage,
    AnimalCrossing: AnimalCrossingImage,
    SWBattlefrontII: SWBattlefrontIIImage,
    ProjectZomboid: ProjectZomboidImage,
    WoW: WoWImage,
    KTane: KTaneImage,
    GolfIt: GolfItImage,
    LittleNightmares: LittleNightmaresImage,
    StreamRaiders: StreamRaidersImage,
    SOT: SeaOfThievesImage,
    MarioKart: MarioKartImage,
    AgarIo: AgarIoImage,
    TetrIo: TetrIoImage,
    Overwatch: OverwatchImage,
    Overcooked: OvercookedImage,
    DeadCells: DeadCellsImage,
    GenshinImpact: GenshinImpactImage,
    AxieInfinity: AxieInfinityImage,
    Music: MusicImage,
    SpidermanMM: SpidermanMMImage,
    GhostOfTsushima: GhostOfTsushimaImage,
    StreamRacer: StreamRacerImage,
    TheLastOfUs: TheLastOfUsImage,
    PokemonUnite: PokemonImage, // We use this image also on the Pokemon category
    MetalSlug: MetalSlugImage,
    Brawlhalla: BrawlhallaImage,
    NewWorld: NewWorldImage,
    Warframe: WarframeImage,
    MarioParty: MarioPartyImage,
    Phasmophobia: PhasmophobiaImage,
    ClashMini: ClashMiniImage
};