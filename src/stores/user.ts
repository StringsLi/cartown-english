import { defineStore } from "pinia";
import { getLearningState, updateChildNickname } from "@/services/progressService";

export const useUserStore = defineStore("user", {
  state: () => ({
    childNickname: getLearningState().childNickname
  }),
  actions: {
    setNickname(name: string) {
      this.childNickname = name || "Little Reader";
      updateChildNickname(this.childNickname);
    }
  }
});
