# Vice Principal (VP) Components

## Overview
This directory contains React Native components for the Vice Principal dashboard and management features in the School Management System.

## Components

### VPDashboard.tsx
Main dashboard component displaying:
- Student management statistics
- Enrollment trends
- Urgent tasks and notifications
- Quick action buttons
- **NEW**: API diagnostics section for troubleshooting network issues

### VPMessages.tsx
Message management component featuring:
- Staff member directory and messaging
- Thread-based conversations
- Message filtering and search
- **FIXED**: Now uses `/api/v1/users` endpoint instead of non-existent staff-members endpoint

### VPCommunications.tsx
Communication and announcements management:
- Create and manage school announcements
- View communication statistics
- Manage audience targeting and priorities
- **FIXED**: Calculates stats from announcements data instead of using non-existent communication-stats endpoint

### VPStudents.tsx
Student management and tracking:
- Student list with search and filters
- Student profile management
- Academic progress tracking

### VPClasses.tsx
Class and subclass management:
- Class capacity monitoring
- Subclass optimization
- Class assignments

### VPReportCards.tsx
Report card management:
- Generate and download report cards
- Batch processing for subclasses
- Report status tracking

## Network Issues Fixed

### Problem
The VP components were experiencing "Network request failed" errors due to:
1. **VPCommunications**: Called `/api/v1/vice-principal/communication-stats` - endpoint doesn't exist
2. **VPMessages**: Called `/api/v1/vice-principal/staff-members` - endpoint doesn't exist

### Solutions Applied

#### VPCommunications.tsx
- **Before**: Called non-existent `/api/v1/vice-principal/communication-stats`
- **After**: 
  - Uses existing `/api/v1/communications/announcements` endpoint
  - Calculates statistics on the frontend from announcements data
  - Includes: total announcements, active announcements, reach, read rates, recent activity

#### VPMessages.tsx  
- **Before**: Called non-existent `/api/v1/vice-principal/staff-members`
- **After**:
  - Uses existing `/api/v1/users?role=TEACHER` endpoint
  - Fallback to `/api/v1/users` with role filtering
  - Transforms user data to staff member format
  - Includes error handling to prevent UI breaks

#### VPDashboard.tsx
- **Enhanced**: Added comprehensive error handling
- **NEW**: API diagnostics section showing:
  - Connection status
  - Base URL configuration
  - Endpoint paths
  - Last error messages
  - Connection test button

## API Endpoints Used

### Working Endpoints
- `GET /api/v1/vice-principal/dashboard` - VP dashboard data
- `GET /api/v1/communications/announcements` - Announcements list
- `POST /api/v1/communications/announcements` - Create announcement
- `DELETE /api/v1/communications/announcements/:id` - Delete announcement
- `GET /api/v1/messaging/threads` - Message threads
- `POST /api/v1/messaging/threads` - Create thread
- `GET /api/v1/messaging/threads/:id/messages` - Thread messages
- `POST /api/v1/messaging/threads/:id/messages` - Send message
- `GET /api/v1/users` - User directory (with role filtering)
- `GET /api/v1/auth/me` - Authentication check

### Removed Non-existent Endpoints
- ~~`GET /api/v1/vice-principal/communication-stats`~~ - Not implemented
- ~~`GET /api/v1/vice-principal/staff-members`~~ - Not implemented

## Troubleshooting Network Issues

### 1. Check API Diagnostics
- Open VP Dashboard
- Tap on "API Diagnostics" section
- Check connection status and test connectivity

### 2. Common Issues and Solutions

#### "Network request failed"
- **Cause**: Server not reachable or endpoint doesn't exist
- **Check**: API diagnostics section shows connection status
- **Solution**: Verify server is running and endpoints exist

#### "Authentication failed" 
- **Cause**: Invalid or expired token
- **Check**: Log out and log back in
- **Solution**: Clear app storage and re-authenticate

#### "Failed to load dashboard data: 403"
- **Cause**: User doesn't have VICE_PRINCIPAL role
- **Check**: Verify user roles in admin panel
- **Solution**: Assign VICE_PRINCIPAL role to user

#### "Failed to load dashboard data: 404"
- **Cause**: VP dashboard endpoint not implemented
- **Check**: Verify backend has VP endpoints
- **Solution**: Update backend to include VP endpoints

### 3. API Configuration
The app uses these base URLs:
- Base URL: `https://sms.sniperbuisnesscenter.com`
- API Base: `https://sms.sniperbuisnesscenter.com/api/v1`

### 4. Required Backend Endpoints
Ensure your backend implements these VP endpoints:
- `GET /api/v1/vice-principal/dashboard`
- `GET /api/v1/vice-principal/student-management` 
- `GET /api/v1/vice-principal/interviews`
- `GET /api/v1/vice-principal/subclass-optimization`

## Data Flow

### Authentication
1. User logs in with VICE_PRINCIPAL role
2. Token stored in AsyncStorage
3. All API requests include Bearer token
4. Components check authentication before API calls

### Error Handling
1. Network errors display user-friendly messages
2. Invalid responses set fallback data
3. Components gracefully handle missing data
4. Diagnostic tools help identify issues

## Development Notes

### Testing Network Connectivity
Use the built-in diagnostics:
```typescript
// In VPDashboard component
const testApiConnectivity = async () => {
  // Tests basic auth endpoint
  // Shows connection status
  // Provides debug information
}
```

### Debugging API Calls
Add logging for troubleshooting:
```typescript
console.log('API Request:', url, headers);
console.log('API Response:', response.status, data);
```

### Error Recovery
Components implement graceful degradation:
- Empty states for missing data
- Retry buttons for failed requests
- Fallback data to prevent crashes
- Clear error messages for users 