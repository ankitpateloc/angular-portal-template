import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AppsServiceImpl} from '../../../../core/services/apps-services/model/apps-service-impl';
import {FieldDefinition} from '../../../../core/services/apps-services/model/apps-model';
import {GraphqlService} from '../../../../graphql-client/graphql-service/graphql.service';

@Component({
    selector: 'app-create-app',
    templateUrl: './create-app.component.html',
    styleUrls: ['./create-app.component.scss']
})
export class CreateAppComponent implements OnInit, OnDestroy {

    appActions = [{
        type: 'SEARCH',
        description: 'Developer ID : '
    }, {
        type: 'CREATE',
        description: 'Create new Developer with ID : '
    }];

    currentAppAction = this.appActions[0];
    currentAppsTypesItems: string [] = [];
    existsAppsTypes: string [] = [];

    appDataFormGroup: FormGroup;
    appFields: {
        fields: FieldDefinition []
    };

    subscriptions: Subscription [] = [];

    constructor(private appsService: AppsServiceImpl,
                private fb: FormBuilder,
                private graphqlService: GraphqlService) {
    }

    ngOnInit(): void {
        this.initAppDataGroup();
        this.addListenerAppTypeField();
        this.getAllAppTypes();
    }

    initAppDataGroup(): void {
        this.appDataFormGroup = this.fb.group({
            appId: ['', Validators.required],
            appType: ['', Validators.required]
        });
    }

    customSearch = (text$: Observable<string>) =>
        text$.pipe(debounceTime(200), distinctUntilChanged(), switchMap(termDeveloperId =>
            this.graphqlService.getDevelopers(termDeveloperId, 1, 20).toPromise().then((developersResponse: any) => {
                const developers = developersResponse?.data?.getDevelopers?.list;
                if (developers?.length === 0) {
                    const normalizedDeveloperId = termDeveloperId.trim();
                    if (normalizedDeveloperId.length > 0) {
                        this.currentAppAction = this.appActions.find((e) => e.type === 'CREATE');
                        return [normalizedDeveloperId];
                    }
                } else {
                    this.currentAppAction = this.appActions.find((e) => e.type === 'SEARCH');
                    if (developers) {
                        return developers.map(developer => developer.developerId);
                    } else {
                        return [];
                    }
                }
            }).catch(error => {
                console.error('Can\'t get developers id' + JSON.stringify(error));
                return [];
            })
        ));

    private addListenerAppTypeField(): void {
        this.subscriptions.push(this.appDataFormGroup.get('appType').valueChanges
            .pipe(debounceTime(200), distinctUntilChanged())
            .subscribe(appType => {
                if (appType) {
                    this.getFieldsByAppType(appType);
                } else {
                    this.appFields = null;
                }
            }, () => this.appFields = null));
    }

    private getAllAppTypes(): void {
        this.currentAppsTypesItems = [];
        this.existsAppsTypes = [];
        this.subscriptions.push(this.graphqlService.getAppTypes(1, 100, true)
            .subscribe((appResponse: any) => {
                const appTypes = appResponse?.data?.getAppTypes?.list;
                if (appTypes && appTypes.length > 0) {
                    this.existsAppsTypes = appTypes;
                    this.currentAppsTypesItems = appTypes.map(app => app.id).filter(app => app && app.length > 0);
                }
            }, (error) => {
                console.error('Can\'t get all Apps : ' + JSON.stringify(error));
            }));
    }

    private getFieldsByAppType(appType: string) {
        this.appFields = null;
        this.subscriptions.push(this.graphqlService.getAppType(appType)
            .subscribe((appTypeResponse: any) => {
                const fieldDefinitions = appTypeResponse?.data?.getAppType?.fieldDefinitions;
                if (fieldDefinitions && fieldDefinitions.length > 0) {
                    this.appFields = {
                        fields: fieldDefinitions
                    };
                }
            }, (error => {
                console.error('ERROR getFieldsByAppType : ' + JSON.stringify(error));
            })));
    }

    saveApp(fields: any) {
        // todo data for saving (appDataGroup.value, fields)
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
