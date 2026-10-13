export interface SavedSession {
  id: string;
  timestamp: string;
  dateFormatted: string;
  agentId: string;
  agentName: string;
  agentRole: string;
  agentAvatar: string;
  messagesCount: number;
  topicsCovered: string[];
  vocabLearned: string[];
  mistakesCorrected: { mistake: string; correction: string; note: string }[];
  tutorAdvice: string;
  stars: number;
  xpEarned: number;
  canvasSnapshot?: string | null;
}

const STORAGE_KEY = "ai_tutor_saved_sessions";

export function getSavedSessions(): SavedSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse saved sessions:", e);
    return [];
  }
}

export function saveSessionToArchive(session: SavedSession): SavedSession[] {
  try {
    const existing = getSavedSessions();
    const updated = [session, ...existing].slice(0, 20); // Keep last 20 sessions
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save session:", e);
    return getSavedSessions();
  }
}

export function deleteSavedSession(id: string): SavedSession[] {
  try {
    const existing = getSavedSessions();
    const updated = existing.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to delete session:", e);
    return getSavedSessions();
  }
}

// Generate smart evaluation summary from messages & active agent
export function generateLessonReport({
  agentId,
  agentName,
  agentRole,
  agentAvatar,
  messages,
  canvasSnapshot,
  xpSession
}: {
  agentId: string;
  agentName: string;
  agentRole: string;
  agentAvatar: string;
  messages: { sender: string; text: string }[];
  canvasSnapshot?: string | null;
  xpSession: number;
}): SavedSession {
  const userMessages = messages.filter((m) => m.sender === "user");
  const agentMessages = messages.filter((m) => m.sender === "agent");

  // Extract detected corrections or vocabulary cues
  const mistakesCorrected: { mistake: string; correction: string; note: string }[] = [];
  const vocabLearned: string[] = [];

  agentMessages.forEach((msg) => {
    // Check if error highlight card was discussed
    if (msg.text.includes("❌") || msg.text.includes("Rule:") || msg.text.includes("Correction:")) {
      const parts = msg.text.split("\n");
      mistakesCorrected.push({
        mistake: parts[0]?.replace("❌", "").trim() || "Grammar formulation",
        correction: parts[1]?.replace("✅", "").trim() || "Standard usage",
        note: parts[2]?.replace("💡", "").trim() || "Contextual advice"
      });
    }

    // Extract potential vocab keywords in quotes
    const quotes = msg.text.match(/"([^"]+)"/g);
    if (quotes) {
      quotes.forEach((q) => {
        const clean = q.replace(/"/g, "").trim();
        if (clean.length > 2 && clean.length < 35 && !vocabLearned.includes(clean)) {
          vocabLearned.push(clean);
        }
      });
    }
  });

  // Default fallbacks if session was conversational
  if (vocabLearned.length === 0) {
    if (agentId === "foundation") vocabLearned.push("Subject-Verb Concord", "Finite Verbs", "Irregular Past");
    else if (agentId === "free_talk") vocabLearned.push("Bite the bullet", "Hit the nail on the head", "Break a leg");
    else if (agentId === "business_pro") vocabLearned.push("Deliverables", "Timeline synergy", "Follow-up protocol");
    else if (agentId === "ielts_examiner") vocabLearned.push("Notwithstanding", "Empirical evidence", "Cohesive devices");
    else if (agentId === "phonetics") vocabLearned.push("Vowel length /iː/", "Dental fricatives /θ/", "Lexical stress");
    else vocabLearned.push("Check-in formalities", "Polite requests", "Assertive diplomatic phrases");
  }

  // Calculate stars based on interaction
  const stars = Math.min(5, Math.max(3, Math.floor(userMessages.length / 2) + 3));

  const tutorAdvices: Record<string, string> = {
    foundation: "ممتاز! استمر في التركيز على مطابقة الفاعل مع الفعل وملاحظة تصاريف الأفعال الشاذة.",
    free_talk: "رائع جداً! استمر في استخدام المصطلحات الشعبية للتحدث بطلاقة وعفوية كالمتحدثين الأصليين.",
    business_pro: "أداء مهني متميز! حافظ على استخدام الصياغات الدبلوماسية والفقرات المحددة في الإيميلات الرسمية.",
    ielts_examiner: "عمل رائع! احرص على استخدام الروابط الأكاديمية (Cohesive devices) لإثراء معيار المعجم والنحو.",
    phonetics: "مجهود صوتي رائع! ركّز على موضع اللسان في الحروف اللثوية والتمييز بين أطوال حروف العلة.",
    roleplay: "تفاعل واقعي شجاع! استمر في التدرب على التعبير عن المشكلات بحلول دبلوماسية واضحة."
  };

  return {
    id: `session_${Date.now()}`,
    timestamp: new Date().toISOString(),
    dateFormatted: new Date().toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
    agentId,
    agentName,
    agentRole,
    agentAvatar,
    messagesCount: messages.length,
    topicsCovered: [agentRole, "التدريب التفاعلي على السبورة السحرية"],
    vocabLearned: vocabLearned.slice(0, 5),
    mistakesCorrected: mistakesCorrected.slice(0, 3),
    tutorAdvice: tutorAdvices[agentId] || "استمر في التدرب اليومي للحفاظ على مستواك العالي!",
    stars,
    xpEarned: Math.max(40, xpSession),
    canvasSnapshot: canvasSnapshot || null
  };
}
