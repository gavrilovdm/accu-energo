import {MailerService} from '@nestjs-modules/mailer'
import {Injectable} from '@nestjs/common'

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {
    }

    async sendOrderConfirmation(user: any, data: any) {

        await this.mailerService.sendMail({
            to: user.email,
            // from: '"Support Team" <support@example.com>', // override default from
            subject: `Заявка №${Date.now()}, АККУ-ЭНЕРГО`,
            text: `
            ${data.name ? 'Имя: ' + data.name : ''}
            ${data.lastname ? 'Фамилия: ' + data.lastname : ''}
            ${data.companyName ? 'Название компании: ' + data.companyName : ''}
            ${data.phone ? 'Телефон: ' + data.phone : ''}
            ${data.comment ? 'Комментарий: ' + data.comment : ''}
            ${data.position ? 'Должность: ' + data.position : ''}
            ${data.email ? 'Эл. почта: ' + data.email : ''}
            ${data.webinar ? 'Название вебинара: ' + data.webinar : ''}
            `,
            html: `
            <p>${data.date ? 'Дата:' : null} ${data.date}</p>
              <br>
            <p>${data.name ? 'Имя: ' + data.name : ''}</p>
            <p>${data.lastname ? 'Фамилия: ' + data.lastname : ''}</p>
            <p>${data.companyName ? 'Название компании: ' + data.companyName : ''}</p>
            <p>${data.phone ? 'Телефон: ' + data.phone : ''}</p>
            <p>${data.comment ? 'Комментарий: ' + data.comment : ''}</p>
            <p>${data.position ? 'Должность: ' + data.position : ''}</p>
            <p>${data.email ? 'Эл. почта: ' + data.email : ''}</p>
            <p>${data.webinar ? 'Название вебинара: ' + data.webinar : ''}</p>
            `
        })
    }
}
