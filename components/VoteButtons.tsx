
import React from 'react';
import { UpArrowIcon, DownArrowIcon } from './icons';

interface VoteButtonsProps {
    score: number;
    userVote: number; // 1 for upvote, -1 for downvote, 0 for no vote
    onVote: (delta: 1 | -1) => void;
}

export const VoteButtons: React.FC<VoteButtonsProps> = ({ score, userVote, onVote }) => {
    return (
        <div className="flex items-center bg-syno-dark rounded-full border border-syno-border">
            <button
                onClick={() => onVote(1)}
                className={`p-2 rounded-l-full transition-colors duration-150 ${
                    userVote === 1 ? 'text-syno-primary bg-syno-primary/20' : 'text-syno-text-secondary hover:bg-syno-border'
                }`}
            >
                <UpArrowIcon className="w-5 h-5" />
            </button>
            <span className="px-3 font-bold text-sm text-syno-text w-12 text-center">{score}</span>
            <button
                onClick={() => onVote(-1)}
                className={`p-2 rounded-r-full transition-colors duration-150 ${
                    userVote === -1 ? 'text-red-500 bg-red-500/20' : 'text-syno-text-secondary hover:bg-syno-border'
                }`}
            >
                <DownArrowIcon className="w-5 h-5" />
            </button>
        </div>
    );
};
