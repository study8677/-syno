import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Question } from '../types';
import { QuestionCard } from './QuestionCard';
import { SearchIcon } from './icons';

interface SearchResultsPageProps {
    questions: Question[];
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ questions }) => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const filteredQuestions = useMemo(() => {
        if (!query) {
            return [];
        }
        const lowercasedQuery = query.toLowerCase();
        return questions.filter(question => 
            question.title.toLowerCase().includes(lowercasedQuery) || 
            question.detail.toLowerCase().includes(lowercasedQuery)
        );
    }, [query, questions]);

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-syno-text mb-2">
                    搜索结果
                </h1>
                <p className="text-syno-text-secondary">
                    关于 “<span className="font-semibold text-syno-text">{query}</span>” 的 {filteredQuestions.length} 个结果
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
                        <h2 className="text-xl font-semibold text-syno-text">未找到结果</h2>
                        <p className="text-syno-text-secondary mt-2">
                            尝试使用不同的关键词进行搜索。
                        </p>
                        <Link to="/" className="mt-6 inline-block bg-syno-primary text-white font-semibold px-5 py-2 rounded-md hover:bg-syno-primary-hover transition-colors">
                            返回首页
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
