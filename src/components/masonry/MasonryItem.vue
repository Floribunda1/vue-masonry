<template>
  <div class="masonry-item" :style="blockStyle" ref="masonryItem">
    <div class="masonry-item-header">
      <slot name="header"></slot>
    </div>
    <div class="masonry-item-img">
      <img :src="url" :style="imageStyle" />
      <div class="masonry-item-img-mask" v-if="showMask">
        <slot name="mask"></slot>
      </div>
    </div>
    <div class="masonry-item-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, ref } from "vue";
import { BlockInfo, UpdateLoadCount } from "@/components/masonry/types";

export default defineComponent({
  name: "masonry-item",
  props: {
    imgUrl: {
      type: String as PropType<string>,
      required: true,
    },
    index: {
      type: Number as PropType<number>,
      required: true,
    },
  },
  setup(props, ctx) {
    const width = inject<number>("width")!;
    const blocksInfo = inject<BlockInfo[]>("blocksInfo")!;
    const updateLoadCount = inject<UpdateLoadCount>("updateLoadCount")!;

    const masonryItem = ref<HTMLElement | null>(null);

    const fallbackImage =
      "https://kubalubra.is/wp-content/uploads/2017/11/default-thumbnail.jpg";

    const initBlockInfo = () => {
      blocksInfo[props.index] = {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        isLaidOut: false,
        image: {
          url: "",
          width: 0,
          height: 0,
          status: "pending",
        },
      };
    };

    const loadImage = (url: string, isFallback = false) => {
      const image = new Image();
      image.src = url;
      image.onload = () => {
        const contentHeight = masonryItem.value?.clientHeight || 0;
        console.log(contentHeight);
        const height = (width / image.width) * image.height;
        blocksInfo[props.index] = Object.assign({}, blocksInfo[props.index], {
          width,
          height: height + contentHeight,
          image: {
            url,
            width,
            height,
            status: isFallback ? "error" : "success",
          },
        });
        updateLoadCount();
      };
      image.onerror = () => {
        loadImage(fallbackImage, true);
      };
    };

    const url = computed(() => blocksInfo[props.index]?.image?.url);

    const imageStyle = computed(() => {
      const { width, height } = blocksInfo[props.index].image;
      return {
        width: width + "px",
        height: height + "px",
      };
    });

    const blockStyle = computed(() => {
      const { left, top, isLaidOut } = blocksInfo[props.index];
      return {
        left: left + "px",
        top: top + "px",
        visibility: isLaidOut ? "visible" : "hidden",
      };
    });

    initBlockInfo();
    loadImage(props.imgUrl);

    const showMask = computed(() => ctx.slots.mask);

    return {
      url,
      imageStyle,
      blockStyle,
      masonryItem,
      showMask,
    };
  },
});
</script>

<style lang="scss" scoped>
.masonry-item {
  display: block;
  position: absolute;
  outline: 2px solid firebrick;

  &-img {
    position: relative;
    width: 100%;

    & > img {
      display: block;
    }
    &-mask {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
