

import { Redis } from 'ioredis'


const redis = new Redis({
    host: 'localhost',
    port: 6379,
})



redis.on('connect' , () =>  {
    console.log('Redis Connection Established')
})

redis.on('error' , (err) => {
    console.log('error in Redis Connection ' ,err)
})


export default redis;