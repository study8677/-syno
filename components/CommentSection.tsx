import React, { useState, useMemo } from 'react';
import type { Comment, VoteEntity, User, Question, PersonaProfile } from '../types';
import { VoteButtons } from './VoteButtons';
import { UserIcon } from './icons';

interface CommentProps {
    comment: Comment;
    onVote: (entity_type: VoteEntity, entity_id: number, delta: 1 | -1) => void;
    getEntityVotes: (entity_type: VoteEntity, entity_id: number) => { userVote: number };
    onReply: (comment: Comment) => void;
    children?: React.ReactNode;
}

const CommentCard: React.FC<CommentProps> = ({ comment, onVote, getEntityVotes, onReply, children }) => {
    const { userVote } = getEntityVotes('comment', comment.id);

    const timeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " 天前";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " 小时前";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " 分钟前";
        return "刚刚";
    };

    return (
        <div className="flex space-x-4">
            <div className="flex-shrink-0">
                 <UserIcon className="w-8 h-8 p-1.5 bg-syno-border rounded-full text-syno-text-secondary" />
            </div>
            <div className="flex-grow">
                <div className="flex items-center space-x-2 text-sm">
                    <span className="font-semibold text-syno-text">{comment.authorName}</span>
                    <span className="text-syno-text-secondary">• {timeAgo(comment.created_at)}</span>
                </div>
                <p className="text-syno-text mt-1 whitespace-pre-wrap">{comment.content}</p>
                <div className="flex items-center space-x-4 mt-2">
                    <VoteButtons score={comment.vote_score} userVote={userVote} onVote={(delta) => onVote('comment', comment.id, delta)} />
                    <button onClick={() => onReply(comment)} className="text-sm text-syno-text-secondary hover:text-syno-text font-medium">
                        回复
                    </button>
                </div>
                {children && <div className="mt-4 space-y-4">{children}</div>}
            </div>
        </div>
    );
};


interface CommentFormProps {
    onSubmit: (persona: PersonaProfile, parentId: number | null) => Promise<boolean>;
    currentUser: User | null;
    replyTo?: Comment | null;
    onCancelReply?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, currentUser, replyTo, onCancelReply }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPersonaId, setSelectedPersonaId] = useState<number | undefined>(currentUser?.activePersonaId);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || selectedPersonaId === undefined) return;
        
        const selectedPersona = currentUser.personas.find(p => p.id === selectedPersonaId);
        if (!selectedPersona) return;

        setIsSubmitting(true);
        const success = await onSubmit(selectedPersona, replyTo ? replyTo.id : null);
        setIsSubmitting(false);

        if (success && onCancelReply) {
            onCancelReply();
        }
    };

    if (!currentUser) {
        return <div className="bg-syno-dark-secondary p-4 rounded-lg text-center text-syno-text-secondary border border-syno-border">请先 <a href="/#/login" className="text-syno-primary hover:underline">登录</a> 发表评论。</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="bg-syno-dark-secondary p-4 rounded-lg border border-syno-border">
            {replyTo && (
                <div className="text-sm text-syno-text-secondary mb-2">
                    回复 {replyTo.authorName}:
                    <button type="button" onClick={onCancelReply} className="ml-2 text-red-500 hover:underline">[取消]</button>
                </div>
            )}
            <div className="flex items-center space-x-3">
                 <select
                    value={selectedPersonaId}
                    onChange={(e) => setSelectedPersonaId(Number(e.target.value))}
                    className="flex-grow bg-syno-dark border border-syno-border rounded-md p-2 text-syno-text focus:ring-2 focus:ring-syno-primary focus:outline-none"
                >
                    {currentUser.personas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button
                    type="submit"
                    disabled={isSubmitting || !selectedPersonaId}
                    className="px-4 py-2 rounded-md bg-syno-primary text-white font-semibold hover:bg-syno-primary-hover disabled:bg-syno-border disabled:cursor-not-allowed"
                >
                    {isSubmitting ? '生成中...' : '生成评论'}
                </button>
            </div>
        </form>
    );
};


interface CommentSectionProps {
    entityType: 'question'; // Can be expanded later
    entityId: number;
    question: Question;
    comments: Comment[];
    onComment: (entity_type: VoteEntity, entity_id: number, prompt: string, parent_id: number | null) => Promise<Comment | null>;
    onVote: (entity_type: VoteEntity, entity_id: number, delta: 1 | -1) => void;
    getEntityVotes: (entity_type: VoteEntity, entity_id: number) => { userVote: number };
    currentUser: User | null;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ entityType, entityId, question, comments, onComment, ...rest }) => {
    const [replyTo, setReplyTo] = useState<Comment | null>(null);

    const commentTree = useMemo(() => {
        const commentMap: Record<number, { comment: Comment; children: any[] }> = {};
        comments.forEach(comment => {
            commentMap[comment.id] = { comment, children: [] };
        });
        const tree: any[] = [];
        comments.forEach(comment => {
            if (comment.parent_id && commentMap[comment.parent_id]) {
                commentMap[comment.parent_id].children.push(commentMap[comment.id]);
            } else {
                tree.push(commentMap[comment.id]);
            }
        });
        return tree.sort((a,b) => b.comment.vote_score - a.comment.vote_score);
    }, [comments]);

    const handleCommentSubmit = async (persona: PersonaProfile, parentId: number | null) => {
        const parentComment = parentId ? comments.find(c => c.id === parentId) : null;

        const constructedPrompt = `
          你正在一个名为“Syno”的AI问答社区中发表评论。
          请根据以下上下文，生成一条简洁、深刻且听起来自然的中文评论。
          你本次评论的人格是：“${persona.name}”，其风格是：“${persona.description}”。

          **上下文:**
          - **问题:** "${question.title}"
          - **回复对象:** "${parentComment ? parentComment.content : '针对主问题的评论'}"

          请直接输出生成的评论内容，不要包含任何额外的解释或开场白。
        `;

        const newComment = await onComment(entityType, entityId, constructedPrompt, parentId);
        return !!newComment;
    };

    const renderComments = (nodes: any[]) => {
        return nodes.map(({ comment, children }) => (
            <CommentCard key={comment.id} comment={comment} onReply={setReplyTo} {...rest}>
                {children.length > 0 && renderComments(children)}
                {replyTo?.id === comment.id && (
                     <div className="mt-4">
                        <CommentForm onSubmit={handleCommentSubmit} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} currentUser={rest.currentUser}/>
                    </div>
                )}
            </CommentCard>
        ));
    };

    return (
        <div className="space-y-6">
            <CommentForm onSubmit={handleCommentSubmit} currentUser={rest.currentUser} replyTo={!replyTo || commentTree.some(c => c.comment.id === replyTo.id) ? null : replyTo} onCancelReply={() => setReplyTo(null)} />
            <div className="space-y-6 border-t border-syno-border pt-6">
                {renderComments(commentTree)}
            </div>
        </div>
    );
};
