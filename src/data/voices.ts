export interface AgentVoiceProfile {
  id: string;
  nameEn: string;
  nameAr: string;
  gender: "male" | "female";
  geminiVoice: "Puck" | "Fenrir" | "Charon" | "Aoede" | "Kore" | "Leda";
  genderAr: string;
  genderEn: string;
  personaAr: string;
  personaEn: string;
  pitch: number;
  rate: number;
  preferredVoicePatterns: string[];
  preferredArabicPatterns: string[];
  sampleGreetingEn: string;
  sampleGreetingAr: string;
}

export const AGENT_VOICE_PROFILES: Record<string, AgentVoiceProfile> = {
  foundation: {
    id: "foundation",
    nameEn: "Adam",
    nameAr: "آدم",
    gender: "male",
    geminiVoice: "Puck",
    genderAr: "شخصية رجل (معلم صبور وواضح)",
    genderEn: "Male Persona (Calm & Clear)",
    personaAr: "صوت رجل هادئ ورزين وصبور، يشرح القواعد والأساسيات بنبرة واضحة ومطمئنة 👨‍🏫",
    personaEn: "Calm, steady, articulate male voice tailored for clear grammatical foundation 👨‍🏫",
    pitch: 1.0, // Natural direct voice without pitch-shifting
    rate: 0.94, // Patient, clear pedagogical pace
    preferredVoicePatterns: [
      "microsoft david",
      "david",
      "google us english male",
      "guy",
      "alex",
      "fred",
      "en-us",
      "male"
    ],
    preferredArabicPatterns: [
      "hamed",
      "shakir",
      "tarek",
      "maged",
      "naayf",
      "male"
    ],
    sampleGreetingEn: "Hello! I am Adam. Let's master sentence structure and English grammar step by step!",
    sampleGreetingAr: "أهلاً بك! أنا آدم. لنتقن معاً قواعد اللغة وبناء الجمل الصحيحة خطوة بخطوة!"
  },
  free_talk: {
    id: "free_talk",
    nameEn: "Sarah",
    nameAr: "سارة",
    gender: "female",
    geminiVoice: "Aoede",
    genderAr: "شخصية نسائية (حيوية وعفوية)",
    genderEn: "Female Persona (Lively & Warm)",
    personaAr: "صوت نسائي دافئ وحيوي ومبتهج، يعزز الطلاقة والمحادثة العفوية اليومية 👩‍💼",
    personaEn: "Bright, energetic, warm female voice designed for natural conversational fluency 👩‍💼",
    pitch: 1.0, // Natural direct voice without pitch-shifting
    rate: 1.04, // Conversational, engaging pace
    preferredVoicePatterns: [
      "samantha",
      "microsoft zira",
      "zira",
      "microsoft jenny",
      "jenny",
      "ava",
      "allison",
      "google us english female",
      "en-us",
      "female"
    ],
    preferredArabicPatterns: [
      "salma",
      "zariyah",
      "laila",
      "mariam",
      "zehra",
      "female"
    ],
    sampleGreetingEn: "Hey there! I'm Sarah! Ready to chat naturally and explore awesome everyday idioms?",
    sampleGreetingAr: "مرحباً! أنا سارة. هل أنت مستعد للحديث بعفوية واكتشاف أروع المصطلحات الإنجليزية اليومية؟"
  },
  business_pro: {
    id: "business_pro",
    nameEn: "David",
    nameAr: "ديفيد",
    gender: "male",
    geminiVoice: "Fenrir",
    genderAr: "شخصية رجل (تنفيذي وقيادي)",
    genderEn: "Male Persona (Deep Executive)",
    personaAr: "صوت رجل تنفيذي ذو نبرة عميقة ورصينة، متخصص في مقابلات العمل واجتماعات الشركات 💼",
    personaEn: "Deep, authoritative executive baritone voice for corporate strategy and job interviews 💼",
    pitch: 1.0, // Natural direct voice without pitch-shifting
    rate: 0.98, // Steady, confident executive pace
    preferredVoicePatterns: [
      "microsoft george",
      "george",
      "oliver",
      "microsoft mark",
      "mark",
      "microsoft christopher",
      "christopher",
      "daniel",
      "google uk english male",
      "en-gb",
      "male"
    ],
    preferredArabicPatterns: [
      "shakir",
      "hamed",
      "maged",
      "tarek",
      "male"
    ],
    sampleGreetingEn: "Greetings, I am David. We will sharpen your executive communication and ace your job interviews.",
    sampleGreetingAr: "تحياتي، أنا ديفيد. سنصقل حضورك القيادي وأسلوبك المهني لتتميز في مقابلات واجتماعات العمل."
  },
  ielts_examiner: {
    id: "ielts_examiner",
    nameEn: "Victoria",
    nameAr: "فيكتوريا",
    gender: "female",
    geminiVoice: "Kore",
    genderAr: "شخصية نسائية (أكاديمية رسمية)",
    genderEn: "Female Persona (British Academic)",
    personaAr: "صوت نسائي بريطاني فخم وراقٍ، بنبرة أكاديمية متقنة لتقييم معايير اختبار الآيلتس 🎯",
    personaEn: "Refined, prestigious British academic female examiner voice focused on Band 8.0+ criteria 🎯",
    pitch: 1.0, // Natural direct voice without pitch-shifting
    rate: 0.95, // Measured, formal examiner pace
    preferredVoicePatterns: [
      "victoria",
      "microsoft hazel",
      "hazel",
      "microsoft libby",
      "libby",
      "microsoft sonia",
      "sonia",
      "google uk english female",
      "karen",
      "fiona",
      "en-gb",
      "female"
    ],
    preferredArabicPatterns: [
      "zariyah",
      "salma",
      "mariam",
      "female"
    ],
    sampleGreetingEn: "Welcome. I am Victoria, your IELTS examiner. Let us work systematically towards your Band 8 score.",
    sampleGreetingAr: "أهلاً بك. أنا فيكتوريا، مدربة اختبار الآيلتس. سنعمل منهجياً للوصول إلى أعلى درجات الإتقان."
  },
  phonetics: {
    id: "phonetics",
    nameEn: "Liam",
    nameAr: "ليام",
    gender: "male",
    geminiVoice: "Charon",
    genderAr: "شخصية رجل (خبير نطق وصوتيات)",
    genderEn: "Male Persona (Phonetics & IPA)",
    personaAr: "صوت رجل خبير بالصوتيات، يتحدث بروية وهدوء مع إبراز مخارج الحروف والرموز الصوتية 🎧",
    personaEn: "Resonant, deliberate male phonetician voice articulating distinct phonemes and IPA stress 🎧",
    pitch: 1.0, // Natural direct voice without pitch-shifting
    rate: 0.88, // Intentional pacing for phonetic clarity and pronunciation
    preferredVoicePatterns: [
      "ryan",
      "arthur",
      "tom",
      "stefan",
      "daniel",
      "google english",
      "google australian english",
      "en-au",
      "en-ca",
      "en-in",
      "male"
    ],
    preferredArabicPatterns: [
      "tarek",
      "hamed",
      "shakir",
      "male"
    ],
    sampleGreetingEn: "Hello! Liam here. Listen closely to tongue placement, vowel contrast, and phonetic stress.",
    sampleGreetingAr: "مرحباً! أنا ليام، خبير الصوتيات. استمع بدقة لمخارج الحروف والرموز الصوتية واللكنة الصحيحة."
  },
  roleplay: {
    id: "roleplay",
    nameEn: "Elena",
    nameAr: "إيلينا",
    gender: "female",
    geminiVoice: "Leda",
    genderAr: "شخصية نسائية (تفاعلية مسرحية)",
    genderEn: "Female Persona (Theatrical & Expressive)",
    personaAr: "صوت نسائي تفاعلي مسرحي مفعم بالحياة، يجسد المواقف والسيناريوهات الواقعية بتفاعل مميز 🎭",
    personaEn: "Expressive, theatrical, dynamic female voice creating rich situational roleplays 🎭",
    pitch: 1.0, // Natural direct voice without pitch-shifting
    rate: 1.02, // Dynamic, expressive roleplay pace
    preferredVoicePatterns: [
      "tessa",
      "microsoft natasha",
      "natasha",
      "microsoft michelle",
      "michelle",
      "stephanie",
      "google australian english",
      "en-au",
      "en-ca",
      "female"
    ],
    preferredArabicPatterns: [
      "laila",
      "salma",
      "zariyah",
      "female"
    ],
    sampleGreetingEn: "Welcome to the stage! I'm Elena, and together we will bring real-life scenarios to life!",
    sampleGreetingAr: "أهلاً بك على المسرح الحواري! أنا إيلينا، وسنعيش معاً مواقف وتحديات الحياة الواقعية بحماس!"
  }
};

/**
 * Cache for generated Gemini TTS audio base64 clips
 */
export const ttsAudioCache = new Map<string, string>();
let currentAudioElement: HTMLAudioElement | null = null;
let currentSpeechRequestId = 0;

export function cacheAgentAudio(agentId: string, text: string, audioBase64: string): void {
  const clean = text
    .replace(/[*#_`$]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "")
    .trim();
  if (clean && audioBase64) {
    ttsAudioCache.set(`${agentId}_${clean}`, audioBase64);
  }
}

/**
 * Stops any currently playing speech (Gemini audio or browser speech synthesis)
 */
export function stopCurrentSpeech(): void {
  currentSpeechRequestId++;
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch {}
    currentAudioElement = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

/**
 * Plays raw base64 WAV audio (e.g. from Gemini TTS stream)
 */
export function playBase64Audio({
  audioBase64,
  mimeType = "audio/wav",
  onStart,
  onEnd,
  onError
}: {
  audioBase64: string;
  mimeType?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}): void {
  stopCurrentSpeech();
  const thisId = currentSpeechRequestId;

  try {
    const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
    currentAudioElement = audio;

    audio.onplay = () => {
      if (thisId === currentSpeechRequestId && onStart) {
        onStart();
      }
    };

    audio.onended = () => {
      if (thisId === currentSpeechRequestId) {
        currentAudioElement = null;
        if (onEnd) onEnd();
      }
    };

    audio.onerror = () => {
      if (thisId === currentSpeechRequestId) {
        currentAudioElement = null;
        if (onError) onError();
      }
    };

    audio.play().catch(() => {
      if (thisId === currentSpeechRequestId) {
        currentAudioElement = null;
        if (onError) onError();
      }
    });
  } catch (err) {
    if (onError) onError();
  }
}

/**
 * Resolves a unique, non-duplicated SpeechSynthesisVoice for each agent from available browser voices.
 * Ensures male agents get male voices, female agents get female voices, and no two characters share a voice.
 */
export function resolveDistinctVoices(
  allVoices: SpeechSynthesisVoice[]
): Record<string, SpeechSynthesisVoice | null> {
  const assignments: Record<string, SpeechSynthesisVoice | null> = {
    foundation: null,
    free_talk: null,
    business_pro: null,
    ielts_examiner: null,
    phonetics: null,
    roleplay: null
  };

  if (!allVoices || allVoices.length === 0) {
    return assignments;
  }

  const usedVoiceURIs = new Set<string>();

  const isLikelyMale = (v: SpeechSynthesisVoice): boolean => {
    const text = `${v.name} ${v.voiceURI}`.toLowerCase();
    const maleNames = [
      "david", "guy", "mark", "george", "daniel", "alex", "fred",
      "christopher", "ryan", "oliver", "arthur", "tom", "stefan",
      "shakir", "hamed", "maged", "tarek", "male", "james", "richard", "puck", "fenrir", "charon"
    ];
    if (text.includes("female") || text.includes("woman")) return false;
    if (text.includes("male") || text.includes("man")) return true;
    return maleNames.some((n) => text.includes(n));
  };

  const isLikelyFemale = (v: SpeechSynthesisVoice): boolean => {
    const text = `${v.name} ${v.voiceURI}`.toLowerCase();
    const femaleNames = [
      "zira", "jenny", "samantha", "victoria", "karen", "fiona", "hazel",
      "libby", "sonia", "ava", "allison", "moira", "tessa", "natasha",
      "michelle", "salma", "zariyah", "laila", "mariam", "zehra", "female",
      "woman", "aoede", "kore", "leda"
    ];
    if (text.includes("female") || text.includes("woman")) return true;
    return femaleNames.some((n) => text.includes(n));
  };

  // English & general pools
  const englishVoices = allVoices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const pool = englishVoices.length > 0 ? englishVoices : allVoices;

  const malePool = pool.filter((v) => isLikelyMale(v));
  const femalePool = pool.filter((v) => isLikelyFemale(v));
  const genericPool = pool.filter((v) => !isLikelyMale(v) && !isLikelyFemale(v));

  // 1. Assign Male Agents: Adam (foundation), David (business_pro), Liam (phonetics)
  const maleAgents = ["foundation", "business_pro", "phonetics"];
  for (const agentId of maleAgents) {
    const profile = AGENT_VOICE_PROFILES[agentId];
    let matchedVoice: SpeechSynthesisVoice | null = null;

    for (const pattern of profile.preferredVoicePatterns) {
      const found = malePool.find(
        (v) => !usedVoiceURIs.has(v.voiceURI) && v.name.toLowerCase().includes(pattern)
      );
      if (found) {
        matchedVoice = found;
        break;
      }
    }

    if (!matchedVoice) {
      matchedVoice = malePool.find((v) => !usedVoiceURIs.has(v.voiceURI)) || null;
    }
    if (!matchedVoice) {
      matchedVoice = genericPool.find((v) => !usedVoiceURIs.has(v.voiceURI)) || null;
    }
    if (!matchedVoice) {
      matchedVoice = pool.find((v) => !usedVoiceURIs.has(v.voiceURI)) || pool[0] || null;
    }

    if (matchedVoice) {
      assignments[agentId] = matchedVoice;
      usedVoiceURIs.add(matchedVoice.voiceURI);
    }
  }

  // 2. Assign Female Agents: Sarah (free_talk), Victoria (ielts_examiner), Elena (roleplay)
  const femaleAgents = ["free_talk", "ielts_examiner", "roleplay"];
  for (const agentId of femaleAgents) {
    const profile = AGENT_VOICE_PROFILES[agentId];
    let matchedVoice: SpeechSynthesisVoice | null = null;

    for (const pattern of profile.preferredVoicePatterns) {
      const found = femalePool.find(
        (v) => !usedVoiceURIs.has(v.voiceURI) && v.name.toLowerCase().includes(pattern)
      );
      if (found) {
        matchedVoice = found;
        break;
      }
    }

    if (!matchedVoice) {
      matchedVoice = femalePool.find((v) => !usedVoiceURIs.has(v.voiceURI)) || null;
    }
    if (!matchedVoice) {
      matchedVoice = genericPool.find((v) => !usedVoiceURIs.has(v.voiceURI)) || null;
    }
    if (!matchedVoice) {
      matchedVoice = pool.find((v) => !usedVoiceURIs.has(v.voiceURI)) || pool[0] || null;
    }

    if (matchedVoice) {
      assignments[agentId] = matchedVoice;
      usedVoiceURIs.add(matchedVoice.voiceURI);
    }
  }

  return assignments;
}

/**

/**
 * Speaks text directly with the tutor's designated voice identity.
 * Plays direct character voice without pitch distortion, beeps, or voice conversion.
 */
export function playAgentVoiceSpeech({
  text,
  agentId,
  assignedVoice,
  allVoices = [],
  onStart,
  onEnd,
  onError
}: {
  text: string;
  agentId: string;
  assignedVoice: SpeechSynthesisVoice | null;
  allVoices?: SpeechSynthesisVoice[];
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}): void {
  stopCurrentSpeech();

  const cleanText = text
    .replace(/[*#_`$]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "")
    .trim();

  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  const thisRequestId = ++currentSpeechRequestId;
  const profile = AGENT_VOICE_PROFILES[agentId] || AGENT_VOICE_PROFILES.foundation;
  const cacheKey = `${agentId}_${cleanText}`;

  // Direct speech synthesis execution helper
  const runDirectSpeech = () => {
    if (thisRequestId !== currentSpeechRequestId) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onError) onError();
      return;
    }

    const isArabicText = /[\u0600-\u06FF]/.test(cleanText);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    let targetVoice = assignedVoice || null;

    if (isArabicText && allVoices.length > 0) {
      const arabicVoices = allVoices.filter((v) => v.lang.toLowerCase().startsWith("ar"));
      if (arabicVoices.length > 0) {
        if (profile.gender === "male") {
          targetVoice =
            arabicVoices.find((v) =>
              profile.preferredArabicPatterns.some((p) => v.name.toLowerCase().includes(p))
            ) ||
            arabicVoices.find((v) => !v.name.toLowerCase().includes("female")) ||
            arabicVoices[0];
        } else {
          targetVoice =
            arabicVoices.find((v) =>
              profile.preferredArabicPatterns.some((p) => v.name.toLowerCase().includes(p))
            ) ||
            arabicVoices.find((v) => v.name.toLowerCase().includes("female")) ||
            arabicVoices[0];
        }
      }
    }

    if (targetVoice) {
      utterance.voice = targetVoice;
      utterance.lang = targetVoice.lang;
    } else {
      utterance.lang = isArabicText ? "ar-SA" : "en-US";
    }

    utterance.pitch = 1.0; // Direct natural voice pitch (no distortion or conversion)
    utterance.rate = profile.rate; // Natural character pacing

    utterance.onstart = () => {
      if (thisRequestId === currentSpeechRequestId && onStart) onStart();
    };

    utterance.onend = () => {
      if (thisRequestId === currentSpeechRequestId && onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (thisRequestId === currentSpeechRequestId && onError) onError();
    };

    window.speechSynthesis.speak(utterance);
  };

  // 1. If high-fidelity neural audio is cached for this tutor, play directly
  if (ttsAudioCache.has(cacheKey)) {
    const cachedBase64 = ttsAudioCache.get(cacheKey)!;
    playBase64Audio({
      audioBase64: cachedBase64,
      onStart,
      onEnd,
      onError: runDirectSpeech
    });
    return;
  }

  // 2. Play direct character voice immediately without delay or conversion
  runDirectSpeech();
}
