import { Injectable } from '@angular/core';
import { AppFormField, DropdownAdditionalField, DropdownField, DropdownFormField } from '@openchannel/angular-common-components';

export type PricingFormType = 'free' | 'single' | 'recurring';

export type PricingFormModel = {
    type: PricingFormType;
    trial: number;
    currency: 'USD' | string;
    price: number;
    billingPeriod: 'daily' | 'weekly' | 'monthly' | 'annually';
    billingPeriodUnit: number;
    license: string;
    commission: number;
};

export interface PricingFormConfig {
    /**
     * Will inject pricing form to your App on the create app page
     */
    enablePricingForm: boolean;
    /**
     * false - single pricing form.<br>
     * true - multi pricing form as DFA array.
     */
    enableMultiPricingForms: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class PricingFormService {
    private readonly GROUP_ID = 'model';
    constructor() {}

    setCanModelBeChanged(canModelBeChanged: boolean): void {
        this.dropdownValueFilterFunc = () => canModelBeChanged;
    }

    createFieldsByData(isFormGroup: boolean, enableMultiPricingForms: boolean, oldPricingData: PricingFormModel[]): AppFormField[] {
        if (isFormGroup) {
            return [this.createPricingLabel(), this.createForm(oldPricingData, enableMultiPricingForms)];
        } else {
            return [this.createForm(oldPricingData, enableMultiPricingForms)];
        }
    }

    private createForm(oldPricingData: PricingFormModel[], enableMultiPricingForms: boolean): AppFormField {
        const dropdownField = this.createTypeField();
        const dropdownForms: { [formId in PricingFormType]: AppFormField[] } = {
            free: this.createFreeForm(),
            single: this.createSingleForm(),
            recurring: this.createRecurringForm(),
        };

        const formField: DropdownFormField = {
            id: 'pricingForm',
            type: 'dropdownForm',
            attributes: {
                dropdownSettings: {
                    dropdownValueFilter: () => this.dropdownValueFilterFunc(),
                    dropdownField,
                    dropdownForms,
                },
            },
        };

        return {
            id: 'model',
            type: 'dynamicFieldArray',
            defaultValue: (oldPricingData?.length > 0 ? oldPricingData : [{} as any]).map(pricingForm => ({ pricingForm })),
            fields: [formField],
            attributes: {
                ordering: 'append',
                onlyFirstDfaItem: !enableMultiPricingForms,
                group: this.GROUP_ID,
            },
        };
    }

    // Function to pass to the formField while creating form, so we can change it later easily
    // by reference
    private dropdownValueFilterFunc(): boolean {
        return false;
    }

    private createFreeForm(): AppFormField[] {
        return [];
    }

    private createSingleForm(): AppFormField[] {
        return [this.createMultiPricingField(), this.createPriceField(), this.createTrialField()];
    }

    private createRecurringForm(): AppFormField[] {
        return [
            this.createMultiPricingField(),
            this.createPriceField(),
            this.createTrialField(),
            this.createBillingPeriodField(),
            this.createBillingPeriodUnitField(),
        ];
    }

    private createPricingLabel(): AppFormField {
        return {
            id: this.GROUP_ID,
            type: 'fieldGroup',
            label: 'Plans & Pricing',
        };
    }

    private createTrialField(): AppFormField {
        return {
            id: 'trial',
            label: 'Trial period (in days)',
            type: 'number',
            attributes: {
                min: 0,
            },
        };
    }

    private createMultiPricingField(): DropdownAdditionalField {
        const options = ['USD'];
        return {
            id: 'currency',
            label: 'Pricing',
            type: 'dropdownList',
            defaultValue: 'USD',
            options,
            attributes: {
                subType: 'additionalField',
                subTypeSettings: {
                    additionalFieldId: 'price',
                    additionalFieldAttributesByDropdownValue: {},
                },
            },
        };
    }

    private createPriceField(): AppFormField {
        return {
            id: 'price',
            label: 'Pricing',
            type: 'number',
            attributes: {
                formHideRow: true,
                min: 0,
            },
        };
    }

    private createBillingPeriodField(): AppFormField {
        const options = ['daily', 'weekly', 'monthly', 'annually'];
        return {
            id: 'billingPeriod',
            label: 'Billing period',
            type: 'dropdownList',
            defaultValue: 'daily',
            options,
            attributes: {
                transformText: 'titleCase',
            },
        };
    }

    private createBillingPeriodUnitField(): AppFormField {
        return {
            id: 'billingPeriodUnit',
            label: 'Billing period unit',
            type: 'number',
            attributes: {
                min: 0,
            },
        };
    }

    private createTypeField(): DropdownField {
        const options = ['free', 'single', 'recurring'];
        return {
            id: 'type',
            label: 'Type',
            type: 'dropdownList',
            defaultValue: 'free',
            options,
            attributes: {
                required: true,
                transformText: 'titleCase',
            },
        };
    }
}
