import { defineConfig } from 'vite';
import { resolve } from 'path';
import eslint from 'vite-plugin-eslint';
import { createHtmlPlugin } from 'vite-plugin-html';
import postcssNested from 'postcss-nested';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

export default defineConfig(() => {
  const isNoMinify = process.env.NO_MINIFY === 'true';
  const postCssPlugins = [postcssNested(), autoprefixer()];
  const buildOutput = {
    manualChunks(id) {
      if (id.includes('node_modules')) {
        return id.toString().split('node_modules/')[1].split('/')[0].toString();
      }
      return null;
    },
  };
  if (!isNoMinify) {
    postCssPlugins.push(cssnano({ preset: 'default' }));
  }
  if (isNoMinify) {
    buildOutput.entryFileNames = 'assets/[name].js';
    buildOutput.chunkFileNames = 'assets/[name].js';
    buildOutput.assetFileNames = 'assets/[name].[ext]';
  }

  return {
    publicDir: 'public',
    root: './',
    base: './',
    build: {
      outDir: isNoMinify ? 'dist-no-minify' : 'dist',
      minify: isNoMinify ? false : 'esbuild',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: buildOutput,
      },
    },
    css: {
      postcss: {
        plugins: postCssPlugins,
      },
    },
    plugins: [
      {
        name: 'crossorigin',
        transformIndexHtml(html) {
          return html.replace(/crossorigin/g, '');
        },
      },
      eslint({
        cache: false,
        fix: true,
      }),
      createHtmlPlugin({
        minify: !isNoMinify,
        inject: {
          data: {
            img: './src/assets/images',
            video: './src/assets/video',
            currentYear: new Date().getFullYear(),
          },
        },
      }),
    ],
    resolve: {
      alias: {
        '@css': resolve(__dirname, './src/styles'),
        '@img': resolve(__dirname, './src/assets/images'),
        '@fonts': resolve(__dirname, './src/assets/fonts'),
        '@video': resolve(__dirname, './src/assets/video'),
      },
    },
  };
});
