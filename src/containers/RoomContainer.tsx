"use client"
import { useEffect, useState } from "react"
import { Room } from "livekit-client"
import { ControlBar, RoomAudioRenderer, RoomContext } from "@livekit/components-react"
import "@livekit/components-styles"
import MyVideoConference from "../components/livekit/MyVideoConference"

interface RoomContainerProps {
  token: string
  serverUrl?: string
}

export default function RoomContainer({ token, serverUrl }: RoomContainerProps) {
  const [room] = useState(() => new Room({ adaptiveStream: true, dynacast: true }))

  useEffect(() => {
    let mounted = true
    const connect = async () => {
      if (mounted) {
        await room.connect(serverUrl ?? "", token)
      }
    }
    connect()

    return () => {
      mounted = false
      room.disconnect()
    }
  }, [room, serverUrl, token])

  return (
    <RoomContext.Provider value={room}>
      <div data-lk-theme="default" style={{ height: "100%" }}>
        <MyVideoConference />
        <RoomAudioRenderer />
        <ControlBar />
      </div>
    </RoomContext.Provider>
  )
}
