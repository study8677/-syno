import type { Persona as DefaultPersona } from './types'; // Keep for old Answer type

export interface PersonaProfile {
    id: number;
    name: string;
    description: string;
}

export type Persona = "学者" | "工程师" | "暴躁老哥" | "圣母";

export interface User {
    id: number;
    name: string;
    personas: PersonaProfile[];
    activePersonaId: number;
    apiEndpoint?: string;
    apiModel?: string;
}

export interface Question {
    id: number;
    title: string;
    detail: string;
    circle?: string;
    created_at: string;
    updated_at?: string;
    hot_score: number;
    vote_score: number;
    comment_count: number;
    language: 'en' | 'zh-CN';
}

export interface Answer {
    id: number;
    qid: number;
    persona: Persona;
    content: string;
    citations?: string[];
    created_at: string;
    vote_score: number;
}

export interface Consensus {
    id: number;
    qid: number;
    conclusion: string;
    evidence: string[];
    disagreements: string[];
    summary: string;
    created_at: string;
    vote_score: number;
}

export type VoteEntity = "question" | "answer" | "consensus" | "comment";

export interface Vote {
    id: number;
    entity_type: VoteEntity;
    entity_id: number;
    delta: 1 | -1;
    user_id: number;
    created_at: string;
}

export interface Comment {
    id: number;
    entity_type: VoteEntity;
    entity_id: number;
    content: string;
    created_at: string;
    parent_id: number | null;
    authorId: number;
    authorName: string;
    vote_score: number;
}
