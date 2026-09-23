# API Documentation — 🎉 Fresher Event Game Platform

Base URL: `/api/v1`

---

## 👨🎓 Student Endpoints

### 1. `POST /api/v1/event/enter`
Register or continue a student session using QR scan.

**Request Body:**
```json
{
  "name": "Nax Chaudhari",
  "enrollmentNo": "EN2026047"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentId": "65fc...abc",
    "name": "Nax Chaudhari",
    "enrollmentNo": "EN2026047",
    "tokenNo": 47,
    "luckyNo": 18,
    "spotlightNo": 63,
    "sessionId": "b8a5...-uuid"
  }
}
```

### 2. `GET /api/v1/student/status/:studentId`
Get real-time profile status and currently available game.

### 3. `POST /api/v1/games/:gameId/join`
Join an active game lobby.

### 4. `POST /api/v1/games/submit`
Submit answer for active SPEED_MCQ game.

**Request Body:**
```json
{
  "gameId": "65fc...abc",
  "selectedOptionIndex": 1,
  "studentId": "65fc...abc"
}
```

---

## 👨💼 Management Protection APIs (Bearer Token Required)

### 1. `POST /api/v1/admin/login`
**Request Body:**
```json
{
  "username": "admin",
  "password": "fresher2026"
}
```

### 2. `GET /api/v1/admin/dashboard`
Fetch live event metrics, active players, and current game stats.

### 3. `GET /api/v1/admin/games`
Fetch complete game library (8 game types).

### 4. `POST /api/v1/admin/games/:id/open`
Transition game to `OPEN` state. Broadcasts `GAME_OPENED` to students and auditorium.

### 5. `POST /api/v1/admin/games/:id/start`
Transition game to `LIVE` state. Starts timer & broadcasts question to 600 concurrent clients.

### 6. `POST /api/v1/admin/games/:id/close`
Transition game to `CLOSED` state. Locks submissions and evaluates first correct winner candidate.

### 7. `POST /api/v1/admin/winners/:winnerId/approve`
Approve winner candidate after management review.

### 8. `POST /api/v1/admin/winners/:winnerId/publish`
Publish approved winner directly to Auditorium Display.

### 9. `POST /api/v1/admin/draw-number`
Draw random Spotlight or Lucky Number for stage challenges.

---

## 🖥️ Auditorium Read-Only API

### 1. `GET /api/v1/auditorium/state`
Returns the current management-published state for TV/projector screens.
