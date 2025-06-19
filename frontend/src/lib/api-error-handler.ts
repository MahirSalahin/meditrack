import { toast } from "sonner"
import { AxiosError } from "axios"

// Error types for consistent handling
export enum ErrorType {
    VALIDATION = "validation",
    UNAUTHORIZED = "unauthorized",
    FORBIDDEN = "forbidden",
    NOT_FOUND = "not_found",
    SERVER_ERROR = "server_error",
    NETWORK_ERROR = "network_error",
    UNKNOWN = "unknown"
}

// Error interface
export interface ApiError {
    type: ErrorType
    message: string
    details?: string
    statusCode?: number
}

// API Error Response interface
interface ApiErrorResponse extends Record<string, unknown> {
    detail?: string
    message?: string
    errors?: Record<string, string[]>
}

// Parse error from axios response
export const parseApiError = (error: AxiosError<ApiErrorResponse> | Error): ApiError => {
    if ('response' in error && error.response) {
        const { status, data } = error.response

        console.log("API Error", status, data)

        switch (status) {
            case 400:
                return {
                    type: ErrorType.VALIDATION,
                    message: "Invalid request data",
                    details: data?.detail,
                    statusCode: status
                }
            case 401:
                return {
                    type: ErrorType.UNAUTHORIZED,
                    message: "Authentication required",
                    details: data?.detail,
                    statusCode: status
                }
            case 403:
                return {
                    type: ErrorType.FORBIDDEN,
                    message: "Access denied",
                    details: data?.message,
                    statusCode: status
                }
            case 404:
                return {
                    type: ErrorType.NOT_FOUND,
                    message: "Resource not found",
                    details: data?.detail,
                    statusCode: status
                }
            case 422:
                return {
                    type: ErrorType.VALIDATION,
                    message: "Validation failed",
                    details: data?.detail,
                    statusCode: status
                }
            case 500:
                return {
                    type: ErrorType.SERVER_ERROR,
                    message: "Internal server error",
                    details: data?.detail,
                    statusCode: status
                }
            default:
                return {
                    type: ErrorType.UNKNOWN,
                    message: "An unexpected error occurred",
                    details: data?.detail,
                    statusCode: status
                }
        }
    }

    if ('request' in error && error.request) {
        return {
            type: ErrorType.NETWORK_ERROR,
            message: "Network error. Please check your connection.",
        }
    }

    return {
        type: ErrorType.UNKNOWN,
        message: error.message || "An unexpected error occurred"
    }
}

// Handle API error with toast notification
export const handleApiErrorWithToast = (error: AxiosError<ApiErrorResponse> | Error, customMessage?: { title?: string, description?: string }) => {
    const apiError = parseApiError(error)

    const title = customMessage?.title ?? apiError.message ?? "Error"
    const description = customMessage?.description ?? apiError.details ?? "Please try again later or contact support."

    toast.error(title, { description })

    return apiError
}

// Handle API error without toast (for custom handling)
export const handleApiErrorSilent = (error: AxiosError<ApiErrorResponse> | Error): ApiError => {
    return parseApiError(error)
}

// Success toast helper
export const showSuccessToast = (message: string, description?: string) => {
    toast.success(message, {
        description
    })
}

// Info toast helper
export const showInfoToast = (message: string, description?: string) => {
    toast.info(message, {
        description
    })
}

// Warning toast helper
export const showWarningToast = (message: string, description?: string) => {
    toast.warning(message, {
        description
    })
} 