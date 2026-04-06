import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import IkaryFooter from './IkaryFooter.vue';
import LangComingSoon from '../components/LangComingSoon.vue';
import { h, onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vitepress';
import './style.css';

function initMermaid() {
  if (typeof window === 'undefined') return;

  const render = () => {
    const els = document.querySelectorAll<HTMLElement>('.mermaid');
    if (els.length === 0) return;

    const isDark = document.documentElement.classList.contains('dark');

    // Load mermaid from CDN if not already loaded
    const w = window as any;
    if (w.mermaid) {
      w.mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: isDark
          ? {
              primaryColor: '#182644',
              primaryTextColor: '#f8fafc',
              primaryBorderColor: '#78afff',
              lineColor: '#78afff',
              secondaryColor: '#111c34',
              tertiaryColor: '#0a1329',
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: '14px',
            }
          : {
              primaryColor: '#e8f0fe',
              primaryTextColor: '#071230',
              primaryBorderColor: '#1d4ed8',
              lineColor: '#1d4ed8',
              secondaryColor: '#f1f5f9',
              tertiaryColor: '#ffffff',
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: '14px',
            },
      });
      w.mermaid.run({ nodes: els });
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js';
      script.onload = () => render();
      document.head.appendChild(script);
    }
  };

  // Render on mount and route change
  nextTick(render);

  // Re-render when theme toggles
  const observer = new MutationObserver(() => nextTick(render));
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(IkaryFooter),
    });
  },
  enhanceApp({ app }) {
    app.component('LangComingSoon', LangComingSoon);
  },
  setup() {
    const route = useRoute();
    onMounted(() => initMermaid());
    watch(() => route.path, () => nextTick(() => initMermaid()));
  },
} satisfies Theme;
