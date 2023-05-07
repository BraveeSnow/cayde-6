import axios from "axios";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
    API,
    APIApplicationCommandInteractionDataBasicOption,
    APIChatInputApplicationCommandInteraction,
    MessageFlags,
} from "@discordjs/core";

import { Command } from "@cayde/common/client";

const urlOpt = "url";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("fetch")
        .setDescription("Retrieves media from the given link")
        .addStringOption((opt) =>
            opt.setName(urlOpt).setDescription("The origin of the media to fetch").setRequired(true)
        )
        .toJSON(),
    async exec(api: API, int: APIChatInputApplicationCommandInteraction) {
        if (!int.data.options) {
            return;
        }

        const url = (int.data.options[0] as APIApplicationCommandInteractionDataBasicOption).value as string;
        if (!url.startsWith("http")) {
            return await api.interactions.reply(int.id, int.token, {
                content: "I can only accept an HTTP or HTTPS link, guardian.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const res = await axios({
            url: url,
            method: "GET",
            responseType: "arraybuffer",
        });
        console.log(res);

        if (res.status != 200) {
            return await api.interactions.reply(int.id, int.token, {
                content: "That link doesn't seem to contain anything.",
                flags: MessageFlags.Ephemeral,
            });
        }

        await api.interactions.reply(int.id, int.token, {
            files: [
                {
                    name: new URL(url).pathname.split("/").pop() as string,
                    data: res.data,
                },
            ],
        });
    },
};

export default command;
