'use client';

import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { contactFormData } from '@/app/types/contact-types';
import { contactSchema } from '@/app/schema/contact-schema';
import { STORAGE_KEYS } from '@/app/constants/storage';
import {
    getDataBySessionStorage,
    removeDataBySessionStorage,
} from '@/app/utils/session/session-utils';
import { setFormError } from '@/app/utils/form/form-utils';

/**
 * お問い合わせ確認画面の状態と送信処理を提供するフック。
 *
 * マウント時に sessionStorage から入力値と CSRF トークンを復元する（入力が無ければフォームへ戻す）。
 * 送信時は `/api/mail/send` へ POST し、成功で完了画面、失敗でフォームエラーを表示する。
 *
 * @returns フォーム登録・監視関数、送信/戻るハンドラー、バリデーションエラー
 */
export const useContactConfirm = () => {
    const router = useRouter();
    // CSRFトークン
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setError,
        formState: { errors },
    } = useForm<contactFormData>({
        resolver: zodResolver(contactSchema),
    });

    useEffect(() => {
        // sessionStorage から CSRFトークンを取得
        const storedToken = sessionStorage.getItem(STORAGE_KEYS.CSRF_TOKEN);
        setCsrfToken(storedToken || null);

        const data = getDataBySessionStorage(STORAGE_KEYS.CONTACT_FORM);
        if (!data) {
            router.push('/contact/form');
            return;
        }

        reset(data);
    }, [router, reset]);

    /**
     * 確認内容をメール送信する。成功で完了画面、失敗でフォームエラーを設定する。
     *
     * @param data - 送信するフォームデータ
     */
    const onSubmit = async (data: contactFormData) => {
        try {
            if (!csrfToken) {
                throw new Error('CSRF token is missing.');
            }

            const response = await fetch('/api/mail/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (response.ok) {
                removeDataBySessionStorage(STORAGE_KEYS.CONTACT_FORM);
                router.push('/contact/success');
            } else {
                setFormError(response.statusText, setError);
            }
        } catch (error) {
            setFormError(error, setError);
        }
    };

    /**
     * フォームへ戻る。保存済みの入力とトークンを破棄する。
     *
     * @param e - クリックイベント（デフォルト遷移を抑止する）
     */
    const handleBackToForm = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        removeDataBySessionStorage(STORAGE_KEYS.CONTACT_FORM);
        removeDataBySessionStorage(STORAGE_KEYS.CSRF_TOKEN);
        sessionStorage.clear();
        router.replace('/contact/form');
    };

    return { register, handleSubmit, watch, errors, onSubmit, handleBackToForm };
};
