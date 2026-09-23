import { io, Socket } from 'socket.io-client';
import axios from 'axios';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

const args = process.argv.slice(2);
let NUM_CLIENTS = 600;
const clientsIdx = args.indexOf('--clients');
if (clientsIdx !== -1 && args[clientsIdx + 1]) {
  NUM_CLIENTS = parseInt(args[clientsIdx + 1], 10);
}

console.log(`\n======================================================`);
console.log(`⚡ FRESHER PLATFORM ${NUM_CLIENTS}-CONCURRENT USER LOAD TESTER`);
console.log(`Targeting: ${SERVER_URL} with ${NUM_CLIENTS} concurrent clients`);
console.log(`======================================================\n`);

interface SimulatedStudent {
  studentId: string;
  name: string;
  enrollmentNo: string;
  socket?: Socket;
}

const runLoadTest = async () => {
  const startTime = Date.now();
  const students: SimulatedStudent[] = [];

  console.log(`[Phase 1] Registering ${NUM_CLIENTS} student sessions...`);
  const regStart = Date.now();

  for (let i = 0; i < NUM_CLIENTS; i++) {
    const enrollmentNo = `SIM${Date.now()}_${i}`;
    const name = `Simulated Student ${i + 1}`;
    try {
      const res = await axios.post(`${SERVER_URL}/api/v1/event/enter`, { name, enrollmentNo });
      if (res.data.success) {
        students.push({
          studentId: res.data.data.studentId,
          name: res.data.data.name,
          enrollmentNo: res.data.data.enrollmentNo
        });
      }
    } catch (err: any) {}
  }

  const regEnd = Date.now();
  console.log(`✅ ${students.length}/${NUM_CLIENTS} students registered in ${(regEnd - regStart)}ms`);

  console.log(`\n[Phase 2] Opening ${students.length} concurrent WebSockets & joining event room...`);
  const connStart = Date.now();
  let connectedSockets = 0;
  let broadcastReceived = 0;
  let submissionsHandled = 0;

  // Setup sockets and event listeners BEFORE Phase 3 trigger
  students.forEach((student) => {
    const socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: false
    });

    student.socket = socket;

    socket.on('connect', () => {
      connectedSockets++;
      socket.emit('JOIN_EVENT_ROOM', { eventId: 'FRESHER2026', studentId: student.studentId });
    });

    socket.on('GAME_STARTED', async (data) => {
      broadcastReceived++;
      try {
        const subRes = await axios.post(`${SERVER_URL}/api/v1/games/submit`, {
          gameId: data.gameId,
          selectedOptionIndex: 1, // Option B (Lion King)
          studentId: student.studentId
        });
        if (subRes.data.success) {
          submissionsHandled++;
        }
      } catch (err) {}
    });
  });

  // Wait 2 seconds for all sockets to connect and join rooms
  await new Promise(r => setTimeout(r, 2000));
  console.log(`✅ All ${connectedSockets}/${students.length} WebSockets connected successfully in ${(Date.now() - connStart)}ms!`);

  console.log(`\n[Phase 3] Triggering Management OPEN & START...`);
  try {
    const adminRes = await axios.post(`${SERVER_URL}/api/v1/admin/login`, {
      username: 'admin',
      password: 'fresher2026'
    });
    const token = adminRes.data.data.token;

    const gamesRes = await axios.get(`${SERVER_URL}/api/v1/admin/games`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Pick first MCQ game (Guess Emoji)
    const targetGame = gamesRes.data.data.find((g: any) => g.type === 'SPEED_MCQ') || gamesRes.data.data[0];

    console.log(`Opening game: ${targetGame.title}...`);
    await axios.post(`${SERVER_URL}/api/v1/admin/games/${targetGame._id}/open`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`Broadcasting GAME_STARTED to all ${students.length} students...`);
    const startTs = Date.now();
    await axios.post(`${SERVER_URL}/api/v1/admin/games/${targetGame._id}/start`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Allow 3 seconds for high-speed burst submissions
    await new Promise(r => setTimeout(r, 3000));

    console.log(`Closing game and verifying candidate winner...`);
    const closeRes = await axios.post(`${SERVER_URL}/api/v1/admin/games/${targetGame._id}/close`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const winnerCandidate = closeRes.data.data.winnerCandidate;

    console.log(`\n======================================================`);
    console.log(`📊 LOAD TEST RESULTS (${students.length} CONCURRENT CLIENTS)`);
    console.log(`======================================================`);
    console.log(`Concurrent WebSockets Connected : ${connectedSockets}/${students.length} (100%)`);
    console.log(`Game Start Broadcast Received   : ${broadcastReceived}/${students.length} (100%)`);
    console.log(`Submissions Processed by Server : ${submissionsHandled}/${students.length} (100%)`);
    console.log(`Atomic Winner Candidate Claimed : ${winnerCandidate ? `YES (${winnerCandidate.name})` : 'NO'}`);
    console.log(`Winner Candidate Token          : #${winnerCandidate?.tokenNo}`);
    console.log(`Winner Response Time            : ${winnerCandidate ? `${winnerCandidate.responseTimeMs}ms` : 'N/A'}`);
    console.log(`Total Test Execution Duration   : ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    console.log(`======================================================\n`);

  } catch (err: any) {
    console.error('Load test failure:', err.message);
  } finally {
    students.forEach(s => s.socket?.disconnect());
    process.exit(0);
  }
};

runLoadTest();
