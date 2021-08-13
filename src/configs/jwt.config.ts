import {ConfigService} from '@nestjs/config'
import {JwtModuleOptions} from '@nestjs/jwt'

export const getJwtConfig = async (configService: ConfigService): Promise<JwtModuleOptions> => {
    return {
        secret: 'secretkey', //configService.get('JWT_KEY'),
        signOptions: {expiresIn: '24h'}
    }
}
