export interface PaginatedResponse<T> {
    items: T;
    totalItems: number;
}

export interface AnotherPaginatedResponse<T> {
    items: T;
    TotalItems: number;
}
export interface GetClientOfferingsFilterParamsResponse {
    countries: string[];
    minPrice: number;
    maxPrice: number;
    maxRating: number;
}
