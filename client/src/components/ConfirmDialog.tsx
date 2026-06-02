interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    open, title, message, confirmLabel = 'Usuń', onConfirm, onCancel,
}: ConfirmDialogProps) {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 transition-all"
            onClick={onCancel}
        >
            <div
                className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl ring-1 ring-stone-900/10 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-black text-stone-900 tracking-tight">{title}</h3>
                <p className="mt-2 text-sm text-stone-500 leading-relaxed">{message}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onCancel} className="rounded-xl bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-200 transition-colors">
                        Anuluj
                    </button>
                    <button onClick={onConfirm} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 transition-colors">
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}