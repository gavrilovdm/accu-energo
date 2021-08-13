import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.enableCors({
        allowedHeaders: ['sessionId', 'Content-Type'],
        exposedHeaders: ['sessionId'],
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false
    })
    app.setGlobalPrefix('api')
    await app.listen(3000)
}

bootstrap()
