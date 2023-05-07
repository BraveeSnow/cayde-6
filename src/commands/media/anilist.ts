import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import {
    API,
    APIApplicationCommandInteractionDataSubcommandOption,
    APIChatInputApplicationCommandInteraction,
    ChannelType,
    MessageFlags,
} from "@discordjs/core";

import { ALStatus, ALType, AnilistQueryResponse, searchByTitle } from "@cayde/api/anilist";
import { Command } from "@cayde/common/client";

function getAirString(query: AnilistQueryResponse): string {
    if (query.status == ALStatus.NOT_YET_RELEASED) {
        return "N/A";
    }

    if (query.status == ALStatus.RELEASING) {
        return `Started ${query.startDate.toDateString()}`;
    }

    return `${query.startDate.toDateString()} to ${query.endDate.toDateString()}`;
}

const sgAnime = "anime";
const sgManga = "manga";

const sgTitleOpt = "title";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("anilist")
        .setDescription("Interacts with AniList")
        .addSubcommand((sub) =>
            sub
                .setName(sgAnime)
                .setDescription("Finds an anime with the given title")
                .addStringOption((opt) =>
                    opt.setName(sgTitleOpt).setDescription("The title of the anime to find").setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName(sgManga)
                .setDescription("Finds a manga with the given title")
                .addStringOption((opt) =>
                    opt.setName(sgTitleOpt).setDescription("The title of the manga to find").setRequired(true)
                )
        )
        .toJSON(),
    async exec(api: API, int: APIChatInputApplicationCommandInteraction) {
        if (!int.data.options) {
            return;
        }

        const sub = int.data.options[0] as APIApplicationCommandInteractionDataSubcommandOption;
        if (!sub.options) {
            return;
        }

        const embed = new EmbedBuilder();
        let query: AnilistQueryResponse;

        switch (sub.name) {
            case sgAnime: {
                query = await searchByTitle(sub.options[0].value as string, ALType.ANIME);
                break;
            }
            case sgManga: {
                query = await searchByTitle(sub.options[0].value as string, ALType.MANGA);
                break;
            }
            default:
                return;
        }

        if (query.isAdult && int.channel.type == ChannelType.GuildText && !int.channel.nsfw) {
            return api.interactions.reply(int.id, int.token, {
                content: "The anime found is rated 18+, please use NSFW channels.",
                flags: MessageFlags.Ephemeral,
            });
        }

        embed
            .setTitle(query.title.english)
            .setAuthor({
                name: query.title.native,
                iconURL: "https://anilist.co/img/icons/apple-touch-icon.png",
            })
            .setURL(query.siteUrl.toString())
            .setFields([
                {
                    name: sub.name == sgAnime ? "Episodes" : "Volumes",
                    value: (query.episodes || "N/A").toString(),
                    inline: true,
                },
                {
                    name: "Status",
                    value: query.status
                        .split("_")
                        .map((e) => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase())
                        .join(" "),
                    inline: true,
                },
                {
                    name: sub.name == sgAnime ? "Aired" : "Published",
                    value: getAirString(query),
                    inline: true,
                },
                {
                    name: "Rating",
                    value: `${query.averageScore / 10}/10`,
                    inline: true,
                },
            ])
            .setThumbnail(query.coverImage.toString())
            .setDescription(query.description)
            .setFooter({
                text: "Contents retrieved from AniList",
            })
            .setColor(0x3db4f2);

        await api.interactions.reply(int.id, int.token, {
            embeds: [embed.toJSON()],
        });
    },
};

export default command;
