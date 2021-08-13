import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common'
import { Request, Response } from 'express';

@Catch(UnauthorizedException)
export class Unauthorized implements ExceptionFilter {
    catch(
        _exception: UnauthorizedException,
        host: ArgumentsHost,
    ) {
        console.log('unauthorized exception')
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()

        response.redirect('https://google.com')
    }
}

// @Catch(NotFoundException)
// export class NotFoundExceptionFilter implements ExceptionFilter {
//     catch(exception: HttpException, host: ArgumentsHost) {
//         const ctx = host.switchToHttp();
//         // const response = ctx.getResponse<Response>();
//         const request = ctx.getRequest<Request>();
//         const status = exception.getStatus();
//
//         console.log('hello')
//
//         // response
//         //     .status(status)
//         //     .json({
//         //         statusCode: status,
//         //         timestamp: new Date().toISOString(),
//         //         path: request.url,
//         //     });
//
//         const response = host.switchToHttp().getResponse();
//         response.status(404).json({ message: 'aaaaaaa' });
//     }
// }
