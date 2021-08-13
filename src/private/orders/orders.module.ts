import {Module} from '@nestjs/common'
import {OrdersController} from './orders.controller'
import {DataService} from '../../handlers/data.service'
import {JwtModule} from '@nestjs/jwt'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {getJwtConfig} from '../../configs/jwt.config'
import {ServeStaticModule} from '@nestjs/serve-static'
import {path} from 'app-root-path'

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getJwtConfig
        }),
        ServeStaticModule.forRoot({
            rootPath: `${path}/files`
        })
    ],
    controllers: [OrdersController],
    providers: [DataService]
})
export class OrdersModule {
}
