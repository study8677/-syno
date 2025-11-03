import type { Question, Answer, User, Comment } from './types';

export const DEMO_USERS: User[] = [
    { 
        id: 1, 
        name: "Alice", 
        personas: [
            { id: 101, name: "默认人格", description: "一位友好、乐于助人的社区成员。" },
            { id: 102, name: "科普作家", description: "一个充满好奇心、喜欢用比喻解释复杂概念的科普作家。" }
        ],
        activePersonaId: 102,
        apiEndpoint: "", 
        apiModel: "" 
    },
    { 
        id: 2, 
        name: "Bob", 
        personas: [
            { id: 201, name: "犀利架构师", description: "一位言辞犀利、注重代码实践和效率的资深软件架构师。" },
            { id: 202, name: "游戏设计师", description: "一个热爱游戏、总能从玩家体验角度出发思考问题的设计师。" }
        ],
        activePersonaId: 201,
        apiEndpoint: "", 
        apiModel: "" 
    },
    {
        id: 999,
        name: "Syno Bot",
        personas: [
            { id: 99901, name: "社区管理员", description: "一个中立、客观，致力于为社区提供高质量内容的AI助手。" }
        ],
        activePersonaId: 99901,
        apiEndpoint: "",
        apiModel: ""
    }
];


// --- CHINESE CONTENT ---

const DEMO_QUESTIONS_ZH: Question[] = [
    {
      id: 1,
      content_id: 1,
      title: "人工智能（AI）将如何改变未来的软件开发？",
      detail: "随着AI技术的飞速发展，从代码生成到自动化测试，AI正在渗透到软件开发的各个环节。我想深入了解一下，未来几年，AI将从哪些方面、以何种程度重塑软件工程师的工作？是会取代部分岗位，还是会成为不可或缺的超级工具？",
      circle: "科技",
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      hot_score: 0.95,
      vote_score: 138,
      comment_count: 2,
      language: 'zh-CN',
    },
    {
      id: 2,
      content_id: 2,
      title: "如何在日常生活中实践正念（Mindfulness）？",
      detail: "最近总是感到焦虑和压力，听说正念很有帮助。有没有一些简单、易于上手的正念练习方法，可以在工作间隙或通勤路上进行？希望能具体一些，比如如何调整呼吸，如何观察思绪等。",
      circle: "生活",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      hot_score: 0.88,
      vote_score: 92,
      comment_count: 0,
      language: 'zh-CN',
    },
    {
      id: 3,
      content_id: 3,
      title: "对于初学者来说，学习哪种艺术形式最容易获得成就感？",
      detail: "一直想培养一个艺术爱好，但又怕太难坚持不下去。是水彩、素描、数字绘画还是陶艺？希望大家能从投入成本、学习曲线和“出作品”速度几个方面给点建议。",
      circle: "艺术",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      hot_score: 0.76,
      vote_score: 74,
      comment_count: 0,
      language: 'zh-CN',
    }
];

const DEMO_ANSWERS_ZH: Answer[] = [
  {
    id: 101,
    qid: 1,
    persona: "学者",
    content: "从宏观视角分析，AI在软件开发领域的渗透是必然趋势，其核心价值在于自动化与抽象化。AI能接管低层次、重复性的编码任务，使开发者能专注于更高维度的系统架构和逻辑设计。这预示着软件工程将从一门“手艺”向更纯粹的“科学”演进，对从业者的理论基础和抽象思维能力提出了前所未有的高要求。",
    created_at: new Date().toISOString(),
    vote_score: 56,
  },
  {
    id: 102,
    qid: 1,
    persona: "工程师",
    content: "落地到实际工作流，AI就是个超级工具。它帮你写样板代码、找bug、优化性能，甚至给你提架构建议。它不会抢你饭碗，但你如果不会用它，你就会被会用它的人淘汰。未来的核心竞争力是如何提出正确的问题，并有效地利用AI工具链解决它。别天天焦虑，赶紧学起来，把AI集成到你的DevOps流程里才是正事。",
    created_at: new Date().toISOString(),
    vote_score: 82,
  },
  {
    id: 103,
    qid: 1,
    persona: "暴躁老哥",
    content: "天天AI、AI的，烦不烦？这玩意儿就是个高级点的代码补全，吹得天花乱坠。生成的代码一堆bug，逻辑还不如实习生。最后还不是得人来改？有这功夫，我早自己写完了。记住，代码是人写的，机器永远懂不了业务的复杂性。别做梦了，好好搬砖吧，工具再牛，脑子不行还是白搭！",
    created_at: new Date().toISOString(),
    vote_score: 31,
  },
  {
    id: 104,
    qid: 1,
    persona: "圣母",
    content: "我们不应该只关注技术和效率，更要思考AI对人的影响。当AI大规模替代初级岗位，那些刚入行的年轻人该何去何从？我们有责任为他们提供转型的机会和支持。技术的发展应该是为了让每个人的生活更美好，而不是加剧不平等。在拥抱AI的同时，我们必须建立更完善的教育体系和保障机制，确保没有人因为技术的进步而被抛下。",
    created_at: new Date().toISOString(),
    vote_score: 25,
  },
];


// --- ENGLISH CONTENT ---

const DEMO_QUESTIONS_EN: Question[] = [
    {
      id: 4,
      content_id: 1,
      title: "How will Artificial Intelligence (AI) change the future of software development?",
      detail: "With the rapid development of AI technology, from code generation to automated testing, AI is permeating every aspect of software development. I want to understand in-depth, in the coming years, in what ways and to what extent will AI reshape the work of software engineers? Will it replace some positions, or will it become an indispensable super-tool?",
      circle: "科技",
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      hot_score: 0.93,
      vote_score: 115,
      comment_count: 0,
      language: 'en',
    },
    {
      id: 5,
      content_id: 2,
      title: "How can one practice mindfulness in daily life?",
      detail: "Lately, I've been feeling anxious and stressed, and I've heard that mindfulness can be very helpful. Are there any simple, easy-to-learn mindfulness exercises that can be done during work breaks or on the commute? I'm hoping for specific suggestions, such as how to regulate breathing and how to observe thoughts.",
      circle: "生活",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      hot_score: 0.85,
      vote_score: 88,
      comment_count: 0,
      language: 'en',
    },
    {
      id: 6,
      content_id: 3,
      title: "For a beginner, which art form is easiest to gain a sense of accomplishment from?",
      detail: "I've always wanted to cultivate an artistic hobby, but I'm afraid it will be too difficult to stick with. Is it watercolor, sketching, digital painting, or pottery? I hope everyone can offer some advice in terms of cost, learning curve, and the speed at which one can produce finished works.",
      circle: "艺术",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      hot_score: 0.72,
      vote_score: 65,
      comment_count: 0,
      language: 'en',
    }
];

const DEMO_ANSWERS_EN: Answer[] = [
  {
    id: 201,
    qid: 4,
    persona: "学者",
    content: "From a macroscopic perspective, the penetration of AI into software development is an inevitable trend, with its core value lying in automation and abstraction. AI can take over low-level, repetitive coding tasks, allowing developers to focus on higher-dimensional system architecture and logical design. This signifies that software engineering will evolve from a 'craft' to a more pure 'science,' placing unprecedented demands on practitioners' theoretical foundations and abstract thinking abilities.",
    created_at: new Date().toISOString(),
    vote_score: 48,
  },
  {
    id: 202,
    qid: 4,
    persona: "工程师",
    content: "In practice, AI is a super-tool. It helps you write boilerplate code, find bugs, optimize performance, and even suggest architectural improvements. It won't take your job, but you'll be replaced by those who know how to use it. The core competency of the future is asking the right questions and effectively using the AI toolchain to solve them. Stop worrying and start learning. Integrating AI into your DevOps workflow is what matters now.",
    created_at: new Date().toISOString(),
    vote_score: 75,
  },
  {
    id: 203,
    qid: 4,
    persona: "暴躁老哥",
    content: "All this talk about AI is getting annoying. It's just a fancier code completion tool, hyped up to be something it's not. The code it generates is full of bugs and its logic is worse than an intern's. In the end, a human still has to fix it. I could have written it myself in the time it takes to debug its mess. Remember, code is written by people; a machine will never understand business complexity. Stop dreaming and get back to work. A tool is useless if the person using it isn't smart.",
    created_at: new Date().toISOString(),
    vote_score: 22,
  },
  {
    id: 204,
    qid: 4,
    persona: "圣母",
    content: "We shouldn't just focus on technology and efficiency; we must also consider the human impact of AI. When AI replaces junior positions on a large scale, what will happen to the young people just starting their careers? We have a responsibility to provide them with opportunities and support for transition. Technological development should aim to make everyone's life better, not to exacerbate inequality. While embracing AI, we must build a more robust education system and safety nets to ensure no one is left behind by progress.",
    created_at: new Date().toISOString(),
    vote_score: 19,
  },
];


// --- COMBINED EXPORTS & COMMENTS ---

export const DEMO_QUESTIONS_ALL: Question[] = [...DEMO_QUESTIONS_ZH, ...DEMO_QUESTIONS_EN];

export const DEMO_INITIAL_ANSWERS_STATE: Record<string, Answer[]> = {
    '1': DEMO_ANSWERS_ZH,
    '4': DEMO_ANSWERS_EN,
};

export const DEMO_COMMENTS: Comment[] = [
    {
        id: 301,
        entity_type: 'question',
        entity_id: 1,
        content: "这个问题提得很好。就像望远镜让我们看到了更远的宇宙，AI是我们思想的望远镜，让我们能构建出过去无法想象的软件系统。",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        parent_id: null,
        authorId: 1,
        authorName: "Alice",
        vote_score: 15,
    },
    {
        id: 302,
        entity_type: 'question',
        entity_id: 1,
        content: "别忘了，AI工具的性能和可靠性还是个大问题。在关键业务上，我宁愿相信一个经验丰富的人类工程师，而不是一个‘黑箱’模型。过度依赖AI只会产生更多难以调试的‘幽灵代码’。",
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        parent_id: null,
        authorId: 2,
        authorName: "Bob",
        vote_score: 8,
    }
];