import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ title, onClose, children, footer, size = 'md' }) => {

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Prevent scrolling on body when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => document.body.style.overflow = 'unset';
    }, []);

    const maxWidth = size === 'lg' ? '800px' : size === 'sm' ? '400px' : '600px';

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                style={{ maxWidth }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div className="modal-title">{title}</div>
                    <button
                        onClick={onClose}
                        style={{ padding: '4px', borderRadius: '50%', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--slate-100)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {children}
                </div>

                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
