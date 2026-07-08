import { defineConfig } from 'vite';
import { annoty } from '@annoty/build-plugins';
import originalConfig from './vite.config.ts';

export default defineConfig(async (env) => {
  let resolvedConfig = originalConfig;
  if (resolvedConfig && (resolvedConfig as any).default) {
    resolvedConfig = (resolvedConfig as any).default;
  }
  if (typeof resolvedConfig === 'function') {
    resolvedConfig = await resolvedConfig(env);
  } else if (resolvedConfig && typeof (resolvedConfig as any).then === 'function') {
    resolvedConfig = await resolvedConfig;
  }
  
  if (resolvedConfig && (resolvedConfig as any).default) {
    resolvedConfig = (resolvedConfig as any).default;
  }
  
  const config = { ...resolvedConfig };
  config.plugins = [
    ...(config.plugins || []),
    ...annoty({ enabled: true })
  ];
  console.log('RESOLVED VITE PLUGINS:', config.plugins.map(p => p && (p as any).name).filter(Boolean));
  return config;
});
