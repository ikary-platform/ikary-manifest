---
title: Playground
head:
  - - meta
    - http-equiv: refresh
      content: '0;url=/ikary-manifest/playground/'
---

<script setup>
import { onMounted } from 'vue'
// Force a real HTTP navigation so VitePress router does not intercept
onMounted(() => window.location.replace('/ikary-manifest/playground/'))
</script>
