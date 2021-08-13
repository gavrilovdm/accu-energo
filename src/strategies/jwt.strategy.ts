import {Injectable, HttpException} from '@nestjs/common'
import {PassportStrategy} from '@nestjs/passport'
import {ExtractJwt, Strategy} from 'passport-jwt'
import {ConfigService} from '@nestjs/config'
import {DataService} from '../handlers/data.service'
import {JwtService} from '@nestjs/jwt'


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly configService: ConfigService,
                private data: DataService,
                private readonly jwtService: JwtService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'secretkey', //configService.get('JWT_KEY'),
            // ignoreExpiration: true
        })
    }

    async validate(req) {

        // if await this.jwtService.verifyAsync(jwt, {secret: this.configService.get('JWT_KEY')})
        // --- более простой вариант написания проверки на истечение jwt
        if (Date.now() >= req.exp * 1000) {
            // истек срок годности jwt токена
            const tokenData = await this.data.tokenExists(req.tokenId)

            if (Date.now() >= Date.parse(tokenData.refreshTokenExpires)) {
                // истек срок годности refresh токена
                await this.data.deleteSessionFromDB(req.tokenId)
                throw new HttpException('', 400)
            } else {
                const refreshTokenData = await this.data.generateRefreshToken()
                await this.data.saveOrUpdateRefreshToken(refreshTokenData.refreshToken, refreshTokenData.expiryDate, req.tokenId)

                const payload = {tokenId: req.tokenId}

                console.log(Object.values(payload) + ' its payload from jwt strategy 1')
                console.log(await this.jwtService.signAsync(payload))
                return {
                    // возвращается новый jwt, который надо записать в localstorage
                    token: await this.jwtService.signAsync(payload)
                }
            }
        } else {
            const payload = {tokenId: req.tokenId}

            // console.log(Object.values(payload) + ' its payload from jwt strategy 2')
            // console.log(await this.jwtService.signAsync(payload))
            return {
                // возвращается новый jwt, который надо записать в localstorage
                token: await this.jwtService.signAsync(payload)
            }
        }
    }
}
