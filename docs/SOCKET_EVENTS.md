# Socket.IO Event Specifications — 🎉 Fresher Event Game Platform

Rooms Architecture:
- `event:{eventId}` / `event:FRESHER2026`: All connected student devices
- `management:{eventId}` / `management:FRESHER2026`: Management dashboard operators
- `auditorium:{eventId}` / `auditorium:FRESHER2026`: Auditorium display screens

---

## Client to Server Events

### 1. `JOIN_EVENT_ROOM`
**Payload:** `{ eventId: string, studentId?: string }`  
Subscribes client socket to the real-time student broadcast channel.

### 2. `JOIN_MANAGEMENT_ROOM`
**Payload:** `{ eventId: string }`  
Subscribes client socket to management control updates.

### 3. `JOIN_AUDITORIUM_ROOM`
**Payload:** `{ eventId: string }`  
Subscribes client socket to auditorium presentation state.

---

## Server to Client Broadcast Events

### 1. `GAME_OPENED`
**Target:** `event:{eventId}`  
**Payload:**
```json
{
  "gameId": "65fc...abc",
  "title": "😂 Guess the Emoji",
  "type": "SPEED_MCQ",
  "timeLimit": 30,
  "prize": 50,
  "questionPreview": {
    "questionText": "What does this movie represent?",
    "mediaContent": "🦁 + 👑"
  }
}
```

### 2. `GAME_STARTED`
**Target:** `event:{eventId}`  
**Payload:**
```json
{
  "gameId": "65fc...abc",
  "timeLimit": 30,
  "question": {
    "id": "65fc...q1",
    "questionText": "What does this movie represent?",
    "mediaContent": "🦁 + 👑",
    "options": ["Jungle Book", "Lion King", "Madagascar", "Simba"]
  },
  "startTime": 1774363200000
}
```

### 3. `GAME_CLOSED`
**Target:** `event:{eventId}`  
**Payload:** `{ "gameId": "65fc...abc" }`

### 4. `WINNER_CANDIDATE`
**Target:** `management:{eventId}`  
**Payload:**
```json
{
  "gameId": "65fc...abc",
  "winnerCandidate": {
    "winnerId": "65fc...w1",
    "studentId": "65fc...s1",
    "name": "Nax Chaudhari",
    "tokenNo": 47,
    "enrollmentNo": "EN2026047",
    "responseTimeMs": 341,
    "correctAnswer": "Lion King"
  },
  "totalSubmissions": 400
}
```

### 5. `WINNER_PUBLISHED`
**Target:** `auditorium:{eventId}` & `event:{eventId}`  
**Payload:**
```json
{
  "gameTitle": "Guess the Emoji",
  "winnerName": "Nax Chaudhari",
  "tokenNo": 47,
  "prize": 50
}
```

### 6. `AUDITORIUM_UPDATED`
**Target:** `auditorium:{eventId}`  
**Payload:** `{ state: "WELCOME" | "WAITING" | "GAME_ANNOUNCEMENT" | "COUNTDOWN" | "GAME_LIVE" | "GAME_CLOSED" | "WINNER_PUBLISHED" | "SPOTLIGHT_DRAW" | "LUCKY_DRAW", payload: object }`
