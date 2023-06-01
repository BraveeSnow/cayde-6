/* eslint-disable @typescript-eslint/no-explicit-any */
import { createPool, RowDataPacket } from "mysql2";
import { PoolConnection, PoolOptions } from "mysql2/promise";

import { log, Severity } from "@cayde/common/log";

// TODO: migrate to Prisma ORM
export class DatabasePool {
  private db: PoolConnection;

  constructor(opts: PoolOptions) {
    this.db = createPool(opts).promise();
    this.db
      .getConnection()
      .then(() => {
        log(`Connected to database at ${opts.host}`);
      })
      .catch((err) => {
        log(`Unable to connect to database at ${opts.host} -> ${err}`, Severity.ERROR);
        throw err;
      });
  }

  async query(sql: string): Promise<any> {
    return ((await this.db.query(sql)) as RowDataPacket)[0][0] as any;
  }

  /**
   * Checks if the given query evaluates to either true or false within a `SELECT EXISTS` clause.
   *
   * @param sql The query to use to check for any existing values.
   * @returns Whether the given query comes up with an existing entry.
   */
  async exists(sql: string): Promise<boolean> {
    return !!Object.values(((await this.db.query(`SELECT EXISTS(${sql})`)) as RowDataPacket)[0][0])[0];
  }

  /**
   * Assumes that the insert statement has values for all covers. If this is not the case, see the `insertValues`
   * method instead.
   *
   * @see DatabasePool#insertValues
   *
   * @param table The table to insert values into.
   * @param values The values to be inserted into the specified table.
   */
  async insert(table: string, values: (number | string | null)[]) {
    await this.db.execute(`INSERT INTO ${table} VALUES (${Array(values.length).fill("?").join(",")})`, values);
  }

  /**
   * Useful for when specific columns need to be filled, disregarding other columns.
   *
   * @see DatabasePool#insert
   *
   * @param table The table to insert values into.
   * @param columns The columns to insert values into.
   * @param values The values to be inserted into the specified table.
   */
  async insertValues(table: string, columns: string[], values: (any | null)[]) {
    await this.db.execute(
      `INSERT INTO ${table} (${columns.join(",")}) VALUES (${Array(values.length).fill("?").join(",")})`,
      values
    );
  }
}
