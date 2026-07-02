export function getStorage<T>(key: string, fallback?: T): T | undefined {
  try {
    const value = uni.getStorageSync(key);
    return value ? (value as T) : fallback;
  } catch (error) {
    console.warn(`Failed to read storage key: ${key}`, error);
    return fallback;
  }
}

export function setStorage<T>(key: string, value: T): void {
  try {
    uni.setStorageSync(key, value);
  } catch (error) {
    console.warn(`Failed to write storage key: ${key}`, error);
  }
}

export function removeStorage(key: string): void {
  try {
    uni.removeStorageSync(key);
  } catch (error) {
    console.warn(`Failed to remove storage key: ${key}`, error);
  }
}
