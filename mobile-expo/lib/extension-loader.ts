import { useExtensionStore, useActionStore } from './registry';
import './runtime'; // auto-runs setupRuntime() as a side effect
// @ts-ignore — no types shipped with standalone build
import * as Babel from '@babel/standalone';

export function loadExtensions() {
  useActionStore.getState().setActions([]);

  const { extensions } = useExtensionStore.getState();

  Object.values(extensions).forEach(({ id, source }) => {
    try {
      // Strip the type-only ambient import and window. namespace prefix
      const cleaned = source
        .replace(/^import\s+["'][^"']*@types[^"']*["'];?\s*/m, '')
        .replace(/\bwindow\./g, 'global.');

      // Transform to ES5 so Hermes' new Function() can parse async/await etc.
      const result = Babel.transform(cleaned, {
        presets: [['env', { targets: { ie: 11 }, modules: false }]],
        plugins: ['transform-regenerator'],
        filename: `${id}.js`,
        sourceType: 'script',
      });

      // eslint-disable-next-line no-new-func
      new Function('global', result.code)(globalThis);
    } catch (e) {
      console.warn(`[extension-loader] ${id} failed:`, e);
    }
  });
}
