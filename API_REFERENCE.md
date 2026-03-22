# API Reference

Complete API documentation for Diplomatrix AI backend.

## Base URL

- **Local**: `http://localhost:8000`
- **Production**: `https://diplomatrix-ai-backend.onrender.com`

## Authentication

No authentication required. All endpoints are public.

---

## Endpoints

### Health Check

**Endpoint**: `GET /`

**Description**: Check if backend is running

**Response**:
```json
{
  "status": "ok",
  "app": "Diplomatrix AI"
}
```

**Example**:
```bash
curl http://localhost:8000/
```

---

### Start Debate

**Endpoint**: `POST /api/debate/run`

**Description**: Start a new debate with specified topic and countries

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "topic": "Should AI development be regulated globally?",
  "countries": ["USA", "China", "India", "EU", "Brazil"]
}
```

**Response**: Server-Sent Events (SSE) stream

Each event contains:
```json
{
  "phase": "opening",
  "speaker": "USA",
  "message": "We believe AI development requires international cooperation...",
  "timestamp": "2026-03-22T10:30:00Z"
}
```

**Phases** (in order):
1. `opening` - Opening statements
2. `rebuttal_1` - First rebuttal round
3. `rebuttal_2` - Second rebuttal round
4. `resolution` - Closing statements
5. `moderation` - Moderator synthesis
6. `voting` - Country votes
7. `judging` - Judge verdict

**Example** (curl):
```bash
curl -X POST http://localhost:8000/api/debate/run \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Should AI be regulated?",
    "countries": ["USA", "China", "India"]
  }'
```

**Example** (JavaScript):
```javascript
const API_URL = 'https://diplomatrix-ai-backend.onrender.com';

const response = await fetch(`${API_URL}/api/debate/run`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    topic: 'Should AI development be regulated globally?',
    countries: ['USA', 'China', 'India', 'EU', 'Brazil']
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const text = decoder.decode(value);
  const lines = text.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const event = JSON.parse(line.slice(6));
        console.log(`[${event.phase}] ${event.speaker}: ${event.message}`);
      } catch (e) {
        console.error('Failed to parse event:', e);
      }
    }
  }
}
```

**Example** (Python):
```python
import httpx
import json

async def start_debate():
    async with httpx.AsyncClient() as client:
        async with client.stream(
            'POST',
            'https://diplomatrix-ai-backend.onrender.com/api/debate/run',
            json={
                'topic': 'Should AI be regulated?',
                'countries': ['USA', 'China', 'India']
            }
        ) as response:
            async for line in response.aiter_lines():
                if line.startswith('data: '):
                    event = json.loads(line[6:])
                    print(f"[{event['phase']}] {event['speaker']}: {event['message']}")
```

**Example** (React):
```javascript
useEffect(() => {
  const startDebate = async () => {
    const response = await fetch(`${API_URL}/api/debate/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Should AI be regulated?',
        countries: ['USA', 'China', 'India']
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n').filter(l => l.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const event = JSON.parse(line.slice(6));
          // Update UI with event
          setMessages(prev => [...prev, event]);
        }
      }
    }
  };

  startDebate();
}, []);
```

---

## Response Phases Explained

### 1. Opening (`opening`)
Each country delivers their initial stance. Response format:
```json
{
  "phase": "opening",
  "speaker": "USA",
  "message": "The United States believes...",
  "timestamp": "2026-03-22T10:30:00Z"
}
```

### 2. Rebuttal 1 (`rebuttal_1`)
Countries respond to opposing arguments:
```json
{
  "phase": "rebuttal_1",
  "speaker": "China",
  "message": "We respectfully disagree with the US position...",
  "timestamp": "2026-03-22T10:30:15Z"
}
```

### 3. Rebuttal 2 (`rebuttal_2`)
Final counterarguments:
```json
{
  "phase": "rebuttal_2",
  "speaker": "India",
  "message": "Building on our earlier points...",
  "timestamp": "2026-03-22T10:30:30Z"
}
```

### 4. Resolution (`resolution`)
Closing statements:
```json
{
  "phase": "resolution",
  "speaker": "EU",
  "message": "In conclusion, we propose...",
  "timestamp": "2026-03-22T10:30:45Z"
}
```

### 5. Moderation (`moderation`)
Moderator synthesizes all positions:
```json
{
  "phase": "moderation",
  "speaker": "Moderator",
  "message": "Common ground includes... Areas of disagreement...",
  "timestamp": "2026-03-22T10:31:00Z"
}
```

### 6. Voting (`voting`)
Poll of country votes (if applicable):
```json
{
  "phase": "voting",
  "speaker": "System",
  "message": "USA: YES | China: NO | India: YES | EU: YES | Brazil: ABSTAIN",
  "timestamp": "2026-03-22T10:31:15Z"
}
```

### 7. Judging (`judging`)
Judge's verdict and scores:
```json
{
  "phase": "judging",
  "speaker": "Judge",
  "message": "Winner: USA (Score: 8.5/10). Logic: 8, Evidence: 9, Diplomacy: 8. Reasoning: Strongest argumentation with well-supported claims...",
  "timestamp": "2026-03-22T10:31:30Z"
}
```

---

## Error Handling

### Missing Topic

**Status**: 422 Unprocessable Entity

```json
{
  "detail": [
    {
      "loc": ["body", "topic"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Missing Countries

**Status**: 422 Unprocessable Entity

```json
{
  "detail": [
    {
      "loc": ["body", "countries"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### API Key Missing

**Status**: 500 Internal Server Error

Response will include error message about missing `ANTHROPIC_API_KEY` environment variable.

### Network Error

If backend is down:
```
Error: Failed to fetch
```

Check Render service status in dashboard.

---

## Rate Limiting

- **Free Tier Render**: If service goes to sleep, first request may take 10-30 seconds
- **Paid Tier Render**: No rate limits
- **Anthropic API**: Rate limits depend on your plan (see [Anthropic Dashboard](https://console.anthropic.com))

---

## CORS Configuration

Frontend can be any domain. Backend CORS allows:
- `http://localhost:3000`
- `http://localhost:5173`
- Your Vercel domain (configured in `.env`)

To add a new domain, update `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'https://your-new-domain.com',
        ...
    ],
    ...
)
```

Then redeploy backend.

---

## Testing

### Health Check
```bash
curl http://localhost:8000/
# Expected: {"status":"ok","app":"Diplomatrix AI"}
```

### Start Debate
```bash
curl -X POST http://localhost:8000/api/debate/run \
  -H "Content-Type: application/json" \
  -d '{"topic":"Test topic","countries":["USA","China"]}' \
  --stream
```

### Using Postman

1. Create new POST request
2. URL: `http://localhost:8000/api/debate/run`
3. Body (raw JSON):
   ```json
   {
     "topic": "Should AI be regulated?",
     "countries": ["USA", "China", "India"]
   }
   ```
4. Send and watch streaming response

---

## WebSocket Alternative (Future)

Currently using Server-Sent Events (SSE). WebSocket support can be added:

```python
from fastapi import WebSocket

@app.websocket("/ws/debate")
async def websocket_debate(websocket: WebSocket):
    await websocket.accept()
    # ... stream events via websocket.send_json()
```

This would enable bidirectional communication for live interactions.

---

## Performance Benchmarks

### Response Times

| Metric | Value | Notes |
|--------|-------|-------|
| Health Check | <50ms | Instant |
| Debate Start | 500-1500ms | LLM inference time |
| First Agent Response | 2-5s | Anthropic API call |
| Each Response | 1-3s | Depends on complexity |
| Total Debate | 30-60s | 5 agents × 5 phases + judging |

### Token Usage

| Phase | Est. Tokens | Notes |
|-------|-------------|-------|
| Opening | 900 tokens | 5 agents × 180 tokens |
| Rebuttal 1 | 900 tokens | Same pattern |
| Rebuttal 2 | 900 tokens | Same pattern |
| Resolution | 900 tokens | Same pattern |
| Moderation | 400 tokens | Synthesis |
| Judging | 200 tokens | Verdict |
| **Total** | **~4,200 tokens** | ~$0.01 per debate |

---

## Deployment API URLs

After deploying to Render + Vercel:

```
🔗 Backend API: https://diplomatrix-ai-backend.onrender.com
🔗 API Docs:    https://diplomatrix-ai-backend.onrender.com/docs
🔗 Frontend:    https://diplomatrix-ai.vercel.app
```

---

## Support

For issues with the API:
1. Check [Render logs](https://dashboard.render.com)
2. Verify `ANTHROPIC_API_KEY` is set
3. Check browser DevTools → Network tab
4. Review [Deployment Guide](./DEPLOYMENT.md)

---

> **Last Updated**: March 22, 2026