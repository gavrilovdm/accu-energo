import {HttpException, Injectable} from '@nestjs/common'
import {JwtService} from '@nestjs/jwt'
import {genSalt, hash, compare} from 'bcryptjs'
import {db} from '../configs/pg.config'
import {createFilter} from 'odata-v4-pg'
import {ensureDir, writeFile, remove} from 'fs-extra'

const format = require('pg-format')
const randtoken = require('rand-token')

@Injectable()
export class DataService {
    constructor(
        private readonly jwtService: JwtService
    ) {
    }

    /* PRIVATE ENTITES START */

    async create(data, table): Promise<string> {
        data = JSON.stringify(data)

        //вытаскиваем id вставляемой записи
        const sql2 = format('INSERT INTO %I (data) VALUES (%L) RETURNING id', table, data)
        let id = await db.query(sql2)
        // преобразуем id в строку
        id = Object.values(id.rows.find(i => i.id !== null)).toString()
        // декодируем data и прикрепляем к нему id
        data = JSON.parse(data)
        data = {...{'id': id}, ...data}
        this.update(data, table, id)

        return id
    }

    async get(table, count?): Promise<string> {
        let _count

        count ? _count = count : null

        const sql = format(`SELECT data
                            FROM %I
                            ORDER BY id DESC ${_count ? 'LIMIT ' + _count : ''}`, table)
        const query = await db.query(sql)

        return query.rows.map(({data}) => data)
    }

    async getById(table, id): Promise<string[]> {
        const sql = format(`SELECT data
                            FROM %I
                            WHERE data ->>'id' = %L`, table, id)
        const query = await db.query(sql)

        return query.rows.map(({data}) => data)[0]
    }

    async getTeamByCity(table): Promise<string> {
        const sql = format(`SELECT data
                            FROM %I
                            ORDER BY data->>'city' DESC`, table)
        const query = await db.query(sql)

        return query.rows.map(({data}) => data)
    }

    async delete(table, id) {
        const sql = await format('DELETE FROM %I WHERE id = %L', table, id)
        await db.query(sql)

        return
    }

    async update(data, table, id) {
        data = JSON.stringify(data)
        const sql = await format('UPDATE %I SET data = %L WHERE id = %L', table, data, id)
        const query = await db.query(sql)

        return query.rows.map(({data}) => data)[0]
    }

    /* PRIVATE ENTITES END */


    /* PUBLIC ENTITES START */

    async getByUrl(table, url): Promise<string[]> {
        const sql = format(`SELECT *
                            FROM %I
                            WHERE data ->>'url' = %L AND data ->>'isActive' = 'true'`, table, url)
        const query = await db.query(sql)

        return query.rows
    }

    async getByQuery(table, urlQuery) {
        const filter = createFilter(urlQuery)

        filter.where = filter.where.replace(/"/g, '\'')
        filter.where = filter.where.replace(/'data'/g, 'data->>')

        const query = await db.query(`SELECT data
                                      FROM ${table}
                                      WHERE ${filter.where}`, filter.parameters)

        return query.rows.map(({data}) => data)
    }

    async checkEntityAccess(tableName): Promise<boolean> {
        const query = await db.query(format(`SELECT data ->>'endpoints' AS endpoints
                                             FROM settings
                                             WHERE data ->>'entity'='permissions'`))
        if (query.rows[0].endpoints.includes(tableName)) {
            const endpoint = JSON.parse(query.rows[0].endpoints)
            if (endpoint.filter(i => i.table === tableName)) {
                if (endpoint.filter(i => i.access === 'private')) {
                    return false
                }
            }
        }

        return true
    }

    /* PUBLIC ENTITES END */


    /* PRODUCTS START */

    async createNew(table): Promise<string> {
        const sql = format(`INSERT INTO %I
                                DEFAULT
                            VALUES RETURNING id`, table)
        const query = await db.query(sql)

        return query.rows[0].id
    }

    async getAll(table): Promise<string> {
        const sql = format(`SELECT *
                            FROM %I
                            ORDER BY id DESC`, table)
        const query = await db.query(sql)

        return query.rows
    }

    async getOneById(table, id): Promise<string[]> {
        const sql = format(`SELECT *
                            FROM %I
                            WHERE id = %L`, table, id)
        const query = await db.query(sql)

        return query.rows[0]
    }

    async getAccumulatorsByQuery(table, filter) {
        let condition = ''
        filter = JSON.parse(filter)

        /* SERIES */
        if (filter.series) {
            condition = condition + ' ('
            let $seriesCondition = ''

            $seriesCondition = $seriesCondition + ` ("series" = '${filter.series}') `

            condition = condition + $seriesCondition + ') '
        }

        /* BRANDS */
        if (filter.brands && filter.brands.length > 0) {
            if (condition) condition = condition + ' and '
            condition = condition + ' ('
            let $brandCondition = ''

            if (Array.isArray(filter.brands)) {
                for (const brand of filter.brands) {
                    if ($brandCondition) $brandCondition = $brandCondition + ' or '
                    $brandCondition = $brandCondition + ` ("brand" = '${brand}') `
                }
            } else $brandCondition = $brandCondition + ` ("brand" = '${filter.brands}') `

            condition = condition + $brandCondition + ') '
        }

        /* ACCUMULATORS */
        if (filter.productType === 'accumulators') {

            /* Technology */
            if (filter.accumulatorTechnology) {
                if (condition) condition = condition + ' and '
                condition = condition + ` ("technology" = '${filter.accumulatorTechnology}') `
            }

            /* Stationary accumulators */
            if (filter.accumulatorType === 'stationary') {

                if (condition) condition = condition + ' and '
                condition = condition + ` ("type" = 'stationary') `

                // capacity
                if (filter.capacityMin || filter.capacityMax) {
                    let $capacityMin = ''
                    let $capacityMax = ''
                    $capacityMin = $capacityMin + filter.capacityMin ? filter.capacityMin : filter.capacityMin < 0.1
                        ? 0
                        : filter.capacityMin.toFixed(2)
                    $capacityMax = filter.capacityMax ? filter.capacityMax : filter.capacityMax < filter.capacityMin
                        ? $capacityMax = '9999'
                        : filter.capacityMax.toFixed(2)

                    if (condition) condition = condition + ' and '
                    condition = condition + ` ("capacity" between '${$capacityMin}' and '${$capacityMax}') `
                }


                // life time
                if (filter.lifeTimeMin || filter.lifeTimeMax) {
                    let $lifeTimeMin = ''
                    let $lifeTimeMax = ''
                    $lifeTimeMin = filter.lifeTimeMin ? filter.lifeTimeMin : filter.lifeTimeMin < 0.1
                        ? 0
                        : filter.lifeTimeMin
                    $lifeTimeMax = filter.lifeTimeMax ? filter.lifeTimeMax : filter.lifeTimeMax < filter.lifeTimeMin
                        ? 9999
                        : filter.lifeTimeMax

                    if (condition) condition = condition + ' and '
                    condition = condition + ` ("lifeTimeMin">=' ${$lifeTimeMin} ' and "lifeTimeMax"<=' ${$lifeTimeMax} ') `
                }


                // voltage
                if (filter.accumulatorVoltage) {
                    if (condition) condition = condition + ' and '

                    if (filter.accumulatorVoltage) {
                        if (filter.accumulatorVoltage === 'two') {
                            filter.accumulatorVoltage = '2'
                        } else if (filter.accumulatorVoltage === 'four') {
                            filter.accumulatorVoltage = '4'
                        } else if (filter.accumulatorVoltage === 'six') {
                            filter.accumulatorVoltage = '6'
                        } else if (filter.accumulatorVoltage === 'eight') {
                            filter.accumulatorVoltage = '8'
                        } else if (filter.accumulatorVoltage === 'twelve') {
                            filter.accumulatorVoltage = '12'
                        } else if (filter.accumulatorVoltage === 'unique1') {
                            filter.accumulatorVoltage = '14'
                        } else if (filter.accumulatorVoltage === 'unique2') {
                            filter.accumulatorVoltage = '40'
                        } else if (filter.accumulatorVoltage === 'unique3') {
                            filter.accumulatorVoltage = '44'
                        } else if (filter.accumulatorVoltage === 'unique4') {
                            filter.accumulatorVoltage = '48'
                        } else if (filter.accumulatorVoltage === 'unique5') {
                            filter.accumulatorVoltage = '80'
                        }
                    }

                    condition = condition + ' (`voltage` = ' + filter.accumulatorVoltage + ') '
                }

            } else if (filter.accumulatorType === 'draft') {

                if (condition) condition = condition + ' and '
                condition = condition + ` ("type" = 'draft') `

                // capacity
                if (filter.capacityMin || filter.capacityMax) {
                    let $capacityMin = ''
                    let $capacityMax = ''
                    $capacityMin = filter.capacityMin ? filter.capacityMin : filter.capacityMin < 0.1
                        ? 0
                        : filter.capacityMin.toFixed(2)
                    $capacityMax = filter.capacityMax ? filter.capacityMax : filter.capacityMax < filter.capacityMin
                        ? $capacityMax = '9999'
                        : filter.capacityMax.toFixed(2)

                    if (condition) condition = condition + ' and '
                    condition = condition + ` ("capacity" between '${$capacityMin}' and '${$capacityMax}') `
                }

                // number of cycles
                if (filter.numberOfCyclesMin || filter.numberOfCyclesMax) {
                    let $numberOfCyclesMin = ''
                    let $numberOfCyclesMax = ''
                    $numberOfCyclesMin = filter.numberOfCyclesMin ? filter.numberOfCyclesMin : filter.numberOfCyclesMin < 0.1
                        ? 0
                        : filter.numberOfCyclesMin
                    $numberOfCyclesMax = filter.numberOfCyclesMax ? filter.numberOfCyclesMax : filter.numberOfCyclesMax < filter.numberOfCyclesMin
                        ? 9999
                        : filter.numberOfCyclesMax

                    if (condition) condition = condition + ' and '
                    condition = condition + ` ("numberOfCyclesMin"> = '${$numberOfCyclesMin}' and numberOfCyclesMax<= '${$numberOfCyclesMax}') `
                }

                // voltage
                if (filter.accumulatorVoltage) {
                    if (condition) condition = condition + ' and '

                    if (filter.accumulatorVoltage) {
                        if (filter.accumulatorVoltage === 'two') {
                            filter.accumulatorVoltage = '2'
                        } else if (filter.accumulatorVoltage === 'four') {
                            filter.accumulatorVoltage = '4'
                        } else if (filter.accumulatorVoltage === 'six') {
                            filter.accumulatorVoltage = '6'
                        } else if (filter.accumulatorVoltage === 'eight') {
                            filter.accumulatorVoltage = '8'
                        } else if (filter.accumulatorVoltage === 'twelve') {
                            filter.accumulatorVoltage = '12'
                        } else if (filter.accumulatorVoltage === 'unique1') {
                            filter.accumulatorVoltage = '14'
                        } else if (filter.accumulatorVoltage === 'unique2') {
                            filter.accumulatorVoltage = '40'
                        } else if (filter.accumulatorVoltage === 'unique3') {
                            filter.accumulatorVoltage = '44'
                        } else if (filter.accumulatorVoltage === 'unique4') {
                            filter.accumulatorVoltage = '48'
                        } else if (filter.accumulatorVoltage === 'unique5') {
                            filter.accumulatorVoltage = '80'
                        }
                    }

                    condition = condition + ` ("voltage" = '${filter.accumulatorVoltage}') `
                }

            }
        } else {
            if (condition) condition = condition + ' and '
            condition = condition + ` ("category" = ' ${filter.productType} ') `
        }

        if (condition) {
            const query = await db.query(`SELECT *
                                          FROM ${table}
                                          WHERE ${condition}
            `)

            return query.rows
        } else {
            const query = await db.query(`SELECT *
                                          FROM ${table}
            `)

            return query.rows
        }
    }

    async getSeries(brand) {
        const sql = format(`SELECT *
                            FROM %I
                            WHERE "brand" = %L
                            ORDER BY id DESC`, 'p_series', brand)
        const query = await db.query(sql)

        return query.rows
    }

    async deleteOne(table, id) {
        const sql = await format('DELETE FROM %I WHERE id = %L', table, id)
        await db.query(sql)

        return
    }

    async updateAccumulator(data, table, id) {
        const sql = await format(`UPDATE %I
                                  SET
                                      title=%L, description = %L,
                                      brand=%L, series = %L, type = %L,
                                      voltage=%L, power = %L, capacity = %L,
                                      length = %L, width = %L, height = %L, weight = %L,
                                      output_type = %L, pdf = %L, url = %L, is_active = %L,
                                      technology = %L,
                                      life_time_min=%L, life_time_max = %L
                                  WHERE id = %L`,
            table, data.title, data.description, data.brand, data.series, data.type, data.voltage, data.power,
            data.capacity, data.length, data.width, data.height, data.weight, data.output_type, data.pdf, data.url,
            data.is_active, data.technology, data.life_time_min, data.life_time_max, id)

        const query = await db.query(sql)

        return query.rows[0]
    }

    async updateSeries(data, table, id) {
        const sql = await format(`UPDATE %I
                                  SET
                                      title=%L, description = %L,
                                      text=%L, img=%L, brand=%L
                                  WHERE id = %L`,
            table, data.title, data.description, data.text, data.img, data.brand, id)

        const query = await db.query(sql)

        return query.rows[0]
    }

    async updateBrand(data, table, id) {
        const sql = await format(`UPDATE %I
                                  SET
                                      title=%L, description = %L,
                                      text=%L, img=%L, producttype=%L,
                                      accumulatortype=%L, accumulatortechnology=%L,
                                      accumulatorvoltage=%L, isshowhome=%L
                                  WHERE id = %L`,
            table, data.title, data.description, data.text, data.img, data.producttype, data.accumulatortype,
            data.accumulatortechnology, data.accumulatorvoltage, data.isshowhome, id)

        const query = await db.query(sql)

        return query.rows[0]
    }

    /* PRODUCTS END */


    /* WORKING WITH FILES START */

    async saveFiles(table, filesField, id, files: Express.Multer.File[]) {
        // путь к папке на сервере, куда будут загружены файлы
        const uploadFolder = `./files/assets/${table}/${id}`
        // удалить папку, если такая уже существует
        await remove(uploadFolder)
        // если папка не существует - создать ее
        await ensureDir(uploadFolder)
        // массив, куда заносим информацию о загружаемых файлах
        const newFileNames = []

        // перебор массива загружаемых файлов
        for (const file of files) {

            // разделяем mimetype на тип и расширение файла (image/png = ['image', 'png'])
            const mimetype = file.mimetype.split('/')
            const extension = mimetype[1]
            const newOriginalName = `${randtoken.generate(8)}.${extension}`

            // записываем файл в папку
            await writeFile(`${uploadFolder}/${newOriginalName}`, file.buffer)
            // заполняем массив с именами файлов
            newFileNames.push(`assets/${table}/${id}/${newOriginalName}`)
            // добавляем для сущности путь к файлу
        }
        const query = await db.query(format(`UPDATE %I
                                             SET %I = %L
                                             WHERE id = %L`, table, filesField, newFileNames, id))

        return query.rows[0]
    }

    async saveFilesArray(table, fieldName: string, id, files: Express.Multer.File[]): Promise<string[]> {
        // путь к папке на сервере, куда будут загружены файлы
        const uploadFolder = `./files/assets/${table}/${id}`
        // если папка не существует - создать ее
        await ensureDir(uploadFolder)
        // массив, куда заносим информацию о загружаемых файлах
        const newFileNames = []

        // перебор массива загружаемых файлов
        for (const file of files) {

            // разделяем mimetype на тип и расширение файла (image/png = ['image', 'png'])
            const mimetype = file.mimetype.split('/')
            const extension = mimetype[1]
            const newOriginalName = `${randtoken.generate(8)}.${extension}`

            // записываем файл в папку
            await writeFile(`${uploadFolder}/${newOriginalName}`, file.buffer)
            // заполняем массив с именами файлов
            newFileNames.push(`assets/${table}/${id}/${newOriginalName}`)
            // добавляем для сущности путь к файлу
        }

        const sql = format(`SELECT *
                            FROM %I
                            WHERE id = %L`, table, id)
        const query = await db.query(sql)

        const images = query.rows[0].data.img

        for (const img of images) {
            newFileNames.push(img)
        }

        console.log(newFileNames)

        const uploadFileNames = JSON.stringify(newFileNames)
        const query2 = await db.query(format(`UPDATE %I
                                              SET data = jsonb_set(cast (data as jsonb), '{img}', '${uploadFileNames}', true)
                                              WHERE id = %L`, table, id))

        const query3 = await db.query(format(`SELECT data ->>'img' AS images
                                              FROM %I
                                              WHERE id = %L`, table, id))

        return query3.rows[0].images
    }

    async deleteFile(table: string, data: string) {
        const p = JSON.parse(data)

        const sql = format(`UPDATE %I
                            SET %I = null
                            WHERE id = %L`, table, p.filesField, p.id)
        const query = await db.query(sql)

        await remove(`./files/assets/${table}/${p.id}`)

        return
    }

    async deleteFileFromJson(table: string, _data) {
        const data = _data

        const sql = format(`SELECT *
                            FROM %I
                            WHERE id = %L`, table, data.id)
        const query = await db.query(sql)

        let images = query.rows[0].data.img

        const index = images.indexOf(data.name)
        if (index > -1) {
            images.splice(index, 1)
        }

        images = JSON.stringify(images)
        const query2 = await db.query(format(`UPDATE %I
                                              SET data = jsonb_set(cast (data as jsonb), '{img}', '${images}', true)
                                              WHERE id = %L`, table, data.id))

        await remove(`./files/${data.name}`)

        return
    }

    /* WORKING WITH FILES END */


    /* USERS START */

    async createUser(data, url) {
        const salt = await genSalt(10)
        const newUser = {
            ...data, ...{
                password: await hash(data.password, salt)
            }
        }

        data = JSON.stringify(newUser)
        const sql2 = format('INSERT INTO %I (data) VALUES (%L)', 'users', data)
        const query = await db.query(sql2)

        return query.rows
    }

    async userExists(login: string) {
        const sql = format(`SELECT *
                            FROM %I
                            WHERE data ->>'login' = %L`, 'users', login)
        const query = await db.query(sql)

        return query.rows.find(i => i.data.login === login)
    }

    async validateUser(login: string, password: string): Promise<{ user }> {
        let user = await this.userExists(login)
        if (!user) {
            throw new HttpException(null, 400)
            // throw new UnauthorizedException()
        }
        const checkPassword = await compare(password, user.data.password)
        if (!checkPassword) {
            throw new HttpException(null, 400)
        }

        return user
    }

    async login(user): Promise<{ token: string }> {
        const refreshTokenData = await this.generateRefreshToken()
        const newTokenId = await this.saveOrUpdateRefreshToken(refreshTokenData.refreshToken, refreshTokenData.expiryDate)
        // добавляем id рефреш токена внутрь данных будущего jwt
        const payload = {tokenId: newTokenId}

        return {
            token: await this.jwtService.signAsync(payload)
        }
    }

    async saveOrUpdateRefreshToken(refreshToken: string, refreshTokenExpires, tokenId?: string): Promise<string> {
        if (!tokenId) {
            const sql = await format('INSERT INTO %I (data) VALUES (%L) RETURNING id', 'tokens', {
                refreshToken: refreshToken,
                refreshTokenExpires: refreshTokenExpires
            })
            let tokenId = await db.query(sql)

            // преобразуем id в строку
            tokenId = Object.values(tokenId.rows.find(i => i.tokenId !== null)).toString()

            return tokenId
        } else {
            const sql = await format('UPDATE %I SET data = %L WHERE id = %L', 'tokens', {
                refreshToken: refreshToken,
                refreshTokenExpires: refreshTokenExpires
            }, tokenId)
            const query = await db.query(sql)

            return tokenId
        }
    }

    async generateRefreshToken(): Promise<{ refreshToken: string, expiryDate }> {
        const refreshToken = randtoken.generate(16)
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 7)

        return {refreshToken, expiryDate}
    }

    async tokenExists(tokenId: string, user_id?: string): Promise<{ refreshToken: string, refreshTokenExpires: string }> {
        const sql = format(`SELECT *
                            FROM %I
                            WHERE id = %L`, 'tokens', tokenId)
        const refreshTokenData = await db.query(sql)
        if (refreshTokenData.rows.length === 0) throw new HttpException(null, 400)
        // преобразуем refreshToken в строку
        const refreshToken = refreshTokenData.rows.map(({data}) => data.refreshToken)
        const refreshTokenExpires = refreshTokenData.rows.map(({data}) => data.refreshTokenExpires)

        return {refreshToken, refreshTokenExpires}
    }

    async deleteSessionFromDB(tokenId: string) {
        const sql = format(`DELETE
                            FROM %I
                            WHERE id = %L`, 'tokens', tokenId)
        await db.query(sql)
        return
    }

    /* USERS END */
}
