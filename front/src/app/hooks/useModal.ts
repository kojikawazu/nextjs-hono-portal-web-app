import { useState } from 'react';

/**
 * モーダルのカスタムhooks
 * @returns モーダルのhooks
 */
export const useModal = () => {
    // モーダルの開閉状態
    const [isModalOpen, setIsModalOpen] = useState(false);

    /**
     * 送信ボタン押下時の処理
     */
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    /**
     * モーダルでの「送信する」ボタン押下時の処理
     */
    const handleExecute = (handleSubmit: () => void) => {
        setIsModalOpen(false);
        handleSubmit();
    };

    /**
     * モーダルでの「キャンセル」ボタン押下時の処理
     */
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return { isModalOpen, handleOpenModal, handleExecute, handleCloseModal };
};
