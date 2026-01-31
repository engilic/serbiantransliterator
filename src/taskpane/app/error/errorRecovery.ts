// src/taskpane/app/error/errorRecovery.ts
import { t } from "../../../shared/i18n";
import { setStatus } from "../status";
import { logger } from "../telemetry/logger"; // NEW

export interface ErrorContext {
    operation: string;
    details?: Record<string, unknown>;
    canRetry?: boolean;
}

export interface RecoveryStrategy {
    shouldRetry: boolean;
    retryDelay?: number;
    fallbackAction?: () => Promise<void>;
    userMessage?: string;
}

/**
 * Centralized error recovery handler with retry logic and user-friendly messages.
 */
export class ErrorRecoveryHandler {
    private retryCount = new Map<string, number>();
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAYS = [1000, 2000, 5000]; // Progressive backoff

    /**
     * Handle an error with appropriate recovery strategy.
     */
    public async handle(error: unknown, context: ErrorContext): Promise<RecoveryStrategy> {
        const errorInfo = this.extractErrorInfo(error);
        const strategy = this.determineStrategy(errorInfo, context);

        // Log for debugging (NEW: using logger)
        logger.error(`Error in ${context.operation}: ${errorInfo.message}`, { errorInfo, context });

        // Track retry attempts
        if (strategy.shouldRetry) {
            const key = `${context.operation}:${errorInfo.code}`;
            const count = (this.retryCount.get(key) || 0) + 1;
            this.retryCount.set(key, count);

            if (count > this.MAX_RETRIES) {
                strategy.shouldRetry = false;
                strategy.userMessage = t("status_error_prefix", t("error_max_retries_exceeded"));
            }
        }

        // Apply recovery
        if (strategy.fallbackAction) {
            try {
                await strategy.fallbackAction();
            } catch (fallbackError) {
                logger.error("Fallback action failed", fallbackError);
            }
        }

        // Update UI
        if (strategy.userMessage) {
            setStatus(strategy.userMessage, "error");
        }

        return strategy;
    }

    /**
     * Reset retry count for an operation.
     */
    public resetRetries(operation: string): void {
        // Clear all retry counts for this operation
        for (const key of this.retryCount.keys()) {
            if (key.startsWith(operation + ":")) {
                this.retryCount.delete(key);
            }
        }
    }

    private extractErrorInfo(error: unknown): ErrorInfo {
        if (error instanceof Error) {
            const message = error.message;

            // Check for specific error patterns
            if (message.includes("InvalidBinding")) {
                return { code: "INVALID_BINDING", message, isRecoverable: true };
            }
            if (message.includes("NetworkError") || message.includes("fetch")) {
                return { code: "NETWORK_ERROR", message, isRecoverable: true };
            }
            if (message.includes("OutOfMemory") || message.includes("too large")) {
                return { code: "OUT_OF_MEMORY", message, isRecoverable: false };
            }
            if (message.includes("RichApi.Error") || message.includes("GeneralException")) {
                return { code: "OFFICE_API_ERROR", message, isRecoverable: true };
            }
            if (message.includes("ItemNotFound")) {
                return { code: "ITEM_NOT_FOUND", message, isRecoverable: false };
            }

            return { code: "UNKNOWN_ERROR", message, isRecoverable: false };
        }

        return {
            code: "UNKNOWN_ERROR",
            message: String(error),
            isRecoverable: false,
        };
    }

    private determineStrategy(errorInfo: ErrorInfo, context: ErrorContext): RecoveryStrategy {
        // Network errors - always retry
        if (errorInfo.code === "NETWORK_ERROR") {
            return {
                shouldRetry: true,
                retryDelay: this.getRetryDelay(context.operation, errorInfo.code),
                userMessage: t("error_network_retrying"),
            };
        }

        // Office API errors - retry with backoff
        if (errorInfo.code === "OFFICE_API_ERROR" || errorInfo.code === "INVALID_BINDING") {
            return {
                shouldRetry: context.canRetry !== false,
                retryDelay: this.getRetryDelay(context.operation, errorInfo.code),
                fallbackAction: async () => {
                    // Force a context sync to recover binding
                    try {
                        await Word.run(async (ctx) => {
                            await ctx.sync();
                        });
                    } catch {
                        // Ignore sync errors
                    }
                },
                userMessage: t("error_word_api_retrying"),
            };
        }

        // Out of memory - suggest splitting document
        if (errorInfo.code === "OUT_OF_MEMORY") {
            return {
                shouldRetry: false,
                userMessage: t("error_out_of_memory_split_document"),
                fallbackAction: async () => {
                    logger.info("Suggested: Split document into smaller parts");
                },
            };
        }

        // Item not found - can't retry
        if (errorInfo.code === "ITEM_NOT_FOUND") {
            return {
                shouldRetry: false,
                userMessage: t("error_selection_lost"),
            };
        }

        // Unknown errors - don't retry
        return {
            shouldRetry: false,
            userMessage: t("status_error_prefix", errorInfo.message),
        };
    }

    private getRetryDelay(operation: string, errorCode: string): number {
        const key = `${operation}:${errorCode}`;
        const count = this.retryCount.get(key) || 0;
        return this.RETRY_DELAYS[Math.min(count, this.RETRY_DELAYS.length - 1)] || 5000;
    }
}

interface ErrorInfo {
    code: string;
    message: string;
    isRecoverable: boolean;
}

// Singleton instance
export const errorRecovery = new ErrorRecoveryHandler();

// Helper function for retry logic
export async function withRetry<T>(operation: string, fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: unknown;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            const result = await fn();

            // Success - reset retry counter
            errorRecovery.resetRetries(operation);

            return result;
        } catch (error) {
            lastError = error;

            if (i === maxRetries) {
                throw error;
            }

            const strategy = await errorRecovery.handle(error, {
                operation,
                canRetry: i < maxRetries,
            });

            if (!strategy.shouldRetry) {
                throw error;
            }

            if (strategy.retryDelay) {
                await new Promise((resolve) => setTimeout(resolve, strategy.retryDelay));
            }
        }
    }

    throw lastError;
}
