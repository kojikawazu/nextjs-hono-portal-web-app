'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// utils
import { useIsHomePath } from '@/app/utils/path/path-functions';
// components
import Navbar from '@/app/components/nav-bar/Navbar';
import Footer from '@/app/components/layout/Footer';
import PageTransition from '@/app/components/page-transition/PageTransition';

/**
 * 送信成功画面
 * @returns JSX.Element
 */
const ContactSuccessPage = () => {
    const isHome: boolean = useIsHomePath();
    const router = useRouter();

    const handleBackToHome = () => {
        router.push('/');
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-dark flex flex-col">
                <Navbar />
                <div className="flex-grow flex justify-center items-center">
                    <div className="max-w-lg bg-dark-lighter p-8 rounded-lg text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-3xl font-bold text-primary mb-4"
                        >
                            送信が完了しました！
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-gray-300 mb-6"
                        >
                            お問い合わせいただきありがとうございます。
                            <br />
                            内容を確認次第、返信させていただきます。
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col gap-4"
                        >
                            <button
                                className="w-full bg-primary hover:bg-primary-hover text-white py-3 px-6 rounded-lg"
                                onClick={handleBackToHome}
                            >
                                ホームへ戻る
                            </button>
                            <Link
                                href="/contact/form"
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg block text-center"
                            >
                                再度お問い合わせ
                            </Link>
                        </motion.div>
                    </div>
                </div>
                {isHome && <Footer />}
            </div>
        </PageTransition>
    );
};

export default ContactSuccessPage;
