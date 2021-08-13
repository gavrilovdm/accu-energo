import {Module} from '@nestjs/common'
import {ConfigModule} from '@nestjs/config'
import {AppController} from './app.controller'
import {AppService} from './app.service'
import {AuthModule} from './auth/auth.module'
import {NewsModule} from './private/news/news.module'
import {PartnersModule} from './private/partners/partners.module'
import {ProductsModule} from './private/products/products.module'
import {WebinarsModule} from './private/webinars/webinars.module'
import {WebinarSpeakersModule} from './private/webinar-speakers/webinar-speakers.module'
import {TeamModule} from './private/team/team.module'
import {OrdersModule} from './private/orders/orders.module'
import {ContentModule} from './public/content.module'

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        AuthModule,
        NewsModule,
        PartnersModule,
        ProductsModule,
        WebinarsModule,
        WebinarSpeakersModule,
        TeamModule,
        OrdersModule,
        ContentModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
