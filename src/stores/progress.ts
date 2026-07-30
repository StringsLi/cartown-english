import { defineStore } from "pinia";
import { getHomeStats, type HomeStats } from "@/services/progressService";

export const useProgressStore = defineStore("progress", {
  state: () => ({
    stats: getHomeStats() as HomeStats
  }),
  actions: {
    refresh() {
      this.stats = getHomeStats();
    }
  }
});
