/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResetPasswordParams } from '../models/ResetPasswordParams';
import type { UserResponse } from '../models/UserResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ControllersAdminService {
    /**
     * @returns UserResponse List users
     * @throws ApiError
     */
    public static listUsers(): CancelablePromise<Array<UserResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/users',
            errors: {
                403: `Unauthorized`,
            },
        });
    }
    /**
     * @param id User PID
     * @returns UserResponse Get user
     * @throws ApiError
     */
    public static getUser(
        id: string,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Unauthorized`,
                404: `User not found`,
            },
        });
    }
    /**
     * @param id User PID
     * @returns any User deleted
     * @throws ApiError
     */
    public static deleteUser(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/admin/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Unauthorized`,
                404: `User not found`,
            },
        });
    }
    /**
     * @param id User PID
     * @returns any User demoted
     * @throws ApiError
     */
    public static demote(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/users/{id}/demote',
            path: {
                'id': id,
            },
            errors: {
                403: `Unauthorized`,
                404: `User not found`,
            },
        });
    }
    /**
     * @param id User PID
     * @returns any User promoted
     * @throws ApiError
     */
    public static promote(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/users/{id}/promote',
            path: {
                'id': id,
            },
            errors: {
                403: `Unauthorized`,
                404: `User not found`,
            },
        });
    }
    /**
     * @param id User PID
     * @param requestBody
     * @returns any Password reset
     * @throws ApiError
     */
    public static resetPassword(
        id: string,
        requestBody: ResetPasswordParams,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/users/{id}/reset_password',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Unauthorized`,
                404: `User not found`,
            },
        });
    }
}
