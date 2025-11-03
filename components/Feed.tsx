

import React, { useState, useMemo, useEffect } from 'react';
import type { Question } from '../types';
import { QuestionCard } from './QuestionCard';
import { useTranslation } from '../i18n/LanguageContext';
import { SparklesIcon } from './icons';

interface FeedProps {
    questions: Question[];
    onGenerateHotTopic: () => void;
    isGeneratingHotTopic: boolean;
}

type SortKey = 'hot' | 'new';
const CIRCLES_ZH = ['全部', '科技', '艺术', '生活', '金融'];
const CIRCLES_EN = ['All', 'Tech', 'Art', 'Life', 'Finance'];
const CIRCLE_MAP_TO_ZH: Record<string, string> = {
    'All': '全部',
    'Tech': '科技',
    'Art': '艺术',
    'Life': '生活',
    'Finance': '金融',
};


export const Feed: React.FC<FeedProps> = ({ questions, onGenerateHotTopic, isGeneratingHotTopic }) => {
    const [sort, setSort] = useState<SortKey>('hot');
    const { t, language } = useTranslation();
    const [activeCircle, setActiveCircle] = useState(language === 'en' ? CIRCLES_EN[0] : CIRCLES_ZH[0]);

    useEffect(() => {
        setActiveCircle(language === 'en' ? CIRCLES_EN[0] : CIRCLES_ZH[0]);
    }, [language]);

    const CIRCLES = language === 'en' ? CIRCLES_EN : CIRCLES_ZH;

    const displayedQuestions = useMemo(() => {
        const contentMap = new Map<number, Question>();

        // First pass: prioritize questions in the user's selected language
        questions.forEach(q => {
            if (q.language === language) {
                contentMap.set(q.content_id, q);
            }
        });

        // Second pass: fill in any missing content with a version from another language
        questions.forEach(q => {
            if (!contentMap.has(q.content_id)) {
                contentMap.set(q.content_id, q);
            }
        });

        return Array.from(contentMap.values());
    }, [questions, language]);

    const sortedQuestions = useMemo(() => {
        const circleFiltered = activeCircle === CIRCLES[0]
            ? displayedQuestions
            : displayedQuestions.filter(q => {
                // This logic allows filtering regardless of the UI language
                const zhCircle = language === 'en' ? CIRCLE_MAP_TO_ZH[activeCircle as keyof typeof CIRCLE_MAP_TO_ZH] : activeCircle;
                return q.circle === zhCircle;
            });

        const sorted = [...circleFiltered];
        if (sort === 'hot') {
            return sorted.sort((a, b) => (b.hot_score || 0) - (a.hot_score || 0));
        }
        if (sort === 'new') {
            return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        return sorted;
    }, [displayedQuestions, sort, activeCircle, language, CIRCLES]);

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
                <div className="flex items-center flex-wrap gap-2">
                    <span className="text-sm font-medium text-syno-text-secondary">{t('feed.circles')}</span>
                     {CIRCLES.map(circle => <CircleButton key={circle} circle={circle} />)}
                </div>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-syno-text">{t('feed.communityFeed')}</h2>
                    <button
                        onClick={onGenerateHotTopic}
                        disabled={isGeneratingHotTopic}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm font-medium bg-syno-primary/10 text-syno-primary border border-syno-primary/30 hover:bg-syno-primary/20 disabled:bg-syno-border disabled:text-syno-text-secondary disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className={`w-4 h-4 ${isGeneratingHotTopic ? 'animate-spin' : ''}`} />
                        {isGeneratingHotTopic ? t('feed.generatingTopic') : t('feed.aiGenerateTopic')}
                    </button>
                </div>
                <div className="flex space-x-2">
                    <SortButton sortKey="hot" label={t('feed.hot')} />
                    <SortButton sortKey="new" label={t('feed.new')} />
                </div>
            </div>
            <div className="space-y-4">
                {sortedQuestions.map(question => (
                    <QuestionCard key={question.id} question={question} />
                ))}
                 {sortedQuestions.length === 0 && (
                    <div className="text-center py-10 text-syno-text-secondary">
                        {t('feed.noQuestionsFound')}
                    </div>
                )}
            </div>
        </div>
    );
};