"use client";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      const r = room.trim();
      const n = name.trim();
      if (!r || !n) {
        setError("Please enter both room and username.");
        return;
      }
      router.push(`/room/${encodeURIComponent(r)}?name=${encodeURIComponent(n)}`);
    },
    [router, room, name]
  );

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Join a Meeting</h1>
        <p style={{ color: "#666", marginBottom: 16 }}>
          Enter a room name and your username. Share the room URL so others can join.
        </p>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Room</span>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. team-sync"
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
              required
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Username</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
              required
            />
          </label>
          {error && <div style={{ color: "#b00020" }}>{error}</div>}
          <button type="submit" style={{ padding: 12, borderRadius: 8, background: "#111", color: "#fff" }}>
            Join Room
          </button>
        </form>
        <div style={{ marginTop: 16, fontSize: 12, color: "#555" }}>
          After joining, your room URL will look like: <code>/room/my-room?name=alice</code>
        </div>
      </div>
    </div>
  );
}
