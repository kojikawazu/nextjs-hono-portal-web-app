'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
// shadcn
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
// hooks
import { useIsHomePath } from '@/app/hooks/useIsHomePath';
import { useContactForm } from '@/app/hooks/useContactForm';
// components
import Navbar from '@/app/components/nav-bar/Navbar';
import PageTransition from '@/app/components/page-transition/PageTransition';
import Footer from '@/app/components/layout/Footer';

/**
 * お問い合わせフォームページ。フォームの状態・送信ロジックは useContactForm に委譲する。
 */
const ContactFormPage = () => {
    const isHome: boolean = useIsHomePath();
    const { register, handleSubmit, errors, onSubmit } = useContactForm();

    const formVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
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
                        className="text-3xl font-bold text-primary mb-8"
                    >
                        お問い合わせ
                    </motion.h1>

                    <div className="max-w-2xl mx-auto">
                        <motion.form
                            variants={formVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-6 bg-dark-lighter p-8 rounded-lg"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit(onSubmit)(e);
                            }}
                        >
                            <motion.div variants={itemVariants}>
                                <Label htmlFor="name" className="text-white mb-2">
                                    お名前
                                </Label>
                                <Input
                                    {...register('name')}
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="bg-dark border-primary/20 text-white"
                                />
                                {errors.name && (
                                    <p className="text-red-500">{errors.name.message}</p>
                                )}
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Label htmlFor="email" className="text-white mb-2">
                                    メールアドレス
                                </Label>
                                <Input
                                    {...register('email')}
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="bg-dark border-primary/20 text-white"
                                />
                                {errors.email && (
                                    <p className="text-red-500">{errors.email.message}</p>
                                )}
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Label htmlFor="subjects" className="text-white mb-2">
                                    件名
                                </Label>
                                <Input
                                    {...register('subjects')}
                                    type="text"
                                    id="subjects"
                                    name="subjects"
                                    className="bg-dark border-primary/20 text-white"
                                />
                                {errors.subjects && (
                                    <p className="text-red-500">{errors.subjects.message}</p>
                                )}
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Label htmlFor="messages" className="text-white mb-2">
                                    メッセージ
                                </Label>
                                <Textarea
                                    {...register('messages')}
                                    id="messages"
                                    name="messages"
                                    rows={6}
                                    className="bg-dark border-primary/20 text-white resize-none"
                                />
                                {errors.messages && (
                                    <p className="text-red-500">{errors.messages.message}</p>
                                )}
                            </motion.div>

                            <motion.button
                                variants={itemVariants}
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-lg transition-colors duration-200"
                            >
                                送信する
                            </motion.button>
                        </motion.form>
                    </div>
                </div>
            </div>
            {isHome && <Footer />}
        </PageTransition>
    );
};

export default ContactFormPage;
