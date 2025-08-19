"use client"
import { useCallback, useEffect, useMemo, useState } from "react"
import {useParams, useRouter, useSearchParams} from "next/navigation"
// @ts-ignore
import RoomContainer from "../../../containers/RoomContainer"
import "@livekit/components-styles/prefabs/index.css"


export default function RoomPage() {
    const router = useRouter()

    const { room } = useParams<{ room: string }>()
    const roomName = decodeURIComponent(room ?? "")
    const searchParams = useSearchParams()
    const initialName = (searchParams.get("name") || "").trim()

    const [participantName, setParticipantName] = useState(initialName)
    const [connecting, setConnecting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [wsUrl, setWsUrl] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [showPeople, setShowPeople] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [now, setNow] = useState<Date | null>(null)

    useEffect(() => {
        setNow(new Date())
        const id = setInterval(() => setNow(new Date()), 30_000)
        return () => clearInterval(id)
    }, [])

    useEffect(() => {
        if (!initialName) router.push(`/?room=${roomName}`)
        if (initialName && !token && !connecting) {
            void handleConnect()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const shareUrl = useMemo(() => {
        const origin = typeof window !== "undefined" ? window.location.origin : ""
        return `${origin}/room/${encodeURIComponent(roomName)}`
    }, [roomName])

    const handleCopyShare = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            setCopied(false)
        }
    }, [shareUrl])

    const handleConnect = useCallback(async () => {
        const n = participantName.trim()
        if (!n) {
            setError("Por favor, digite seu nome de usuário.")
            return
        }
        setError(null)
        setConnecting(true)
        try {
            const res = await fetch(`/api/token?room=${encodeURIComponent(roomName)}&name=${encodeURIComponent(n)}`)
            if (!res.ok) {
                const data = (await res.json().catch(() => ({}))) as { error?: string }
                throw new Error(data.error ?? `Token request failed with ${res.status}`)
            }
            const data: { token: string; wsUrl: string } = await res.json()
            setToken(data.token)
            setWsUrl(data.wsUrl)
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Failed to fetch token"
            setError(msg)
        } finally {
            setConnecting(false)
        }
    }, [participantName, roomName])

    const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        void handleConnect()
    }, [handleConnect])

    return (
        <div className="container-full">
            <header className="header" role="banner">
                <strong className="text-sm">Sala: {roomName}</strong>
                <span className="muted">URL para compartilhar:</span>
                <input id="share-url" readOnly value={shareUrl} onFocus={(e) => e.currentTarget.select()} className="input flex-1 min-w-60" aria-label="URL da sala para compartilhar" />
                <button className="btn" type="button" onClick={handleCopyShare} aria-live="polite">{copied ? "Copiado" : "Copiar"}</button>
                <div className="row ml-auto gap-2">
                    <button
                        type="button"
                        className={`btn ${showPeople ? "primary" : "ghost"}`}
                        aria-pressed={showPeople}
                        onClick={() => {
                            setShowPeople(v => {
                                const nv = !v
                                if (nv) setShowChat(false)
                                return nv
                            })
                        }}
                    >Pessoas</button>
                    <button
                        type="button"
                        className={`btn ${showChat ? "primary" : "ghost"}`}
                        aria-pressed={showChat}
                        onClick={() => {
                            setShowChat(v => {
                                const nv = !v
                                if (nv) setShowPeople(false)
                                return nv
                            })
                        }}
                    >Bate-papo</button>
                    <span className="muted small" aria-live="polite">{now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span>
                    {token && <span className="muted small">Você: {participantName || "(anônimo)"}</span>}
                </div>
            </header>

            {!token ? (
                <section className="w-full max-w-xl mx-auto p-6 grid gap-3">
                    <h2 className="m-0 text-lg">Digite seu nome para entrar</h2>
                    <form onSubmit={onSubmit} className="stack" aria-labelledby="join-heading">
                        <label className="stack" htmlFor="name-input">
                            <span>Seu nome</span>
                            <input id="name-input" type="text" placeholder="Seu nome" value={participantName} onChange={(e) => setParticipantName(e.target.value)} className="input" autoFocus aria-describedby={error ? "name-error" : undefined} />
                        </label>
                        {error && <div id="name-error" className="error" role="alert">{error}</div>}
                        <button type="submit" className="btn primary" disabled={connecting}>{connecting ? "Conectando..." : "Entrar na sala"}</button>
                        <p className="small muted">Ao entrar, sua câmera e microfone serão ativados. Você também pode compartilhar a tela e usar o bate-papo.</p>
                    </form>
                </section>
            ) : (
                <section className="flex-1 min-h-0">
                    <RoomContainer token={token} serverUrl={wsUrl ?? undefined} />
                </section>
            )}
        </div>
    )
}
