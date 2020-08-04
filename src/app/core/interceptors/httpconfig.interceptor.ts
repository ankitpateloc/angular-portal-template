import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { NotificationService } from 'src/app/shared/custom-components/notification/notification.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { Router } from '@angular/router';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
    constructor(private notificationService: NotificationService, private loaderService: LoaderService, private router: Router) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token: string = localStorage.getItem('access_token');

        if (token && !request.url.endsWith('oauth/token')) {
            request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + token) });
        }
        request = request.clone({ headers: request.headers.set('Accept', 'application/json') });
        if (request.headers.get('x-loader')) {
            if (request.headers.get('x-loader') === 'true') {
                this.loaderService.showLoader(request.url);
            }
            request = request.clone({ headers: request.headers.delete('x-loader') });
        }

        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    this.loaderService.closeLoader(event.url);
                }
                return event;
            }),
            catchError((response: HttpErrorResponse) => {
                this.loaderService.closeLoader(response.url);
                if (response.status==401) {
                    this.router.navigate(['/login']);   
                    localStorage.clear();    
                }
                if (response.status == 403) {
                    this.notificationService.showError([{ error: '403 Forbidden: Access is denied' }]);
                } else if (response.error && response.error['validation-errors']) {
                    this.notificationService.showError(response.error['validation-errors']);
                } else if (response.error.error_description) {
                    this.notificationService.showError([{ error: response.error.error_description }]);
                } else if (response.error.message) {
                    this.notificationService.showError([{ error: response.error.message }]);
                } else {
                    this.notificationService.showError([{ error: JSON.stringify(response.error) }]);
                }
                return throwError(response);
            }));
    }
}
