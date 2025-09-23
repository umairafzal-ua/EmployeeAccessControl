const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const ROOMS = {
  "ServerRoom": { minAccess: 2, open: "09:00", close: "11:00", cooldownMin: 15 },
  "Vault": { minAccess: 3, open: "09:00", close: "10:00", cooldownMin: 30 },
  "R&D Lab": { minAccess: 1, open: "08:00", close: "12:00", cooldownMin: 10 }
};

const timeToMinutes = (t) => {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
};
const minutesToHHMM = (mins) => {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
};

app.post("/simulate", (req, res) => {
  const rawArray = req.body;

  if (!Array.isArray(rawArray)) {
    return res.status(400).json({ error: "Invalid input. Must be an array." });
  }

  const requests = rawArray.map((r, idx) => ({
    originalIndex: idx,
    id: r.id,
    access_level: r.access_level,
    room: r.room,
    request_time: r.request_time,
    tmins: timeToMinutes(r.request_time)
  }));

  requests.sort((a, b) =>
    a.tmins === b.tmins ? a.originalIndex - b.originalIndex : a.tmins - b.tmins
  );

  const lastGranted = {};
  const resultsByIndex = {};

  for (const req of requests) {
    const roomRules = ROOMS[req.room];
    let decision = { granted: false, reason: "" };

    if (!roomRules) {
      decision.reason = `Denied: Unknown room "${req.room}"`;
    } else if (req.access_level < roomRules.minAccess) {
      decision.reason = `Denied: Below required level (needs ${roomRules.minAccess})`;
    } else {
      const openM = timeToMinutes(roomRules.open);
      const closeM = timeToMinutes(roomRules.close);
      if (req.tmins < openM || req.tmins >= closeM) {
        decision.reason = `Denied: Room closed (${roomRules.open} - ${roomRules.close})`;
      } else {
        const empLast = (lastGranted[req.id] && lastGranted[req.id][req.room]) ?? null;
        if (empLast !== null && req.tmins - empLast < roomRules.cooldownMin) {
          const diff = req.tmins - empLast;
          decision.reason = `Denied: Cooldown (${roomRules.cooldownMin} min). Last granted at ${minutesToHHMM(empLast)} (${diff} min ago)`;
        } else {
          decision.granted = true;
          decision.reason = `Access granted to ${req.room}`;
          lastGranted[req.id] = lastGranted[req.id] || {};
          lastGranted[req.id][req.room] = req.tmins;
        }
      }
    }

    resultsByIndex[req.originalIndex] = {
      id: req.id,
      request_time: req.request_time,
      room: req.room,
      access_level: req.access_level,
      granted: decision.granted,
      reason: decision.reason
    };
  }

  const results = rawArray.map((_, idx) => resultsByIndex[idx]);
  res.json(results);
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
