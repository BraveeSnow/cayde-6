import { SlashCommandBuilder } from "@discordjs/builders";
import { API, APIInteraction, MessageFlags } from "@discordjs/core";

import { Command } from "@cayde/common/client";

const command: Command = {
    data: new SlashCommandBuilder().setName("ping"),
    async exec(api: API, data: APIInteraction) {
        await api.interactions.reply(data.id, data.token, {
            content: "Pong!",
            flags: MessageFlags.Ephemeral,
        });
    },
};

export default command;
