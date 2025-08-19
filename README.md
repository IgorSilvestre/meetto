This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## LiveKit Meeting (Bun + Next.js)

This app provides a simple online meeting experience powered by LiveKit.

Features:
- Join or create rooms by entering a room name and username
- Automatic camera and microphone publishing
- Screen sharing
- In-room chat
- Shareable room URL: /room/{room}?name={username}

### Prerequisites
- LiveKit server running locally on ws://localhost:7880
  - Docs: https://docs.livekit.io
- Bun runtime (https://bun.sh)

### Environment Variables
Create a .env.local file in the project root:

```
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
# Optional (defaults to ws://localhost:7880)
LIVEKIT_WS_URL=ws://localhost:7880
```

The backend API route at /api/token will mint an access token for a given room & username using these credentials.

### Install & Run (Bun)
```
bun install
bun dev
```
Open http://localhost:3000

### Usage
1. On the home page, enter:
   - Room: any string (e.g., team-sync)
   - Username: your display name
2. Click Join Room. You will be taken to /room/{room}?name={username} and connected to LiveKit.
3. Share the room URL with others so they can join the same room with their own name.
4. In-room controls allow toggling camera/mic, starting/stopping screen share, and chatting.

### Notes
- The token API requires LIVEKIT_API_KEY and LIVEKIT_API_SECRET to be set; these come from your LiveKit instance.
- The Video/Audio, Screen Share, and Chat are provided by @livekit/components-react.
- This project uses Bun; use bun install/dev/start instead of npm.
