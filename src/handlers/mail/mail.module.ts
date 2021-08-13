import {MailerModule} from '@nestjs-modules/mailer'
import {HandlebarsAdapter} from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import {Module} from '@nestjs/common'
import {MailService} from './mail.service'
import {join} from 'path'

@Module({
    imports: [
        MailerModule.forRoot({
            // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
            // or
            transport: {
                host: 'smtp.yandex.ru',
                port: 465,
                secure: true,
                auth: {
                    user: 'accu-energo-website@yandex.ru',
                    pass: 'uttt79e9DTjOuttt79e9DTjO',
                },
            },
            defaults: {
                from: 'accu-energo-website@yandex.ru',
            },
        }),
    ],
    providers: [MailService],
    exports: [MailService], // 👈 export for DI
})
export class MailModule {
}
