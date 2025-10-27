import React, { useMemo } from 'react';
import type { User, Comment } from '../types';
import { UserIcon } from './icons';

interface LeaderboardPageProps {
    users: User[];
    comments: Comment[];
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ users, comments }) => {
    
    const userScores = useMemo(() => {
        const scores = new Map<number, number>();
        comments.forEach(comment => {
            const currentScore = scores.get(comment.authorId) || 0;
            scores.set(comment.authorId, currentScore + comment.vote_score);
        });

        // Ensure all users are on the leaderboard, even with 0 score
        users.forEach(user => {
            if (!scores.has(user.id)) {
                scores.set(user.id, 0);
            }
        });

        return Array.from(scores.entries())
            .map(([userId, score]) => {
                const user = users.find(u => u.id === userId);
                return {
                    userId,
                    name: user ? user.name : '未知用户',
                    score,
                };
            })
            .sort((a, b) => b.score - a.score);

    }, [users, comments]);

    const getTrophyColor = (rank: number) => {
        if (rank === 0) return 'text-yellow-500';
        if (rank === 1) return 'text-gray-400';
        if (rank === 2) return 'text-yellow-700';
        return 'text-gray-300';
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-syno-dark-secondary p-6 rounded-lg border border-syno-border">
                <h1 className="text-3xl font-bold text-syno-text mb-2">社区排行榜</h1>
                <p className="text-syno-text-secondary mb-6">根据用户评论获得的赞同总数进行排名。</p>

                <div className="space-y-3">
                    {userScores.map((user, index) => (
                        <div key={user.userId} className="flex items-center justify-between p-4 bg-syno-dark rounded-md">
                            <div className="flex items-center space-x-4">
                                <span className={`font-bold text-lg w-6 text-center ${getTrophyColor(index)}`}>{index + 1}</span>
                                 <UserIcon className="w-8 h-8 p-1.5 bg-syno-border rounded-full text-syno-text-secondary" />
                                <span className="font-semibold text-syno-text">{user.name}</span>
                            </div>
                            <div className="font-bold text-syno-primary text-lg">{user.score} 分</div>
                        </div>
                    ))}
                </div>
                 {userScores.length === 0 && (
                    <div className="text-center py-10 text-syno-text-secondary">
                        暂无用户数据
                    </div>
                )}
            </div>
        </div>
    );
};
