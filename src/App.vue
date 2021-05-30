<template>
  <masonry-view></masonry-view>
</template>

<script lang="ts">
import MasonryView from '@/view/Masonry.vue'
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'App',
  components: {
    MasonryView
  }
});
</script>