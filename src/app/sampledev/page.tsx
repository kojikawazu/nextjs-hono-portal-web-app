'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PulseLoader } from 'react-spinners';
import Image from 'next/image';
// types
import { SampleDevDataType } from '@/app/types/sample-data-types';
// utils
import { useIsHomePath } from '@/app/utils/path/path-functions';
// components
import Navbar from '@/app/components/nav-bar/Navbar';
import PageTransition from '@/app/components/page-transition/PageTransition';
import Footer from '@/app/components/layout/Footer';

/**
 * サンプル開発履歴ページ
 * @returns JSX.Element
 */
const SampleHistoryDevPage = () => {
    const isHome: boolean = useIsHomePath();
    const [isLoading, setIsLoading] = useState(true);
    const [sampleDevDataList, setSampleDevDataList] = useState<SampleDevDataType[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await fetch('/api/gcs/sampledev');

                if (result.ok) {
                    const data = await result.json();

                    if (data.sampledev && Array.isArray(data.sampledev)) {
                        setSampleDevDataList(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            data.sampledev.map((item: any) => ({
                                title: item.title,
                                description: item.description,
                                tech: item.tech,
                                imageUrl: item.imageUrl,
                                url: item.url,
                            })),
                        );
                    } else {
                        console.error('Unexpected API response format:', data);
                    }
                }
            } catch (error) {
                console.error('Error fetching sample development data:', error);
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

    const itemVariants = {
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
                        サンプル開発履歴
                    </motion.h1>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {isLoading ? (
                            <div className="flex justify-center items-center h-screen">
                                <PulseLoader color="#ffffff" size={10} />
                            </div>
                        ) : sampleDevDataList.length == 0 ? (
                            <div className="text-white text-center">
                                <p>No sample development data available.</p>
                            </div>
                        ) : (
                            sampleDevDataList.map((sample, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{
                                        scale: 1.03,
                                        transition: { duration: 0.1, ease: 'easeInOut' },
                                    }}
                                    className="bg-dark-lighter rounded-lg overflow-hidden transition-all duration-100 hover:shadow-lg hover:shadow-primary/20 group"
                                >
                                    <div className="relative w-full h-48">
                                        <Image
                                            src={sample.imageUrl}
                                            alt={sample.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-white transition-colors duration-100 group-hover:text-primary mb-2">
                                            {sample.title}
                                        </h3>
                                        <p className="text-gray-400 mb-6">{sample.description}</p>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {sample.tech.map((tech: string, i: number) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm max-w-[150px] truncate"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                        <Link
                                            href={sample.url}
                                            className="text-primary hover:text-primary-hover inline-flex items-center gap-2"
                                        >
                                            View Sample Code
                                            <ArrowLeft className="h-4 w-4 rotate-180" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </div>
            </div>
            {isHome && <Footer />}
        </PageTransition>
    );
};

export default SampleHistoryDevPage;
