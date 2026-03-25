import knex from "knex";
import { getDbConfig } from "./config.js";

const db = knex(getDbConfig());

export default db;
