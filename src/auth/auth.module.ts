import {Module} from '@nestjs/common'
import {AuthController} from './auth.controller'
import {DataService} from '../handlers/data.service'
import {JwtModule} from '@nestjs/jwt'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {getJwtConfig} from '../configs/jwt.config'
import {JwtStrategy} from '../strategies/jwt.strategy'

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getJwtConfig
        })
    ],
    controllers: [AuthController],
    providers: [DataService, JwtStrategy]
})
export class AuthModule {
}
