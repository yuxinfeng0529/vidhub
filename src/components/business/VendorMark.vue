<script setup lang="ts">
import { computed } from 'vue'
import { vendorBySlug, type VendorBrand } from '@/mock/models'

/**
 * 厂商标记。
 * 真实项目里 `vendor.logo_url` 由后端下发；本地没有官方素材，
 * 用品牌双色渐变 + 首字母缩写做程序化标记，风格统一且不涉及商标使用。
 */
const props = withDefaults(
  defineProps<{ slug: string; size?: number; rounded?: boolean }>(),
  { size: 32, rounded: true },
)

const v = computed<VendorBrand>(() => vendorBySlug(props.slug))
</script>

<template>
  <span
    class="mark"
    :class="{ 'is-rounded': rounded }"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${Math.round(size * 0.34)}px`,
      backgroundImage: `linear-gradient(135deg, ${v.from}, ${v.to})`,
    }"
    :title="v.name"
  >
    {{ v.mark }}
  </span>
</template>

<style scoped>
.mark {
  display: inline-grid;
  place-items: center;
  flex: none;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 2px 8px -2px rgba(0, 0, 0, 0.6);
}
.is-rounded {
  border-radius: 30%;
}
</style>
