# API Testing with HTTP Files

This directory contains HTTP files for testing the API endpoints using VS Code's REST Client extension or similar tools.

## Setup

1. **Install REST Client Extension** (VS Code):
   - Search for "REST Client" by Huachao Mao in VS Code extensions
   - Or install via: `code --install-extension humao.rest-client`

2. **Get Your JWT Token**:
   - Log in to your application through the frontend
   - Open browser DevTools > Application/Storage > Local Storage
   - Copy your JWT token
   - Replace `YOUR_JWT_TOKEN_HERE` in the HTTP files with your actual token

3. **Update Variables**:
   - Update `@baseUrl` if your server runs on a different port
   - Update `@dashboardId` with an actual dashboard ID after creating one

## Files

- **`dashboards.http`** - Test dashboard CRUD operations
- **`notes.http`** - Test note CRUD operations

## Usage

1. Open any `.http` file in VS Code
2. Click "Send Request" above any request (appears as a link)
3. View the response in a split pane

## Testing Flow

### For Dashboards:
1. Create a dashboard (POST)
2. Get all dashboards (GET)
3. Get specific dashboard (GET with ID)
4. Update dashboard (PUT)
5. Delete dashboard (DELETE)

### For Notes:
1. First create a dashboard and note its ID
2. Create notes with that dashboard_id (POST)
3. Get all notes (GET)
4. Filter notes by dashboard (GET with query param)
5. Get specific note (GET with ID)
6. Update note (PUT)
7. Delete note (DELETE)

## Expected Responses

### Success Responses:
- **GET**: `200 OK` with data
- **POST**: `201 Created` with created resource
- **PUT**: `200 OK` with updated resource
- **DELETE**: `204 No Content`

### Error Responses:
- **401 Unauthorized**: Missing or invalid token
- **404 Not Found**: Resource doesn't exist or doesn't belong to user
- **400 Bad Request**: Missing required fields
- **500 Internal Server Error**: Database or server error
