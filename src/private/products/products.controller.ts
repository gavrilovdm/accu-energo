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
@Controller('private/products')
export class ProductsController {
    constructor(
        private data: DataService
    ) {
    }

    // accumulators
    @HttpCode(201)
    @Post('accumulators/:id')
    @UseInterceptors(FilesInterceptor('files'))
    async accumulatorUploadFiles(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() data,
        @Param('id') id: string) {
        if (files) return await this.data.saveFiles('p_accumulators', 'pdf', id, files)
        throw new HttpException(null, 400)
    }

    @HttpCode(204)
    @Delete('accumulators/files/:data')
    async delete(
        @Param('data') data: string
    ) {
        return await this.data.deleteFile('p_accumulators', data)
    }

    @HttpCode(200)
    @Get('accumulators')
    async getAccumulators(@Req() req: Request) {
        if (req.query.$filter !== undefined) return await this.data.getAccumulatorsByQuery('p_accumulators', req.query.$filter)
        else return await this.data.getAll('p_accumulators')
    }

    @HttpCode(200)
    @Get('accumulators/:id')
    async getAccumulatorById(@Param('id') id: string) {
        return await this.data.getOneById('p_accumulators', id)
    }

    @HttpCode(201)
    @Post('accumulators')
    async createAccumulator() {
        return await this.data.createNew('p_accumulators')
    }

    @HttpCode(204)
    @Put('accumulators/:id')
    async updateAccumulator(
        @Body() data,
        @Param('id') id: string) {
        return await this.data.updateAccumulator(data, 'p_accumulators', id)
    }

    @HttpCode(204)
    @Delete('accumulators/:id')
    async deleteAccumulator(@Param('id') id: string) {
        return await this.data.deleteOne('p_accumulators', id)
    }


    // series
    @HttpCode(201)
    @Post('series/:id')
    @UseInterceptors(FilesInterceptor('files'))
    async seriesUploadFiles(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() data,
        @Param('id') id: string) {
        if (files) return await this.data.saveFiles('p_series', 'img', id, files)
        throw new HttpException(null, 400)
    }

    @HttpCode(204)
    @Delete('series/files/:data')
    async deleteSeriesFiles(
        @Param('data') data: string
    ) {
        return await this.data.deleteFile('p_series', data)
    }

    @HttpCode(200)
    @Get('series')
    async getSeries(@Req() req: Request) {
        if (req.query.$filter !== undefined) return await this.data.getByQuery('p_series', req.query.$filter)
        else return await this.data.getAll('p_series')
    }

    @HttpCode(200)
    @Get('series/:id')
    async getSeriesById(@Param('id') id: string) {
        return await this.data.getOneById('p_series', id)
    }

    @HttpCode(201)
    @Post('series')
    async createSeries() {
        return await this.data.createNew('p_series')
    }

    @HttpCode(204)
    @Put('series/:id')
    async updateSeries(
        @Body() data,
        @Param('id') id: string) {
        return await this.data.updateSeries(data, 'p_series', id)
    }

    @HttpCode(204)
    @Delete('series/:id')
    async deleteSeries(@Param('id') id: string) {
        return await this.data.deleteOne('p_series', id)
    }

    // brands
    @HttpCode(201)
    @Post('brands/:id')
    @UseInterceptors(FilesInterceptor('files'))
    async brandsUploadFiles(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() data,
        @Param('id') id: string) {
        if (files) return await this.data.saveFiles('p_brands', 'img', id, files)
        throw new HttpException(null, 400)
    }

    @HttpCode(204)
    @Delete('brands/files/:data')
    async deleteBrandsFiles(
        @Param('data') data: string
    ) {
        return await this.data.deleteFile('p_brands', data)
    }

    @HttpCode(200)
    @Get('brands')
    async getBrands(@Req() req: Request) {
        if (req.query.$filter !== undefined) return await this.data.getByQuery('p_brands', req.query.$filter)
        else return await this.data.getAll('p_brands')
    }

    @HttpCode(200)
    @Get('brands/:id')
    async getBrandById(@Param('id') id: string) {
        return await this.data.getOneById('p_brands', id)
    }

    @HttpCode(201)
    @Post('brands')
    async createBrand() {
        return await this.data.createNew('p_brands')
    }

    @HttpCode(204)
    @Put('brands/:id')
    async updateBrand(
        @Body() data,
        @Param('id') id: string) {
        return await this.data.updateBrand(data, 'p_brands', id)
    }

    @HttpCode(204)
    @Delete('brands/:id')
    async deleteBrand(@Param('id') id: string) {
        return await this.data.deleteOne('p_brands', id)
    }
}
