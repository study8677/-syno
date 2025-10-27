
import { GoogleGenAI, Type } from "@google/genai";
import type { Question, Answer, Consensus, Persona, User, Comment, PersonaProfile } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. AI features will not work.");
}
const API_KEY = process.env.API_KEY || "YOUR_API_KEY_HERE";
const geminiAI = new GoogleGenAI({ apiKey: API_KEY });

const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';
const GEMINI_JSON_MODEL = 'gemini-2.5-pro';

/**
 * Generic AI call function that routes to either Gemini or a custom OpenAI-compatible API.
 */
async function callAI(prompt: string, user: User | null, jsonOutput: boolean = false, schema: any = null): Promise<string> {
    // Use custom OpenAI-compatible API if endpoint and model are configured by the user
    if (user?.apiEndpoint && user.apiModel) {
        try {
            const response = await fetch(user.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: user.apiModel,
                    messages: [{ role: 'user', content: prompt }],
                    ...(jsonOutput && { response_format: { type: "json_object" } })
                })
            });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`OpenAI API request failed with status ${response.status}: ${errorBody}`);
            }
            const data = await response.json();
            const content = data.choices[0]?.message?.content;
            if (typeof content !== 'string') {
                 throw new Error('Invalid response structure from OpenAI API');
            }
            return content;
        } catch (error) {
            console.error('Error calling OpenAI-compatible API:', error);
            throw error; // Re-throw to be caught by the calling function
        }
    }

    // Default to Google Gemini API
    try {
        const model = jsonOutput ? GEMINI_JSON_MODEL : GEMINI_TEXT_MODEL;
        const response = await geminiAI.models.generateContent({
            model,
            contents: prompt,
            ...(jsonOutput && {
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                }
            })
        });
        return response.text;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error; // Re-throw to be caught by the calling function
    }
}

const getLanguageInstruction = (language: 'en' | 'zh-CN') => {
    return language === 'en'
        ? 'Your entire response MUST be in English.'
        : '你的整个回答必须是简体中文。';
}

async function generateSingleAnswer(question: Question, persona: Persona, user: User | null, language: 'en' | 'zh-CN'): Promise<string> {
    const personaTranslations: Record<Persona, string> = { "学者": "Scholar", "工程师": "Engineer", "暴躁老哥": "Grumpy Bro", "圣母": "Moralist" };
    const displayPersona = language === 'en' ? personaTranslations[persona] : persona;

    const prompt = language === 'en' ? `
        As a seasoned "${displayPersona}", please provide a profound, well-structured, professional, and easy-to-understand answer to the following question.

        **Question Title**: ${question.title}
        **Question Details**: ${question.detail || "None"}

        Please elaborate from a first-person "I" perspective, showcasing the typical mindset and language style of a "${displayPersona}". The answer should directly address the core of the question, avoiding generic platitudes.
        ${getLanguageInstruction(language)}
    ` : `
        作为一名资深的“${persona}”，请针对以下问题提供一个深刻、结构清晰、专业且易于理解的回答。

        **问题标题**: ${question.title}
        **问题详情**: ${question.detail || "无"}

        请以第一人称“我”的视角进行阐述，展现出“${persona}”的典型思维方式和语言风格。回答内容应直接针对问题核心，避免空泛的套话。
        ${getLanguageInstruction(language)}
    `;
    
    try {
        return await callAI(prompt, user);
    } catch (error) {
        console.error(`Error generating answer for persona ${persona}:`, error);
        return language === 'en' ? `Error generating answer for "${displayPersona}".` : `为“${persona}”生成回答时出错。`;
    }
}

export async function generateQuestionFromGuidance(
    guidance: string,
    persona: PersonaProfile,
    user: User | null,
    language: 'en' | 'zh-CN'
): Promise<{ title: string; detail: string }> {

    const prompt = language === 'en' ? `
        You are an expert at writing high-quality questions for the AI Q&A community "Syno".
        Your current identity is: "${persona.name}", whose style is: "${persona.description}".
        A user has provided the following guidance to inspire a question: "${guidance}".

        Based on this guidance and fully embodying your current identity, generate a complete, thought-provoking question. The question should include a concise "title" and a "detail" section providing more background.
        
        ${getLanguageInstruction(language)}

        Respond STRICTLY in the following JSON format, with no extra text or explanations:
        {
          "title": "A concise and engaging question title",
          "detail": "A detailed description providing background, context, and clearly stating what is being asked."
        }
    ` : `
        你是一位为AI问答社区“Syno”撰写高质量问题的专家。
        你当前的身份是：“${persona.name}”，其风格是：“${persona.description}”。
        一位用户提供了以下引导句来激发一个问题：“${guidance}”。

        请基于这个引导句并完全代入你当前的身份，生成一个结构完整、引人深思的问题。问题应包含一个简洁的“title”和一个提供更多背景信息的“detail”。

        ${getLanguageInstruction(language)}

        请严格按照以下JSON格式返回结果，不要添加任何额外的文字或解释：
        {
          "title": "一个精炼且有吸引力的问题标题",
          "detail": "一段详细的描述，提供问题的背景、上下文，并清晰地陈述希望了解的内容。"
        }
    `;

    const questionSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        detail: { type: Type.STRING },
      },
      required: ["title", "detail"],
    };
    
    try {
        const jsonStr = await callAI(prompt, user, true, questionSchema);
        return JSON.parse(jsonStr.trim());
    } catch(error) {
        console.error("Error generating question from guidance:", error);
        return { // Fallback on error
            title: language === 'en' ? `Failed to generate question from "${guidance}"` : `根据“${guidance}”生成问题失败`,
            detail: language === 'en' ? "The AI encountered a network or format error while thinking. Please try again later." : "AI在构思问题时遇到了网络或格式错误，请稍后重试。"
        }
    }
}

export async function generateHotTopicQuestion(
    circle: string,
    language: 'en' | 'zh-CN'
): Promise<{ title: string; detail: string }> {

    const prompt = language === 'en' ? `
        As an AI content curator for the 'Syno' Q&A community, my task is to generate a new question.
        1. First, use your search tool to identify a recent, significant, and widely debated hot topic within the '${circle}' category (e.g., technology, arts, finance). The topic should be relevant to an English-speaking audience.
        2. Based on this hot topic, formulate a neutral, thought-provoking question in English designed to encourage diverse opinions and detailed discussion.
        3. Finally, format your entire response STRICTLY as follows, with no additional text, introductory phrases, or explanations:

        TITLE: [The generated title in English]
        DETAIL: [The generated detail in English, providing context and background]
    ` : `
        作为AI内容策划，为“Syno”问答社区生成一个新问题。
        1. 首先，使用搜索工具在“${circle}”类别（如科技、艺术、金融）中确定一个近期的、重要的、广受争议的热点话题。
        2. 基于此热点，用简体中文制定一个中立的、引人深思的问题，以鼓励多样化的意见和详细的讨论。
        3. 最后，严格按照以下格式回答，不要有任何额外的文字、介绍或解释：

        TITLE: [生成的中文标题]
        DETAIL: [生成的中文详细信息，提供背景和上下文]
    `;

    try {
        const response = await geminiAI.models.generateContent({
           model: "gemini-2.5-flash",
           contents: prompt,
           config: {
             tools: [{googleSearch: {}}],
           },
        });

        const text = response.text;
        const titleMatch = text.match(/TITLE:\s*(.*)/);
        const detailMatch = text.match(/DETAIL:\s*([\s\S]*)/);

        const title = titleMatch ? titleMatch[1].trim() : "Failed to parse title";
        const detail = detailMatch ? detailMatch[1].trim() : "Failed to parse detail from AI response.";
        
        if (title === "Failed to parse title" || !title) {
             console.error("Could not parse title from response:", text);
             throw new Error("Could not parse title from Gemini response.");
        }

        return { title, detail };

    } catch (error) {
        console.error("Error generating hot topic question:", error);
        return {
            title: language === 'en' ? "Failed to automatically generate hot topic question" : "自动生成热点问题失败",
            detail: language === 'en' ? "Syno Bot encountered an error while trying to generate a new question from web trends. Please try again later." : "Syno Bot 在尝试从网络热点中生成新问题时遇到了错误。请稍后再试。"
        };
    }
}


export async function generateComment(fullPrompt: string, user: User | null, language: 'en' | 'zh-CN'): Promise<string> {
    const promptWithLang = `${fullPrompt}\n\n${getLanguageInstruction(language)}`;
    try {
        return await callAI(promptWithLang, user);
    } catch (error) {
        console.error(`Error generating comment:`, error);
        return language === 'en' ? "Error generating comment." : "生成评论时出错。";
    }
}

export async function generateConsensusFromAnswers(
    question: Question,
    answers: { persona: Persona; content: string }[],
    comments: Comment[], // Added to incorporate community feedback
    user: User | null,
    language: 'en' | 'zh-CN'
): Promise<Consensus> {
    const answerTexts = answers.map(a => `--- [Answer from ${a.persona}] ---\n${a.content}`).join('\n\n');
    
    const topComments = comments
        .sort((a, b) => b.vote_score - a.vote_score)
        .slice(0, 5) // Take top 5 comments
        .map(c => `- ${c.authorName}: "${c.content}"`)
        .join('\n');
    
    const prompt = language === 'en' ? `
        You are a knowledge integration and consensus engine. Your task is to generate a structured "Consensus Answer" based on multiple answers from different AI personas (e.g., Scholar, Engineer) and popular community comments for the same question.

        **Original Question**: ${question.title}

        **Various Answers**:
        ${answerTexts}
        
        **Popular Community Comments**:
        ${topComments || "No comments yet"}
        
        ${getLanguageInstruction(language)}

        Please output your analysis strictly in the following JSON structure, with no additional explanations or introductions.
        Your output must be a valid JSON object with the following fields:
        - "conclusion": (string) A concise core conclusion summarizing the common ground of all answers and comments.
        - "evidence": (string[]) An array of strings listing key arguments or facts supporting the core conclusion.
        - "disagreements": (string[]) An array of strings listing the main disagreements, points of contention, or different perspectives.
        - "summary": (string) A final summary that integrates all viewpoints and suggests future developments or actions.
    ` : `
        你是一个知识整合与共识引擎。你的任务是基于以下针对同一个问题由不同AI人格（学者、工程师、创作者）生成的多个回答，以及社区的热门评论，总结出一个结构化的“共识回答”。

        **原始问题**: ${question.title}

        **各方回答**:
        ${answerTexts}
        
        **社区热门评论**:
        ${topComments || "暂无评论"}

        ${getLanguageInstruction(language)}

        请严格按照以下JSON结构输出你的分析结果，不要添加任何额外的解释或开场白。
        你的输出必须是一个合法的JSON对象，包含以下字段：
        - "conclusion": (string) 一个精炼的核心结论，总结所有回答和评论的共同观点。
        - "evidence": (string[]) 一个字符串数组，列出支撑核心结论的关键论据或事实，每个论据占一个字符串。
        - "disagreements": (string[]) 一个字符串数组，列出不同回答或评论之间的主要分歧、争议点或视角差异，每个分歧点占一个字符串。
        - "summary": (string) 一段最终的总结陈词，整合所有观点，并对未来的发展或行动提出建议。
    `;

    const consensusSchema = {
      type: Type.OBJECT,
      properties: {
        conclusion: { type: Type.STRING },
        evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
        disagreements: { type: Type.ARRAY, items: { type: Type.STRING } },
        summary: { type: Type.STRING },
      },
      required: ["conclusion", "evidence", "disagreements", "summary"],
    };

    try {
        const jsonStr = await callAI(prompt, user, true, consensusSchema);
        const consensusData = JSON.parse(jsonStr.trim());

        return {
            id: Date.now(),
            qid: question.id,
            ...consensusData,
            created_at: new Date().toISOString(),
            vote_score: 0,
        };

    } catch (error) {
        console.error("Error generating consensus:", error);
        return { // Fallback consensus on error
            id: Date.now(),
            qid: question.id,
            conclusion: language === 'en' ? "Error encountered while generating consensus." : "生成共识时遇到错误。",
            evidence: [],
            disagreements: [],
            summary: language === 'en' ? "Could not summarize a consensus from the provided answers and comments. Please check the API connection or model output." : "无法从提供的回答和评论中总结出共识，请检查API连接或模型输出。",
            created_at: new Date().toISOString(),
            vote_score: 0,
        };
    }
}

export async function generateAnswers(
    question: Question,
    personas: Persona[],
    user: User | null,
    language: 'en' | 'zh-CN'
): Promise<Answer[]> {
    const generatedAnswers: Answer[] = [];
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    for (const [index, persona] of personas.entries()) {
        const content = await generateSingleAnswer(question, persona, user, language);
        generatedAnswers.push({
            id: Date.now() + index,
            qid: question.id,
            persona: persona,
            content,
            created_at: new Date().toISOString(),
            vote_score: 0,
        });
        
        // Add a 1-second delay between generating answers to avoid hitting API rate limits.
        if (index < personas.length - 1) {
            await delay(1000);
        }
    }

    return generatedAnswers;
}
