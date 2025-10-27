import React, { useState, useMemo } from 'react';
import type { Question } from '../types';
import { QuestionCard } from './QuestionCard';

interface FeedProps {
    questions: Question[];
}

type SortKey = 'hot' | 'new';
const CIRCLES = ['全部', '科技', '艺术', '生活', '金融'];


export const Feed: React.FC<FeedProps> = ({ questions }) => {
    const [sort, setSort] = useState<SortKey>('hot');
    const [activeCircle, setActiveCircle] = useState('全部');

    const sortedQuestions = useMemo(() => {
        const filtered = activeCircle === '全部'
            ? questions
            : questions.filter(q => q.circle === activeCircle);

        const sorted = [...filtered];
        if (sort === 'hot') {
            return sorted.sort((a, b) => (b.hot_score || 0) - (a.hot_score || 0));
        }
        if (sort === 'new') {
            return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        return sorted;
    }, [questions, sort, activeCircle]);

    const SortButton: React.FC<{ sortKey: SortKey, label: string }> = ({ sortKey, label }) => (
        <button
            onClick={() => setSort(sortKey)}
            className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                sort === sortKey
                    ? 'bg-syno-primary text-white'
                    : 'bg-syno-dark-secondary text-syno-text-secondary hover:bg-syno-border'
            }`}
        >
            {label}
        </button>
    );

    const CircleButton: React.FC<{ circle: string }> = ({ circle }) => (
         <button
            onClick={() => setActiveCircle(circle)}
            className={`px-4 py-1.5 rounded-full transition-colors text-sm font-medium border ${
                activeCircle === circle
                    ? 'bg-syno-primary/10 text-syno-primary border-syno-primary/30'
                    : 'bg-syno-dark-secondary text-syno-text-secondary hover:bg-syno-border border-syno-border'
            }`}
        >
            {circle}
        </button>
    );

    return (
        <div className="max-w-3xl mx-auto">
             <div className="mb-6 p-4 bg-syno-dark-secondary border border-syno-border rounded-lg">
                <div className="flex items-center space-x-2">
                    <span className="font-semibold text-syno-text">圈子:</span>
                     {CIRCLES.map(circle => <CircleButton key={circle} circle={circle} />)}
                </div>
            </div>

            <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-syno-text">社区流</h2>
                <div className="flex space-x-2">
                    <SortButton sortKey="hot" label="热度" />
                    <SortButton sortKey="new" label="最新" />
                </div>
            </div>
            <div className="space-y-4">
                {sortedQuestions.map(question => (
                    <QuestionCard key={question.id} question={question} />
                ))}
                 {sortedQuestions.length === 0 && (
                    <div className="text-center py-10 text-syno-text-secondary">
                        这个圈子还没有问题，快来提一个吧！
                    </div>
                )}
            </div>
        </div>
    );
};
