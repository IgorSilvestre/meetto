import { NextRequest } from "next/server";
import { AccessToken } from "livekit-server-sdk";

/**
 * GET /api/token?room=<room>&name=<username>
 * Returns: { token: string, wsUrl: string }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get("room");
  const name = searchParams.get("name") || searchParams.get("username") || undefined;

  if (!room || !name) {
    return new Response(
      JSON.stringify({ error: "Missing required query params: room and name" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_WS_URL || "ws://localhost:7880";

  if (!apiKey || !apiSecret) {
    return new Response(
      JSON.stringify({ error: "Server missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity: name,
      // name: name, // optional display name
    });

    at.addGrant({
      room: room,
      roomJoin: true,
      roomCreate: true, // allow auto-create if room doesn't exist
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return new Response(
      JSON.stringify({ token, wsUrl }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err) {
    console.error("/api/token error", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate token" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
