

import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Feed } from './components/Feed';
import { QuestionPage } from './components/QuestionPage';
import { NewQuestionModal } from './components/NewQuestionModal';
import { LoginPage } from './components/LoginPage';
import { ProfileModal } from './components/ProfileModal';
import { LeaderboardPage } from './components/LeaderboardPage';
import { SearchResultsPage } from './components/SearchResultsPage';
import { generateAnswers, generateComment, generateConsensusFromAnswers, generateQuestionFromGuidance, generateHotTopicQuestion } from './services/geminiService';
import type { Question, Answer, Consensus, Comment, Vote, VoteEntity, User, PersonaProfile } from './types';
import { calculateHotScore } from './utils/ranking';
import { usePersistentState } from './hooks/usePersistentState';
import { DEMO_QUESTIONS_ALL, DEMO_INITIAL_ANSWERS_STATE, DEMO_USERS, DEMO_COMMENTS } from './constants';
import { useTranslation } from './i18n/LanguageContext';

const App: React.FC = () => {
    const [questions, setQuestions] = usePersistentState<Question[]>('syno_questions', DEMO_QUESTIONS_ALL);
    const [answers, setAnswers] = usePersistentState<Record<string, Answer[]>>('syno_answers', DEMO_INITIAL_ANSWERS_STATE);
    const [consensuses, setConsensuses] = usePersistentState<Record<string, Consensus>>('syno_consensuses', {});
    const [comments, setComments] = usePersistentState<Comment[]>('syno_comments', DEMO_COMMENTS);
    const [votes, setVotes] = usePersistentState<Vote[]>('syno_votes', []);
    const [users, setUsers] = usePersistentState<User[]>('syno_users', DEMO_USERS);
    const [currentUser, setCurrentUser] = usePersistentState<User | null>('syno_currentUser', null);
    
    const [isNewQuestionModalOpen, setIsNewQuestionModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [generatingMessage, setGeneratingMessage] = useState<string | null>(null);
    const [isGeneratingManual, setIsGeneratingManual] = useState(false);
    const navigate = useNavigate();
    const { language, t } = useTranslation();

    const updateHotScores = useCallback((updatedVotes: Vote[], allQuestions: Question[]) => {
        return allQuestions.map(q => {
            const questionVotes = updatedVotes.filter(v => v.entity_type === 'question' && v.entity_id === q.id);
            const upvotes = questionVotes.filter(v => v.delta === 1).length;
            const downvotes = questionVotes.filter(v => v.delta === -1).length;
            return { ...q, hot_score: calculateHotScore(upvotes, downvotes, q.created_at) };
        });
    }, []);

    useEffect(() => {
        setQuestions(prevQuestions => updateHotScores(votes, prevQuestions));
    }, [votes, updateHotScores, setQuestions]);

    const SYNO_BOT_USER_ID = 999;

    // Effect for generating a hot topic periodically
    useEffect(() => {
        const TEN_HOURS = 10 * 60 * 60 * 1000;

        const checkForPeriodicUpdate = async () => {
            const lastTimeKey = `syno_last_periodic_topic_time`; // Use a single, global key
            const lastTime = localStorage.getItem(lastTimeKey);

            if (lastTime && (Date.now() - parseInt(lastTime, 10)) < TEN_HOURS) {
                return;
            }

            const synoBotUser = users.find(u => u.id === SYNO_BOT_USER_ID);
            if (!synoBotUser) {
                console.error("Syno Bot user not found. Cannot generate questions.");
                return;
            }
            
            try {
                setGeneratingMessage(t('generatingMessages.hotTopic.fetch'));
                
                const circles = ['科技', '艺术', '生活', '金融'];
                const randomCircle = circles[Math.floor(Math.random() * circles.length)];
                const { title, detail } = await generateHotTopicQuestion(randomCircle, language);

                if (title.includes("失败") || title.includes("Failed")) {
                    console.warn(`Failed to generate a valid hot topic question.`);
                } else {
                    const newId = Date.now();
                    const newQuestion: Question = {
                        id: newId,
                        content_id: newId,
                        title: `${title} [🤖 AI Hot Topic]`,
                        detail,
                        circle: randomCircle,
                        created_at: new Date().toISOString(),
                        hot_score: 0,
                        vote_score: 0,
                        comment_count: 0,
                        language: language,
                    };
                    setQuestions(prev => [newQuestion, ...prev]);
                    
                    setGeneratingMessage(t('generatingMessages.hotTopic.answer'));
                    const personas: import('./types').Persona[] = ["学者", "工程师", "暴躁老哥", "圣母"];
                    const generatedAnswers = await generateAnswers(newQuestion, personas, synoBotUser, language);
                    setAnswers(prev => ({ ...prev, [newQuestion.id]: generatedAnswers }));
                }
                
                localStorage.setItem(lastTimeKey, Date.now().toString());

            } catch (error) {
                console.error("Failed to generate periodic hot topic question:", error);
            } finally {
                setGeneratingMessage(null);
            }
        };
        
        checkForPeriodicUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);

    const handleGenerateSingleHotTopic = async () => {
        setIsGeneratingManual(true);
        const synoBotUser = users.find(u => u.id === SYNO_BOT_USER_ID);
        if (!synoBotUser) {
            console.error("Syno Bot user not found.");
            setIsGeneratingManual(false);
            return;
        };

        try {
            const circles = ['科技', '艺术', '生活', '金融'];
            const randomCircle = circles[Math.floor(Math.random() * circles.length)];
            const { title, detail } = await generateHotTopicQuestion(randomCircle, language);

            if (title.includes("失败") || title.includes("Failed")) {
                console.warn("Failed to generate a valid hot topic question.");
                return;
            }

            const newId = Date.now();
            const newQuestion: Question = {
                id: newId,
                content_id: newId,
                title: `${title} [🤖 AI Hot Topic]`,
                detail,
                circle: randomCircle,
                created_at: new Date().toISOString(),
                hot_score: 0,
                vote_score: 0,
                comment_count: 0,
                language: language,
            };
            setQuestions(prev => [newQuestion, ...prev]);

            await new Promise(resolve => setTimeout(resolve, 100));

            const personas: import('./types').Persona[] = ["学者", "工程师", "暴躁老哥", "圣母"];
            const generatedAnswers = await generateAnswers(newQuestion, personas, synoBotUser, language);
            setAnswers(prev => ({ ...prev, [newQuestion.id]: generatedAnswers }));

        } catch (error) {
            console.error("Failed to generate single hot topic:", error);
        } finally {
            setIsGeneratingManual(false);
        }
    };

    const handleLogin = (username: string) => {
        let user = users.find(u => u.name.toLowerCase() === username.toLowerCase());
        if (!user) {
            const defaultPersona: PersonaProfile = { id: Date.now(), name: "默认人格", description: "一位友好、乐于助人的社区成员。"};
            user = {
                id: Date.now(),
                name: username,
                personas: [defaultPersona],
                activePersonaId: defaultPersona.id
            };
            setUsers(prev => [...prev, user]);
        }
        setCurrentUser(user);
        navigate('/');
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        navigate('/');
    };

    const handleProfileUpdate = (updatedUser: User) => {
        if (currentUser) {
            setCurrentUser(updatedUser);
            setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? updatedUser : u));
            setIsProfileModalOpen(false);
        }
    };

    const handleNewQuestion = async (guidance: string, personaId: number, circle: string) => {
        if (!currentUser) {
            alert(t('alerts.loginRequired'));
            return;
        }
        const selectedPersona = currentUser.personas.find(p => p.id === personaId);
        if (!selectedPersona) {
            alert(t('alerts.invalidPersona'));
            return;
        }

        setGeneratingMessage(t('generatingMessages.question.creating'));
        setIsNewQuestionModalOpen(false);
        try {
            const { title, detail } = await generateQuestionFromGuidance(guidance, selectedPersona, currentUser, language);
            const newId = Date.now();
            const newQuestion: Question = {
                id: newId,
                content_id: newId,
                title,
                detail,
                circle,
                created_at: new Date().toISOString(),
                hot_score: 0,
                vote_score: 0,
                comment_count: 0,
                language: language
            };

            setQuestions(prev => [newQuestion, ...prev]);
            
            setGeneratingMessage(t('generatingMessages.question.thinking'));
            const personas: import('./types').Persona[] = ["学者", "工程师", "暴躁老哥", "圣母"];
            const generatedAnswers = await generateAnswers(newQuestion, personas, currentUser, language);

            setAnswers(prev => ({ ...prev, [newQuestion.id]: generatedAnswers }));
            navigate(`/question/${newQuestion.id}`);

        } catch (error) {
            console.error("Failed to generate question or answers:", error);
        } finally {
            setGeneratingMessage(null);
        }
    };
    
    const handleVote = (entity_type: VoteEntity, entity_id: number, delta: 1 | -1) => {
        if (!currentUser) {
            alert(t('alerts.loginToVote'));
            return;
        }
        setVotes(prevVotes => {
            const existingVoteIndex = prevVotes.findIndex(
                v => v.user_id === currentUser.id && v.entity_type === entity_type && v.entity_id === entity_id
            );

            let newVotes = [...prevVotes];
            if (existingVoteIndex > -1) {
                const existingVote = newVotes[existingVoteIndex];
                if (existingVote.delta === delta) {
                    newVotes.splice(existingVoteIndex, 1);
                } else {
                    newVotes[existingVoteIndex] = { ...existingVote, delta };
                }
            } else {
                newVotes.push({
                    id: Date.now(),
                    entity_type,
                    entity_id,
                    delta,
                    user_id: currentUser.id,
                    created_at: new Date().toISOString(),
                });
            }

            const getVoteScore = (type: VoteEntity, id: number) => {
                return newVotes
                    .filter(v => v.entity_type === type && v.entity_id === id)
                    .reduce((acc, v) => acc + v.delta, 0);
            };
            
            if (entity_type === 'question') {
                setQuestions(qs => qs.map(q => q.id === entity_id ? { ...q, vote_score: getVoteScore('question', entity_id) } : q));
            } else if (entity_type === 'answer') {
                 setAnswers(ans => ({
                    ...ans,
                    ...Object.fromEntries(Object.entries(ans).map(([qid, ansList]) => [
                        qid,
                        (ansList as Answer[]).map(a => a.id === entity_id ? { ...a, vote_score: getVoteScore('answer', entity_id) } : a)
                    ]))
                }));
            } else if (entity_type === 'consensus') {
                const qidToUpdate = Object.keys(consensuses).find(qid => consensuses[qid]?.id === entity_id);
                if (qidToUpdate) {
                    setConsensuses(cs => ({ ...cs, [qidToUpdate]: { ...cs[qidToUpdate], vote_score: getVoteScore('consensus', entity_id) }}));
                }
            } else if (entity_type === 'comment') {
                setComments(cs => cs.map(c => c.id === entity_id ? { ...c, vote_score: getVoteScore('comment', entity_id) } : c));
            }

            return newVotes;
        });
    };

    const handleConsensusUpdate = async (questionId: number, newCommentForContext: Comment | null = null) => {
        const question = questions.find(q => q.id === questionId);
        const questionAnswers = answers[questionId];
        let questionComments = comments.filter(c => c.entity_type === 'question' && c.entity_id === questionId);
        
        if (newCommentForContext && !questionComments.some(c => c.id === newCommentForContext.id)) {
            questionComments.push(newCommentForContext);
        }

        if (!question || !questionAnswers || questionAnswers.length === 0) {
            console.error("Cannot update consensus without question or answers.");
            return;
        }

        setGeneratingMessage(t('generatingMessages.consensus.updating'));
        try {
            const newConsensus = await generateConsensusFromAnswers(
                question,
                questionAnswers.map(a => ({ persona: a.persona, content: a.content })),
                questionComments,
                currentUser,
                language
            );
            setConsensuses(prev => ({ ...prev, [questionId]: newConsensus }));
        } catch (error) {
            console.error("Failed to regenerate consensus:", error);
        } finally {
            setGeneratingMessage(null);
        }
    };

    const handleComment = async (entity_type: VoteEntity, entity_id: number, prompt: string, parent_id: number | null): Promise<Comment | null> => {
        if (!currentUser) {
            alert(t('alerts.loginToComment'));
            return null;
        }

        setGeneratingMessage(t('generatingMessages.comment.generating'));
        let newComment: Comment | null = null;
        try {
            const content = await generateComment(prompt, currentUser, language);
            newComment = {
                id: Date.now(),
                entity_type,
                entity_id,
                content,
                parent_id,
                created_at: new Date().toISOString(),
                authorId: currentUser.id,
                authorName: currentUser.name,
                vote_score: 0,
            };
            
            setComments(prev => [...prev, newComment!]);

            if (entity_type === 'question') {
                 const newCommentCount = comments.filter(c => c.entity_type === 'question' && c.entity_id === entity_id).length + 1;
                 setQuestions(qs => qs.map(q => q.id === entity_id ? { ...q, comment_count: newCommentCount } : q));
            }
        } catch (error) {
            console.error("Failed to generate comment:", error);
            newComment = null;
        } finally {
            setGeneratingMessage(null);
        }

        if (newComment && entity_type === 'question') {
            const newCommentCount = comments.filter(c => c.entity_type === 'question' && c.entity_id === entity_id).length + 1;
            const consensusExists = !!consensuses[entity_id];

            if (!consensusExists && newCommentCount >= 10) {
                await handleConsensusUpdate(entity_id, newComment);
            } else if (consensusExists && newCommentCount > 0 && newCommentCount % 50 === 0) {
                await handleConsensusUpdate(entity_id, newComment);
            }
        }
        
        return newComment;
    };


    const getEntityVotes = (entity_type: VoteEntity, entity_id: number) => {
        const userVote = votes.find(v => v.user_id === currentUser?.id && v.entity_type === entity_type && v.entity_id === entity_id)?.delta || 0;
        return { userVote };
    };
    
    return (
        <div className="min-h-screen bg-syno-dark">
            <Header 
                currentUser={currentUser} 
                onNewQuestion={() => setIsNewQuestionModalOpen(true)}
                onProfile={() => setIsProfileModalOpen(true)}
                onLogout={handleLogout}
            />
            {generatingMessage && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 bg-opacity-90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-4 z-50 animate-slide-in-up-fade-in">
                    <div className="w-5 h-5 border-2 border-t-white border-gray-500 rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">{generatingMessage}</span>
                </div>
            )}
            <main className="container mx-auto px-4 py-8">
                 <Routes>
                    <Route path="/" element={<Feed questions={questions} onGenerateHotTopic={handleGenerateSingleHotTopic} isGeneratingHotTopic={isGeneratingManual} />} />
                    <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                    <Route path="/leaderboard" element={<LeaderboardPage users={users} comments={comments} />} />
                    <Route path="/search" element={<SearchResultsPage questions={questions} />} />
                    <Route path="/question/:id" element={
                        <QuestionPageWrapper
                            questions={questions}
                            answers={answers}
                            consensuses={consensuses}
                            comments={comments}
                            onVote={handleVote}
                            onComment={handleComment}
                            getEntityVotes={getEntityVotes}
                            currentUser={currentUser}
                        />
                    }/>
                </Routes>
            </main>
            {isNewQuestionModalOpen && currentUser && (
                <NewQuestionModal
                    user={currentUser}
                    onClose={() => setIsNewQuestionModalOpen(false)}
                    onSubmit={handleNewQuestion}
                />
            )}
            {isProfileModalOpen && currentUser && (
                <ProfileModal
                    user={currentUser}
                    onClose={() => setIsProfileModalOpen(false)}
                    onSave={handleProfileUpdate}
                />
            )}
        </div>
    );
};

// Extracted Router logic to a sub-component to use useNavigate hook
const AppWrapper: React.FC = () => (
    <HashRouter>
        <App />
    </HashRouter>
);


interface QuestionPageWrapperProps {
    questions: Question[];
    answers: Record<string, Answer[]>;
    consensuses: Record<string, Consensus>;
    comments: Comment[];
    onVote: (entity_type: VoteEntity, entity_id: number, delta: 1 | -1) => void;
    onComment: (entity_type: VoteEntity, entity_id: number, prompt: string, parent_id: number | null) => Promise<Comment | null>;
    getEntityVotes: (entity_type: VoteEntity, entity_id: number) => { userVote: number };
    currentUser: User | null;
}

const QuestionPageWrapper: React.FC<QuestionPageWrapperProps> = (props) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const questionId = id ? parseInt(id, 10) : undefined;
    const question = props.questions.find(q => q.id === questionId);

    useEffect(() => {
        if (!question && questionId) {
             navigate('/');
        }
    }, [question, questionId, navigate]);

    if (!question || !questionId) {
        return <div className="text-center text-syno-text-secondary">{t('questionPage.notFound')}</div>;
    }

    return <QuestionPage 
        question={question} 
        answers={props.answers[questionId] || []} 
        consensus={props.consensuses[questionId]}
        comments={props.comments.filter(c => c.entity_type === 'question' && c.entity_id === questionId)}
        onVote={props.onVote}
        onComment={props.onComment}
        getEntityVotes={props.getEntityVotes}
        currentUser={props.currentUser}
    />;
};


export default AppWrapper;