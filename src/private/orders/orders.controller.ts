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
@Controller('private/orders')
export class OrdersController {
    constructor(
        private data: DataService
    ) {
    }

    @HttpCode(200)
    @Get()
    async get(@Req() req: Request) {
        if (req.query.$filter !== undefined) return await this.data.getByQuery('orders', req.query.$filter)
        else return await this.data.get('orders')
    }

    @HttpCode(200)
    @Get(':id')
    async getById(@Param('id') id: string) {
        return await this.data.getById('orders', id)
    }

    @HttpCode(201)
    @Post()
    async create(
        @Body() data) {
        return await this.data.create(data, 'orders')
    }

    @HttpCode(204)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.data.delete('orders', id)
    }
}
