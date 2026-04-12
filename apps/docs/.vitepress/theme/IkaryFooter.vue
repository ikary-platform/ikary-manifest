<template>
  <footer class="ikary-footer">
    <!-- Wave background -->
    <div class="ikary-wave-container">
      <svg class="ikary-wave ikary-wave-slow" viewBox="0 0 2880 380" preserveAspectRatio="none">
        <path d="M0,160 C200,60 520,260 720,160 C920,60 1240,260 1440,160 C1640,60 1960,260 2160,160 C2360,60 2680,260 2880,160 L2880,380 L0,380 Z" />
      </svg>
      <svg class="ikary-wave ikary-wave-mid" viewBox="0 0 2880 280" preserveAspectRatio="none">
        <path d="M0,100 C120,180 360,20 480,100 C600,180 840,20 960,100 C1080,180 1320,20 1440,100 C1560,180 1800,20 1920,100 C2040,180 2280,20 2400,100 C2520,180 2760,20 2880,100 L2880,280 L0,280 Z" />
      </svg>
      <svg class="ikary-wave ikary-wave-fast" viewBox="0 0 2880 190" preserveAspectRatio="none">
        <path d="M0,70 C160,130 320,20 480,70 C640,120 800,15 960,70 C1120,125 1280,15 1440,70 C1600,130 1760,20 1920,70 C2080,120 2240,15 2400,70 C2560,125 2720,15 2880,70 L2880,190 L0,190 Z" />
      </svg>
    </div>

    <!-- Footer content -->
    <div class="ikary-footer-inner">
      <div class="ikary-footer-grid">
        <div class="ikary-footer-brand">
          <a href="/" aria-label="IKARY Manifest home">
            <img :src="withBase('/brand/black-full.svg')" alt="IKARY" class="ikary-footer-logo logo-dark" />
            <img :src="withBase('/brand/white-full.svg')" alt="IKARY" class="ikary-footer-logo logo-light" />
          </a>
          <p class="ikary-footer-tagline">
            Open-source declarative cell contracts for the IKARY Platform.
          </p>
        </div>

        <div class="ikary-footer-links">
          <p class="ikary-footer-heading">Docs</p>
          <ul>
            <li><a href="/guide/why-ikary-manifest">Why IKARY Manifest</a></li>
            <li><a href="/guide/cli">Getting Started</a></li>
            <li><a href="/guide/architecture">Architecture</a></li>
          </ul>
        </div>

        <div class="ikary-footer-links">
          <p class="ikary-footer-heading">Reference</p>
          <ul>
            <li><a href="/reference/entity-definition">Entity Definition</a></li>
            <li><a href="/reference/schemas">YAML Schemas</a></li>
            <li><a href="/packages/overview">Packages</a></li>
          </ul>
        </div>

        <div class="ikary-footer-links">
          <p class="ikary-footer-heading">Community</p>
          <ul>
            <li><a href="https://github.com/ikary-platform/ikary-manifest" target="_blank">GitHub</a></li>
            <li><a href="https://x.com/ikary_platform" target="_blank">X / Twitter</a></li>
            <li><a href="/contributing">Contributing</a></li>
          </ul>
        </div>
      </div>

      <div class="ikary-footer-bottom">
        <p>Copyright {{ year }} IKARY. All rights reserved. IKARY Manifest is released under the MIT License.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { withBase } from 'vitepress';

const year = new Date().getFullYear();
</script>
