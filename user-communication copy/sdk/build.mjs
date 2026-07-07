import * as esbuild from 'esbuild';

// UMD-style IIFE for CDN <script> usage
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/comm-timeline-sdk.js',
  format: 'iife',
  globalName: 'CRMCommTimeline',
  target: 'es2020',
  minify: true
});

// ESM for npm/bundler usage
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/comm-timeline-sdk.mjs',
  format: 'esm',
  target: 'es2020',
  minify: true
});

console.log('SDK built successfully');
