
import React from 'react';
import type { Consensus, VoteEntity } from '../types';
import { VoteButtons } from './VoteButtons';
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from './icons';

interface ConsensusCardProps {
    consensus: Consensus;
    onVote: (entity_type: VoteEntity, entity_id: number, delta: 1 | -1) => void;
    getEntityVotes: (entity_type: VoteEntity, entity_id: number) => { userVote: number };
}

export const ConsensusCard: React.FC<ConsensusCardProps> = ({ consensus, onVote, getEntityVotes }) => {
    const { userVote } = getEntityVotes('consensus', consensus.id);
    
    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-lg border-2 border-syno-primary/70">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-7 h-7 text-yellow-500"/>
                    <h2 className="text-2xl font-bold text-syno-primary">共识回答</h2>
                </div>
                <VoteButtons
                    score={consensus.vote_score}
                    userVote={userVote}
                    onVote={(delta) => onVote('consensus', consensus.id, delta)}
                />
            </div>

            <div className="space-y-5 text-syno-text">
                <p className="text-lg font-semibold bg-syno-primary/5 text-syno-text p-3 rounded-md">{consensus.conclusion}</p>

                <div>
                    <h4 className="font-semibold text-syno-text-secondary flex items-center mb-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                        主要依据
                    </h4>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                        {consensus.evidence.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold text-syno-text-secondary flex items-center mb-2">
                        <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                        争议焦点
                    </h4>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                        {consensus.disagreements.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold text-syno-text-secondary mb-2">小结</h4>
                    <p className="bg-black/5 p-3 rounded-md">{consensus.summary}</p>
                </div>
            </div>
        </div>
    );
};