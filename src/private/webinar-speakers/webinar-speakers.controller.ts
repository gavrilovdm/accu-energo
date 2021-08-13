import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode, HttpException,
    Param,
    Post,
    Put,
    Req,
    UploadedFiles, UseGuards,
    UseInterceptors
} from '@nestjs/common'
import {DataService} from '../../handlers/data.service'
import {Request} from 'express'
import {FilesInterceptor} from '@nestjs/platform-express'
import {JwtAuthGuard} from '../../guards/jwt.guard'

@UseGuards(JwtAuthGuard)
@Controller('private/webinar_speakers')
export class WebinarSpeakersController {
    constructor(
        private data: DataService
    ) {
    }

    // files start
    @HttpCode(201)
    @Post(':id')
    @UseInterceptors(FilesInterceptor('files'))
    async uploadFiles(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() data,
        @Param('id') id: string) {
        if (files) return await this.data.saveFilesArray('webinar_speakers', 'img', id, files)
        throw new HttpException(null, 400)
    }

    @HttpCode(204)
    @Put('files/delete')
    async deleteFilesNews(
        @Body() data,
    ) {
        return await this.data.deleteFileFromJson('webinar_speakers', data)
    }

    // files end

    @HttpCode(200)
    @Get()
    async get(@Req() req: Request) {
        if (req.query.$filter !== undefined) return await this.data.getByQuery('webinar_speakers', req.query.$filter)
        else return await this.data.get('webinar_speakers')
    }

    @HttpCode(200)
    @Get(':id')
    async getById(@Param('id') id: string) {
        return await this.data.getById('webinar_speakers', id)
    }

    @HttpCode(201)
    @Post()
    async create(
        @Body() data) {
        return await this.data.create(data, 'webinar_speakers')
    }

    @HttpCode(204)
    @Put(':id')
    async update(
        @Body() data,
        @Param('id') id: string) {
        return await this.data.update(data, 'webinar_speakers', id)
    }

    @HttpCode(204)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.data.delete('webinar_speakers', id)
    }
}
