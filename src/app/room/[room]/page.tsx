"use client";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LiveKitRoom, RoomAudioRenderer, ControlBar, GridLayout, ParticipantTile, Chat, useTracks, useParticipants, ParticipantName, LayoutContextProvider } from "@livekit/components-react";
import "@livekit/components-styles/prefabs/index.css";
import { Track } from "livekit-client";

type PageProps = {
  params: Promise<{ room: string }>;
};

export default function RoomPage({ params }: PageProps) {
  const searchParams = useSearchParams();
  const initialName = (searchParams.get("name") || "").trim();

  const { room } = use(params);
  const roomName = decodeURIComponent(room);
  const [participantName, setParticipantName] = useState(initialName);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/room/${encodeURIComponent(roomName)}`;
    if (participantName) return `${url}?name=${encodeURIComponent(participantName)}`;
    return url;
  }, [roomName, participantName]);

  useEffect(() => {
    // hydrate participant name from localStorage if not provided in query
    if (!initialName && typeof window !== "undefined") {
      const saved = window.localStorage.getItem("displayName");
      if (saved) setParticipantName(saved);
    }
    // auto-start connection if a name exists in query
    if (initialName && !token && !connecting) {
      void handleConnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Right-side panels
  const [showPeople, setShowPeople] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Meet-like stage: grid of camera/screenshare tiles
  function Stage() {
    const tracks = useTracks([Track.Source.ScreenShare, Track.Source.Camera]);
    return (
      <GridLayout tracks={tracks} style={{ height: "100%" }}>
        <ParticipantTile />
      </GridLayout>
    );
  }

  // People panel: simple list of participant names
  function PeoplePanel() {
    const participants = useParticipants();
    return (
      <div className="stack" style={{ padding: 8 }}>
        <div className="small muted">Participants ({participants.length})</div>
        <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {participants.map((p) => (
            <li key={p.sid} className="row" style={{ justifyContent: "space-between" }}>
              <ParticipantName participant={p} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const handleCopyShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: select the input by id
      const el = document.getElementById("share-url") as HTMLInputElement | null;
      if (el) {
        el.select();
        document.execCommand?.("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    }
  }, [shareUrl]);

  const handleConnect = useCallback(async () => {
    if (!participantName.trim()) {
      setError("Please enter your username.");
      return;
    }
    setError(null);
    setConnecting(true);
    try {
      const res = await fetch(`/api/token?room=${encodeURIComponent(roomName)}&name=${encodeURIComponent(participantName.trim())}`);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Token request failed with ${res.status}`);
      }
      const data: { token: string; wsUrl: string } = await res.json();
      setToken(data.token);
      setWsUrl(data.wsUrl);
      // persist name for next time
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("displayName", participantName.trim());
        }
      } catch {}
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to fetch token";
      setError(msg);
    } finally {
      setConnecting(false);
    }
  }, [participantName, roomName]);

  const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void handleConnect();
  }, [handleConnect]);

  return (
    <div className="container-full">
      <header className="header" role="banner">
        <strong style={{ fontSize: 16 }}>Room: {roomName}</strong>
        <span className="muted">Share URL:</span>
        <input
          id="share-url"
          readOnly
          value={shareUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="input"
          style={{ flex: 1, minWidth: 240 }}
          aria-label="Shareable room URL"
        />
        <button className="btn" type="button" onClick={handleCopyShare} aria-live="polite">
          {copied ? "Copied" : "Copy"}
        </button>
        <div className="row" style={{ marginLeft: "auto", gap: 8 }}>
          <button
            type="button"
            className={`btn${showPeople ? " primary" : ""}`}
            aria-pressed={showPeople}
            onClick={() => {
              setShowPeople((v) => {
                const nv = !v;
                if (nv) setShowChat(false);
                return nv;
              });
            }}
          >
            People
          </button>
          <button
            type="button"
            className={`btn${showChat ? " primary" : ""}`}
            aria-pressed={showChat}
            onClick={() => {
              setShowChat((v) => {
                const nv = !v;
                if (nv) setShowPeople(false);
                return nv;
              });
            }}
          >
            Chat
          </button>
          <span className="muted small" aria-live="polite">{now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span>
          {token && (
            <span className="muted small">You: {participantName || "(anonymous)"}</span>
          )}
        </div>
      </header>

      {!token ? (
        <div style={{ padding: 20, display: "grid", gap: 12, maxWidth: 520, margin: "24px auto", width: "100%" }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Enter your name to join</h2>
          <form onSubmit={onSubmit} className="stack" aria-labelledby="join-heading">
            <label className="stack" htmlFor="name-input">
              <span>Your name</span>
              <input
                id="name-input"
                type="text"
                placeholder="Your name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="input"
                autoFocus
                aria-describedby={error ? "name-error" : undefined}
              />
            </label>
            {error && (
              <div id="name-error" className="error" role="alert">
                {error}
              </div>
            )}
            <button type="submit" className="btn primary" disabled={connecting}>
              {connecting ? "Connecting..." : "Join Room"}
            </button>
            <p className="small muted">
              When you join, your camera and microphone will be enabled. You can also share your screen and use chat.
            </p>
          </form>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0 }}>
          <LiveKitRoom
            token={token}
            serverUrl={wsUrl ?? undefined}
            connect
            options={{
              // Start with publishing enabled
              publishDefaults: { simulcast: true },
              // Autoplay remote audio
              dynacast: true,
              adaptiveStream: true,
            }}
            data-lk-theme="default"
            style={{ height: "100%" }}
          >
            <LayoutContextProvider>
              <div className="meet-shell">
                <div className="meet-main">
                  <div className="meet-stage">
                    <Stage />
                  </div>
                  {showPeople && (
                    <aside className="meet-sidebar" aria-label="Participants panel">
                      <PeoplePanel />
                    </aside>
                  )}
                  {showChat && (
                    <aside className="meet-sidebar" aria-label="Chat panel">
                      <Chat />
                    </aside>
                  )}
                </div>
                <div className="meet-controls">
                  <ControlBar controls={{ chat: false, settings: true }} />
                </div>
              </div>
            </LayoutContextProvider>
            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>
      )}
    </div>
  );
}
