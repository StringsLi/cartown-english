<script setup lang="ts">
import { onLaunch, onHide } from "@dcloudio/uni-app";
import { initCloudEnvironment } from "@/services/cloudService";
import { configureAudioPlayback } from "@/services/audioService";
import { flushLearningState } from "@/services/progressService";
import { flushCartownProgress } from "@/services/cartownProgressService";
import { resolveCachedMedia } from "@/services/mediaCacheService";
import { getBookById, getTodayBook } from "@/services/bookService";
import { mapIcon, vehicleIcon } from "@/mock/topicAssets";
import { highResolutionAsset } from "@/services/assetService";

onLaunch(() => {
  const cloudReady = initCloudEnvironment();
  configureAudioPlayback();

  const explorerBook = getBookById("book_red_car_001") ?? getTodayBook();
  const criticalImages = [
    explorerBook.cover,
    vehicleIcon("fire-truck"),
    mapIcon("world"),
    highResolutionAsset("/static/cartown-logos/toyota.webp")
  ];
  criticalImages.forEach((src) => {
    if (src) void resolveCachedMedia(src, "image");
  });

  console.log("车车英语乐园 launched", { cloudReady });
});

onHide(() => {
  flushLearningState();
  flushCartownProgress();
});
</script>

<style lang="scss">
@use "@/styles/global.scss" as *;
</style>
