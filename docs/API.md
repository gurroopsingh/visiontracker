# VisionTracker — REST API Reference
## Phase 1

**Base URL:** `http://localhost:5000/api`

All responses follow the format:
```json
{
  "success": true | false,
  "message": "Optional message",
  "data": { ... }
}
```

---

## Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | None | API status check |

**Response:**
```json
{ "success": true, "message": "VisionTracker API is running." }
```

---

## Authentication

### POST /auth/register

Register a new user account.

**Request body:**
```json
{
  "name": "Gurroop Singh",
  "email": "gurroop@chitkara.edu.in",
  "password": "secure123"
}
```

**Success (201):**
```json
{
  "success": true,
  "token": "<JWT>",
  "user": {
    "id": "...",
    "name": "Gurroop Singh",
    "email": "gurroop@chitkara.edu.in",
    "role": "student"
  }
}
```

**Errors:**
- `400` — Missing fields or email already exists
- `400` — Mongoose validation error

---

### POST /auth/login

Login with email and password.

**Request body:**
```json
{
  "email": "gurroop@chitkara.edu.in",
  "password": "secure123"
}
```

**Success (200):**
```json
{
  "success": true,
  "token": "<JWT>",
  "user": { ... }
}
```

**Errors:**
- `400` — Missing fields
- `401` — Invalid email or password

---

### GET /auth/me

Get the authenticated user's profile.

**Headers:** `Authorization: Bearer <JWT>`

**Success (200):**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "Gurroop Singh",
    "email": "gurroop@chitkara.edu.in",
    "role": "student",
    "createdAt": "2026-08-22T..."
  }
}
```

**Errors:**
- `401` — No token / invalid token

---

## Items

### GET /items

Fetch all items. Supports query filters.

**Query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `type` | `"lost"` \| `"found"` | Filter by item type |
| `category` | string | Filter by category |
| `status` | `"active"` \| `"resolved"` \| `"closed"` | Filter by status |
| `search` | string | Text search on title, description, location |

**Example:** `GET /api/items?type=lost&category=Electronics`

**Success (200):**
```json
{
  "success": true,
  "count": 5,
  "items": [
    {
      "_id": "...",
      "type": "lost",
      "title": "Black Dell Laptop",
      "description": "...",
      "category": "Electronics",
      "brand": "Dell",
      "color": "Black",
      "location": "Block A Cafeteria",
      "date": "2026-08-20T...",
      "status": "active",
      "reportedBy": { "_id": "...", "name": "Gurroop Singh", "email": "..." },
      "createdAt": "..."
    }
  ]
}
```

---

### GET /items/:id

Fetch a single item by MongoDB id.

**Success (200):** `{ "success": true, "item": { ... } }`  
**Errors:** `404` — Item not found

---

### POST /items/lost

Report a new lost item.

**Headers:** `Authorization: Bearer <JWT>` (required)

**Request body:**
```json
{
  "title": "Black Dell Laptop",
  "description": "15 inch, sticker on lid",
  "category": "Electronics",
  "brand": "Dell",
  "color": "Black",
  "location": "Block A Cafeteria",
  "date": "2026-08-20",
  "additionalDetails": "Serial number: DL123456"
}
```

**Success (201):** `{ "success": true, "item": { ... } }`  
**Errors:** `400` — Validation, `401` — Unauthenticated

---

### POST /items/found

Report a new found item.

**Headers:** `Authorization: Bearer <JWT>` (required)

**Request body:** Same fields as `/items/lost`

**Success (201):** `{ "success": true, "item": { ... } }`

---

### PUT /items/:id

Update an existing item. Only the reporter can update.

**Headers:** `Authorization: Bearer <JWT>` (required)

**Request body:** Any subset of item fields including `status`.

**Success (200):** `{ "success": true, "item": { ... } }`  
**Errors:** `403` — Not the owner, `404` — Not found

---

### DELETE /items/:id

Delete an item report. Only the reporter can delete.

**Headers:** `Authorization: Bearer <JWT>` (required)

**Success (200):** `{ "success": true, "message": "Item deleted." }`  
**Errors:** `403` — Not the owner, `404` — Not found

---

## Error Response Format

All errors return:
```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

In development, a `stack` field is also included.

---

## HTTP Status Code Summary

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized — missing or invalid JWT |
| 403 | Forbidden — insufficient permissions |
| 404 | Resource Not Found |
| 500 | Internal Server Error |

---

## Item Categories

```
Electronics · Clothing · Books & Stationery · Accessories
ID & Cards · Bags & Luggage · Keys · Sports Equipment · Other
```

## Item Status Values

```
active   → default, item is still being looked for / waiting to be claimed
resolved → matched and reunited
closed   → no longer active
```
