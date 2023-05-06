import { SlashCommandBuilder } from "@discordjs/builders";
import { API, APIChatInputApplicationCommandInteraction, MessageFlags } from "@discordjs/core";

import { Command } from "@cayde/common/client";

const command: Command = {
    data: new SlashCommandBuilder().setName("ping").setDescription("Replies with 'Pong!'").toJSON(),
    async exec(api: API, int: APIChatInputApplicationCommandInteraction) {
        await api.interactions.reply(int.id, int.token, {
            content: "Pong!",
            flags: MessageFlags.Ephemeral,
        });
    },
};

export default command;
