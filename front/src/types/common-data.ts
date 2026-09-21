/**
 * 共通データ型
 *
 * URL 系はすべて任意。検証に通らない値・未設定は `undefined` に劣化するため
 * （`schemas/url.ts`）、描画側は値の有無でリンクを出し分ける。
 */
export type CommonDataType = {
    /** ポートフォリオの URL。Hero のボタンと Navbar の項目に使う */
    portfolioUrl?: string;
    /** ブログの URL。Navbar の項目に使う */
    blogUrl?: string;
    /** SNS リンク。Footer のアイコンに使う */
    linkUrl: {
        /** GitHub プロフィールの URL */
        githubUrl?: string;
        /** X（旧 Twitter）の URL */
        xUrl?: string;
        /** LinkedIn の URL */
        linkedinUrl?: string;
    };
};
