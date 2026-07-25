'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
// hooks
import { useIsHomePath } from '@/app/hooks/useIsHomePath';
import { useContactConfirm } from '@/app/hooks/useContactConfirm';
import { useModal } from '@/app/hooks/useModal';
// components
import Navbar from '@/app/components/nav-bar/Navbar';
import Footer from '@/app/components/layout/Footer';
import PageTransition from '@/app/components/page-transition/PageTransition';
import ConfirmModal from '@/app/components/modal/ConfirmModal';

/**
 * お問い合わせ確認ページ。復元・送信・戻る処理は useContactConfirm に委譲する。
 */
const ContactConfirmPage = () => {
    const isHome: boolean = useIsHomePath();
    const { register, handleSubmit, watch, errors, onSubmit, handleBackToForm } =
        useContactConfirm();
    // モーダル
    const { isModalOpen, handleOpenModal, handleExecute, handleCloseModal } = useModal();

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
                        <button
                            onClick={handleBackToForm}
                            className="text-primary hover:text-primary-hover flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            フォームへ戻る
                        </button>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-3xl font-bold text-primary mb-8"
                    >
                        確認画面
                    </motion.h1>

                    <form className="max-w-2xl mx-auto bg-dark-lighter p-8 rounded-lg">
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-xl font-bold text-primary my-8 text-center"
                        >
                            この内容でよろしいでしょうか？
                            {errors.root && (
                                <p className="text-red-500 mb-4">
                                    {errors.root.serverError.message}
                                </p>
                            )}
                        </motion.h2>

                        {/* hidden inputs for form submission */}
                        <input type="hidden" {...register('name')} />
                        <input type="hidden" {...register('email')} />
                        <input type="hidden" {...register('subjects')} />
                        <input type="hidden" {...register('messages')} />
                        <div className="flex justify-center">
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                transition={{ staggerChildren: 0.1 }}
                                className="space-y-6"
                            >
                                <motion.div variants={itemVariants}>
                                    <h2 className="text-white font-semibold mb-2">お名前:</h2>
                                    <p className="text-gray-300">{watch('name')}</p>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <h2 className="text-white font-semibold mb-2">
                                        メールアドレス:
                                    </h2>
                                    <p className="text-gray-300">{watch('email')}</p>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <h2 className="text-white font-semibold mb-2">件名:</h2>
                                    <p className="text-gray-300">{watch('subjects')}</p>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <h2 className="text-white font-semibold mb-2">メッセージ:</h2>
                                    <p className="text-gray-300">{watch('messages')}</p>
                                </motion.div>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex justify-center gap-4 mt-8"
                        >
                            <button
                                className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg"
                                onClick={handleBackToForm}
                            >
                                修正する
                            </button>
                            <button
                                className="bg-primary hover:bg-primary-hover text-white py-3 px-6 rounded-lg"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleOpenModal();
                                }}
                            >
                                確認して送信
                            </button>
                        </motion.div>
                    </form>
                </div>
                {isHome && <Footer />}
            </div>

            {/* 確認モーダル */}
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={() => handleExecute(() => handleSubmit(onSubmit)())}
            />
        </PageTransition>
    );
};

export default ContactConfirmPage;
