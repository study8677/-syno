import React, { useState } from 'react';
import type { User } from '../types';

interface NewQuestionModalProps {
    user: User;
    onClose: () => void;
    onSubmit: (guidance: string, personaId: number, circle: string) => void;
}

const CIRCLES = ['科技', '艺术', '生活', '金融'];

export const NewQuestionModal: React.FC<NewQuestionModalProps> = ({ user, onClose, onSubmit }) => {
    const [guidance, setGuidance] = useState('');
    const [selectedPersonaId, setSelectedPersonaId] = useState<number>(user.activePersonaId);
    const [selectedCircle, setSelectedCircle] = useState(CIRCLES[0]);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (guidance.trim().length < 5) {
            setError('引导句至少需要 5 个字符。');
            return;
        }
        setError('');
        onSubmit(guidance.trim(), selectedPersonaId, selectedCircle);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40" onClick={onClose}>
            <div className="bg-syno-dark-secondary rounded-lg shadow-xl p-8 w-full max-w-2xl border border-syno-border" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 text-syno-text">AI 辅助提问</h2>
                <p className="text-syno-text-secondary mb-6">提供一句引导，选择您的 AI 人格，剩下的交给 Syno！</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="guidance" className="block text-sm font-medium text-syno-text-secondary mb-1">引导句</label>
                        <input
                            type="text"
                            id="guidance"
                            value={guidance}
                            onChange={(e) => setGuidance(e.target.value)}
                            className="w-full bg-syno-dark border border-syno-border rounded-md p-2 text-syno-text focus:ring-2 focus:ring-syno-primary focus:outline-none"
                            placeholder="例如：探讨一下 AI 对初级软件工程师岗位的影响"
                            maxLength={200}
                            required
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label htmlFor="persona" className="block text-sm font-medium text-syno-text-secondary mb-1">选择提问人格</label>
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
                            <label htmlFor="circle" className="block text-sm font-medium text-syno-text-secondary mb-1">选择圈子</label>
                            <select
                                id="circle"
                                value={selectedCircle}
                                onChange={(e) => setSelectedCircle(e.target.value)}
                                className="w-full bg-syno-dark border border-syno-border rounded-md p-2 text-syno-text focus:ring-2 focus:ring-syno-primary focus:outline-none"
                            >
                                {CIRCLES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-syno-border text-syno-text-secondary hover:bg-opacity-80">
                            取消
                        </button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-syno-primary text-white font-semibold hover:bg-syno-primary-hover">
                            AI 生成问题
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
