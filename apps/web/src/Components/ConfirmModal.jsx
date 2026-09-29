import React from 'react';

export default function ConfirmModal({
    isOpen,
    title = "Emin misiniz?",
    message,
    confirmText = "Evet, Sil",
    cancelText = "İptal",
    onConfirm,
    onClose
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] w-screen h-screen bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#0d1117] border border-[#1a2035] rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto text-xl font-bold">
                    ⚠️
                </div>
                <div>
                    {title && <h3 className="text-base font-bold text-white mb-1">{title}</h3>}
                    <p className="text-xs sm:text-sm font-medium text-gray-300 leading-relaxed">{message}</p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            onConfirm();
                        }}
                        className="flex-1 px-4 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-900/40 transition-all"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
