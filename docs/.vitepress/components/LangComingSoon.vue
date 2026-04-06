<template>
  <div class="lang-coming-soon">
    <span class="lang-coming-soon__badge">Python</span>
    <span>Python support for this section is coming soon.</span>
  </div>
</template>

<style scoped>
.lang-coming-soon {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-brand-2, #aac8fd);
  background-color: var(--vp-c-brand-soft, rgba(100, 150, 255, 0.08));
  color: var(--vp-c-text-1);
  font-size: 14px;
  margin: 16px 0;
}

.lang-coming-soon__badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: var(--vp-c-brand-1, #1d4ed8);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
