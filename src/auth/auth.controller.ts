import {Body, Controller, HttpCode, HttpException, HttpStatus, Post, Req} from '@nestjs/common'
import {Request} from 'express'
import {DataService} from '../handlers/data.service'
import {JwtService} from '@nestjs/jwt'
import {ConfigService} from '@nestjs/config'

@Controller('auth')
export class AuthController {
    constructor(
        private readonly data: DataService,
        private readonly jwtService: JwtService
    ) {
    }

    // users start
    @HttpCode(201)
    @Post('users')
    async register(@Body() data,
                   @Req() req: Request) {
        if (await this.data.userExists(data.login)) throw new HttpException(null, HttpStatus.BAD_REQUEST)

        return this.data.createUser(data, req.url)
    }

    @HttpCode(201)
    @Post('login')
    async login(@Body() { login, password }) {
        const user = await this.data.validateUser(login, password)

        return await this.data.login(user)
    }

    @Post('logout')
    async logout(@Body() jwt: string) {
        jwt = Object.values(jwt).toString()
        const decodedPayload: any = await this.jwtService.decode(jwt)
        await this.data.deleteSessionFromDB(decodedPayload.tokenId)
        return
    }

}
