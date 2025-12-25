import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class StandardResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((responseData) => {
        // If responseData is an object with data property, treat as wrapper
        if (
          responseData &&
          typeof responseData === 'object' &&
          'data' in responseData
        ) {
          const wrapper = responseData as any;
          return {
            success: true,
            data: wrapper.data,
            ...(wrapper.meta !== undefined && { meta: wrapper.meta }),
          };
        }
        // Raw response data
        return {
          success: true,
          data: responseData,
        };
      }),
    );
  }
}
