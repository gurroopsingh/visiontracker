# VisionTracker — Phase 2 Testing Guide

Since Phase 2 introduces complex asynchronous workflows (AI matching, Redis caching, Socket.IO), follow this manual End-to-End (E2E) testing guide to verify the system.

## 1. Prerequisites
Ensure all 5 services are running via Docker Compose:
```bash
docker compose up --build -d
```
Check that all containers are `healthy`:
```bash
docker compose ps
```

## 2. Test Scenarios

### Scenario A: Redis Caching
1. Log in to the frontend (`http://localhost:5173`).
2. Navigate to the **Lost Items** feed.
3. Check the backend logs (`docker compose logs -f backend`). You should see a database query.
4. Refresh the page. You should see a log indicating `Cache HIT for key: items:lost:active:...`, and the response should be noticeably faster.
5. Report a new Lost item. The logs should show `Cache invalidated for pattern items:*`.
6. Refresh the feed. It should trigger a DB query again (Cache MISS).

### Scenario B: AI Matching & Socket.IO Notification
To test the core AI matching engine:
1. **User A (Loser)**:
   - Logs in using Browser Window 1.
   - Goes to **Report Lost**.
   - Submits a report for a lost item (e.g., "Black North Face Backpack") AND uploads a photo of it.
   - Keeps their browser open on the Dashboard to maintain the active WebSocket connection.

2. **User B (Finder)**:
   - Logs in using Browser Window 2 (Incognito).
   - Goes to **Report Found**.
   - Submits a report for the same item AND uploads a visually similar photo of the backpack.
   - Clicks Submit.

3. **Verification**:
   - In the backend logs, you should see:
     ```
     [INFO] Running AI match search for found item...
     [INFO] AI match found! similarity=0.89 model=openai/clip-vit-base-patch32
     ```
   - In **Browser Window 1 (User A)**, a real-time **Toast Notification** should appear instantly:
     > "🎉 A potential match was found for your lost item: 'Black North Face Backpack' (89% confidence)"

### Scenario C: Edit Item (Ownership Guard)
1. User A navigates to `/dashboard/items/my` (Profile page) and clicks on their reported item.
2. Clicks the **Edit Report** button.
3. Modifies the description and uploads a new image.
4. Clicks Save. The item should update successfully.
5. User B navigates to the same item's detail page. The **Edit Report** button should NOT be visible.
6. If User B manually types the `/edit` URL for User A's item, they should be automatically redirected back to the details page (Frontend Guard), and any direct PUT requests to the API will return a `403 Forbidden` (Backend Guard).

### Scenario D: Graceful Degradation
1. Stop the Redis container: `docker stop visiontracker-redis-1`
2. Refresh the frontend feed. The items should still load correctly (fallback to MongoDB).
3. Stop the AI Microservice: `docker stop visiontracker-ai-1`
4. Report a new Found item with an image.
5. The item should be successfully reported (201 Created), and the backend logs should show a graceful fallback warning: `AI service unavailable or error`. The Node.js server must NOT crash.
