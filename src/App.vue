<script setup lang="ts">
import { onLaunch } from "@dcloudio/uni-app";
import { initCloudEnvironment } from "@/services/cloudService";
import { configureAudioPlayback } from "@/services/audioService";

onLaunch(() => {
  const cloudReady = initCloudEnvironment();
  configureAudioPlayback();
  console.log("车车探索小助手 launched", { cloudReady });
});
</script>

<style lang="scss">
@use "@/styles/global.scss" as *;
</style>