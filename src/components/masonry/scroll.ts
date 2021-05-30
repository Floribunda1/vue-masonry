import { ref, onMounted, onBeforeUnmount, SetupContext } from "vue";
import { ScrollProps } from "./types";

type anyFunction = (...args: unknown[]) => unknown;

export const throttle = (fn: anyFunction, delay: number): anyFunction => {
  let start = Date.now();
  return function (...args: unknown[]) {
    if (Date.now() - start < delay) {
      return;
    }
    fn.call(null, ...args);
    start = Date.now();
  };
};

export const debounce = (fn: anyFunction, delay: number): anyFunction => {
  let timer: number | null = null;
  return function (...args: unknown[]) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn.call(null, ...args);
    }, delay);
  };
};

export const handleScroll = (
  ctx: SetupContext<any>,
  scrollProps: ScrollProps
) => {
  const masonryLoading = ref<HTMLElement | null>(null);
  const { isOver, delay } = scrollProps;
  const scrollEvent = debounce(() => {
    if (isOver.value) {
      return;
    }
    // 视窗距离顶部的高度
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;
    const loadingOffsetTop = masonryLoading.value?.offsetTop || 0;

    if (loadingOffsetTop - scrollTop - clientHeight < 40) {
      ctx.emit("reach-bottom");
    }
  }, delay);

  onMounted(() => {
    document.addEventListener("scroll", scrollEvent);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("scroll", scrollEvent);
  });

  return {
    masonryLoading,
  };
};
