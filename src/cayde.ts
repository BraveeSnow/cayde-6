import path from "path";
import dotenv from "dotenv";
import {
    APIChatInputApplicationCommandInteraction,
    APIInteraction,
    ActivityType,
    GatewayDispatchEvents,
    GatewayGuildCreateDispatchData,
    GatewayIntentBits,
    InteractionType,
    PresenceUpdateStatus,
    WithIntrinsicProps,
} from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";

import { createServer } from "@cayde/server";
import { CaydeClient } from "@cayde/common/client";
import { log } from "@cayde/common/log";

async function startCayde(token: string): Promise<void> {
    const rest = new REST({
        version: "10",
    }).setToken(token);
    const gateway = new WebSocketManager({
        token: token,
        intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
        rest,
    });

    const cayde = new CaydeClient({
        rest: rest,
        ws: gateway,
        db: {
            host: "localhost",
            port: 3306,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: "cayde-6",
        },
    });
    await cayde.loadCommands(path.join(process.cwd(), "./dist/commands"));

    cayde.on(GatewayDispatchEvents.InteractionCreate, async (props: WithIntrinsicProps<APIInteraction>) => {
        if (props.data.type !== InteractionType.ApplicationCommand) {
            return;
        }

        const cmd = cayde.getCommand(props.data.data.name);
        if (!cmd) {
            return;
        }

        await cmd.exec(props.api, props.data as APIChatInputApplicationCommandInteraction);
    });
    cayde.on(GatewayDispatchEvents.GuildCreate, (props: WithIntrinsicProps<GatewayGuildCreateDispatchData>) => {
        // This function fires when bot starts up for all inhabited guilds
        log(`Registering commands for guild ${props.data.name} with ID ${props.data.id}`);
        cayde.registerCommands(props.data.id);
    });
    cayde.on(GatewayDispatchEvents.Ready, () => {
        log("Cayde-6 is ready");
    });

    await gateway.connect();
    gateway.getShardIds().then((ids: number[]) => {
        ids.forEach((shardId: number) => {
            cayde.updatePresence(shardId, {
                status: PresenceUpdateStatus.Online,
                activities: [
                    {
                        name: "the stars fly by...",
                        type: ActivityType.Watching,
                    },
                ],
                since: null,
                afk: false,
            });
        });
    });

    createServer(cayde);
}

dotenv.config();

const token = process.env.DISCORD_TOKEN;

if (token) {
    startCayde(token);
} else {
    log("Environment variable DISCORD_TOKEN is undefined");
}
