export interface TutorAgentConfig {
  id: string;
  name: string;
  gender: "male" | "female";
  role: string;
  voice: "Puck" | "Fenrir" | "Charon" | "Aoede" | "Kore" | "Leda";
  systemInstruction: string;
}

export const TUTOR_AGENTS: Record<string, TutorAgentConfig> = {
  // --- المعلمون (رجال) ---
  foundation: {
    id: "foundation",
    name: "Adam",
    gender: "male",
    role: "Grammar & Basics",
    voice: "Puck",
    systemInstruction: `You are Adam, a patient English grammar tutor for beginners. Speak slowly with clear articulation using your warm tone. Focus on core grammar rules and write key points on the board.`
  },
  business_pro: {
    id: "business_pro",
    name: "David",
    gender: "male",
    role: "Business & Interviews",
    voice: "Fenrir",
    systemInstruction: `You are David, an executive corporate coach. Maintain a professional, confident tone. Guide the student through workplace negotiations, emails, and interview responses.`
  },
  phonetics: {
    id: "phonetics",
    name: "Liam",
    gender: "male",
    role: "Pronunciation & Accent",
    voice: "Charon",
    systemInstruction: `You are Liam, a phonetics coach. Speak clearly and emphasize precise syllables, stress patterns, and mouth placement cues.`
  },

  // --- المعلمات (نساء) ---
  free_talk: {
    id: "free_talk",
    name: "Sarah",
    gender: "female",
    role: "Casual & Idioms",
    voice: "Aoede",
    systemInstruction: `You are Sarah, an energetic and casual conversation partner. Keep the energy high, use everyday idioms, and encourage the student to speak freely without fear of mistakes.`
  },
  ielts_examiner: {
    id: "ielts_examiner",
    name: "Victoria",
    gender: "female",
    role: "IELTS Examiner",
    voice: "Kore",
    systemInstruction: `You are Victoria, a certified IELTS speaking examiner. Speak formally and evaluate responses based on Fluency, Lexical Resource, Grammar, and Pronunciation.`
  },
  roleplay: {
    id: "roleplay",
    name: "Elena",
    gender: "female",
    role: "Real-world Scenarios",
    voice: "Leda",
    systemInstruction: `You are Elena, an expressive scenario coach. Immerse the learner in dynamic scenarios (airport check-in, ordering food, emergency room) with adaptable personality traits.`
  }
};

export interface Agent {
  id: string;
  nameEn: string;
  nameAr: string;
  roleEn: string;
  roleAr: string;
  avatar: string;
  quoteEn: string;
  quoteAr: string;
  colorClass: string;
  badgeColor: string;
  sampleChallenge: string;
  gender: "male" | "female";
  geminiVoice: "Puck" | "Fenrir" | "Charon" | "Aoede" | "Kore" | "Leda";
  genderLabelAr: string;
  genderLabelEn: string;
  personaAr: string;
  personaEn: string;
  voicePitch: number;
  voiceRate: number;
}

export const AGENTS: Agent[] = [
  {
    id: "foundation",
    nameEn: "Adam",
    nameAr: "آدم",
    roleEn: "Grammar & Basics",
    roleAr: "القواعد والأساسيات",
    avatar: "📚",
    quoteEn: "Let's master sentence structure! 🏗️",
    quoteAr: "لنبنِ جملاً صحيحة وقوية! 🏗️",
    colorClass: "card-foundation",
    badgeColor: "#3b82f6",
    sampleChallenge: "Fix this sentence: 'She have went to school yesterday.'",
    gender: "male",
    geminiVoice: "Puck",
    genderLabelAr: "صوت رجل هادئ",
    genderLabelEn: "Male (Calm)",
    personaAr: "شخصية رجل: هادئ، واثق، وصبور لتبسيط القواعد 👨‍🏫",
    personaEn: "Male Persona: Calm, steady & patient grammar coach 👨‍🏫",
    voicePitch: 0.94,
    voiceRate: 0.90
  },
  {
    id: "free_talk",
    nameEn: "Sarah",
    nameAr: "سارة",
    roleEn: "Casual & Idioms",
    roleAr: "المحادثة والطلاقة",
    avatar: "💬",
    quoteEn: "Chat naturally like a native speaker! ☕",
    quoteAr: "تحدث بعفوية وأسلوب شيق! ☕",
    colorClass: "card-free_talk",
    badgeColor: "#f59e0b",
    sampleChallenge: "Idiom challenge: What does 'Once in a blue moon' mean?",
    gender: "female",
    geminiVoice: "Aoede",
    genderLabelAr: "صوت نسائي حيوي",
    genderLabelEn: "Female (Lively)",
    personaAr: "شخصية نسائية: دافئة، عفوية، ومبتهجة للطلاقة 👩‍💼",
    personaEn: "Female Persona: Energetic, warm & friendly conversationalist 👩‍💼",
    voicePitch: 1.24,
    voiceRate: 1.04
  },
  {
    id: "business_pro",
    nameEn: "David",
    nameAr: "ديفيد",
    roleEn: "Corporate & Interviews",
    roleAr: "الإنجليزية المهنية والمقابلات",
    avatar: "💼",
    quoteEn: "Elevate your executive presence! 📈",
    quoteAr: "تميّز في اجتماعاتك ومقابلات العمل! 📈",
    colorClass: "card-business_pro",
    badgeColor: "#10b981",
    sampleChallenge: "Email draft: 'Dear Sir, I am writing to follow up regarding our proposal.'",
    gender: "male",
    geminiVoice: "Fenrir",
    genderLabelAr: "صوت رجل تنفيذي",
    genderLabelEn: "Male (Executive)",
    personaAr: "شخصية رجل: تنفيذي عميق النبرة، رسمي، ومحترف 💼",
    personaEn: "Male Persona: Deep executive baritone for business meetings 💼",
    voicePitch: 0.78,
    voiceRate: 0.92
  },
  {
    id: "ielts_examiner",
    nameEn: "Victoria",
    nameAr: "فيكتوريا",
    roleEn: "IELTS Examiner",
    roleAr: "مدربة اختبار الآيلتس",
    avatar: "🎯",
    quoteEn: "Reach Band 8.0+ criteria! 🏅",
    quoteAr: "حقّق أهدافك في الآيلتس بدرجة 8+! 🏅",
    colorClass: "card-ielts_examiner",
    badgeColor: "#ec4899",
    sampleChallenge: "Speaking Part 2: Describe an environmental project in your city.",
    gender: "female",
    geminiVoice: "Kore",
    genderLabelAr: "صوت نسائي بريطاني",
    genderLabelEn: "Female (British Academic)",
    personaAr: "شخصية نسائية: بريطانية أكاديمية فخمة وراقية 🎯",
    personaEn: "Female Persona: Refined British academic IELTS examiner 🎯",
    voicePitch: 1.08,
    voiceRate: 0.86
  },
  {
    id: "phonetics",
    nameEn: "Liam",
    nameAr: "ليام",
    roleEn: "Pronunciation & IPA",
    roleAr: "مخارج الحروف والنطق",
    avatar: "🎤",
    quoteEn: "Refine every phoneme and stress! 🎧",
    quoteAr: "أتقن مخارج الحروف واللكنة بدقة! 🎧",
    colorClass: "card-phonetics",
    badgeColor: "#8b5cf6",
    sampleChallenge: "Pronunciation tip: Contrast 'ship' /ʃɪp/ vs 'sheep' /ʃiːp/.",
    gender: "male",
    geminiVoice: "Charon",
    genderLabelAr: "صوت رجل مخارج الحروف",
    genderLabelEn: "Male (Phonetician)",
    personaAr: "شخصية رجل: خبير صوتيات دقيق ومتمهل في النطق 🎧",
    personaEn: "Male Persona: Articulate phonetician highlighting IPA stress 🎧",
    voicePitch: 0.88,
    voiceRate: 0.78
  },
  {
    id: "roleplay",
    nameEn: "Elena",
    nameAr: "إيلينا",
    roleEn: "Real-World Scenarios",
    roleAr: "سيناريوهات ومواقف واقعية",
    avatar: "🎭",
    quoteEn: "Immerse into dynamic roleplays! ✈️",
    quoteAr: "عِش المواقف اليومية وكأنك هناك! ✈️",
    colorClass: "card-roleplay",
    badgeColor: "#f97316",
    sampleChallenge: "Scenario: You are at an airport transit desk checking your connection.",
    gender: "female",
    geminiVoice: "Leda",
    genderLabelAr: "صوت نسائي مسرحي",
    genderLabelEn: "Female (Theatrical)",
    personaAr: "شخصية نسائية: درامية معبّرة لتمثيل سيناريوهات الحياة 🎭",
    personaEn: "Female Persona: Theatrical, dynamic roleplay actress 🎭",
    voicePitch: 1.30,
    voiceRate: 0.98
  }
];

