import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import {
    API,
    APIApplicationCommandInteractionDataSubcommandOption,
    APIChatInputApplicationCommandInteraction,
    ChannelType,
} from "@discordjs/core";

import { ALStatus, AnilistQueryResponse, searchByTitle } from "@cayde/api/anilist";
import { Command } from "@cayde/common/client";

function getAirString(query: AnilistQueryResponse): string {
    if (query.status == ALStatus.NOT_YET_RELEASED) {
        return "N/A";
    }

    const season = query.season.charAt(0) + query.season.slice(1).toLowerCase();

    if (query.status == ALStatus.RELEASING) {
        return `Started ${query.startDate.toDateString()} (${season})`;
    }

    return `${query.startDate.toDateString()} to ${query.endDate.toDateString()} (${season})`;
}

const sgAnime = "anime";
const sgAnimeTitleOpt = "title";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("anilist")
        .setDescription("Interacts with AniList")
        .addSubcommand((sub) =>
            sub
                .setName(sgAnime)
                .setDescription("Finds an anime with the given title")
                .addStringOption((opt) =>
                    opt.setName(sgAnimeTitleOpt).setDescription("The title of the anime to find").setRequired(true)
                )
        )
        .toJSON(),
    async exec(api: API, int: APIChatInputApplicationCommandInteraction) {
        if (!int.data.options || int.data.options.length == 0) {
            return;
        }

        const sub = int.data.options[0] as APIApplicationCommandInteractionDataSubcommandOption;
        if (!sub.options) {
            return;
        }

        const embed = new EmbedBuilder();

        switch (sub.name) {
            case sgAnime: {
                const query: AnilistQueryResponse = await searchByTitle(sub.options[0].value as string);

                if (query.isAdult && int.channel.type == ChannelType.GuildText && !int.channel.nsfw) {
                    return api.interactions.reply(int.id, int.token, {
                        content: "The anime found is rated 18+, please use NSFW channels.",
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
                            name: "Episodes",
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
                            name: "Aired",
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
                    .setColor(0x3db4f2);
                await api.interactions.reply(int.id, int.token, {
                    embeds: [embed.toJSON()],
                });
                break;
            }
        }
    },
};

export default command;
