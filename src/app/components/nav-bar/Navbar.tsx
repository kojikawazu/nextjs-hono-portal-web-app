'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { PulseLoader } from 'react-spinners';
// contexts
import { useCommonData } from '@/app/contexts/CommonContext';

/**
 * ナビゲーションバー
 * @returns JSX.Element
 */
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isLoading, commonData } = useCommonData();

    const menuItems = [
        { name: 'ポートフォリオ', path: commonData?.portfolioUrl || '' },
        { name: '個人開発履歴', path: '/personaldev' },
        { name: 'サンプル開発履歴', path: '/sampledev' },
        { name: 'ブログ', path: commonData?.blogUrl || '' },
        { name: 'お問い合わせ', path: '/contact/form' },
    ];

    return (
        <nav className="fixed w-full z-50 bg-dark/80 backdrop-blur-sm border-b border-primary/10 h-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {isLoading ? (
                    <div className="h-16 flex items-center justify-center">
                        <PulseLoader color="#ffffff" size={10} />
                    </div>
                ) : (
                    <div className="flex items-center justify-between h-16">
                        <div className="flex-shrink-0">
                            <Link href="/" className="text-primary font-bold text-xl">
                                My Tech Hub
                            </Link>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-center space-x-8">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.path}
                                        className="text-gray-300 hover:text-primary transition-colors duration-200"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-gray-300 hover:text-primary"
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile menu */}
            {isOpen && !isLoading && (
                <div className="md:hidden bg-dark/95 backdrop-blur-lg">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.path}
                                className="text-gray-300 hover:text-primary block px-3 py-2 text-base"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
