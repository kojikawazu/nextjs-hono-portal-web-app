'use client';

import { AnimatePresence } from 'framer-motion';
// utils
import { useIsHomePath } from '@/app/hooks/useIsHomePath';
// components
import Navbar from '@/app/components/nav-bar/Navbar';
import Hero from '@/app/components/hero/Hero';
import Footer from '@/app/components/layout/Footer';
import PageTransition from '@/app/components/page-transition/PageTransition';

/**
 * ホームページ
 */
export default function Home() {
    const isHome: boolean = useIsHomePath();

    return (
        <PageTransition>
            <AnimatePresence mode="wait">
                <div className="min-h-screen bg-dark">
                    <Navbar />
                    <Hero />
                </div>
            </AnimatePresence>
            {isHome && <Footer />}
        </PageTransition>
    );
}
