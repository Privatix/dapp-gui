export interface PaginatedResponse<T> {
    items: T;
    totalItems: number;
}

export interface GetClientOfferingsFilterParamsResponse {
    countries: string[];
    minPrice: number;
    maxPrice: number;
}
