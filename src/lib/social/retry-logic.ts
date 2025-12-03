// Retry logic with exponential backoff for social media API calls

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
}

/**
 * Calculate delay for exponential backoff
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt)
  return Math.min(delay, options.maxDelay)
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Async function to retry
 * @param options - Retry configuration options
 * @returns Result with success status, data, error, and attempt count
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const config: Required<RetryOptions> = {
    maxRetries: options.maxRetries ?? 3,
    initialDelay: options.initialDelay ?? 1000, // 1 second
    maxDelay: options.maxDelay ?? 10000, // 10 seconds
    backoffMultiplier: options.backoffMultiplier ?? 2,
  }

  let lastError: Error | undefined
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const data = await fn()
      return {
        success: true,
        data,
        attempts: attempt + 1,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Don't retry if this was the last attempt
      if (attempt === config.maxRetries) {
        break
      }
      
      // Calculate delay and wait before retrying
      const delay = calculateDelay(attempt, config)
      console.log(
        `Retry attempt ${attempt + 1}/${config.maxRetries} failed. Retrying in ${delay}ms...`,
        lastError.message
      )
      
      await sleep(delay)
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: config.maxRetries + 1,
  }
}

/**
 * Determine if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase()
  
  // Network errors are retryable
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('enotfound')
  ) {
    return true
  }
  
  // Rate limit errors are retryable
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return true
  }
  
  // Server errors (5xx) are retryable
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return true
  }
  
  // Client errors (4xx) are generally not retryable
  if (
    message.includes('400') ||
    message.includes('401') ||
    message.includes('403') ||
    message.includes('404')
  ) {
    return false
  }
  
  // Default to not retryable for unknown errors
  return false
}

/**
 * Retry a function only if the error is retryable
 */
export async function retryIfRetryable<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const config: Required<RetryOptions> = {
    maxRetries: options.maxRetries ?? 3,
    initialDelay: options.initialDelay ?? 1000,
    maxDelay: options.maxDelay ?? 10000,
    backoffMultiplier: options.backoffMultiplier ?? 2,
  }

  let lastError: Error | undefined
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const data = await fn()
      return {
        success: true,
        data,
        attempts: attempt + 1,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Check if error is retryable
      if (!isRetryableError(lastError)) {
        console.log('Error is not retryable:', lastError.message)
        return {
          success: false,
          error: lastError,
          attempts: attempt + 1,
        }
      }
      
      // Don't retry if this was the last attempt
      if (attempt === config.maxRetries) {
        break
      }
      
      // Calculate delay and wait before retrying
      const delay = calculateDelay(attempt, config)
      console.log(
        `Retryable error on attempt ${attempt + 1}/${config.maxRetries}. Retrying in ${delay}ms...`,
        lastError.message
      )
      
      await sleep(delay)
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: config.maxRetries + 1,
  }
}
