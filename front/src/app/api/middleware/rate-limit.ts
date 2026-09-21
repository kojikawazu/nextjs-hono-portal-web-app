import type { MiddlewareHandler } from 'hono';

/**
 * レートリミットの設定。
 */
type RateLimitOptions = {
    /** ウィンドウ内に許可するリクエスト数 */
    limit: number;
    /** ウィンドウの長さ（ミリ秒） */
    windowMs: number;
    /**
     * 追跡するクライアント数の上限。これを超えたら最も古いエントリから捨てる。
     * 上限を設けないと、送信元を変えながら叩くだけでメモリを食い潰せてしまい、
     * レートリミッター自体が攻撃経路になる。
     */
    maxTrackedClients?: number;
};

/** 追跡クライアント数の既定上限。 */
const DEFAULT_MAX_TRACKED_CLIENTS = 10_000;

/**
 * リクエスト元を識別するキーを決める。
 *
 * Cloudflare が付与する `cf-connecting-ip` を優先し、無ければ `x-forwarded-for` の
 * 先頭（最も手前のクライアント）を使う。
 *
 * **これらのヘッダーは送信側が詐称できる。** 本アプリの Cloud Run は
 * `--allow-unauthenticated` で公開されており、Cloudflare を迂回して直接叩けるため、
 * 本ミドルウェアは「善意の利用者による過剰送信」と「素朴なスパム」を抑えるもので、
 * 分散・詐称を伴う攻撃には効かない。エッジ側（Cloudflare）の制限と併用する前提。
 *
 * @param headerValue - `cf-connecting-ip` の値
 * @param forwardedFor - `x-forwarded-for` の値
 * @returns 識別キー。いずれも取れない場合は `unknown`
 */
const resolveClientKey = (
    headerValue: string | undefined,
    forwardedFor: string | undefined,
): string => {
    const cfIp = headerValue?.trim();
    if (cfIp) return cfIp;

    const firstForwarded = forwardedFor?.split(',')[0]?.trim();
    if (firstForwarded) return firstForwarded;

    // 識別できない場合は共通キーに寄せる。個別に通すより、まとめて絞るほうが安全側。
    return 'unknown';
};

/**
 * IP ベースのレートリミットを行う Hono ミドルウェアを生成する。
 *
 * スライディングウィンドウ方式。固定ウィンドウだと境界をまたいで短時間に上限の 2 倍を
 * 通せてしまうため、リクエスト時刻を保持してウィンドウ内の件数で判定する。
 *
 * **カウントはインスタンスのメモリに持つ。** Cloud Run は水平スケールするため、実効上限は
 * 「閾値 × 稼働インスタンス数」になり、インスタンス再起動でリセットされる。厳密な保証では
 * なく、無制限状態からの現実的な緩和として位置づける（詳細は
 * `docs/06-security-specification/application.md`）。
 *
 * @param options - 閾値・ウィンドウ長・追跡上限
 * @returns 超過時に 429 と `{ error }` を返すミドルウェア
 */
export const createRateLimiter = (options: RateLimitOptions): MiddlewareHandler => {
    const { limit, windowMs, maxTrackedClients = DEFAULT_MAX_TRACKED_CLIENTS } = options;

    /** クライアントキー → ウィンドウ内のリクエスト時刻。 */
    const hits = new Map<string, number[]>();

    return async (c, next) => {
        const key = resolveClientKey(
            c.req.header('cf-connecting-ip'),
            c.req.header('x-forwarded-for'),
        );
        const now = Date.now();
        const windowStart = now - windowMs;

        // ウィンドウから外れた記録を落としてから判定する。
        const recent = (hits.get(key) ?? []).filter((at) => at > windowStart);

        if (recent.length >= limit) {
            const retryAfterSec = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
            c.header('Retry-After', String(retryAfterSec));
            return c.json({ error: 'Too many requests. Please try again later.' }, 429);
        }

        recent.push(now);
        hits.set(key, recent);

        // 期限切れのエントリを掃除する。Map は挿入順を保つため、超過分は先頭（古い順）から捨てる。
        for (const [trackedKey, timestamps] of hits) {
            if (timestamps.every((at) => at <= windowStart)) {
                hits.delete(trackedKey);
            }
        }
        while (hits.size > maxTrackedClients) {
            const oldestKey = hits.keys().next().value;
            if (oldestKey === undefined) break;
            hits.delete(oldestKey);
        }

        await next();
    };
};
