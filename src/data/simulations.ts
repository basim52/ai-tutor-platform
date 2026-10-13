export interface SimulationStage {
  id: string;
  stageTitleAr: string;
  stageTitleEn: string;
  promptAr: string;
  promptEn: string;
  suggestedDurationSeconds: number;
  cueCardPoints?: string[];
  boardTemplateNote: string;
  expectedKeywords: string[];
}

export interface SimulationPack {
  id: "job_interview" | "ielts_speaking" | "everyday_roleplay";
  agentId: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  icon: string;
  badgeColor: string;
  stages: SimulationStage[];
  criteriaList: { nameAr: string; nameEn: string; weight: string }[];
}

export const SIMULATION_PACKS: SimulationPack[] = [
  {
    id: "job_interview",
    agentId: "business_pro",
    titleAr: "محاكي مقابلات العمل الواقعية (Job Interview)",
    titleEn: "Executive Job Interview Simulator",
    subtitleAr: "محاكاة واقعية لأسئلة المقابلات الوظيفية وتقييم أسلوب STAR والمفردات المهنية مع ديفيد.",
    subtitleEn: "Realistic executive interview simulation evaluated with STAR method by David.",
    icon: "💼",
    badgeColor: "#10b981",
    criteriaList: [
      { nameAr: "هيكل الإجابة (STAR Method)", nameEn: "STAR Structure", weight: "30%" },
      { nameAr: "المفردات التنفيذية والمهنية", nameEn: "Executive Vocabulary", weight: "25%" },
      { nameAr: "الثقة والوضوح اللغوي", nameEn: "Clarity & Confidence", weight: "25%" },
      { nameAr: "الرد الدبلوماسي وحل المشكلات", nameEn: "Problem Solving", weight: "20%" }
    ],
    stages: [
      {
        id: "interview_q1",
        stageTitleAr: "السؤال الأول: التعريف بالخبرات المهنية",
        stageTitleEn: "Question 1: Professional Background",
        promptAr: "Tell me about yourself and walk me through your key career achievements.",
        promptEn: "Tell me about yourself and walk me through your key career achievements.",
        suggestedDurationSeconds: 90,
        boardTemplateNote: "💼 Interview Stage 1: Tell Me About Yourself\n• Framework: Present Role -> Past Accomplishments -> Future Value for Company",
        expectedKeywords: ["experience", "achieved", "collaborate", "leadership", "deliverables"]
      },
      {
        id: "interview_q2",
        stageTitleAr: "السؤال الثاني: تحدٍّ مهني وكيف تغلبت عليه (أسلوب STAR)",
        stageTitleEn: "Question 2: Overcoming a Major Challenge (STAR)",
        promptAr: "Describe a high-pressure situation where a project was at risk. How did you handle it?",
        promptEn: "Describe a high-pressure situation where a project was at risk. How did you handle it?",
        suggestedDurationSeconds: 120,
        cueCardPoints: [
          "Situation: What was the context and problem?",
          "Task: What was your specific responsibility?",
          "Action: What concrete steps did you take?",
          "Result: What was the measurable positive outcome?"
        ],
        boardTemplateNote: "🌟 STAR Method Checklist:\n[S] Situation: The risk context\n[T] Task: Your goal\n[A] Action: Your strategy\n[R] Result: Measurable outcome",
        expectedKeywords: ["situation", "action", "resolved", "measurable", "outcome", "team"]
      },
      {
        id: "interview_q3",
        stageTitleAr: "السؤال الثالث: سؤال المقابل في الختام",
        stageTitleEn: "Question 3: Inquiring About Company Culture & Vision",
        promptAr: "Do you have any insightful questions for us regarding the team or company growth?",
        promptEn: "Do you have any insightful questions for us regarding the team or company growth?",
        suggestedDurationSeconds: 60,
        boardTemplateNote: "💡 Pro Interview Closing:\nAsk about upcoming strategic priorities or the team's definition of success in the first 90 days.",
        expectedKeywords: ["growth", "priorities", "success", "vision", "strategy"]
      }
    ]
  },
  {
    id: "ielts_speaking",
    agentId: "ielts_examiner",
    titleAr: "محاكي اختبار محادثة الآيلتس (IELTS Speaking Mock)",
    titleEn: "Official IELTS Speaking Mock Exam",
    subtitleAr: "محاكاة للأجزاء الثلاثة الرسمية (Part 1, 2, 3) مع بطاقة Cue Card ومؤقت وتحليل Band Score مع فيكتوريا.",
    subtitleEn: "Official 3-part exam flow with Cue Card, 60s preparation timer, and Band Score breakdown.",
    icon: "🎯",
    badgeColor: "#ec4899",
    criteriaList: [
      { nameAr: "الطلاقة والتماسك (Fluency & Coherence)", nameEn: "Fluency & Coherence", weight: "25%" },
      { nameAr: "الثراء المعجمي (Lexical Resource)", nameEn: "Lexical Resource", weight: "25%" },
      { nameAr: "التنوع النحوي والدقة (Grammar Range)", nameEn: "Grammatical Range", weight: "25%" },
      { nameAr: "النطق ومخارج الحروف (Pronunciation)", nameEn: "Pronunciation", weight: "25%" }
    ],
    stages: [
      {
        id: "ielts_part1",
        stageTitleAr: "الجزء الأول: أسئلة تمهيدية يومية (Part 1 - Warm-up)",
        stageTitleEn: "Part 1: Introduction & Everyday Topics",
        promptAr: "Let's talk about your hometown and work/study routines. How has your city changed in recent years?",
        promptEn: "Let's talk about your hometown and work/study routines. How has your city changed in recent years?",
        suggestedDurationSeconds: 120,
        boardTemplateNote: "🎯 IELTS Part 1: Fluent & Natural Answers\n• Aim for 2-3 full sentences per question.\n• Avoid short one-word answers.",
        expectedKeywords: ["urbanization", "modernized", "heritage", "amenities", "transformation"]
      },
      {
        id: "ielts_part2",
        stageTitleAr: "الجزء الثاني: بطاقة الموضوع (Part 2 - Cue Card)",
        stageTitleEn: "Part 2: The 2-Minute Long Turn (Cue Card)",
        promptAr: "Describe an environmental initiative or project that has helped improve your community.",
        promptEn: "Describe an environmental initiative or project that has helped improve your community.",
        suggestedDurationSeconds: 120,
        cueCardPoints: [
          "What the initiative is and who organized it",
          "What concrete activities it involved",
          "What challenges were encountered",
          "And explain why you believe it was impactful"
        ],
        boardTemplateNote: "📋 Part 2 Cue Card: Environmental Initiative\n[1 Min Preparation Note Space on Whiteboard]\n• What it is:\n• How it started:\n• Key impact:\n• Your personal evaluation:",
        expectedKeywords: ["sustainability", "renewable", "initiative", "impactful", "awareness"]
      },
      {
        id: "ielts_part3",
        stageTitleAr: "الجزء الثالث: النقاش الفكري التجريدي (Part 3 - Abstract Discussion)",
        stageTitleEn: "Part 3: In-Depth Abstract Discussion",
        promptAr: "Do you believe individual actions or governmental regulations play a more pivotal role in global sustainability?",
        promptEn: "Do you believe individual actions or governmental regulations play a more pivotal role in global sustainability?",
        suggestedDurationSeconds: 180,
        boardTemplateNote: "🎯 IELTS Part 3: Band 8+ Academic Connectors\n• 'From a macroscopic perspective...'\n• 'Notwithstanding individual efforts, systemic reform is paramount.'",
        expectedKeywords: ["regulations", "macro-level", "systemic", "notwithstanding", "paramount"]
      }
    ]
  },
  {
    id: "everyday_roleplay",
    agentId: "roleplay",
    titleAr: "محاكي سيناريوهات ومواقف الحياة اليومية (Real-World Roleplay)",
    titleEn: "Everyday Interactive Situational Roleplay",
    subtitleAr: "محاكاة لمواقف واقعية حية (في الفندق، العيادة، والمطار) مع قائمة أهداف حوارية مع إيلينا.",
    subtitleEn: "Dynamic situational scenarios with conversational goal checklist guided by Elena.",
    icon: "🎭",
    badgeColor: "#f97316",
    criteriaList: [
      { nameAr: "تحقيق الأهداف الحوارية", nameEn: "Goal Completion", weight: "35%" },
      { nameAr: "اللباقة والأسلوب الودود", nameEn: "Politeness & Tone", weight: "30%" },
      { nameAr: "العفوية والتعبير عن المشكلة", nameEn: "Spontaneity", weight: "35%" }
    ],
    stages: [
      {
        id: "hotel_checkin",
        stageTitleAr: "المشهد: في مكتب استقبال الفندق (Hotel Check-in & Upgrade)",
        stageTitleEn: "Scene: Hotel Front Desk Check-in & Inquiry",
        promptAr: "Good evening! Welcome to the Grand Horizon Hotel. How may I assist you with your reservation tonight?",
        promptEn: "Good evening! Welcome to the Grand Horizon Hotel. How may I assist you with your reservation tonight?",
        suggestedDurationSeconds: 90,
        cueCardPoints: [
          "State your reservation name and duration of stay",
          "Politely ask if a quiet room on a higher floor is available",
          "Inquire about breakfast hours and Wi-Fi access"
        ],
        boardTemplateNote: "🏨 Scenario Checklist:\n[ ] Confirm booking details\n[ ] Inquire about room upgrade/view\n[ ] Ask for amenities & breakfast schedule",
        expectedKeywords: ["reservation", "upgrade", "breakfast", "complimentary", "floor"]
      },
      {
        id: "hotel_problem",
        stageTitleAr: "المشهد: معالجة مشكلة التكييف بلباقة ودبلوماسية",
        stageTitleEn: "Scene: Diplomatic Complaint Handling",
        promptAr: "I see your room is on the 14th floor. Is there anything else I can arrange for your comfort?",
        promptEn: "I see your room is on the 14th floor. Is there anything else I can arrange for your comfort?",
        suggestedDurationSeconds: 90,
        boardTemplateNote: "💡 Diplomatic Problem Solving:\n'I appreciate your assistance; however, there seems to be a minor issue with the AC unit.'",
        expectedKeywords: ["appreciate", "however", "maintenance", "assistance", "resolve"]
      }
    ]
  }
];
