'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PulseLoader } from 'react-spinners';
// types
import { PersonalDevDataType } from '@/app/types/personal-data-types';
// utils
import { useIsHomePath } from '@/app/utils/path/path-functions';
// components
import Navbar from '@/app/components/nav-bar/Navbar';
import Footer from '@/app/components/layout/Footer';
import PageTransition from '@/app/components/page-transition/PageTransition';

/**
 * 個人開発履歴ページ
 * @returns JSX.Element
 */
const PersonalHistoryDevPage = () => {
    const isHome: boolean = useIsHomePath();
    const [isLoading, setIsLoading] = useState(true);
    const [personalDevDataList, setPersonalDevDataList] = useState<PersonalDevDataType[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await fetch('/api/gcs/personaldev');

                if (result.ok) {
                    const data = await result.json();

                    if (data.personaldev && Array.isArray(data.personaldev)) {
                        setPersonalDevDataList(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            data.personaldev.map((item: any) => ({
                                title: item.title,
                                description: item.description,
                                tech: item.tech,
                                url: item.url,
                            })),
                        );
                    } else {
                        console.error('Unexpected API response format:', data);
                    }
                }
            } catch (error) {
                console.error('Error fetching personal development data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

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
                                        <Link href={personalDev.url}>
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
                                        </Link>
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
