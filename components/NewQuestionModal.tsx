import React, { useState } from 'react';
import type { User } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface NewQuestionModalProps {
    user: User;
    onClose: () => void;
    onSubmit: (guidance: string, personaId: number, circle: string) => void;
}

const CIRCLES = ['科技', '艺术', '生活', '金融'];
const CIRCLES_EN = ['Tech', 'Art', 'Life', 'Finance'];

export const NewQuestionModal: React.FC<NewQuestionModalProps> = ({ user, onClose, onSubmit }) => {
    const { t, language } = useTranslation();
    const [guidance, setGuidance] = useState('');
    const [selectedPersonaId, setSelectedPersonaId] = useState<number>(user.activePersonaId);
    const [selectedCircle, setSelectedCircle] = useState(CIRCLES[0]);
    const [error, setError] = useState('');
    
    const displayCircles = language === 'en' ? CIRCLES_EN : CIRCLES;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (guidance.trim().length < 5) {
            setError(t('newQuestionModal.errorMinChars'));
            return;
        }
        setError('');
        
        // Always submit the Chinese version of the circle for data consistency
        const circleToSubmit = language === 'en' ? CIRCLES[displayCircles.indexOf(selectedCircle)] : selectedCircle;

        onSubmit(guidance.trim(), selectedPersonaId, circleToSubmit);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40" onClick={onClose}>
            <div className="bg-syno-dark-secondary rounded-lg shadow-xl p-8 w-full max-w-2xl border border-syno-border" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 text-syno-text">{t('newQuestionModal.title')}</h2>
                <p className="text-syno-text-secondary mb-6">{t('newQuestionModal.subtitle')}</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="guidance" className="block text-sm font-medium text-syno-text-secondary mb-1">{t('newQuestionModal.guidanceLabel')}</label>
                        <input
                            type="text"
                            id="guidance"
                            value={guidance}
                            onChange={(e) => setGuidance(e.target.value)}
                            className="w-full bg-syno-dark border border-syno-border rounded-md p-2 text-syno-text focus:ring-2 focus:ring-syno-primary focus:outline-none"
                            placeholder={t('newQuestionModal.guidancePlaceholder')}
                            maxLength={200}
                            required
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label htmlFor="persona" className="block text-sm font-medium text-syno-text-secondary mb-1">{t('newQuestionModal.personaLabel')}</label>
                            <select
                                id="persona"
                                value={selectedPersonaId}
                                onChange={(e) => setSelectedPersonaId(Number(e.target.value))}
                                className="w-full bg-syno-dark border border-syno-border rounded-md p-2 text-syno-text focus:ring-2 focus:ring-syno-primary focus:outline-none"
                            >
                                {user.personas.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="circle" className="block text-sm font-medium text-syno-text-secondary mb-1">{t('newQuestionModal.circleLabel')}</label>
                            <select
                                id="circle"
                                value={selectedCircle}
                                onChange={(e) => setSelectedCircle(e.target.value)}
                                className="w-full bg-syno-dark border border-syno-border rounded-md p-2 text-syno-text focus:ring-2 focus:ring-syno-primary focus:outline-none"
                            >
                                {displayCircles.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-syno-border text-syno-text-secondary hover:bg-opacity-80">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-syno-primary text-white font-semibold hover:bg-syno-primary-hover">
                            {t('newQuestionModal.submitButton')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
