import dotenv from "dotenv";

import {
    APIInteraction,
    Client,
    GatewayDispatchEvents,
    GatewayIntentBits,
    InteractionType,
    WithIntrinsicProps,
} from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";

import { log } from "@cayde/common/log";

function startCayde(token: string): void {
    const rest = new REST({
        version: "10",
    }).setToken(token);
    const gateway = new WebSocketManager({
        token: token,
        intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
        rest,
    });

    const cayde = new Client({ rest: rest, ws: gateway });
    cayde.on(GatewayDispatchEvents.InteractionCreate, async (props: WithIntrinsicProps<APIInteraction>) => {
        if (props.data.type !== InteractionType.ApplicationCommand) {
            return;
        }
    });
    cayde.on(GatewayDispatchEvents.Ready, () => {
        log("Cayde-6 is ready");
    });

    gateway.connect();
}

dotenv.config();

const token = process.env.DISCORD_TOKEN;

if (token) {
    startCayde(token);
} else {
    log("Environment variable DISCORD_TOKEN is undefined");
}
