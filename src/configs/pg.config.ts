import {Pool} from 'pg'

// dev
// export const db = new Pool({
//     user: 'postgres',
//     host: '127.0.0.1',
//     database: 'accu_energo',
//     password: '3tA(uW%)3btv]Hq`3tA(uW%)3btv]Hq`',
//     port: 5432,
// })

// prod
export const db = new Pool({
    user: 'admin',
    host: '127.0.0.1',
    database: 'accu-energo',
    password: '8XrYOM9V14fT',
    port: 5432,
})
