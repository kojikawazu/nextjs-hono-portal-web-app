'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PulseLoader } from 'react-spinners';
// types
import type { AiUsageSectionType } from '@/types/ai-usage';
// hooks
import { useIsHomePath } from '@/hooks/useIsHomePath';
import { useAiUsageData } from '@/hooks/useAiUsageData';
// components
import Navbar from '@/app/components/nav-bar/Navbar';
import Footer from '@/app/components/layout/Footer';
import PageTransition from '@/app/components/page-transition/PageTransition';

/** `AiUsageSection` の props。 */
type AiUsageSectionProps = {
    /** 表示するセクション */
    section: AiUsageSectionType;
    /** 通し番号（1 始まり。`01` のようにゼロ埋めして表示する） */
    index: number;
};

/**
 * AI 活用方法の 1 セクション（見出し・要約・項目リスト）を描画する。
 *
 * 項目の `decision`（人間が決めること）と `url`（参考リンク）は任意のため、
 * 値がある場合だけ描画する。`url` が無い項目にリンクを出さないのは、
 * `href=""` の「押すとリロードされるだけのリンク」を作らないため。
 *
 * @param props - セクションと通し番号
 */
const AiUsageSection = ({ section, index }: AiUsageSectionProps) => (
    <section className="mb-12">
        <div className="flex items-baseline gap-4 flex-wrap">
            <span className="text-primary text-xs font-bold tracking-widest">
                {String(index).padStart(2, '0')}
            </span>
            <h2 className="text-2xl font-bold text-white">{section.title}</h2>
        </div>
        <p className="text-gray-400 mt-2 mb-4 max-w-3xl">{section.summary}</p>

        <div className="flex flex-col gap-2">
            {section.items.map((item) => (
                <div key={item.title} className="bg-dark-lighter rounded-lg p-4">
                    <p className="font-semibold text-white mb-1">{item.title}</p>
                    <p className="text-gray-400 text-sm">{item.description}</p>

                    {item.decision && (
                        <span className="inline-block mt-2 text-sm text-gray-200 bg-primary/10 rounded px-3 py-1">
                            <span className="text-primary font-bold">人間 → </span>
                            {item.decision}
                        </span>
                    )}

                    {item.url && (
                        <div>
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${item.title} の参考リンク`}
                                className="inline-block mt-2 text-sm text-gray-400 hover:text-primary transition-colors duration-200 underline underline-offset-4"
                            >
                                参考リンク ↗
                            </a>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </section>
);

/**
 * AI 活用方法ページ
 */
const AiUsagePage = () => {
    const isHome: boolean = useIsHomePath();
    const { aiUsageData, isLoading } = useAiUsageData();

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
                        AI 活用方法
                    </motion.h1>

                    {isLoading ? (
                        <div className="flex justify-center items-center min-h-screen">
                            <PulseLoader color="#ffffff" size={10} />
                        </div>
                    ) : !aiUsageData || aiUsageData.sections.length === 0 ? (
                        <div className="text-white text-center">
                            <p>No AI usage data available.</p>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            {/* 原則: ページ全体を貫く前提のため、セクションより前に置く */}
                            <div className="border-l-4 border-primary bg-primary/5 rounded-r-lg p-6 mb-12">
                                <p className="text-primary text-xs font-bold tracking-widest">
                                    原則
                                </p>
                                <p className="text-white text-lg font-bold mt-2">
                                    {aiUsageData.principle}
                                </p>
                            </div>

                            {aiUsageData.sections.map((section, index) => (
                                <AiUsageSection
                                    key={section.title}
                                    section={section}
                                    index={index + 1}
                                />
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
            {isHome && <Footer />}
        </PageTransition>
    );
};

export default AiUsagePage;
