import Link from 'next/link';
import { PulseLoader } from 'react-spinners';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
// contexts
import { useCommonData } from '@/contexts/CommonContext';

/**
 * フッター
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();
    const { isLoading, commonData } = useCommonData();

    // 表示順・アイコン・ラベルをひとまとめにする。3 つ同じ JSX を並べると、
    // 条件描画を足すときに 1 つ書き漏らす。
    const socialLinks = [
        { label: 'GitHub', url: commonData?.linkUrl.githubUrl, icon: faGithub },
        { label: 'X', url: commonData?.linkUrl.xUrl, icon: faTwitter },
        { label: 'LinkedIn', url: commonData?.linkUrl.linkedinUrl, icon: faLinkedin },
    ];

    return (
        <footer className="w-full bg-dark-lighter mt-auto border-t border-primary/10">
            {isLoading ? (
                <div className="h-16 flex items-center justify-center">
                    <PulseLoader color="#ffffff" size={10} />
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex flex-col items-center md:items-start gap-2">
                            <Link href="/" className="text-white font-bold text-xl">
                                My Tech Hub
                            </Link>
                            <p className="text-gray-300 text-sm">
                                © {currentYear} My Tech Hub. All rights reserved.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 text-white">
                            {/* URL が無いものはアイコンごと出さない。href="" のリンクを作らない
                                （`schemas/url.ts`: 不正・未設定の URL は undefined に劣化する） */}
                            {socialLinks.map(({ label, url, icon }) =>
                                url ? (
                                    <a
                                        key={label}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className="text-gray-300 hover:text-primary transition-colors"
                                    >
                                        <FontAwesomeIcon icon={icon} size="lg" />
                                    </a>
                                ) : null,
                            )}
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;
