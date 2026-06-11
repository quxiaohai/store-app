<template>
  <router-view v-slot="{Component, route}" v-if="isRouterShow">
    <keep-alive :max="2">
      <component v-if="route.meta.cache" :key="route.meta.key" :is="Component"/>
    </keep-alive>
    <component :is="Component" v-if="!route.meta.cache"/>
  </router-view>
</template>
<script setup>
import {ref} from 'vue'

const isRouterShow = ref(true);
</script>