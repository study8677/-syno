

import React from 'react';
import type { Answer, VoteEntity } from '../types';
import { VoteButtons } from './VoteButtons';
import { ScholarIcon, EngineerIcon, GrumpyBroIcon, MoralistIcon } from './icons';

interface AnswerCardProps {
    answer: Answer;
    onVote: (entity_type: VoteEntity, entity_id: number, delta: 1 | -1) => void;
    getEntityVotes: (entity_type: VoteEntity, entity_id: number) => { userVote: number };
}

export const AnswerCard: React.FC<AnswerCardProps> = ({ answer, onVote, getEntityVotes }) => {
    const { userVote } = getEntityVotes('answer', answer.id);

    const personaInfo = {
        "学者": { icon: <ScholarIcon className="w-5 h-5" />, color: "text-blue-500" },
        "工程师": { icon: <EngineerIcon className="w-5 h-5" />, color: "text-green-500" },
        "暴躁老哥": { icon: <GrumpyBroIcon className="w-5 h-5" />, color: "text-red-500" },
        "圣母": { icon: <MoralistIcon className="w-5 h-5" />, color: "text-pink-500" },
    };

    return (
        <div className="bg-syno-dark-secondary p-5 rounded-lg border border-syno-border">
            <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center space-x-2 font-semibold ${personaInfo[answer.persona].color}`}>
                    {personaInfo[answer.persona].icon}
                    <span>{answer.persona}</span>
                </div>
                <VoteButtons
                    score={answer.vote_score}
                    userVote={userVote}
                    onVote={(delta) => onVote('answer', answer.id, delta)}
                />
            </div>
            <p className="text-syno-text leading-relaxed whitespace-pre-wrap">{answer.content}</p>
        </div>
    );
};