import "dotenv/config";
export const env = {
  port: Number(process.env.PORT ?? 3001),
  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "password",
    database: process.env.DB_NAME ?? "steam",
  },
};
