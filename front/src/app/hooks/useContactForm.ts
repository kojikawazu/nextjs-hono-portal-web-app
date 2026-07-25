'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { contactFormData } from '@/app/types/contact-types';
import { contactSchema } from '@/app/schema/contact-schema';
import { STORAGE_KEYS } from '@/app/constants/storage';
import {
    getDataBySessionStorage,
    setDataBySessionStorage,
} from '@/app/utils/session/session-utils';
import { setFormError } from '@/app/utils/form/form-utils';

/** `/api/mail/csrf` の応答形状。外部入力のため unknown で受けてこのスキーマで検証する。 */
const csrfResponseSchema = z.object({ csrfToken: z.string() });

/**
 * お問い合わせフォームの状態と送信処理を提供するフック。
 *
 * マウント時に CSRF トークンを取得し、保存済み入力があれば復元する。送信時は入力値と
 * トークンを sessionStorage へ保存して確認画面へ遷移する（実送信は確認画面で行う）。
 *
 * @returns フォーム登録関数・送信ハンドラー・バリデーションエラー
 */
export const useContactForm = () => {
    const router = useRouter();
    // CSRFトークン
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        reset,
    } = useForm<contactFormData>({
        resolver: zodResolver(contactSchema),
    });

    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                const response = await fetch('/api/mail/csrf', {
                    credentials: 'include', // クッキーを送信するために必要
                });
                const data: unknown = await response.json();
                const parsed = csrfResponseSchema.safeParse(data);
                if (parsed.success) {
                    setCsrfToken(parsed.data.csrfToken);
                } else {
                    console.error('Unexpected CSRF response format:', data);
                }
            } catch (error) {
                console.error('CSRF token fetch error:', error);
            }
        };

        fetchCsrfToken();

        // セッションストレージからデータを取得して復元
        const data = getDataBySessionStorage(STORAGE_KEYS.CONTACT_FORM);
        if (data) {
            reset(data);
        }
    }, [reset]);

    /**
     * 入力値とトークンを sessionStorage に保存し、確認画面へ遷移する。
     *
     * @param data - バリデーション済みのフォームデータ
     */
    const onSubmit = async (data: contactFormData) => {
        try {
            if (!csrfToken) {
                throw new Error('CSRF token is missing.');
            }

            setDataBySessionStorage(STORAGE_KEYS.CONTACT_FORM, data);
            setDataBySessionStorage(STORAGE_KEYS.CSRF_TOKEN, csrfToken);

            router.push('/contact/confirm');
        } catch (error) {
            setFormError(error, setError);
        }
    };

    return { register, handleSubmit, errors, onSubmit };
};
