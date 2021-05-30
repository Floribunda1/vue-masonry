<template>
  <div class="wrapper">
    <masonry @reach-bottom="handleReach" :is-over="isOver" :width="270">
      <masonry-item
        v-for="(img, index) in imgs"
        :key="img"
        :img-url="img"
        :index="index"
        @mousemove="showMask(index)"
        @mouseleave="showMask(-1)"
      >
        <template #header>
          <div class="masonry-item-test">这里是header</div>
        </template>
        <template #footer>
          <div class="masonry-item-test">这里是footer</div>
        </template>
        <template #mask>
          <div class="my-mask" v-show="showingMask === index">
            <div class="button-group">
              <button>💖</button>
              <button>🔞</button>
            </div>
          </div>
        </template>
      </masonry-item>
      <template #loading>
        <div class="spinner">
          <div class="rect"></div>
          <div class="rect"></div>
          <div class="rect"></div>
          <div class="rect"></div>
          <div class="rect"></div>
        </div>
      </template>
    </masonry>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import Masonry from "@/components/masonry/Masonry.vue";
import MasonryItem from "@/components/masonry/MasonryItem.vue";
import { urls } from "@/components/masonry/fake";

export default defineComponent({
  name: "MasonryView",
  components: { MasonryItem, Masonry },
  // FIXME: 当图片过少的时候无法触发滚动事件出现碧油鸡
  setup() {
    let group = 1;
    let count = 50;
    const isOver = ref(false);
    const imgs = ref<string[]>(urls.slice(0, group * count));
    const showingMask = ref(-1);
    const handleReach = () => {
      group++;
      if (group > 3) {
        isOver.value = true;
      }
      imgs.value = urls.slice(0, group * count);
    };

    const showMask = (index: number) => {
      showingMask.value = index;
    };
    return {
      imgs,
      handleReach,
      isOver,
      showMask,
      showingMask,
    };
  },
});
</script>

<style lang="scss">
.wrapper {
  padding-top: 20px;
}

.spinner {
  display: flex;
  justify-content: center;
  align-items: center;

  & > .rect {
    background-color: #2ecc71;
    width: 6px;
    height: 20px;
    margin-right: 10px;
    animation: stretch-delay 1.2s infinite ease-in-out;
    border-radius: 4px;
  }
}

@for $i from 1 through 5 {
  .rect:nth-child(#{$i}) {
    animation-delay: $i * 0.2s;
  }
}
@keyframes stretch-delay {
  0%,
  20%,
  100% {
    transform: scaleY(1);
  }

  40% {
    transform: scaleY(2);
  }
}

.masonry-item-test {
  text-align: center;
  padding: 20px 0;
}

.my-mask {
  background-color: rgba(0, 0, 0, 0.1);
  height: 100%;
}

.button-group {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 20px;
  display: flex;
  justify-content: space-around;
  align-items: flex-start;

  & > button {
    width: 50px;
    font-size: 24px;
    height: 40px;
  }
}
</style>
