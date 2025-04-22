export interface IApiResponse<T> {
    data: T | null;
    message: string;
}