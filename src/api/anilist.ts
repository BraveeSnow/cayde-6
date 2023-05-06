import axios from "axios";

const ANILIST_URL = "https://graphql.anilist.co";

// GraphQL queries
const ANILIST_QUERY_TITLE = `
query ($title: String) {
	Media (search: $title, type: ANIME) {
		siteUrl
        title {
			english
			native
        }
		episodes
		averageScore
		type
		status (version: 2)
        isAdult
		startDate {
			year
			month
			day
		}
		endDate {
			year
			month
			day
		}
		season
		description (asHtml: false)
		coverImage {
			extraLarge
		}
	}
}
`;

// Internal types
interface RawAnilistQueryResponse {
    data: {
        Media: {
            siteUrl: string;
            title: {
                english: string;
                native: string;
            };
            episodes: number;
            averageScore: number;
            type: string;
            status: string;
            isAdult: boolean;
            startDate: {
                year: number;
                month: number;
                day: number;
            };
            endDate: {
                year: number;
                month: number;
                day: number;
            };
            season: string;
            description: string;
            coverImage: {
                extraLarge: string;
            };
        };
    };
}

// External types
export enum ALType {
    ANIME = "ANIME",
    MANGA = "MANGA",
}

export enum ALStatus {
    FINISHED = "FINISHED",
    RELEASING = "RELEASING",
    NOT_YET_RELEASED = "NOT_YET_RELEASED",
    CANCELLED = "CANCELLED",
    HIATUS = "HAITUS",
}

export enum ALSeason {
    WINTER = "WINTER",
    SPRING = "SPRING",
    SUMMER = "SUMMER",
    FALL = "FALL",
}

export interface AnilistQueryResponse {
    siteUrl: URL;
    title: {
        english: string;
        native: string;
    };
    episodes: number;
    averageScore: number;
    type: ALType;
    status: ALStatus;
    isAdult: boolean;
    startDate: Date;
    endDate: Date;
    season: ALSeason;
    description: string;
    coverImage: URL;
}

function convertRaw(response: RawAnilistQueryResponse): AnilistQueryResponse {
    let desc = response.data.Media.description.replaceAll(/<[^>]+>/g, "");
    if (desc.length >= 2000) {
        desc = desc.slice(0, desc.lastIndexOf(" ", 1997));
        desc += "...";
    }

    return {
        siteUrl: new URL(response.data.Media.siteUrl),
        title: response.data.Media.title,
        episodes: response.data.Media.episodes,
        averageScore: response.data.Media.averageScore,
        type: response.data.Media.type as ALType,
        status: response.data.Media.status as ALStatus,
        isAdult: response.data.Media.isAdult,
        startDate: new Date(
            response.data.Media.startDate.year,
            response.data.Media.startDate.month,
            response.data.Media.startDate.day
        ),
        endDate: new Date(
            response.data.Media.endDate.year,
            response.data.Media.endDate.month,
            response.data.Media.endDate.day
        ),
        season: response.data.Media.season as ALSeason,
        description: desc,
        coverImage: new URL(response.data.Media.coverImage.extraLarge),
    };
}

export async function searchByTitle(title: string): Promise<AnilistQueryResponse> {
    const res = await axios({
        url: ANILIST_URL,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        data: {
            query: ANILIST_QUERY_TITLE,
            variables: {
                title: title,
            },
        },
    });

    if (res.status != 200) {
        throw new MediaError();
    }

    return convertRaw(res.data);
}
