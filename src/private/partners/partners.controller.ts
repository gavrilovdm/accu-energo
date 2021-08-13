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
@Controller('private/partners')
export class PartnersController {
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
        if (files) return await this.data.saveFilesArray('partners', 'img', id, files)
        throw new HttpException(null, 400)
    }

    // files end

    @HttpCode(200)
    @Get()
    async get(@Req() req: Request) {
        if (req.query.$filter !== undefined) return await this.data.getByQuery('partners', req.query.$filter)
        else return await this.data.get('partners')
    }

    @HttpCode(200)
    @Get(':id')
    async getById(@Param('id') id: string) {
        return await this.data.getById('partners', id)
    }

    @HttpCode(201)
    @Post()
    async create(
        @Body() data) {
        return await this.data.create(data, 'partners')
    }

    @HttpCode(204)
    @Put(':id')
    async update(
        @Body() data,
        @Param('id') id: string) {
        return await this.data.update(data, 'partners', id)
    }

    @HttpCode(204)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.data.delete('partners', id)
    }
}
