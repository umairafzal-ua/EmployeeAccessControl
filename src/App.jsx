import { useState } from "react";
import axios from "axios";
import "./App.css";

const sampleData = [
  { "id": "EMP001", "access_level": 2, "request_time": "09:15", "room": "ServerRoom" },
  { "id": "EMP002", "access_level": 1, "request_time": "09:30", "room": "Vault" },
  { "id": "EMP003", "access_level": 3, "request_time": "10:05", "room": "ServerRoom" },
  { "id": "EMP004", "access_level": 3, "request_time": "09:45", "room": "Vault" },
  { "id": "EMP005", "access_level": 2, "request_time": "08:50", "room": "R&D Lab" },
  { "id": "EMP006", "access_level": 1, "request_time": "10:10", "room": "R&D Lab" },
  { "id": "EMP007", "access_level": 2, "request_time": "10:18", "room": "ServerRoom" },
  { "id": "EMP008", "access_level": 3, "request_time": "09:55", "room": "Vault" },
  { "id": "EMP001", "access_level": 2, "request_time": "09:28", "room": "ServerRoom" },
  { "id": "EMP006", "access_level": 1, "request_time": "10:15", "room": "R&D Lab" }
];

function App() {
  const [input, setInput] = useState(JSON.stringify(sampleData, null, 2));
  const [results, setResults] = useState(null);

  const simulateAccess = async () => {
    try {
      const data = JSON.parse(input);
      const res = await axios.post("http://localhost:5000/simulate", data);
      setResults(res.data);
    } catch (err) {
      alert("Invalid JSON or server error.");
    }
  };

  return (
    <div className="container">
      <h1>Access Grid — Simulator</h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={10}
      />

      <button onClick={simulateAccess}>Simulate Access</button>

      {results && (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Employee</th>
              <th>Room</th>
              <th>Time</th>
              <th>Result</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{r.id}</td>
                <td>{r.room}</td>
                <td>{r.request_time}</td>
                <td className={r.granted ? "granted" : "denied"}>
                  {r.granted ? "GRANTED" : "DENIED"}
                </td>
                <td>{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
