import React from 'react';
import { Link } from 'react-router-dom';
import type { Question } from '../types';
import { UpArrowIcon, CommentIcon } from './icons';

interface QuestionCardProps {
    question: Question;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
    const timeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " 年前";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " 个月前";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " 天前";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " 小时前";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " 分钟前";
        return Math.floor(seconds) + " 秒前";
    };

    return (
        <Link to={`/question/${question.id}`} className="block bg-syno-dark-secondary p-5 rounded-lg border border-syno-border hover:border-syno-primary transition-colors duration-200">
            <div className="flex justify-between items-start">
                 <h3 className="text-xl font-semibold text-syno-text mb-2 pr-4">{question.title}</h3>
                 {question.circle && (
                    <span className="text-xs font-medium bg-syno-primary/10 text-syno-primary px-2 py-1 rounded-full flex-shrink-0">
                        {question.circle}
                    </span>
                 )}
            </div>
            <p className="text-syno-text-secondary text-sm mb-4 line-clamp-2">{question.detail}</p>
            <div className="flex items-center space-x-4 text-syno-text-secondary text-sm">
                <div className="flex items-center space-x-1">
                    <UpArrowIcon className="w-4 h-4" />
                    <span>{question.vote_score} 赞同</span>
                </div>
                <div className="flex items-center space-x-1">
                    <CommentIcon className="w-4 h-4" />
                    <span>{question.comment_count} 评论</span>
                </div>
                <span>•</span>
                <span>{timeAgo(question.created_at)}</span>
            </div>
        </Link>
    );
};
