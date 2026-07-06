interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

/**
 * 確認モーダル
 * @param isOpen モーダルの開閉状態
 * @param onClose モーダルの閉じる処理
 * @param onConfirm モーダルでの「送信する」ボタン押下時の処理
 * @returns 確認モーダル
 */
const ConfirmModal = ({ isOpen, onClose, onConfirm }: ConfirmModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-dark-lighter rounded-lg shadow-lg p-6 max-w-sm w-full">
                <h2 className="text-lg font-bold mb-4 text-white">確認</h2>
                <p className="text-gray-300">本当に送信してもよろしいでしょうか？</p>
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition duration-200"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-md transition duration-200"
                    >
                        送信する
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
