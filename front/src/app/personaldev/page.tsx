'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Github } from 'lucide-react';
import Link from 'next/link';
import { PulseLoader } from 'react-spinners';
// types
import type { PersonalDevDataType } from '@/types/personal-data';
// hooks
import { useIsHomePath } from '@/hooks/useIsHomePath';
import { usePersonalDevData } from '@/hooks/usePersonalDevData';
// components
import Navbar from '@/app/components/nav-bar/Navbar';
import Footer from '@/app/components/layout/Footer';
import PageTransition from '@/app/components/page-transition/PageTransition';

/** `CardBody` の props。 */
type CardBodyProps = {
    /** リンク先。未設定なら子要素をそのまま描画する */
    href?: string;
    /** カードの中身 */
    children: React.ReactNode;
};

/**
 * カードの中身を、リンク先がある場合だけ `Link` で包む。
 *
 * `href=""` のリンク（押すと同じページがリロードされる）を作らないための出し分け。
 *
 * @param props - リンク先と子要素
 */
const CardBody = ({ href, children }: CardBodyProps) =>
    href ? <Link href={href}>{children}</Link> : <>{children}</>;

/**
 * 個人開発履歴ページ
 */
const PersonalHistoryDevPage = () => {
    const isHome: boolean = useIsHomePath();
    const { personalDevDataList, isLoading } = usePersonalDevData();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const projectVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-dark">
                <Navbar />
                <div className="container mx-auto px-4 pt-24 pb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center mb-8"
                    >
                        <Link
                            href="/"
                            className="text-primary hover:text-primary-hover flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Homeへ戻る
                        </Link>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-4xl font-bold text-white mb-8"
                    >
                        個人開発履歴
                    </motion.h1>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-12"
                    >
                        {isLoading ? (
                            <div className="flex justify-center items-center h-screen">
                                <PulseLoader color="#ffffff" size={10} />
                            </div>
                        ) : personalDevDataList?.length == 0 ? (
                            <div className="text-white text-center">
                                <p>No personal development data available.</p>
                            </div>
                        ) : (
                            personalDevDataList?.map(
                                (personalDev: PersonalDevDataType, index: number) => (
                                    <motion.div
                                        key={index}
                                        variants={projectVariants}
                                        whileHover={{
                                            scale: 1.02,
                                            transition: { duration: 0.1, ease: 'easeInOut' },
                                        }}
                                        className="bg-dark-lighter p-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 group"
                                    >
                                        {/* url が無ければリンクにせず中身だけ描画する
                                            （href="" のリンクを作らない） */}
                                        <CardBody href={personalDev.url}>
                                            <h3 className="text-xl font-semibold text-white transition-colors duration-200 group-hover:text-primary mb-2">
                                                {personalDev.title}
                                            </h3>
                                            <p className="text-gray-400 mb-4">
                                                {personalDev.description}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {personalDev.tech.map((tech: string, i: number) => (
                                                    <span
                                                        key={i}
                                                        className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm max-w-[150px] truncate"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </CardBody>
                                        {/* 公開サイトへの Link の「外」に置く。内側に入れると <a> の
                                            入れ子になり HTML として不正（ブラウザが分解する）。
                                            githubUrl が無い要素では要素ごと描画しない（レイアウトは
                                            mt で吸収されるため崩れない）。 */}
                                        {personalDev.githubUrl && (
                                            <a
                                                href={personalDev.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`${personalDev.title} のGitHubリポジトリ`}
                                                className="text-gray-400 hover:text-primary transition-colors duration-200 inline-flex items-center gap-2 mt-4 text-sm"
                                            >
                                                <Github className="h-4 w-4" />
                                                GitHub
                                            </a>
                                        )}
                                    </motion.div>
                                ),
                            )
                        )}
                    </motion.div>
                </div>
            </div>
            {isHome && <Footer />}
        </PageTransition>
    );
};

export default PersonalHistoryDevPage;
