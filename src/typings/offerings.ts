import { PaginatedResponse } from 'typings/paginatedResponse';

export enum BillType {
    prepaid = 'prepaid', postpaid = 'postpaid'
}

export type OfferStatus = '' | 'registering' | 'registered' | 'popping_up' | 'popped_up' | 'removing' | 'removed';

export enum UnitType {
    units = 'units', seconds = 'seconds'
}

export interface Offering {
    id: string;
    isLocal: boolean;
    template: string;
    product: string;
    hash: string;
    status: OfferStatus;
    blockNumberUpdated: number;
    agent: string;
    rawMsg: string;
    serviceName: string;
    description: string;
    country: string;
    ipType: string;
    supply: number;
    currentSupply: number;
    unitName: string;
    unitType: UnitType;
    billingType: BillType;
    setupPrice: number;
    unitPrice: number;
    minUnits: number;
    maxUnit: number;
    billingInterval: number;
    maxBillingUnitLag: number;
    maxSuspendTime: number;
    maxInactiveTimeSec: number;
    freeUnits: number;
    additionalParams: string;
    autoPopUp: boolean;
}

export interface ResolvedOffering extends Offering {
    productName: string;
}

export type OfferingAvailabilityResponse = {
    [key: string]: boolean;
};

export type ClientOfferingItem = {offering: Offering, rating: number};
export type AgentOfferingResponse = PaginatedResponse<Offering[]>;
export type ClientOfferingResponse = PaginatedResponse<ClientOfferingItem[]>;
