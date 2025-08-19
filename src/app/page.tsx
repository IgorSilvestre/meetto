"use client"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

export default function Home() {
  const router = useRouter()
  const [room, setRoom] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [commingFromSharedLink, setCommingFromSharedLink] = useState(false)

  useEffect(() => {
    try {
        // Obter sala a partir dos parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search)
        const roomParam = urlParams.get('room')
        if (roomParam) {
            setRoom(roomParam)
            setCommingFromSharedLink(true)
        }
    } catch {}
  }, [])

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setError(null)
      const r = room.trim()
      const n = name.trim()
      if (!r || !n) {
        setError("Por favor, informe a sala e o nome de usuário.")
        return
      }
      router.push(`/room/${encodeURIComponent(r)}?name=${encodeURIComponent(n)}`)
    },
    [router, room, name]
  )

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Entre em uma reunião</h1>
        <p className="muted" style={{ marginBottom: 16 }}>
          Digite o nome da sala e seu nome de usuário. <br /> Compartilhe a URL da sala para que outras pessoas possam entrar
        </p>
        <form onSubmit={onSubmit} className="stack">
          <label className="stack" htmlFor="room-input">
            <span>Sala</span>
            <input
              id="room-input"
              type="text"
              value={room}
              disabled={commingFromSharedLink}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="ex. team-sync"
              className={`${commingFromSharedLink ? "text-xl font-bold" : "input"}`}
              required
            />
          </label>
          <label className="stack" htmlFor="name-input">
            <span>Nome de usuário</span>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="input"
              required
            />
          </label>
          {error && <div className="error" role="alert">{error}</div>}
          <button type="submit" className="btn primary">
            Entrar na sala
          </button>
        </form>
        <div className="small muted mt-8" style={{ marginTop: 16 }}>
          Depois de entrar, a URL da sua sala ficará assim: <code>/room/minha-sala?name=alice</code>
        </div>
      </div>
    </div>
  )
}
