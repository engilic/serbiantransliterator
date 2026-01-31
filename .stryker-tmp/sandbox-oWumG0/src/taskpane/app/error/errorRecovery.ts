// @ts-nocheck
// src/taskpane/app/error/errorRecovery.ts
function stryNS_9fa48() {
    var g =
        (typeof globalThis === "object" && globalThis && globalThis.Math === Math && globalThis) ||
        new Function("return this")();
    var ns = g.__stryker__ || (g.__stryker__ = {});
    if (
        ns.activeMutant === undefined &&
        g.process &&
        g.process.env &&
        g.process.env.__STRYKER_ACTIVE_MUTANT__
    ) {
        ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
    }
    function retrieveNS() {
        return ns;
    }
    stryNS_9fa48 = retrieveNS;
    return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
    var ns = stryNS_9fa48();
    var cov =
        ns.mutantCoverage ||
        (ns.mutantCoverage = {
            static: {},
            perTest: {},
        });
    function cover() {
        var c = cov.static;
        if (ns.currentTestId) {
            c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
        }
        var a = arguments;
        for (var i = 0; i < a.length; i++) {
            c[a[i]] = (c[a[i]] || 0) + 1;
        }
    }
    stryCov_9fa48 = cover;
    cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
    var ns = stryNS_9fa48();
    function isActive(id) {
        if (ns.activeMutant === id) {
            if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
                throw new Error("Stryker: Hit count limit reached (" + ns.hitCount + ")");
            }
            return true;
        }
        return false;
    }
    stryMutAct_9fa48 = isActive;
    return isActive(id);
}
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
    private readonly RETRY_DELAYS = stryMutAct_9fa48("4773")
        ? []
        : (stryCov_9fa48("4773"), [1000, 2000, 5000]); // Progressive backoff

    /**
     * Handle an error with appropriate recovery strategy.
     */
    public async handle(error: unknown, context: ErrorContext): Promise<RecoveryStrategy> {
        if (stryMutAct_9fa48("4774")) {
            {
            }
        } else {
            stryCov_9fa48("4774");
            const errorInfo = this.extractErrorInfo(error);
            const strategy = this.determineStrategy(errorInfo, context);

            // Log for debugging (NEW: using logger)
            logger.error(
                stryMutAct_9fa48("4775")
                    ? ``
                    : (stryCov_9fa48("4775"), `Error in ${context.operation}: ${errorInfo.message}`),
                stryMutAct_9fa48("4776")
                    ? {}
                    : (stryCov_9fa48("4776"),
                      {
                          errorInfo,
                          context,
                      })
            );

            // Track retry attempts
            if (
                stryMutAct_9fa48("4778")
                    ? false
                    : stryMutAct_9fa48("4777")
                      ? true
                      : (stryCov_9fa48("4777", "4778"), strategy.shouldRetry)
            ) {
                if (stryMutAct_9fa48("4779")) {
                    {
                    }
                } else {
                    stryCov_9fa48("4779");
                    const key = stryMutAct_9fa48("4780")
                        ? ``
                        : (stryCov_9fa48("4780"), `${context.operation}:${errorInfo.code}`);
                    const count = stryMutAct_9fa48("4781")
                        ? (this.retryCount.get(key) || 0) - 1
                        : (stryCov_9fa48("4781"),
                          (stryMutAct_9fa48("4784")
                              ? this.retryCount.get(key) && 0
                              : stryMutAct_9fa48("4783")
                                ? false
                                : stryMutAct_9fa48("4782")
                                  ? true
                                  : (stryCov_9fa48("4782", "4783", "4784"), this.retryCount.get(key) || 0)) +
                              1);
                    this.retryCount.set(key, count);
                    if (
                        stryMutAct_9fa48("4788")
                            ? count <= this.MAX_RETRIES
                            : stryMutAct_9fa48("4787")
                              ? count >= this.MAX_RETRIES
                              : stryMutAct_9fa48("4786")
                                ? false
                                : stryMutAct_9fa48("4785")
                                  ? true
                                  : (stryCov_9fa48("4785", "4786", "4787", "4788"), count > this.MAX_RETRIES)
                    ) {
                        if (stryMutAct_9fa48("4789")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("4789");
                            strategy.shouldRetry = stryMutAct_9fa48("4790")
                                ? true
                                : (stryCov_9fa48("4790"), false);
                            strategy.userMessage = t(
                                stryMutAct_9fa48("4791")
                                    ? ""
                                    : (stryCov_9fa48("4791"), "status_error_prefix"),
                                t(
                                    stryMutAct_9fa48("4792")
                                        ? ""
                                        : (stryCov_9fa48("4792"), "error_max_retries_exceeded")
                                )
                            );
                        }
                    }
                }
            }

            // Apply recovery
            if (
                stryMutAct_9fa48("4794")
                    ? false
                    : stryMutAct_9fa48("4793")
                      ? true
                      : (stryCov_9fa48("4793", "4794"), strategy.fallbackAction)
            ) {
                if (stryMutAct_9fa48("4795")) {
                    {
                    }
                } else {
                    stryCov_9fa48("4795");
                    try {
                        if (stryMutAct_9fa48("4796")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("4796");
                            await strategy.fallbackAction();
                        }
                    } catch (fallbackError) {
                        if (stryMutAct_9fa48("4797")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("4797");
                            logger.error(
                                stryMutAct_9fa48("4798")
                                    ? ""
                                    : (stryCov_9fa48("4798"), "Fallback action failed"),
                                fallbackError
                            );
                        }
                    }
                }
            }

            // Update UI
            if (
                stryMutAct_9fa48("4800")
                    ? false
                    : stryMutAct_9fa48("4799")
                      ? true
                      : (stryCov_9fa48("4799", "4800"), strategy.userMessage)
            ) {
                if (stryMutAct_9fa48("4801")) {
                    {
                    }
                } else {
                    stryCov_9fa48("4801");
                    setStatus(
                        strategy.userMessage,
                        stryMutAct_9fa48("4802") ? "" : (stryCov_9fa48("4802"), "error")
                    );
                }
            }
            return strategy;
        }
    }

    /**
     * Reset retry count for an operation.
     */
    public resetRetries(operation: string): void {
        if (stryMutAct_9fa48("4803")) {
            {
            }
        } else {
            stryCov_9fa48("4803");
            // Clear all retry counts for this operation
            for (const key of this.retryCount.keys()) {
                if (stryMutAct_9fa48("4804")) {
                    {
                    }
                } else {
                    stryCov_9fa48("4804");
                    if (
                        stryMutAct_9fa48("4807")
                            ? key.endsWith(operation + ":")
                            : stryMutAct_9fa48("4806")
                              ? false
                              : stryMutAct_9fa48("4805")
                                ? true
                                : (stryCov_9fa48("4805", "4806", "4807"),
                                  key.startsWith(
                                      operation +
                                          (stryMutAct_9fa48("4808") ? "" : (stryCov_9fa48("4808"), ":"))
                                  ))
                    ) {
                        if (stryMutAct_9fa48("4809")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("4809");
                            this.retryCount.delete(key);
                        }
                    }
                }
            }
        }
    }
    private extractErrorInfo(error: unknown): ErrorInfo {
        if (stryMutAct_9fa48("4810")) {
            {
            }
        } else {
            stryCov_9fa48("4810");
            if (
                stryMutAct_9fa48("4812")
                    ? false
                    : stryMutAct_9fa48("4811")
                      ? true
                      : (stryCov_9fa48("4811", "4812"), error instanceof Error)
            ) {
                if (stryMutAct_9fa48("4813")) {
                    {
                    }
                } else {
                    stryCov_9fa48("4813");
                    const message = error.message;

                    // Check for specific error patterns
                    if (
                        stryMutAct_9fa48("4815")
                            ? false
                            : stryMutAct_9fa48("4814")
                              ? true
                              : (stryCov_9fa48("4814", "4815"),
                                message.includes(
                                    stryMutAct_9fa48("4816") ? "" : (stryCov_9fa48("4816"), "InvalidBinding")
                                ))
                    ) {
                        if (stryMutAct_9fa48("4817")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("4817");
                            return stryMutAct_9fa48("4818")
                                ? {}
                                : (stryCov_9fa48("4818"),
                                  {
                                      code: stryMutAct_9fa48("4819")
                                          ? ""
                                          : (stryCov_9fa48("4819"), "INVALID_BINDING"),
                                      message,
                                      isRecoverable: stryMutAct_9fa48("4820")
                                          ? false
                                          : (stryCov_9fa48("4820"), true),
                                  });
                        }
                    }
                    if (
                        stryMutAct_9fa48("4823")
                            ? message.includes("NetworkError") && message.includes("fetch")
                            : stryMutAct_9fa48("4822")
                              ? false
                              : stryMutAct_9fa48("4821")
                                ? true
                                : (stryCov_9fa48("4821", "4822", "4823"),
                                  message.includes(
                                      stryMutAct_9fa48("4824") ? "" : (stryCov_9fa48("4824"), "NetworkError")
                                  ) ||
                                      message.includes(
                                          stryMutAct_9fa48("4825") ? "" : (stryCov_9fa48("4825"), "fetch")
                                      ))
                    ) {
                        if (stryMutAct_9fa48("4826")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("4826");
                            return stryMutAct_9fa48("4827")
                                ? {}
                                : (stryCov_9fa48("4827"),
                                  {
                                      code: stryMutAct_9fa48("4828")
                                          ? ""
                                          : (stryCov_9fa48("4828"), "NETWORK_ERROR"),
                                      message,
                                      isRecoverable: stryMutAct_9fa48("4829")
                                          ? false
                                          : (stryCov_9fa48("4829"), true),
                                  });
                        }
                    }
                    if (
                        stryMutAct_9fa48("4832")
                            ? message.includes("OutOfMemory") && message.includes("too large")
                            : stryMutAct_9fa48("4831")
                              ? false
                              : stryMutAct_9fa48("4830")
                                ? true
                                : (stryCov_9fa48("4830", "4831", "4832"),
                                  message.includes(
                                      stryMutAct_9fa48("4833") ? "" : (stryCov_9fa48("4833"), "OutOfMemory")
                                  ) ||
                                      message.includes(
                                          stryMutAct_9fa48("4834") ? "" : (stryCov_9fa48("4834"), "too large")
                                      ))
                    ) {
                        if (stryMutAct_9fa48("4835")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("4835");
                            return stryMutAct_9fa48("4836")
                                ? {}
                                : (stryCov_9fa48("4836"),
                                  {
                                      code: stryMutAct_9fa48("4837")
                                          ? ""
                                          : (stryCov_9fa48("4837"), "OUT_OF_MEMORY"),
                                      message,
                                      isRecoverable: stryMutAct_9fa48("4838")
                                          ? true
                                          : (stryCov_9fa48("4838"), false),
                                  });
                        }
                    }
                    if (
                        stryMutAct_9fa48("4841")
                            ? message.includes("RichApi.Error") && message.includes("GeneralException")
                            : stryMutAct_9fa48("4840")
                              ? false
                              : stryMutAct_9fa48("4839")
                                ? true
                                : (stryCov_9fa48("4839", "4840", "4841"),
                                  message.includes(
                                      stryMutAct_9fa48("4842") ? "" : (stryCov_9fa48("4842"), "RichApi.Error")
                                  ) ||
                                      message.includes(
                                          stryMutAct_9fa48("4843")
                                              ? ""
                                              : (stryCov_9fa48("4843"), "GeneralException")
                                      ))
                    ) {
                        if (stryMutAct_9fa48("4844")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("4844");
                            return stryMutAct_9fa48("4845")
                                ? {}
                                : (stryCov_9fa48("4845"),
                                  {
                                      code: stryMutAct_9fa48("4846")
                                          ? ""
                                          : (stryCov_9fa48("4846"), "OFFICE_API_ERROR"),
                                      message,
                                      isRecoverable: stryMutAct_9fa48("4847")
                                          ? false
                                          : (stryCov_9fa48("4847"), true),
                                  });
                        }
                    }
                    if (
                        stryMutAct_9fa48("4849")
                            ? false
                            : stryMutAct_9fa48("4848")
                              ? true
                              : (stryCov_9fa48("4848", "4849"),
                                message.includes(
                                    stryMutAct_9fa48("4850") ? "" : (stryCov_9fa48("4850"), "ItemNotFound")
                                ))
                    ) {
                        if (stryMutAct_9fa48("4851")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("4851");
                            return stryMutAct_9fa48("4852")
                                ? {}
                                : (stryCov_9fa48("4852"),
                                  {
                                      code: stryMutAct_9fa48("4853")
                                          ? ""
                                          : (stryCov_9fa48("4853"), "ITEM_NOT_FOUND"),
                                      message,
                                      isRecoverable: stryMutAct_9fa48("4854")
                                          ? true
                                          : (stryCov_9fa48("4854"), false),
                                  });
                        }
                    }
                    return stryMutAct_9fa48("4855")
                        ? {}
                        : (stryCov_9fa48("4855"),
                          {
                              code: stryMutAct_9fa48("4856") ? "" : (stryCov_9fa48("4856"), "UNKNOWN_ERROR"),
                              message,
                              isRecoverable: stryMutAct_9fa48("4857") ? true : (stryCov_9fa48("4857"), false),
                          });
                }
            }
            return stryMutAct_9fa48("4858")
                ? {}
                : (stryCov_9fa48("4858"),
                  {
                      code: stryMutAct_9fa48("4859") ? "" : (stryCov_9fa48("4859"), "UNKNOWN_ERROR"),
                      message: String(error),
                      isRecoverable: stryMutAct_9fa48("4860") ? true : (stryCov_9fa48("4860"), false),
                  });
        }
    }
    private determineStrategy(errorInfo: ErrorInfo, context: ErrorContext): RecoveryStrategy {
        if (stryMutAct_9fa48("4861")) {
            {
            }
        } else {
            stryCov_9fa48("4861");
            // Network errors - always retry
            if (
                stryMutAct_9fa48("4864")
                    ? errorInfo.code !== "NETWORK_ERROR"
                    : stryMutAct_9fa48("4863")
                      ? false
                      : stryMutAct_9fa48("4862")
                        ? true
                        : (stryCov_9fa48("4862", "4863", "4864"),
                          errorInfo.code ===
                              (stryMutAct_9fa48("4865") ? "" : (stryCov_9fa48("4865"), "NETWORK_ERROR")))
            ) {
                if (stryMutAct_9fa48("4866")) {
                    {
                    }
                } else {
                    stryCov_9fa48("4866");
                    return stryMutAct_9fa48("4867")
                        ? {}
                        : (stryCov_9fa48("4867"),
                          {
                              shouldRetry: stryMutAct_9fa48("4868") ? false : (stryCov_9fa48("4868"), true),
                              retryDelay: this.getRetryDelay(context.operation, errorInfo.code),
                              userMessage: t(
                                  stryMutAct_9fa48("4869")
                                      ? ""
                                      : (stryCov_9fa48("4869"), "error_network_retrying")
                              ),
                          });
                }
            }

            // Office API errors - retry with backoff
            if (
                stryMutAct_9fa48("4872")
                    ? errorInfo.code === "OFFICE_API_ERROR" && errorInfo.code === "INVALID_BINDING"
                    : stryMutAct_9fa48("4871")
                      ? false
                      : stryMutAct_9fa48("4870")
                        ? true
                        : (stryCov_9fa48("4870", "4871", "4872"),
                          (stryMutAct_9fa48("4874")
                              ? errorInfo.code !== "OFFICE_API_ERROR"
                              : stryMutAct_9fa48("4873")
                                ? false
                                : (stryCov_9fa48("4873", "4874"),
                                  errorInfo.code ===
                                      (stryMutAct_9fa48("4875")
                                          ? ""
                                          : (stryCov_9fa48("4875"), "OFFICE_API_ERROR")))) ||
                              (stryMutAct_9fa48("4877")
                                  ? errorInfo.code !== "INVALID_BINDING"
                                  : stryMutAct_9fa48("4876")
                                    ? false
                                    : (stryCov_9fa48("4876", "4877"),
                                      errorInfo.code ===
                                          (stryMutAct_9fa48("4878")
                                              ? ""
                                              : (stryCov_9fa48("4878"), "INVALID_BINDING")))))
            ) {
                if (stryMutAct_9fa48("4879")) {
                    {
                    }
                } else {
                    stryCov_9fa48("4879");
                    return stryMutAct_9fa48("4880")
                        ? {}
                        : (stryCov_9fa48("4880"),
                          {
                              shouldRetry: stryMutAct_9fa48("4883")
                                  ? context.canRetry === false
                                  : stryMutAct_9fa48("4882")
                                    ? false
                                    : stryMutAct_9fa48("4881")
                                      ? true
                                      : (stryCov_9fa48("4881", "4882", "4883"),
                                        context.canRetry !==
                                            (stryMutAct_9fa48("4884")
                                                ? true
                                                : (stryCov_9fa48("4884"), false))),
                              retryDelay: this.getRetryDelay(context.operation, errorInfo.code),
                              fallbackAction: async () => {
                                  if (stryMutAct_9fa48("4885")) {
                                      {
                                      }
                                  } else {
                                      stryCov_9fa48("4885");
                                      // Force a context sync to recover binding
                                      try {
                                          if (stryMutAct_9fa48("4886")) {
                                              {
                                              }
                                          } else {
                                              stryCov_9fa48("4886");
                                              await Word.run(async (ctx) => {
                                                  if (stryMutAct_9fa48("4887")) {
                                                      {
                                                      }
                                                  } else {
                                                      stryCov_9fa48("4887");
                                                      await ctx.sync();
                                                  }
                                              });
                                          }
                                      } catch {
                                          // Ignore sync errors
                                      }
                                  }
                              },
                              userMessage: t(
                                  stryMutAct_9fa48("4888")
                                      ? ""
                                      : (stryCov_9fa48("4888"), "error_word_api_retrying")
                              ),
                          });
                }
            }

            // Out of memory - suggest splitting document
            if (
                stryMutAct_9fa48("4891")
                    ? errorInfo.code !== "OUT_OF_MEMORY"
                    : stryMutAct_9fa48("4890")
                      ? false
                      : stryMutAct_9fa48("4889")
                        ? true
                        : (stryCov_9fa48("4889", "4890", "4891"),
                          errorInfo.code ===
                              (stryMutAct_9fa48("4892") ? "" : (stryCov_9fa48("4892"), "OUT_OF_MEMORY")))
            ) {
                if (stryMutAct_9fa48("4893")) {
                    {
                    }
                } else {
                    stryCov_9fa48("4893");
                    return stryMutAct_9fa48("4894")
                        ? {}
                        : (stryCov_9fa48("4894"),
                          {
                              shouldRetry: stryMutAct_9fa48("4895") ? true : (stryCov_9fa48("4895"), false),
                              userMessage: t(
                                  stryMutAct_9fa48("4896")
                                      ? ""
                                      : (stryCov_9fa48("4896"), "error_out_of_memory_split_document")
                              ),
                              fallbackAction: async () => {
                                  if (stryMutAct_9fa48("4897")) {
                                      {
                                      }
                                  } else {
                                      stryCov_9fa48("4897");
                                      logger.info(
                                          stryMutAct_9fa48("4898")
                                              ? ""
                                              : (stryCov_9fa48("4898"),
                                                "Suggested: Split document into smaller parts")
                                      );
                                  }
                              },
                          });
                }
            }

            // Item not found - can't retry
            if (
                stryMutAct_9fa48("4901")
                    ? errorInfo.code !== "ITEM_NOT_FOUND"
                    : stryMutAct_9fa48("4900")
                      ? false
                      : stryMutAct_9fa48("4899")
                        ? true
                        : (stryCov_9fa48("4899", "4900", "4901"),
                          errorInfo.code ===
                              (stryMutAct_9fa48("4902") ? "" : (stryCov_9fa48("4902"), "ITEM_NOT_FOUND")))
            ) {
                if (stryMutAct_9fa48("4903")) {
                    {
                    }
                } else {
                    stryCov_9fa48("4903");
                    return stryMutAct_9fa48("4904")
                        ? {}
                        : (stryCov_9fa48("4904"),
                          {
                              shouldRetry: stryMutAct_9fa48("4905") ? true : (stryCov_9fa48("4905"), false),
                              userMessage: t(
                                  stryMutAct_9fa48("4906")
                                      ? ""
                                      : (stryCov_9fa48("4906"), "error_selection_lost")
                              ),
                          });
                }
            }

            // Unknown errors - don't retry
            return stryMutAct_9fa48("4907")
                ? {}
                : (stryCov_9fa48("4907"),
                  {
                      shouldRetry: stryMutAct_9fa48("4908") ? true : (stryCov_9fa48("4908"), false),
                      userMessage: t(
                          stryMutAct_9fa48("4909") ? "" : (stryCov_9fa48("4909"), "status_error_prefix"),
                          errorInfo.message
                      ),
                  });
        }
    }
    private getRetryDelay(operation: string, errorCode: string): number {
        if (stryMutAct_9fa48("4910")) {
            {
            }
        } else {
            stryCov_9fa48("4910");
            const key = stryMutAct_9fa48("4911") ? `` : (stryCov_9fa48("4911"), `${operation}:${errorCode}`);
            const count = stryMutAct_9fa48("4914")
                ? this.retryCount.get(key) && 0
                : stryMutAct_9fa48("4913")
                  ? false
                  : stryMutAct_9fa48("4912")
                    ? true
                    : (stryCov_9fa48("4912", "4913", "4914"), this.retryCount.get(key) || 0);
            return stryMutAct_9fa48("4917")
                ? this.RETRY_DELAYS[Math.min(count, this.RETRY_DELAYS.length - 1)] && 5000
                : stryMutAct_9fa48("4916")
                  ? false
                  : stryMutAct_9fa48("4915")
                    ? true
                    : (stryCov_9fa48("4915", "4916", "4917"),
                      this.RETRY_DELAYS[
                          stryMutAct_9fa48("4918")
                              ? Math.max(count, this.RETRY_DELAYS.length - 1)
                              : (stryCov_9fa48("4918"),
                                Math.min(
                                    count,
                                    stryMutAct_9fa48("4919")
                                        ? this.RETRY_DELAYS.length + 1
                                        : (stryCov_9fa48("4919"), this.RETRY_DELAYS.length - 1)
                                ))
                      ] || 5000);
        }
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
    if (stryMutAct_9fa48("4920")) {
        {
        }
    } else {
        stryCov_9fa48("4920");
        let lastError: unknown;
        for (
            let i = 0;
            stryMutAct_9fa48("4923")
                ? i > maxRetries
                : stryMutAct_9fa48("4922")
                  ? i < maxRetries
                  : stryMutAct_9fa48("4921")
                    ? false
                    : (stryCov_9fa48("4921", "4922", "4923"), i <= maxRetries);
            stryMutAct_9fa48("4924") ? i-- : (stryCov_9fa48("4924"), i++)
        ) {
            if (stryMutAct_9fa48("4925")) {
                {
                }
            } else {
                stryCov_9fa48("4925");
                try {
                    if (stryMutAct_9fa48("4926")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4926");
                        const result = await fn();

                        // Success - reset retry counter
                        errorRecovery.resetRetries(operation);
                        return result;
                    }
                } catch (error) {
                    if (stryMutAct_9fa48("4927")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4927");
                        lastError = error;
                        if (
                            stryMutAct_9fa48("4930")
                                ? i !== maxRetries
                                : stryMutAct_9fa48("4929")
                                  ? false
                                  : stryMutAct_9fa48("4928")
                                    ? true
                                    : (stryCov_9fa48("4928", "4929", "4930"), i === maxRetries)
                        ) {
                            if (stryMutAct_9fa48("4931")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("4931");
                                throw error;
                            }
                        }
                        const strategy = await errorRecovery.handle(
                            error,
                            stryMutAct_9fa48("4932")
                                ? {}
                                : (stryCov_9fa48("4932"),
                                  {
                                      operation,
                                      canRetry: stryMutAct_9fa48("4936")
                                          ? i >= maxRetries
                                          : stryMutAct_9fa48("4935")
                                            ? i <= maxRetries
                                            : stryMutAct_9fa48("4934")
                                              ? false
                                              : stryMutAct_9fa48("4933")
                                                ? true
                                                : (stryCov_9fa48("4933", "4934", "4935", "4936"),
                                                  i < maxRetries),
                                  })
                        );
                        if (
                            stryMutAct_9fa48("4939")
                                ? false
                                : stryMutAct_9fa48("4938")
                                  ? true
                                  : stryMutAct_9fa48("4937")
                                    ? strategy.shouldRetry
                                    : (stryCov_9fa48("4937", "4938", "4939"), !strategy.shouldRetry)
                        ) {
                            if (stryMutAct_9fa48("4940")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("4940");
                                throw error;
                            }
                        }
                        if (
                            stryMutAct_9fa48("4942")
                                ? false
                                : stryMutAct_9fa48("4941")
                                  ? true
                                  : (stryCov_9fa48("4941", "4942"), strategy.retryDelay)
                        ) {
                            if (stryMutAct_9fa48("4943")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("4943");
                                await new Promise(
                                    stryMutAct_9fa48("4944")
                                        ? () => undefined
                                        : (stryCov_9fa48("4944"),
                                          (resolve) => setTimeout(resolve, strategy.retryDelay))
                                );
                            }
                        }
                    }
                }
            }
        }
        throw lastError;
    }
}
