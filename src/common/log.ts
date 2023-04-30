import chalk from "chalk";

export enum Severity {
    INFO,
    WARN,
    ERROR,
}

export function log(msg: string, level: Severity = Severity.INFO) {
    const uptime: string = process.uptime().toFixed(5);
    switch (level) {
        case Severity.INFO:
            console.info(chalk.green(`[${uptime}] ${msg}`));
            break;

        case Severity.WARN:
            console.warn(chalk.yellow(`[${uptime}] ${msg}`));
            break;

        case Severity.ERROR:
            console.error(chalk.red(`[${uptime}] ${msg}`));
            break;
    }
}

export function logError(msg: string) {
    log(msg, Severity.ERROR);
}
