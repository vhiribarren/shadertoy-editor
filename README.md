# Shadertoy Editor

> **Note**: This is mainly an AI-generated project.

A lightweight, web-based WebGL shader editor with Shadertoy compatibility.
Write, compile, and visualize GLSL fragment shaders in a progressive web app
environment with persistent local storage.

## Features

- **Shader Editing** - GLSL syntax highlighting, code completions, and error
  markers
- **WebGL 2.0 Real-time Rendering** - Compile and render shaders instantly
- **[Shadertoy](https://www.shadertoy.com/) Compatible** - Support for standard Shadertoy uniforms
  (`iResolution`, `iTime`, `iMouse`, etc.)
- **Project Persistence** - Locally save and manage shader projects
- **PWA Support** - Offline-capable progressive web app

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
git clone https://github.com/vhiribarren/shader-studio-lite.git
cd shader-studio-lite
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

Tests cover:
- **CRUD Operations** - Create, read, update, delete shader projects with data format validation
- **Data Type Validation** - Ensure IDs, names, timestamps, and file structures match expected types
- **Import/Export Roundtrips** - Verify exported projects can be re-imported without data loss
- **Format Compatibility** - Support for multiple import formats (new files array, old single code field, raw GLSL)
- **Edge Cases** - Unicode, special characters, empty strings, very long code, etc.

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
- `iResolution` (vec3) - Viewport resolution
- `iTime` (float) - Elapsed time in seconds
- `iFrame` (int) - Frame count
- `iMouse` (vec4) - Mouse position and click state

## License

MIT-0 License - See [LICENSE.md](LICENSE.md) for details