import { Request } from "express";

export interface IApiResponse<T> {
    data: T | null;
    message: string;
}

export interface DataContainedInToken {
    id: string;
}
export interface AuthorizedRequest extends Request {
    jwtDecodedUser: DataContainedInToken;
}