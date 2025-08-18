"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles/prefabs/index.css";

type PageProps = {
  params: { room: string };
};

export default function RoomPage({ params }: PageProps) {
  const searchParams = useSearchParams();
  const initialName = (searchParams.get("name") || "").trim();

  const roomName = decodeURIComponent(params.room);
  const [participantName, setParticipantName] = useState(initialName);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);

  const shareUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/room/${encodeURIComponent(roomName)}`;
    if (participantName) return `${url}?name=${encodeURIComponent(participantName)}`;
    return url;
  }, [roomName, participantName]);

  useEffect(() => {
    // auto-start connection if a name exists in query
    if (initialName && !token && !connecting) {
      void handleConnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleConnect() {
    if (!participantName) {
      setError("Please enter your username.");
      return;
    }
    setError(null);
    setConnecting(true);
    try {
      const res = await fetch(`/api/token?room=${encodeURIComponent(roomName)}&name=${encodeURIComponent(participantName)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Token request failed with ${res.status}`);
      }
      const data: { token: string; wsUrl: string } = await res.json();
      setToken(data.token);
      setWsUrl(data.wsUrl);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to fetch token";
      setError(msg);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "12px 16px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 16 }}>Room: {roomName}</strong>
        <span style={{ color: "#666" }}>Share URL:</span>
        <input readOnly value={shareUrl} onFocus={(e) => e.currentTarget.select()} style={{ flex: 1, minWidth: 240, padding: 8, borderRadius: 6, border: "1px solid #ddd" }} />
      </header>

      {!token ? (
        <div style={{ padding: 20, display: "grid", gap: 12, maxWidth: 520, margin: "24px auto", width: "100%" }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Enter your name to join</h2>
          <input
            type="text"
            placeholder="Your name"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
          {error && <div style={{ color: "#b00020" }}>{error}</div>}
          <button onClick={handleConnect} disabled={connecting} style={{ padding: 12, borderRadius: 8, background: "#111", color: "#fff" }}>
            {connecting ? "Connecting..." : "Join Room"}
          </button>
          <p style={{ fontSize: 12, color: "#666" }}>
            When you join, your camera and microphone will be enabled. You can also share your screen and use chat.
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0 }}>
          <LiveKitRoom
            token={token}
            serverUrl={wsUrl ?? undefined}
            connect
            options={{
              // Start with publishing enabled
              publishDefaults: { videoSimulcast: true },
              // Autoplay remote audio
              dynacast: true,
              adaptiveStream: true,
            }}
            data-lk-theme="default"
            style={{ height: "100%" }}
          >
            <VideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>
      )}
    </div>
  );
}
