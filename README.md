# Shadertoy Editor

> [!NOTE]
> This is mainly an AI-generated project.

A lightweight, web-based WebGL shader editor with [Shadertoy][shadertoy] compatibility.
Write, compile, and visualize GLSL fragment shaders in a progressive web app
environment with persistent local storage.

Visit
**[https://www.alea.net/shadertoy-editor/](https://www.alea.net/shadertoy-editor/)**
to use the editor directly in your browser.

You can also install it as a progressive web app (PWA) on your device, by
clicking on the install button in your browser's address bar.

## Features

- **Shader Editing** - GLSL syntax highlighting, code completions, and error
  markers
- **WebGL 2.0 Real-time Rendering** - Compile and render shaders instantly
- **Shadertoy Compatible** - Support for standard [Shadertoy][shadertoy] uniforms
  (`iResolution`, `iTime`, `iMouse`, etc.)
- **Project Persistence** - Locally save and manage shader projects
- **PWA Support** - Offline-capable progressive web app

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
git clone https://github.com/vhiribarren/shadertoy-editor.git
cd shadertoy-editor
npm install
```

### Development

```bash
npm run dev      # Start development server with hot module replacement
```

Open your browser to `http://localhost:5173` (or the URL shown in terminal).

### Build & Deployment

```bash
npm run build    # Create production build
npm run preview  # Preview the production build locally
```

### Testing

Data consistency tests verify that shader project storage and retrieval maintain data integrity:

```bash
npm run test           # Run tests once
npm run test:watch     # Run tests in watch mode
```

### Shader Structure

All shaders implement the standard Shadertoy function:

```glsl
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    // Your shader code here
    fragColor = vec4(uv, 0.5, 1.0);
}
```

Available Shadertoy uniforms:
- `iResolution` (vec3) - Viewport resolution in pixels
- `iTime` (float) - Elapsed time in seconds since the shader started
- `iTimeDelta` (float) - Time elapsed since the last frame
- `iFrame` (int) - Frame count
- `iFrameRate` (float) - Frame rate in frames per second
- `iMouse` (vec4) - Mouse position and click state (x, y, click_x, click_y)
- `iDate` (vec4) - Year, month, day, seconds since midnight

## Limitations

Compared to [Shadertoy][shadertoy], the following features are not currently supported:

- **Input Channels** - `iChannel0`, `iChannel1`, `iChannel2`, `iChannel3` uniforms are declared but not functional. Texture inputs, webcam sources, and other channel types are not available.
- **Audio Input** - No support for audio visualization or sound-reactive features
- **Screen Capture** - Cannot capture or manipulate screen output across frames
- **Keyboard Input** - No `iKey` uniform or keyboard state tracking
- **Multiple Passes** - Only single-pass fragment shaders are supported; multi-pass rendering and buffer channels (A, B, C, D) are not available

These limitations may be addressed in future versions. For now, shaders relying only on time, mouse, and the Shadertoy mathematical uniforms will work seamlessly.

## License

MIT-0 License - See [LICENSE.md](LICENSE.md) for details

[shadertoy]: https://www.shadertoy.com/