import { getDbConfig } from "./src/config.js";
import type { Knex } from "knex";

const config: Knex.Config = {
  ...getDbConfig(),
  migrations: {
    directory: "./migrations",
  },
};

export default config;
