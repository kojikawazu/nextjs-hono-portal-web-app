'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/** ページ遷移アニメーションのラッパーが受け取る props。 */
type PageTransitionProps = {
    /** アニメーションを適用する子要素 */
    children: ReactNode;
};

/**
 * ページ遷移時にフェードアニメーションを子要素へ適用するラッパー。
 */
const PageTransition = ({ children }: PageTransitionProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
