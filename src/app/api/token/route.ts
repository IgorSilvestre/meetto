import { NextRequest } from "next/server"
import { AccessToken } from "livekit-server-sdk"

/**
 * GET /api/token?room=<room>&name=<username>
 * Returns: { token: string, wsUrl: string }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const room = searchParams.get("room")
  const name = searchParams.get("name") || searchParams.get("username") || undefined

  if (!room || !name) {
    return new Response(
      JSON.stringify({ error: "Parâmetros obrigatórios ausentes: room e name" }),
      { status: 400, headers: { "content-type": "application/json" } }
    )
  }

  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const wsUrl = process.env.LIVEKIT_WS_URL || "ws://localhost:7880"

  if (!apiKey || !apiSecret) {
    return new Response(
      JSON.stringify({ error: "Variáveis de ambiente ausentes: LIVEKIT_API_KEY ou LIVEKIT_API_SECRET" }),
      { status: 500, headers: { "content-type": "application/json" } }
    )
  }

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity: name,
      // name: name, // nome de exibição opcional
    })

    at.addGrant({
      room: room,
      roomJoin: true,
      roomCreate: true, // permitir auto-criação se a sala não existir
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    })

    const token = await at.toJwt()

    return new Response(
      JSON.stringify({ token, wsUrl }),
      { status: 200, headers: { "content-type": "application/json" } }
    )
  } catch (err) {
    console.error("/api/token error", err)
    return new Response(
      JSON.stringify({ error: "Falha ao gerar token" }),
      { status: 500, headers: { "content-type": "application/json" } }
    )
  }
}
