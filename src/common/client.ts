import { readdirSync } from "fs";
import path from "path";
import url from "url";

import { ConnectionOptions } from "mysql2";
import {
    API,
    APIChatInputApplicationCommandInteraction,
    Client,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";

import { DatabaseClient } from "@cayde/common/database";
import { log, Severity } from "@cayde/common/log";

export interface Command {
    data: RESTPostAPIChatInputApplicationCommandsJSONBody;
    exec(api: API, int: APIChatInputApplicationCommandInteraction): Promise<void>;
}

export interface CaydeClientOptions {
    rest: REST;
    ws: WebSocketManager;
    db: ConnectionOptions;
}

export class CaydeClient extends Client {
    private commandMap: Map<string, Command> = new Map();
    readonly db: DatabaseClient;

    constructor(opts: CaydeClientOptions) {
        super({
            rest: opts.rest,
            gateway: opts.ws,
        });

        this.db = new DatabaseClient(opts.db);
    }

    getCommand(name: string): Command | undefined {
        return this.commandMap.get(name);
    }

    async loadCommands(commandPath: string) {
        for (const entry of readdirSync(commandPath, { withFileTypes: true })) {
            const entryPath: string = path.join(commandPath, entry.name);

            if (entry.isDirectory()) {
                await this.loadCommands(entryPath);
                continue;
            }

            if (!entry.name.endsWith(".js")) {
                log(`Entry ${entryPath} is not a command or directory, skipping...`, Severity.WARN);
                continue;
            }

            log(`Loading command from ${entryPath}`);
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const command: Command = ((await import(url.pathToFileURL(entryPath).toString())) as any).default.default;
            if (this.commandMap.has(command.data.name)) {
                log(`Command with name ${command.data.name} already exists, consider renaming`, Severity.WARN);
                continue;
            }

            this.commandMap.set(command.data.name.toLowerCase(), command);
        }
    }

    async registerCommands(guildId: string) {
        for (const command of this.commandMap.values()) {
            await this.api.applicationCommands.createGuildCommand("694828817457479731", guildId, command.data);
        }
    }
}
