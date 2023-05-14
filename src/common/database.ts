import {
    createConnection,
    Connection,
    ConnectionOptions,
    FieldPacket,
    QueryError,
    RowDataPacket,
    OkPacket,
    ResultSetHeader,
} from "mysql2";
import { log, Severity } from "./log";

export type QueryResult = RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader;
export type QueryCallback = (err: QueryError | null, result: QueryResult, fields: FieldPacket[]) => unknown;

export class DatabaseClient {
    private conn: Connection;

    constructor(opts: ConnectionOptions) {
        this.conn = createConnection(opts);
        this.conn.connect((err) => {
            if (err) {
                log(`Unable to connect to database: ${err}`, Severity.ERROR);
                throw err;
            }

            log(`Connected to MySQL database at ${this.conn.config.host}`);
        });
    }

    query(q: string, func: QueryCallback): void {
        this.conn.query(q, func);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insert(table: string, values: any): void {
        this.conn.prepare(`INSERT INTO ${table} VALUES (${Array(values.length).fill("?").join(",")})`, (err, statement) => {
            if (err) {
                log(`Unable to prepare statement for table ${table}: ${err}`, Severity.ERROR);
                return;
            }

            statement.execute(values, (err) => {
                if (err) {
                    log(`Unable to insert into table ${table}: ${err}`, Severity.WARN);
                    return;
                }
            });
        })
    }
}
