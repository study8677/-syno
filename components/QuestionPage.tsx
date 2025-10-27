import React from 'react';
import type { Question, Answer, Consensus, VoteEntity, Comment, User } from '../types';
import { AnswerCard } from './AnswerCard';
import { ConsensusCard } from './ConsensusCard';
import { VoteButtons } from './VoteButtons';
import { CommentSection } from './CommentSection';
import { useTranslation } from '../i18n/LanguageContext';

interface QuestionPageProps {
    question: Question;
    answers: Answer[];
    consensus: Consensus | undefined;
    comments: Comment[];
    onVote: (entity_type: VoteEntity, entity_id: number, delta: 1 | -1) => void;
    onComment: (entity_type: VoteEntity, entity_id: number, prompt: string, parent_id: number | null) => Promise<Comment | null>;
    getEntityVotes: (entity_type: VoteEntity, entity_id: number) => { userVote: number };
    currentUser: User | null;
}

export const QuestionPage: React.FC<QuestionPageProps> = ({ question, answers, consensus, comments, onVote, onComment, getEntityVotes, currentUser }) => {
    const { t, language } = useTranslation();
    const { userVote: questionUserVote } = getEntityVotes('question', question.id);

    const formattedDate = new Date(question.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-syno-dark-secondary p-6 rounded-lg border border-syno-border mb-8">
                <h1 className="text-3xl font-bold text-syno-text mb-3">{question.title}</h1>
                <p className="text-syno-text-secondary whitespace-pre-wrap">{question.detail}</p>
                <div className="mt-6 flex items-center justify-between">
                     <div className="flex items-center space-x-4 text-syno-text-secondary text-sm">
                        <span>{t('questionPage.postedOn')} {formattedDate}</span>
                    </div>
                   <VoteButtons
                        score={question.vote_score}
                        userVote={questionUserVote}
                        onVote={(delta) => onVote('question', question.id, delta)}
                    />
                </div>
            </div>

            {consensus && (
                <ConsensusCard consensus={consensus} onVote={onVote} getEntityVotes={getEntityVotes} />
            )}

            <div className="mt-10">
                <h2 className="text-2xl font-bold text-syno-text border-b border-syno-border pb-2 mb-6">
                    {answers.length} {t('questionPage.aiAnswers')}
                </h2>
                <div className="space-y-6">
                    {answers.sort((a,b) => b.vote_score - a.vote_score).map(answer => (
                        <AnswerCard key={answer.id} answer={answer} onVote={onVote} getEntityVotes={getEntityVotes} />
                    ))}
                </div>
            </div>
            
            <div className="mt-10">
                 <h2 className="text-2xl font-bold text-syno-text border-b border-syno-border pb-2 mb-6">
                    {question.comment_count} {t('questionPage.comments')}
                </h2>
                <CommentSection
                    entityType="question"
                    entityId={question.id}
                    comments={comments}
                    question={question}
                    onComment={onComment}
                    onVote={onVote}
                    getEntityVotes={getEntityVotes}
                    currentUser={currentUser}
                />
            </div>
        </div>
    );
};
