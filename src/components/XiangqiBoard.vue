<script setup lang="ts">
/**
 * 生成兵 / 炮标记
 * cx, cy 都是棋盘坐标（基于 90×100）
 */
const getMarkerPath = (
  cx: number,
  cy: number,
  type: 'full' | 'left' | 'right'
) => {
  const s = 1.5
  const len = 4
  let d = ''

  if (type !== 'right') {
    d += `M ${cx - s - len} ${cy - s} L ${cx - s} ${cy - s} L ${cx - s} ${cy - s - len} `
    d += `M ${cx - s - len} ${cy + s} L ${cx - s} ${cy + s} L ${cx - s} ${cy + s + len} `
  }

  if (type !== 'left') {
    d += `M ${cx + s + len} ${cy - s} L ${cx + s} ${cy - s} L ${cx + s} ${cy - s - len} `
    d += `M ${cx + s + len} ${cy + s} L ${cx + s} ${cy + s} L ${cx + s} ${cy + s + len} `
  }

  return d
}

/** 所有标准标记 */
const markersPath = (() => {
  let p = ''

  // 黑炮
  p += getMarkerPath(15, 25, 'full')
  p += getMarkerPath(75, 25, 'full')

  // 红炮
  p += getMarkerPath(15, 75, 'full')
  p += getMarkerPath(75, 75, 'full')

  // 黑卒
  p += getMarkerPath(5, 35, 'right')
  p += getMarkerPath(25, 35, 'full')
  p += getMarkerPath(45, 35, 'full')
  p += getMarkerPath(65, 35, 'full')
  p += getMarkerPath(85, 35, 'left')

  // 红兵
  p += getMarkerPath(5, 65, 'right')
  p += getMarkerPath(25, 65, 'full')
  p += getMarkerPath(45, 65, 'full')
  p += getMarkerPath(65, 65, 'full')
  p += getMarkerPath(85, 65, 'left')

  return p
})()
</script>

<template>
  <svg
    class="board-svg"
    viewBox="0 0 90 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 木纹背景 -->
    <defs>
      <linearGradient id="boardWood" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#dfc69f" />
        <stop offset="50%" stop-color="#e6cfaa" />
        <stop offset="100%" stop-color="#d4b88f" />
      </linearGradient>
    </defs>

    <rect x="0" y="0" width="90" height="100" fill="url(#boardWood)" />

    <!-- 外框 -->
    <rect x="2" y="2" width="86" height="96" fill="none" stroke="#2c1e1a" stroke-width="0.8" />

    <!-- 内框（棋盘真实边界） -->
    <rect x="5" y="5" width="80" height="90" fill="none" stroke="#2c1e1a" stroke-width="1.5" />

    <!-- 横线（中间 8 条，不画上下边） -->
    <g stroke="#2c1e1a" stroke-width="0.4">
      <line
        v-for="i in 8"
        :key="`h-${i}`"
        x1="5"
        :y1="5 + i * 10"
        x2="85"
        :y2="5 + i * 10"
      />

      <!-- 上半竖线 -->
      <line
        v-for="i in 7"
        :key="`vt-${i}`"
        :x1="5 + i * 10"
        y1="5"
        :x2="5 + i * 10"
        y2="45"
      />

      <!-- 下半竖线 -->
      <line
        v-for="i in 7"
        :key="`vb-${i}`"
        :x1="5 + i * 10"
        y1="55"
        :x2="5 + i * 10"
        y2="95"
      />
    </g>

    <!-- 九宫 -->
    <g stroke="#2c1e1a" stroke-width="0.4">
      <line x1="35" y1="5" x2="55" y2="25" />
      <line x1="55" y1="5" x2="35" y2="25" />
      <line x1="35" y1="75" x2="55" y2="95" />
      <line x1="55" y1="75" x2="35" y2="95" />
    </g>

    <!-- 兵 / 炮标记 -->
    <path
      :d="markersPath"
      fill="none"
      stroke="#2c1e1a"
      stroke-width="0.6"
    />
  </svg>
</template>

<style scoped>
.board-svg {
  width: 100%;
  height: 100%;
  display: block;
  user-select: none;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}
</style>
