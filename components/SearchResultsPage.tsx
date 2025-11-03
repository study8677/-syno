
import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Question } from '../types';
import { QuestionCard } from './QuestionCard';
import { SearchIcon } from './icons';
import { useTranslation } from '../i18n/LanguageContext';

interface SearchResultsPageProps {
    questions: Question[];
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ questions }) => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const { t, language } = useTranslation();

    const filteredQuestions = useMemo(() => {
        if (!query) {
            return [];
        }
        const lowercasedQuery = query.toLowerCase();

        // 1. Find all questions that match the search query, regardless of language.
        const allMatchingQuestions = questions.filter(q => 
            q.title.toLowerCase().includes(lowercasedQuery) ||
            q.detail.toLowerCase().includes(lowercasedQuery)
        );

        // 2. Get the unique content_ids from the matches.
        const matchingContentIds = new Set(allMatchingQuestions.map(q => q.content_id));

        // 3. Build the final results list, prioritizing the user's language but including fallbacks.
        const resultsMap = new Map<number, Question>();

        // First pass: Add matches that are in the user's preferred language.
        questions.forEach(q => {
            if (matchingContentIds.has(q.content_id) && q.language === language) {
                resultsMap.set(q.content_id, q);
            }
        });

        // Second pass: Add fallbacks for any matched content that didn't have a version in the user's language.
        allMatchingQuestions.forEach(q => {
            if (!resultsMap.has(q.content_id)) {
                resultsMap.set(q.content_id, q);
            }
        });

        return Array.from(resultsMap.values());

    }, [query, questions, language]);

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-syno-text mb-2">
                    {t('search.title')}
                </h1>
                <p className="text-syno-text-secondary">
                     {filteredQuestions.length} {t('search.resultsFor')} “<span className="font-semibold text-syno-text">{query}</span>”
                </p>
            </div>

            <div className="space-y-4">
                {filteredQuestions.length > 0 ? (
                    filteredQuestions.map(question => (
                        <QuestionCard key={question.id} question={question} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-syno-dark-secondary rounded-lg border border-syno-border">
                        <SearchIcon className="w-12 h-12 mx-auto text-syno-text-secondary mb-4" />
                        <h2 className="text-xl font-semibold text-syno-text">{t('search.noResults')}</h2>
                        <p className="text-syno-text-secondary mt-2">
                            {t('search.tryDifferentKeywords')}
                        </p>
                        <Link to="/" className="mt-6 inline-block bg-syno-primary text-white font-semibold px-5 py-2 rounded-md hover:bg-syno-primary-hover transition-colors">
                            {t('search.backToHome')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
