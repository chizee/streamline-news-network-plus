# Requirements Document: Social Media Publishing

## Introduction

This feature enables users to connect their social media accounts (Twitter/X, Facebook, Instagram, Threads) via OAuth and publish content directly to these platforms from the SNN+ application. It includes both manual publishing and automated scheduled publishing capabilities.

## Glossary

- **OAuth**: Open Authorization protocol for secure API authorization
- **Access Token**: Credential used to access protected resources on behalf of a user
- **Refresh Token**: Token used to obtain new access tokens when they expire
- **Publishing**: The act of posting content to a social media platform
- **Connection**: A linked social media account with valid OAuth credentials
- **Scheduled Post**: Content scheduled to be published at a future date/time
- **Cron Job**: Automated task that runs at specified intervals

## Requirements

### Requirement 1: OAuth Connection Management

**User Story:** As a user, I want to connect my social media accounts to the platform, so that I can publish content directly without manual copy-paste.

#### Acceptance Criteria

1. WHEN a user initiates OAuth for Twitter THEN the system SHALL redirect to Twitter authorization and store the access token upon successful authentication
2. WHEN a user initiates OAuth for Facebook THEN the system SHALL redirect to Facebook authorization and store the access token upon successful authentication
3. WHEN a user initiates OAuth for Instagram THEN the system SHALL redirect to Instagram authorization via Facebook Graph API and store the access token upon successful authentication
4. WHEN a user initiates OAuth for Threads THEN the system SHALL redirect to Threads authorization and store the access token upon successful authentication
5. WHEN an access token expires THEN the system SHALL use the refresh token to obtain a new access token automatically
6. WHEN a user disconnects an account THEN the system SHALL revoke the access token and remove stored credentials
7. WHEN viewing connected accounts THEN the system SHALL display all connected platforms with connection status

### Requirement 2: Direct Content Publishing

**User Story:** As a user, I want to publish generated content directly to my connected social media accounts, so that I can streamline my content distribution workflow.

#### Acceptance Criteria

1. WHEN a user publishes to Twitter THEN the system SHALL post the content using Twitter API v2 and return the post URL
2. WHEN a user publishes to Facebook THEN the system SHALL post the content using Facebook Graph API and return the post URL
3. WHEN a user publishes to Instagram THEN the system SHALL post the content using Instagram Graph API and return the post URL
4. WHEN a user publishes to Threads THEN the system SHALL post the content using Threads API and return the post URL
5. WHEN publishing fails due to API errors THEN the system SHALL capture the error message and display it to the user
6. WHEN publishing succeeds THEN the system SHALL update the content status to 'published' and store the platform post URL
7. WHEN a user selects multiple platforms THEN the system SHALL publish to all selected platforms sequentially

### Requirement 3: Token Storage and Security

**User Story:** As a system administrator, I want OAuth tokens stored securely, so that user credentials are protected from unauthorized access.

#### Acceptance Criteria

1. WHEN storing access tokens THEN the system SHALL encrypt tokens before storing in the database
2. WHEN retrieving access tokens THEN the system SHALL decrypt tokens only when needed for API calls
3. WHEN a token refresh occurs THEN the system SHALL update the stored token with the new value
4. WHEN a user's session ends THEN the system SHALL not expose tokens in client-side code
5. WHEN tokens are transmitted THEN the system SHALL use HTTPS for all OAuth communications

### Requirement 4: Automated Scheduled Publishing

**User Story:** As a user, I want my scheduled posts to be automatically published at the scheduled time, so that I don't have to manually publish them.

#### Acceptance Criteria

1. WHEN the cron job runs THEN the system SHALL query for posts where scheduled_for is less than or equal to current time and status is 'scheduled'
2. WHEN a scheduled post is found THEN the system SHALL publish it to the specified platforms using stored OAuth tokens
3. WHEN automated publishing succeeds THEN the system SHALL update the post status to 'published' and record the published_at timestamp
4. WHEN automated publishing fails THEN the system SHALL update the post status to 'failed' and log the error message
5. WHEN the cron job completes THEN the system SHALL log the number of posts processed and any errors encountered
6. WHEN multiple posts are scheduled for the same time THEN the system SHALL process them in order of creation

### Requirement 5: Publishing Status Tracking

**User Story:** As a user, I want to see the status of my published and scheduled posts, so that I can track my content distribution.

#### Acceptance Criteria

1. WHEN viewing the content library THEN the system SHALL display publishing status for each piece of content
2. WHEN a post is published THEN the system SHALL show the platform-specific post URL as a clickable link
3. WHEN a post fails to publish THEN the system SHALL display the error message and allow retry
4. WHEN viewing scheduled posts THEN the system SHALL show the scheduled time and target platforms
5. WHEN a scheduled post is published THEN the system SHALL update the UI to reflect the published status

### Requirement 6: Error Handling and Retry Logic

**User Story:** As a user, I want the system to handle publishing errors gracefully, so that I can understand what went wrong and retry if needed.

#### Acceptance Criteria

1. WHEN an API rate limit is exceeded THEN the system SHALL display a clear message indicating the rate limit and when to retry
2. WHEN an OAuth token is invalid THEN the system SHALL prompt the user to reconnect their account
3. WHEN a network error occurs THEN the system SHALL retry the request up to 3 times with exponential backoff
4. WHEN content exceeds platform character limits THEN the system SHALL display a validation error before attempting to publish
5. WHEN publishing fails after retries THEN the system SHALL log the error and allow manual retry

### Requirement 7: Platform-Specific Content Formatting

**User Story:** As a user, I want content to be formatted appropriately for each platform, so that it displays correctly on different social media sites.

#### Acceptance Criteria

1. WHEN publishing to Twitter THEN the system SHALL enforce the 280 character limit
2. WHEN publishing to Facebook THEN the system SHALL support longer text content up to 63,206 characters
3. WHEN publishing to Instagram THEN the system SHALL support captions up to 2,200 characters
4. WHEN publishing to Threads THEN the system SHALL enforce the 500 character limit
5. WHEN content includes URLs THEN the system SHALL preserve URL formatting for each platform
