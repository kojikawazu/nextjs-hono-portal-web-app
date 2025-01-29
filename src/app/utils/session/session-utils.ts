/**
 * セッションストレージからデータを取得
 * @param key キー
 * @returns データ
 */
export const getDataBySessionStorage = (key: string) => {
    const storedData = sessionStorage.getItem(key);
    if (!storedData) {
        return null;
    }
    return JSON.parse(storedData);
};

/**
 * セッションストレージにデータを保存
 * @param key キー
 * @param data データ
 */
export const setDataBySessionStorage = (key: string, data: unknown) => {
    sessionStorage.setItem(key, JSON.stringify(data));
};

/**
 * セッションストレージからデータを削除
 * @param key キー
 */
export const removeDataBySessionStorage = (key: string) => {
    sessionStorage.removeItem(key);
};
