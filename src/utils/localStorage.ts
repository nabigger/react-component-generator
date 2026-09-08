// localStorage 키 정의
const STORAGE_KEYS = {
  API_KEY: 'rcg_api_key',
  PROVIDER: 'rcg_provider',
  COMPONENTS: 'rcg_components',
} as const;

// API 키 저장/로드
export function saveApiKey(apiKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
  } catch (err) {
    console.warn('Failed to save API key to localStorage:', err);
  }
}

export function loadApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  } catch (err) {
    console.warn('Failed to load API key from localStorage:', err);
    return '';
  }
}

// Provider 저장/로드
export function saveProvider(provider: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROVIDER, provider);
  } catch (err) {
    console.warn('Failed to save provider to localStorage:', err);
  }
}

export function loadProvider(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.PROVIDER) || 'google';
  } catch (err) {
    console.warn('Failed to load provider from localStorage:', err);
    return 'google';
  }
}

// 컴포넌트 목록 저장/로드 (JSON 직렬화)
export function saveComponents<T>(components: T[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPONENTS, JSON.stringify(components));
  } catch (err) {
    console.warn('Failed to save components to localStorage:', err);
  }
}

export function loadComponents<T>(defaultValue: T[] = []): T[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPONENTS);
    if (!stored) return defaultValue;

    const parsed = JSON.parse(stored) as T[];
    // createdAt을 Date 객체로 변환 (필요시)
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch (err) {
    console.warn('Failed to load components from localStorage:', err);
    return defaultValue;
  }
}

// 전체 저장소 초기화 (선택사항)
export function clearAllStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    localStorage.removeItem(STORAGE_KEYS.PROVIDER);
    localStorage.removeItem(STORAGE_KEYS.COMPONENTS);
  } catch (err) {
    console.warn('Failed to clear localStorage:', err);
  }
}
