---
title: Playground
head:
  - - meta
    - http-equiv: refresh
      content: '0;url=/playground/'
---

<script setup>
import { onMounted } from 'vue'
// Force a real HTTP navigation so VitePress router does not intercept
onMounted(() => window.location.replace('/playground/'))
</script>
