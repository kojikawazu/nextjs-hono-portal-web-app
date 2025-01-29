import Link from 'next/link';
import { PulseLoader } from 'react-spinners';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
// contexts
import { useCommonData } from '@/app/contexts/CommonContext';

/**
 * フッター
 * @returns JSX.Element
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();
    const { isLoading, commonData } = useCommonData();

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
                            <a
                                href={commonData?.linkUrl.githubUrl || ''}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-300 hover:text-primary transition-colors"
                            >
                                <FontAwesomeIcon icon={faGithub} size="lg" />
                            </a>

                            <a
                                href={commonData?.linkUrl.xUrl || ''}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-300 hover:text-primary transition-colors"
                            >
                                <FontAwesomeIcon icon={faTwitter} size="lg" />
                            </a>

                            <a
                                href={commonData?.linkUrl.linkedinUrl || ''}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-300 hover:text-primary transition-colors"
                            >
                                <FontAwesomeIcon icon={faLinkedin} size="lg" />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;
