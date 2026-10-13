export interface QuizQuestion {
  id: string;
  agentId: string;
  topicAr: string;
  topicEn: string;
  questionAr: string;
  questionEn: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanationAr: string;
    explanationEn: string;
  }[];
  whiteboardNoteText?: string;
}

export interface AchievementBadge {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: string;
  category: "chat" | "voice" | "board" | "quiz" | "explorer";
}

export const ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: "first_step",
    titleAr: "أول خطوة 🎓",
    titleEn: "First Step 🎓",
    descAr: "بدء أول محادثة تعليمية مع أحد المعلمين الأذكياء.",
    descEn: "Start your first learning conversation with a tutor.",
    icon: "🌱",
    category: "chat"
  },
  {
    id: "voice_pioneer",
    titleAr: "المتحدث الشجاع 🎙️",
    titleEn: "Voice Pioneer 🎙️",
    descAr: "التحدث صوتياً باستخدام ميزة الميكروفون المباشر.",
    descEn: "Speak out loud using the live microphone feature.",
    icon: "🗣️",
    category: "voice"
  },
  {
    id: "board_artist",
    titleAr: "رسام السبورة 🎨",
    titleEn: "Board Master 🎨",
    descAr: "إضافة ملاحظات وتفاعل مباشر مع السبورة السحرية.",
    descEn: "Add notes and interact directly with the Magic Board.",
    icon: "🪄",
    category: "board"
  },
  {
    id: "speed_solver",
    titleAr: "سريع البديهة ⚡",
    titleEn: "Speed Solver ⚡",
    descAr: "إكمال تحدي لغوي واختيار الإجابة الصحيحة بنجاح.",
    descEn: "Complete a speed quiz challenge with a correct answer.",
    icon: "⚡",
    category: "quiz"
  },
  {
    id: "all_tutors",
    titleAr: "صديق الجميع 🌟",
    titleEn: "Polymath 🌟",
    descAr: "تجربة الجلسات مع جميع المعلمين الستة المتخصصين.",
    descEn: "Experience sessions with all 6 specialist tutors.",
    icon: "👑",
    category: "explorer"
  },
  {
    id: "streak_champ",
    titleAr: "شعلة الحماس 🔥",
    titleEn: "Streak Spark 🔥",
    descAr: "المواظبة على التدريب اليومي المستمر.",
    descEn: "Maintain your daily learning streak.",
    icon: "🔥",
    category: "quiz"
  }
];

export const TUTOR_QUIZZES: Record<string, QuizQuestion[]> = {
  foundation: [
    {
      id: "gram_1",
      agentId: "foundation",
      topicAr: "توافق الفاعل والفعل (Subject-Verb Agreement)",
      topicEn: "Subject-Verb Agreement",
      questionAr: "اختر الجملة الصحيحة نحوياً:",
      questionEn: "Choose the grammatically correct sentence:",
      options: [
        {
          text: "Each of the students has finished their work.",
          isCorrect: true,
          explanationAr: "كلمة Each تعامل معاملة المفرد ويأتي معها الفعل has وليس have.",
          explanationEn: "'Each' is grammatically singular and takes the singular verb 'has'."
        },
        {
          text: "Each of the students have finished their work.",
          isCorrect: false,
          explanationAr: "خطأ شائع: مع كلمة Each نستخدم has لأنها تدل على المفرد المنفرد.",
          explanationEn: "Common mistake: 'Each' requires a singular verb, so 'has' is correct."
        },
        {
          text: "Each of the students having finished their work.",
          isCorrect: false,
          explanationAr: "الجملة تفتقر إلى فعل رئيسي مسند.",
          explanationEn: "The sentence lacks a finite main verb."
        }
      ],
      whiteboardNoteText: "📝 Grammar Rule:\n'Each of' + Plural Noun + Singular Verb (has/is/was)"
    },
    {
      id: "gram_2",
      agentId: "foundation",
      topicAr: "الأزمنة (Past Continuous vs Simple Past)",
      topicEn: "Past Continuous vs Simple Past",
      questionAr: "أكمل الفراغ: 'While I _______ dinner, the phone rang.'",
      questionEn: "Fill in the blank: 'While I _______ dinner, the phone rang.'",
      options: [
        {
          text: "was cooking",
          isCorrect: true,
          explanationAr: "نستخدم الماضي المستمر للحدث الطويل الذي قاطعه حدث مفاجئ (Past Simple).",
          explanationEn: "Use Past Continuous for the longer continuous background action interrupted by the phone."
        },
        {
          text: "cooked",
          isCorrect: false,
          explanationAr: "cooked يعبر عن حدث مكتمل سريع، بينما هنا لدينا استمرارية أثناء الطهي.",
          explanationEn: "'Cooked' is simple past; 'while' introduces a continuous past background action."
        },
        {
          text: "cook",
          isCorrect: false,
          explanationAr: "لا يمكن استخدام المضارع البسيط في سياق جملة ماضية مع rang.",
          explanationEn: "Cannot use present tense with past action 'rang'."
        }
      ],
      whiteboardNoteText: "⏳ Tense Pattern:\nWhile + Past Continuous (was cooking) + Past Simple (rang)"
    }
  ],
  free_talk: [
    {
      id: "idiom_1",
      agentId: "free_talk",
      topicAr: "المصطلحات الشائعة (Idioms)",
      topicEn: "Everyday Idioms",
      questionAr: "ما معنى المصطلح الإنجليزي 'Bite the bullet'؟",
      questionEn: "What does the idiom 'Bite the bullet' mean?",
      options: [
        {
          text: "To face an inevitable difficult situation with courage.",
          isCorrect: true,
          explanationAr: "يعني مواجهة أمر صعب أو غير مرغوب فيه بشجاعة وثبات.",
          explanationEn: "It means to accept and endure a tough or unpleasant situation bravely."
        },
        {
          text: "To eat something very hard or crunchy.",
          isCorrect: false,
          explanationAr: "المصطلح مجازي ولا علاقة له بالطعام الحقيقي.",
          explanationEn: "The idiom is figurative and unrelated to actual food."
        },
        {
          text: "To make a reckless and dangerous mistake.",
          isCorrect: false,
          explanationAr: "المعنى الحقيقي هو التحمل والشجاعة وليس التهور.",
          explanationEn: "It means enduring with fortitude, not being reckless."
        }
      ],
      whiteboardNoteText: "💡 Idiom of the Day:\n'Bite the bullet' = إرغام النفس على مواجهة موقف صعب بشجاعة."
    },
    {
      id: "idiom_2",
      agentId: "free_talk",
      topicAr: "التواصل العفوي (Casual Phrases)",
      topicEn: "Casual Conversation",
      questionAr: "إذا أردت أن تقول لصديقك 'أنا أتفق معك تماماً' بشكل طبيعي، أي عبارة هي الأنسب؟",
      questionEn: "Which natural expression means 'I totally agree with you'?",
      options: [
        {
          text: "You can say that again!",
          isCorrect: true,
          explanationAr: "عبارة يومية شائعة جداً تعني 'كلامك في الصميم، وأنا أوافقك 100%'.",
          explanationEn: "A common conversational phrase meaning 'I strongly and completely agree!'."
        },
        {
          text: "Repeat yourself please.",
          isCorrect: false,
          explanationAr: "هذا طلب إعادة كلام بشكل حرفي، وليس تعبيراً عن الاتفاق.",
          explanationEn: "This literally requests repetition rather than signaling agreement."
        },
        {
          text: "I am having no opinions.",
          isCorrect: false,
          explanationAr: "صياغة غير طبيعية وغير صحيحة تعني انعدام الرأي.",
          explanationEn: "Unnatural phrasing meaning having no opinion."
        }
      ],
      whiteboardNoteText: "💬 Natural Flow:\n'You can say that again!' = أوافقك الرأي تماماً!"
    }
  ],
  business_pro: [
    {
      id: "biz_1",
      agentId: "business_pro",
      topicAr: "المراسلات والاجتماعات المهنية",
      topicEn: "Corporate Communication",
      questionAr: "أي الجمل التالية هي الأكثر لباقة واحترافية في إيميل عمل لطلب التحديث؟",
      questionEn: "Which sentence is most professional when following up on a project update?",
      options: [
        {
          text: "I would appreciate a brief update on the project timeline when convenient.",
          isCorrect: true,
          explanationAr: "صياغة مهنية راقية تجمع بين التحديد واللطف الدبلوماسي.",
          explanationEn: "Polite, diplomatic, and clear corporate tone for email follow-ups."
        },
        {
          text: "Tell me what you did on the project right now.",
          isCorrect: false,
          explanationAr: "أسلوب فظ وأمر مباشر غير ملائم في بيئات الأعمال الاحترافية.",
          explanationEn: "Too blunt and demanding for professional workplace correspondence."
        },
        {
          text: "Did you finish or what?",
          isCorrect: false,
          explanationAr: "أسلوب عامي غير لائق بالمراسلات الرسمية.",
          explanationEn: "Informal and unprofessional phrasing."
        }
      ],
      whiteboardNoteText: "💼 Business Etiquette:\n'I would appreciate an update when convenient' > Direct demands"
    }
  ],
  ielts_examiner: [
    {
      id: "ielts_1",
      agentId: "ielts_examiner",
      topicAr: "الروابط المتقدمة (Cohesive Devices)",
      topicEn: "IELTS Band 8+ Connectors",
      questionAr: "اختر الرابط الأكثر ملاءمة للتعبير عن التناقض في كتابة الآيلتس الرسمية:",
      questionEn: "Choose the advanced cohesive device for contrasting ideas:",
      options: [
        {
          text: "Notwithstanding this disadvantage, the proposal offers significant benefits.",
          isCorrect: true,
          explanationAr: "كلمة Notwithstanding كلمة أكاديمية راقية ترفع درجات معيار Lexical Resource.",
          explanationEn: "'Notwithstanding' is an academic Band 8+ preposition meaning 'in spite of'."
        },
        {
          text: "But this is having bad things too, so benefits are good.",
          isCorrect: false,
          explanationAr: "لغة غير أكاديمية وضعيفة تمنح درجات منخفضة في معيار المعجم.",
          explanationEn: "Informal, simplistic structure that scores low in Lexical Resource."
        },
        {
          text: "Also opposite things are happening in benefits.",
          isCorrect: false,
          explanationAr: "صياغة مشوشة تفتقر إلى الدقة المعجمية والنحوية.",
          explanationEn: "Confusing phrasing that lacks grammatical precision."
        }
      ],
      whiteboardNoteText: "🎯 IELTS Band 8 Tip:\nUse 'Notwithstanding' or 'Conversely' to signal contrast smoothly."
    }
  ],
  phonetics: [
    {
      id: "phon_1",
      agentId: "phonetics",
      topicAr: "الأزواج الصوتية المتقاربة (Minimal Pairs)",
      topicEn: "Vowel Length & Phoneme Contrast",
      questionAr: "ما الفرق الصوتي بين كلمتي 'ship' و 'sheep'؟",
      questionEn: "What is the key phonetic distinction between 'ship' and 'sheep'?",
      options: [
        {
          text: "'ship' has a short relaxed vowel /ɪ/, while 'sheep' has a long tense vowel /iː/.",
          isCorrect: true,
          explanationAr: "الصوت في ship قصير ومسترخٍ /ɪ/، بينما في sheep ممدود ومشدود /iː/.",
          explanationEn: "'ship' uses short lax /ɪ/ (kit vowel); 'sheep' uses long tense /iː/ (fleece vowel)."
        },
        {
          text: "They are pronounced identically; the difference is only in spelling.",
          isCorrect: false,
          explanationAr: "خطأ شائع: هما صوتان مختلفان تماماً وتغير المعنى إذا خلطت بينهما.",
          explanationEn: "Incorrect: mixing them up causes serious comprehension confusion."
        },
        {
          text: "The 'sh' sound is voiced in one and unvoiced in the other.",
          isCorrect: false,
          explanationAr: "صوت الشين /ʃ/ هو نفسه في الكلمتين، الفرق في حرف العلة فقط.",
          explanationEn: "The initial consonant /ʃ/ is identical in both words; only the vowel differs."
        }
      ],
      whiteboardNoteText: "🗣️ IPA Minimal Pair:\n/ʃɪp/ (short) vs /ʃiːp/ (long tense)"
    }
  ],
  roleplay: [
    {
      id: "role_1",
      agentId: "roleplay",
      topicAr: "سيناريو المطعم وطلب المساعدة",
      topicEn: "Restaurant Scenario",
      questionAr: "إذا وصلك طبق مختلف عن طلبك في المطعم، ما هي العبارة الأنسب لمعالجة الأمر بلباقة؟",
      questionEn: "At a restaurant, your dish is not what you ordered. What is the best polite phrase?",
      options: [
        {
          text: "Excuse me, I believe there might be a slight mix-up; I had ordered the grilled fish.",
          isCorrect: true,
          explanationAr: "أسلوب مهذب ولبق يحل المشكلة دون إحراج النادل أو خلق توتر.",
          explanationEn: "Diplomatic and polite way to point out the error without being confrontational."
        },
        {
          text: "Take this away right now! You don't know my food!",
          isCorrect: false,
          explanationAr: "أسلوب عدائي وغير لائق في التواصل اليومي الإنجليزي.",
          explanationEn: "Rude and aggressive reaction."
        },
        {
          text: "Never mind, I will eat it even if I hate it.",
          isCorrect: false,
          explanationAr: "سلبية غير ضرورية؛ يمكنك التعبير عن حقك بلباقة.",
          explanationEn: "Unnecessary passive submission; polite assertiveness is preferred."
        }
      ],
      whiteboardNoteText: "🎭 Roleplay Cue:\n'Excuse me, I believe there might be a slight mix-up...'"
    }
  ]
};

// Calculate user level based on XP
export function calculateLevel(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  titleAr: string;
  titleEn: string;
  progressPercent: number;
} {
  const levels = [
    { minXp: 0, titleAr: "المبتدئ الواعد 🌱", titleEn: "Rising Explorer 🌱" },
    { minXp: 100, titleAr: "مغامر الكلمات 📖", titleEn: "Word Adventurer 📖" },
    { minXp: 250, titleAr: "صائد القواعد 🎯", titleEn: "Grammar Hunter 🎯" },
    { minXp: 500, titleAr: "فصيح اللسان 💬", titleEn: "Fluent Speaker 💬" },
    { minXp: 850, titleAr: "خبير الأكاديمية 👑", titleEn: "Academy Master 👑" },
    { minXp: 1300, titleAr: "أسطورة الإنجليزية 🌟", titleEn: "English Legend 🌟" },
  ];

  let currentIdx = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].minXp) {
      currentIdx = i;
      break;
    }
  }

  const currentLevel = currentIdx + 1;
  const currentMin = levels[currentIdx].minXp;
  const nextMin = currentIdx < levels.length - 1 ? levels[currentIdx + 1].minXp : currentMin + 600;
  const range = nextMin - currentMin;
  const progress = Math.min(100, Math.max(0, ((xp - currentMin) / range) * 100));

  return {
    level: currentLevel,
    currentLevelXp: xp - currentMin,
    nextLevelXp: range,
    titleAr: levels[currentIdx].titleAr,
    titleEn: levels[currentIdx].titleEn,
    progressPercent: Math.round(progress)
  };
}
