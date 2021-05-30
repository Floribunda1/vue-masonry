<template>
  <div class="masonry" :style="masonryWrapperStyle" ref="masonry">
    <slot />
    <div class="masonry-loading" ref="masonryLoading" v-if="!isOver">
      <slot name="loading">正在加载中...</slot>
    </div>
    <div class="masonry-finish" v-else>
      <slot name="finish">到底啦</slot>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  provide,
  reactive,
  ref,
  watchEffect,
  toRef,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { BlockInfo } from "@/components/masonry/types";
import { handleScroll } from "@/components/masonry/scroll";

export default defineComponent({
  name: "Masonry",
  props: {
    columns: {
      type: [String, Number] as PropType<string | number>,
      default: "auto",
    },
    width: {
      type: Number as PropType<number>,
      default: 260,
    },
    gap: {
      type: [Number, String] as PropType<number | string>,
      default: "auto",
    },
    verticalGap: {
      type: [Number, String] as PropType<number | string>,
      default: "auto",
    },
    isOver: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    bottomDistance: {
      type: Number as PropType<number>,
      default: 30,
    },
  },
  emits: ["reach-bottom"],
  setup(props, ctx) {
    provide("width", props.width);

    const columns = ref(0);
    const gap = ref(0);
    const verticalGap = ref(0);

    const masonry = ref<HTMLElement | null>(null);

    const isResizing = ref(false);

    // 改变尺寸事件绑定
    const watchResize = () => {
      const resizeEvent = () => {
        isResizing.value = true;
        normalizeProps();
        layout();
        isResizing.value = false;
      };

      onMounted(() => window.addEventListener("resize", resizeEvent));
      onBeforeUnmount(() => window.removeEventListener("resize", resizeEvent));
    };

    watchResize();

    const blocksInfo = reactive<BlockInfo[]>([]);
    provide("blocksInfo", blocksInfo);

    const loadedCount = ref(0);
    provide("updateLoadCount", () => {
      loadedCount.value++;
    });

    const columnsHeight = reactive<number[]>([]);

    const normalizeProps = () => {
      const masonryWidth =
        masonry.value?.clientWidth || document.documentElement.clientWidth;
      // normalize columns
      if (props.columns === "auto") {
        columns.value = Math.floor(masonryWidth / props.width);
      } else {
        columns.value = Number(props.columns);
      }

      // 先清除掉，然后再重新塞入
      columnsHeight.length = 0;
      columnsHeight.push(...new Array(columns.value).fill(0));

      // normalize gap
      if (props.gap === "auto") {
        const remainSize = masonryWidth - columns.value * props.width;
        // gap 的数量为 columns + 1
        gap.value = remainSize / (columns.value + 1);
      } else {
        gap.value = Number(props.gap);
      }

      // normalize vertical gap
      if (props.verticalGap === "auto") {
        verticalGap.value = gap.value;
      } else {
        verticalGap.value = Number(props.verticalGap);
      }
    };

    // 在 nexttick 中获取到对应 dom 然后进行重新计算
    nextTick(normalizeProps);

    // 寻找高度最低的那一列
    const findMinNumberIdx = (arr: number[]) => {
      let min = Infinity;
      let i = 0;
      arr.forEach((num, index) => {
        if (min > num) {
          min = num;
          i = index;
        }
      });
      return i;
    };

    // 进行布局
    const layout = () => {
      blocksInfo.forEach((block, index) => {
        // 如果是由于 resize 引起的重排，就会对所有元素生效
        if (isResizing.value) {
          block.isLaidOut = false;
        }
        if (block.isLaidOut) {
          return;
        }
        const { width, height } = block;
        // 寻找最小列
        const minHeightColumn = findMinNumberIdx(columnsHeight);

        // 计算间距
        const left = minHeightColumn * (width + gap.value) + gap.value;
        const top = columnsHeight[minHeightColumn];
        columnsHeight[minHeightColumn] += height + verticalGap.value;
        blocksInfo[index] = Object.assign({}, blocksInfo[index], {
          left,
          top,
          isLaidOut: true,
        });
      });
    };

    const masonryWrapperStyle = computed(() => {
      return {
        height: Math.max(...columnsHeight) + props.bottomDistance + "px",
      };
    });

    // 判断是否加载完成
    watchEffect(function judgeLoadingComplete() {
      if (!ctx.slots.default) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let children = ctx.slots.default() as any;

      if (Array.isArray(children) /* v-for */) {
        children = children[0];
      }
      if (children.shapeFlag === 1 << 4 /* fragment */) {
        children = children.children;
      }
      if (children.length === loadedCount.value) {
        layout();
      }
    });

    const isOver = toRef(props, "isOver");

    // 滚动事件绑定
    const { masonryLoading } = handleScroll(ctx, { isOver, delay: 200 });

    return {
      masonryWrapperStyle,
      masonry,
      masonryLoading,
    };
  },
});
</script>

<style lang="scss" scoped>
.masonry {
  width: 100%;
  position: relative;
  &-loading,
  &-finish {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
