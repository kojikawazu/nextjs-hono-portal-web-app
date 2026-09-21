import type { z } from 'zod';

/**
 * API アクセスの失敗を表すエラー。
 *
 * 失敗の種類を `kind` で区別する。呼び出し側（hooks / contexts）がログ出力や
 * 画面表示を切り替えられるようにするためで、`instanceof` で判別する。
 */
export class ApiError extends Error {
    constructor(
        /** 失敗の種類。`network` は通信自体の失敗、`status` は非 2xx、`schema` は応答形状の不一致 */
        readonly kind: 'network' | 'status' | 'schema',
        message: string,
        /** `kind` が `status` のときの HTTP ステータス */
        readonly status?: number,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * API を呼び出し、応答を Zod スキーマで検証して返す。
 *
 * `fetch` を書いてよいのは `repositories/` だけ（`frontend.md`）。認証ヘッダ・エラー
 * 処理・リトライの実装が散らばらないよう、呼び出し口をこの 1 関数に閉じる。
 * 外部入力は `unknown` で受け、`parse` してからドメインへ渡す（`typescript.md`）。
 *
 * @param input - リクエスト先 URL
 * @param schema - 応答を検証する Zod スキーマ
 * @param init - `fetch` に渡す追加オプション（メソッド・ヘッダー・認証情報など）
 * @returns スキーマ検証済みの応答
 * @throws {ApiError} 通信に失敗した場合（`network`）、非 2xx の場合（`status`）、応答が
 *   スキーマに一致しない場合（`schema`）
 */
export async function fetchJson<TSchema extends z.ZodTypeAny>(
    input: string,
    schema: TSchema,
    init?: RequestInit,
): Promise<z.infer<TSchema>> {
    const response = await requestOrThrow(input, init);

    // 外部入力は unknown で受け、スキーマ検証でナローイングしてから返す。
    let body: unknown;
    try {
        body = await response.json();
    } catch {
        throw new ApiError('schema', `${input}: 応答を JSON として解釈できません`);
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        throw new ApiError('schema', `${input}: 応答が想定の形式と一致しません`);
    }
    return parsed.data;
}

/**
 * API を呼び出し、応答本文を読まずに成否だけを確かめる。
 *
 * 本文を返さないエンドポイント（送信系など）で使う。
 *
 * @param input - リクエスト先 URL
 * @param init - `fetch` に渡す追加オプション
 * @throws {ApiError} 通信に失敗した場合（`network`）、非 2xx の場合（`status`）
 */
export async function fetchOk(input: string, init?: RequestInit): Promise<void> {
    await requestOrThrow(input, init);
}

/**
 * `fetch` を実行し、通信失敗と非 2xx を `ApiError` に正規化する。
 *
 * @param input - リクエスト先 URL
 * @param init - `fetch` に渡す追加オプション
 * @returns 2xx の応答
 * @throws {ApiError} 通信に失敗した場合（`network`）、非 2xx の場合（`status`）
 */
async function requestOrThrow(input: string, init?: RequestInit): Promise<Response> {
    let response: Response;
    try {
        response = await fetch(input, init);
    } catch (cause) {
        // fetch は通信失敗のときだけ reject する（非 2xx では reject しない）。
        throw new ApiError('network', `${input}: 通信に失敗しました`);
    }

    if (!response.ok) {
        throw new ApiError(
            'status',
            `${input}: ${response.status} ${response.statusText}`,
            response.status,
        );
    }
    return response;
}
