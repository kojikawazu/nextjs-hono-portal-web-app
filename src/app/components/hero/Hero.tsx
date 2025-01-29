import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * ヒーローセクション
 * @returns JSX.Element
 */
const Hero = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-dark text-white relative overflow-hidden">
            {/* Background gradient effects */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl animate-fade-in-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-fade-in-slow"></div>
            </div>

            <div className="relative z-10 text-center px-4 animate-fade-in">
                <div className="inline-block mb-6 px-4 py-2 bg-secondary/50 backdrop-blur-sm rounded-full">
                    <span className="text-primary">Creative Developer</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Crafting Digital
                    <br />
                    Experiences
                </h1>

                <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                    フロントエンド、バックエンド、インフラまで。
                    <br />
                    モダンな技術で革新的なソリューションを提供します。
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="https://introtechkk.com"
                        className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-dark font-medium rounded-full transition-colors duration-200"
                    >
                        View Portfolio
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link
                        href="/contact"
                        className="inline-flex items-center px-6 py-3 bg-secondary hover:bg-secondary/80 text-white font-medium rounded-full transition-colors duration-200"
                    >
                        Contact
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;
