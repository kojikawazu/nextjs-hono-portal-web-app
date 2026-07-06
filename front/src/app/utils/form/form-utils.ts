import { FieldValues, UseFormSetError } from 'react-hook-form';

/**
 * フォームエラーを設定
 * @param error エラー
 * @param setError エラー設定関数
 */
export const setFormError = <T extends FieldValues>(
    error: unknown,
    setError: UseFormSetError<T>,
) => {
    console.error('Error: ', error);
    setError('root.serverError', { message: 'エラーが発生しました。' });
};
