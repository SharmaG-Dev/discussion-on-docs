import IORedis from "ioredis"

export const connection = new IORedis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,
})

connection.on("error", (err) => console.log("Redis Client Error", err))
connection.on("connect", () => console.log("Redis Client Connected"))
connection.on("ready", () => console.log("Redis Client Ready"))