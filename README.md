# LibreSpeak

A self-hosted Text-to-Speech service powered by ElevenLabs API and SvelteKit.

## Features
- Simple, clean interface for text-to-speech conversion
- Self-hosted solution for privacy and control
- Built with modern web technologies (SvelteKit, TailwindCSS)
- Docker support for easy deployment

## Prerequisites
- Node.js 20+ (for local development)
- Docker and Docker Compose (for deployment)
- ElevenLabs API key ([Get one here](https://elevenlabs.io/))

## Quick Start (Docker)

1. Clone the repository:


```bash
git clone https://github.com/logan-larson/LibreSpeak.git

cd LibreSpeak
```

2. Create a `.env` file with your ElevenLabs API key:

```bash
ELEVENLABS_API_KEY=your_api_key_here
```

3. Build and run with Docker Compose:
```bash
docker compose up -d
```

The application will be available at `http://localhost:3000`

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your ElevenLabs API key as shown above.

3. Start the development server:
```bash
npm run dev
```

4. Visit `http://localhost:5173` in your browser.

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a new branch for your feature:
```bash
git checkout -b feature/amazing-feature
```

3. Make your changes and commit them:
```bash
git commit -m 'Add some amazing feature'
```

4. Push to your branch:
```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Make sure all tests pass:
```bash
npm run test
```

## Testing

Run the test suite:
```bash
npm run test
```

## Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## License

[MIT License](LICENSE)

## Acknowledgments
- [ElevenLabs](https://elevenlabs.io/) for their excellent TTS API
- [SvelteKit](https://kit.svelte.dev/) for the web framework
- All our contributors!

