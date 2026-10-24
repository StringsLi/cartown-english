import { readonly, ref } from "vue";

const pendingWrites = new Map<string, unknown>();
const pendingCount = ref(0);
export const unsavedStorageCount = readonly(pendingCount);

export function getStorage<T>(key: string, fallback?: T): T | undefined {
  if (pendingWrites.has(key)) return pendingWrites.get(key) as T;
  try {
    const value = uni.getStorageSync(key);
    return value === undefined || value === null || value === "" ? fallback : (value as T);
  } catch (error) {
    console.warn(`Failed to read storage key: ${key}`, error);
    return fallback;
  }
}

export function setStorage<T>(key: string, value: T): boolean {
  try {
    uni.setStorageSync(key, value);
    pendingWrites.delete(key);
    pendingCount.value = pendingWrites.size;
    return true;
  } catch (error) {
    pendingWrites.set(key, value);
    pendingCount.value = pendingWrites.size;
    console.warn(`Failed to write storage key: ${key}`, error);
    return false;
  }
}

export function retryStorageWrites(): boolean {
  for (const [key, value] of [...pendingWrites]) setStorage(key, value);
  return pendingWrites.size === 0;
}

export function removeStorage(key: string): void {
  try {
    uni.removeStorageSync(key);
    pendingWrites.delete(key);
    pendingCount.value = pendingWrites.size;
  } catch (error) {
    console.warn(`Failed to remove storage key: ${key}`, error);
  }
}
