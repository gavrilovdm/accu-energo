import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param, Post, Req
} from '@nestjs/common'
import {DataService} from '../handlers/data.service'
import {Request} from 'express'
import {MailService} from '../handlers/mail/mail.service'

@Controller('content')
export class ContentController {
    constructor(
        private data: DataService,
        private mailService: MailService
    ) {
    }

    @HttpCode(201)
    @Post('orders')
    async create(
        @Body() data) {
        return await this.mailService.sendOrderConfirmation({email: 'info@accu-energo.kz'}, data),
            await this.data.create(data, 'orders')

    }

    @HttpCode(200)
    @Get('news')
    async getNews(@Req() req: Request) {
        if (req.query.count !== undefined) return await this.data.get('news', req.query.count)
        return await this.data.get('news')
    }

    @HttpCode(200)
    @Get('news/:url')
    async getNewsByUrl(@Param('url') url: string) {
        return await this.data.getByUrl('news', url)
    }

    @HttpCode(200)
    @Get('webinars')
    async getWebinars(@Req() req: Request) {
        if (req.query.count !== undefined) return await this.data.get('webinars', req.query.count)
        return await this.data.get('webinars')
    }

    @HttpCode(200)
    @Get('webinars/:url')
    async getWebinarByUrl(@Param('url') url: string) {
        return await this.data.getByUrl('webinars', url)
    }

    @HttpCode(200)
    @Get('webinar_speakers')
    async getWebinarSpeakers() {
        return await this.data.get('webinar_speakers')
    }

    @HttpCode(200)
    @Get('partners')
    async getPartners() {
        return await this.data.get('partners')
    }

    @HttpCode(200)
    @Get('team')
    async getTeam() {
        return await this.data.getTeamByCity('team')
    }

    @HttpCode(200)
    @Get('accumulators')
    async getAccumulators(@Req() req: Request) {
        if (req.query.filter !== undefined) return await this.data.getAccumulatorsByQuery('p_accumulators', req.query.filter)
        else return await this.data.getAll('p_accumulators')
    }

    @HttpCode(200)
    @Get('brands')
    async getBrands() {
        return await this.data.getAll('p_brands')
    }

    @HttpCode(200)
    @Get('series')
    async getSeries(@Req() req: Request) {
        if (req.query.brand !== undefined) return await this.data.getSeries(req.query.brand)
        else return await this.data.getSeries(req.query.brand)
    }
}
