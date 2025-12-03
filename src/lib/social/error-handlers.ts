// Platform-specific error handlers for social media APIs

import type { SocialPlatform } from './types'

export interface PlatformError {
  platform: SocialPlatform
  code?: string
  message: string
  isRetryable: boolean
  requiresReauth?: boolean
}

/**
 * Parse and categorize Twitter API errors
 */
export function handleTwitterError(error: any): PlatformError {
  const message = error.message || String(error)
  const lowerMessage = message.toLowerCase()
  
  // Rate limit errors
  if (
    lowerMessage.includes('429') ||
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('too many requests')
  ) {
    return {
      platform: 'twitter',
      code: '429',
      message: 'Twitter rate limit exceeded. Please try again later.',
      isRetryable: true,
    }
  }
  
  // Authentication errors
  if (
    lowerMessage.includes('401') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('invalid token') ||
    lowerMessage.includes('authentication failed') ||
    (lowerMessage.includes('token') && lowerMessage.includes('expired'))
  ) {
    return {
      platform: 'twitter',
      code: '401',
      message: 'Twitter authentication failed. Please reconnect your account.',
      isRetryable: false,
      requiresReauth: true,
    }
  }
  
  // Content validation errors
  if (lowerMessage.includes('character limit') || lowerMessage.includes('too long')) {
    return {
      platform: 'twitter',
      code: 'CONTENT_TOO_LONG',
      message: 'Tweet exceeds 280 character limit.',
      isRetryable: false,
    }
  }
  
  // Duplicate content
  if (lowerMessage.includes('duplicate')) {
    return {
      platform: 'twitter',
      code: 'DUPLICATE',
      message: 'This tweet has already been posted.',
      isRetryable: false,
    }
  }
  
  // Network errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('econnrefused') ||
    lowerMessage.includes('connection')
  ) {
    return {
      platform: 'twitter',
      code: 'NETWORK_ERROR',
      message: 'Network error connecting to Twitter. Please try again.',
      isRetryable: true,
    }
  }
  
  // Server errors
  if (
    lowerMessage.includes('500') ||
    lowerMessage.includes('502') ||
    lowerMessage.includes('503') ||
    lowerMessage.includes('server error')
  ) {
    return {
      platform: 'twitter',
      code: '5XX',
      message: 'Twitter server error. Please try again later.',
      isRetryable: true,
    }
  }
  
  // Default error
  return {
    platform: 'twitter',
    message: `Twitter error: ${message}`,
    isRetryable: false,
  }
}

/**
 * Parse and categorize Facebook API errors
 */
export function handleFacebookError(error: any): PlatformError {
  const message = error.message || String(error)
  const lowerMessage = message.toLowerCase()
  
  // Rate limit errors
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
    return {
      platform: 'facebook',
      code: 'RATE_LIMIT',
      message: 'Facebook rate limit exceeded. Please try again later.',
      isRetryable: true,
    }
  }
  
  // Authentication errors
  if (
    lowerMessage.includes('190') ||
    lowerMessage.includes('invalid token') ||
    lowerMessage.includes('401') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('authentication failed') ||
    (lowerMessage.includes('token') && lowerMessage.includes('expired'))
  ) {
    return {
      platform: 'facebook',
      code: '190',
      message: 'Facebook authentication failed. Please reconnect your account.',
      isRetryable: false,
      requiresReauth: true,
    }
  }
  
  // Permission errors
  if (lowerMessage.includes('permission') || lowerMessage.includes('403')) {
    return {
      platform: 'facebook',
      code: 'PERMISSION_DENIED',
      message: 'Missing Facebook permissions. Please reconnect your account.',
      isRetryable: false,
      requiresReauth: true,
    }
  }
  
  // Content validation errors
  if (lowerMessage.includes('character limit')) {
    return {
      platform: 'facebook',
      code: 'CONTENT_TOO_LONG',
      message: 'Post exceeds Facebook character limit.',
      isRetryable: false,
    }
  }
  
  // Network errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('econnrefused')
  ) {
    return {
      platform: 'facebook',
      code: 'NETWORK_ERROR',
      message: 'Network error connecting to Facebook. Please try again.',
      isRetryable: true,
    }
  }
  
  // Server errors
  if (
    lowerMessage.includes('500') ||
    lowerMessage.includes('502') ||
    lowerMessage.includes('503') ||
    lowerMessage.includes('server error')
  ) {
    return {
      platform: 'facebook',
      code: '5XX',
      message: 'Facebook server error. Please try again later.',
      isRetryable: true,
    }
  }
  
  // Default error
  return {
    platform: 'facebook',
    message: `Facebook error: ${message}`,
    isRetryable: false,
  }
}

/**
 * Parse and categorize Instagram API errors
 */
export function handleInstagramError(error: any): PlatformError {
  const message = error.message || String(error)
  const lowerMessage = message.toLowerCase()
  
  // Rate limit errors
  if (
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('429') ||
    lowerMessage.includes('too many requests')
  ) {
    return {
      platform: 'instagram',
      code: 'RATE_LIMIT',
      message: 'Instagram rate limit exceeded. Please try again later.',
      isRetryable: true,
    }
  }
  
  // Authentication errors
  if (
    lowerMessage.includes('invalid token') ||
    lowerMessage.includes('401') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('authentication failed') ||
    (lowerMessage.includes('token') && lowerMessage.includes('expired'))
  ) {
    return {
      platform: 'instagram',
      code: 'AUTH_ERROR',
      message: 'Instagram authentication failed. Please reconnect your account.',
      isRetryable: false,
      requiresReauth: true,
    }
  }
  
  // No business account
  if (lowerMessage.includes('business account')) {
    return {
      platform: 'instagram',
      code: 'NO_BUSINESS_ACCOUNT',
      message: 'Instagram Business account required for publishing.',
      isRetryable: false,
    }
  }
  
  // Content validation errors
  if (lowerMessage.includes('character limit')) {
    return {
      platform: 'instagram',
      code: 'CONTENT_TOO_LONG',
      message: 'Caption exceeds Instagram 2,200 character limit.',
      isRetryable: false,
    }
  }
  
  // Media required
  if (lowerMessage.includes('media') || lowerMessage.includes('image')) {
    return {
      platform: 'instagram',
      code: 'MEDIA_REQUIRED',
      message: 'Instagram posts require at least one image or video.',
      isRetryable: false,
    }
  }
  
  // Network errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('econnrefused')
  ) {
    return {
      platform: 'instagram',
      code: 'NETWORK_ERROR',
      message: 'Network error connecting to Instagram. Please try again.',
      isRetryable: true,
    }
  }
  
  // Server errors
  if (
    lowerMessage.includes('500') ||
    lowerMessage.includes('502') ||
    lowerMessage.includes('503') ||
    lowerMessage.includes('server error')
  ) {
    return {
      platform: 'instagram',
      code: '5XX',
      message: 'Instagram server error. Please try again later.',
      isRetryable: true,
    }
  }
  
  // Default error
  return {
    platform: 'instagram',
    message: `Instagram error: ${message}`,
    isRetryable: false,
  }
}

/**
 * Parse and categorize Threads API errors
 */
export function handleThreadsError(error: any): PlatformError {
  const message = error.message || String(error)
  const lowerMessage = message.toLowerCase()
  
  // Rate limit errors
  if (
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('429') ||
    lowerMessage.includes('too many requests')
  ) {
    return {
      platform: 'threads',
      code: 'RATE_LIMIT',
      message: 'Threads rate limit exceeded. Please try again later.',
      isRetryable: true,
    }
  }
  
  // Authentication errors
  if (
    lowerMessage.includes('invalid token') ||
    lowerMessage.includes('401') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('authentication failed') ||
    lowerMessage.includes('token expired')
  ) {
    return {
      platform: 'threads',
      code: 'AUTH_ERROR',
      message: 'Threads authentication failed. Please reconnect your account.',
      isRetryable: false,
      requiresReauth: true,
    }
  }
  
  // Content validation errors
  if (lowerMessage.includes('character limit')) {
    return {
      platform: 'threads',
      code: 'CONTENT_TOO_LONG',
      message: 'Thread exceeds 500 character limit.',
      isRetryable: false,
    }
  }
  
  // Network errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('econnrefused') ||
    lowerMessage.includes('connection')
  ) {
    return {
      platform: 'threads',
      code: 'NETWORK_ERROR',
      message: 'Network error connecting to Threads. Please try again.',
      isRetryable: true,
    }
  }
  
  // Server errors
  if (
    lowerMessage.includes('500') ||
    lowerMessage.includes('502') ||
    lowerMessage.includes('503') ||
    lowerMessage.includes('server error')
  ) {
    return {
      platform: 'threads',
      code: '5XX',
      message: 'Threads server error. Please try again later.',
      isRetryable: true,
    }
  }
  
  // Default error
  return {
    platform: 'threads',
    message: `Threads error: ${message}`,
    isRetryable: false,
  }
}

/**
 * Handle error for any platform
 */
export function handlePlatformError(
  platform: SocialPlatform,
  error: any
): PlatformError {
  switch (platform) {
    case 'twitter':
      return handleTwitterError(error)
    case 'facebook':
      return handleFacebookError(error)
    case 'instagram':
      return handleInstagramError(error)
    case 'threads':
      return handleThreadsError(error)
    default:
      return {
        platform,
        message: `Unknown error: ${error.message || String(error)}`,
        isRetryable: false,
      }
  }
}
