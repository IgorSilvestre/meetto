"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [commingFromSharedLink, setCommingFromSharedLink] = useState(false);

  useEffect(() => {
    try {
        // Get room from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const roomParam = urlParams.get('room');
        if (roomParam) {
            setRoom(roomParam);
            setCommingFromSharedLink(true);
        }
    } catch {}
  }, []);

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
        <p className="muted" style={{ marginBottom: 16 }}>
          Enter a room name and your username. Share the room URL so others can join.
        </p>
        <form onSubmit={onSubmit} className="stack">
          <label className="stack" htmlFor="room-input">
            <span>Room</span>
            <input
              id="room-input"
              type="text"
              value={room}
              disabled={commingFromSharedLink}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. team-sync"
              className={`${commingFromSharedLink ? "text-xl font-bold" : "input"}`}
              required
            />
          </label>
          <label className="stack" htmlFor="name-input">
            <span>Username</span>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="input"
              required
            />
          </label>
          {error && <div className="error" role="alert">{error}</div>}
          <button type="submit" className="btn primary">
            Join Room
          </button>
        </form>
        <div className="small muted" style={{ marginTop: 16 }}>
          After joining, your room URL will look like: <code>/room/my-room?name=alice</code>
        </div>
      </div>
    </div>
  );
}
