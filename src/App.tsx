import React, { useState, useEffect, useRef, useCallback } from "react";
import { Whiteboard, WhiteboardRef } from "./Whiteboard";
import {
  TUTOR_QUIZZES,
  ACHIEVEMENTS,
  calculateLevel,
  QuizQuestion
} from "./data/challenges";
import {
  EDUCATIONAL_TEMPLATES,
  EducationalTemplate
} from "./data/templates";
import {
  SavedSession,
  getSavedSessions,
  saveSessionToArchive,
  deleteSavedSession,
  generateLessonReport
} from "./data/sessions";
import {
  SIMULATION_PACKS,
  SimulationPack
} from "./data/simulations";
import {
  AGENT_VOICE_PROFILES,
  resolveDistinctVoices,
  playAgentVoiceSpeech,
  playBase64Audio,
  stopCurrentSpeech,
  cacheAgentAudio
} from "./data/voices";
import { TutorShowcase } from "./components/TutorShowcase";
import { AGENTS, Agent } from "./config/tutorAgents";
import "./App.css";

export interface StudentProfile {
  name: string;
  level: "beginner" | "intermediate" | "advanced";
  goal: string;
  isRegistered: boolean;
}

const STUDENT_GOALS = [
  { id: "grammar", labelAr: "تأسيس وقواعد إنجليزية 📘", labelEn: "Grammar & Foundation 📘", defaultTutor: "foundation" },
  { id: "conversation", labelAr: "محادثة وطلاقة يومية 🗣️", labelEn: "Casual & Idioms 🗣️", defaultTutor: "free_talk" },
  { id: "business", labelAr: "إنجليزية الأعمال والمقابلات 💼", labelEn: "Business & Interviews 💼", defaultTutor: "business_pro" },
  { id: "ielts", labelAr: "التحضير لاختبار الآيلتس 🎯", labelEn: "IELTS Speaking Prep 🎯", defaultTutor: "ielts_examiner" },
  { id: "phonetics", labelAr: "مخارج الحروف وتصحيح النطق 🎤", labelEn: "Pronunciation & Phonetics 🎤", defaultTutor: "phonetics" },
  { id: "roleplay", labelAr: "سيناريوهات ومواقف واقعية ✈️", labelEn: "Real-world Scenarios ✈️", defaultTutor: "roleplay" },
];

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  imageBase64?: string | null;
  agentName?: string;
}

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

export const App: React.FC = () => {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [selectedAgent, setSelectedAgent] = useState<string>("foundation");

  // Flow Step 1: Student Registration & Tutors Selection vs Flow Step 2: Classroom & Whiteboard
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("ai_tutor_student_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Error parsing saved student profile:", e);
      }
    }
    return {
      name: "",
      level: "intermediate",
      goal: "conversation",
      isRegistered: false,
    };
  });

  const [appStep, setAppStep] = useState<"tutors_selection" | "classroom">(() => {
    const saved = localStorage.getItem("ai_tutor_student_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.isRegistered && parsed.name?.trim()) {
          return "classroom";
        }
      } catch (e) {
        console.warn("Error reading student registration:", e);
      }
    }
    return "tutors_selection";
  });

  const [isChatSidebarCollapsed, setIsChatSidebarCollapsed] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isTutorSpeaking, setIsTutorSpeaking] = useState<boolean>(false);
  const [voiceAutoSpeak, setVoiceAutoSpeak] = useState<boolean>(true);
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Track 2: Gamification
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem("ai_tutor_xp");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem("ai_tutor_streak");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(() => {
    const saved = localStorage.getItem("ai_tutor_badges");
    return saved ? JSON.parse(saved) : [];
  });
  const [visitedTutors, setVisitedTutors] = useState<string[]>(["foundation"]);

  // Track 3: Templates & Sticky Color Palette
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [showColorPalette, setShowColorPalette] = useState<boolean>(false);
  const [selectedStickyColor, setSelectedStickyColor] = useState<"yellow" | "green" | "blue" | "violet" | "red">("yellow");

  // Track 4: Saved Sessions Archive & Lesson Report Card
  const [showArchiveModal, setShowArchiveModal] = useState<boolean>(false);
  const [savedSessionsList, setSavedSessionsList] = useState<SavedSession[]>(() => getSavedSessions());
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [currentReport, setCurrentReport] = useState<SavedSession | null>(null);

  // Track 5: Simulation Studio, HUD & Timers
  const [showSimulationStudioModal, setShowSimulationStudioModal] = useState<boolean>(false);
  const [activeSimulation, setActiveSimulation] = useState<SimulationPack | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(90);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [showScorecardModal, setShowScorecardModal] = useState<boolean>(false);
  const [scorecardResults, setScorecardResults] = useState<any | null>(null);

  // Modals for Track 2
  const [showBadgesModal, setShowBadgesModal] = useState<boolean>(false);
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion | null>(null);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);

  // Track 1: Teacher pointer alert on canvas
  const [teacherPointerText, setTeacherPointerText] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const whiteboardRef = useRef<WhiteboardRef>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const pointerTimeoutRef = useRef<number | null>(null);

  const isArabic = lang === "ar";
  const currentAgent = AGENTS.find((a) => a.id === selectedAgent) || AGENTS[0];
  const levelData = calculateLevel(xp);

  // Countdown timer for simulations (Track 5)
  useEffect(() => {
    let interval: any = null;
    if (activeSimulation && isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSimulation, isTimerRunning, secondsRemaining]);

  // Trigger celebration particle spray
  const triggerCelebration = useCallback((message?: string) => {
    const emojis = ["⭐", "✨", "🌟", "💖", "🎉", "🎈", "🎨"];
    const newParticles: Particle[] = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: 30 + Math.random() * 40,
      y: 40 + Math.random() * 30
    }));

    setParticles(newParticles);
    if (message) {
      setCelebrationToast(message);
      setTimeout(() => setCelebrationToast(null), 3000);
    }

    setTimeout(() => {
      setParticles([]);
    }, 1600);
  }, []);

  // Award XP and check badges
  const awardXp = useCallback((amount: number, reasonAr: string, reasonEn: string) => {
    setXp((prev) => {
      const updated = prev + amount;
      localStorage.setItem("ai_tutor_xp", updated.toString());
      return updated;
    });

    triggerCelebration(isArabic ? `+${amount} XP! ${reasonAr}` : `+${amount} XP! ${reasonEn}`);
  }, [isArabic, triggerCelebration]);

  // Unlock badge
  const unlockBadge = useCallback((badgeId: string) => {
    setUnlockedBadges((prev) => {
      if (prev.includes(badgeId)) return prev;
      const updated = [...prev, badgeId];
      localStorage.setItem("ai_tutor_badges", JSON.stringify(updated));
      const badge = ACHIEVEMENTS.find((b) => b.id === badgeId);
      if (badge) {
        triggerCelebration(
          isArabic
            ? `وسام جديد مفتوح: ${badge.titleAr}! 🏆`
            : `New Badge Unlocked: ${badge.titleEn}! 🏆`
        );
      }
      return updated;
    });
  }, [isArabic, triggerCelebration]);

  // Track distinct voices per agent to guarantee no duplicate voices
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [assignedVoices, setAssignedVoices] = useState<Record<string, SpeechSynthesisVoice | null>>({});
  const [playingVoiceAgentId, setPlayingVoiceAgentId] = useState<string | null>(null);

  // Initialize and load non-duplicated voices dynamically
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
        const resolved = resolveDistinctVoices(voices);
        setAssignedVoices(resolved);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Text-to-Speech handler with distinct voice identities (Male / Female tailored)
  const handleSpeak = useCallback((text: string, targetAgentId?: string) => {
    const agentIdToUse = targetAgentId || selectedAgent;
    const assignedVoice = assignedVoices[agentIdToUse] || null;

    setPlayingVoiceAgentId(agentIdToUse);
    setIsTutorSpeaking(true);

    playAgentVoiceSpeech({
      text,
      agentId: agentIdToUse,
      assignedVoice,
      allVoices: availableVoices,
      onStart: () => {
        setIsTutorSpeaking(true);
        setPlayingVoiceAgentId(agentIdToUse);
      },
      onEnd: () => {
        setIsTutorSpeaking(false);
        setPlayingVoiceAgentId(null);
      },
      onError: () => {
        setIsTutorSpeaking(false);
        setPlayingVoiceAgentId(null);
      }
    });
  }, [selectedAgent, assignedVoices, availableVoices]);

  // Preview Voice greeting for any tutor
  const previewAgentVoice = useCallback((agentId: string) => {
    const profile = AGENT_VOICE_PROFILES[agentId];
    if (!profile) return;
    const greeting = isArabic ? profile.sampleGreetingAr : profile.sampleGreetingEn;
    handleSpeak(greeting, agentId);
    triggerCelebration(
      isArabic
        ? `استمع لنبرة ${profile.nameAr} (${profile.genderAr}) 🎙️`
        : `Previewing ${profile.nameEn}'s voice (${profile.genderEn}) 🎙️`
    );
  }, [isArabic, handleSpeak, triggerCelebration]);

  // Activate teacher pointer on canvas
  const showTeacherPointer = useCallback((text: string) => {
    setTeacherPointerText(text);
    if (pointerTimeoutRef.current) clearTimeout(pointerTimeoutRef.current);
    pointerTimeoutRef.current = window.setTimeout(() => {
      setTeacherPointerText(null);
    }, 4500);
  }, []);

  // Vercel-compatible: no WebSocket server. Check the serverless API health instead.
  useEffect(() => {
    let alive = true;
    fetch("/api/health").then((r) => r.json()).then((d) => {
      if (alive) setIsConnected(Boolean(d?.ok && d?.gemini));
    }).catch(() => alive && setIsConnected(false));
    return () => { alive = false; };
  }, []);

  // Close quiz modal with Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowQuizModal(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // html lang/dir follow the UI language
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Speech Recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isArabic ? "ميزة التعرف الصوتي غير مدعومة في هذا المتصفح." : "Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedAgent === "phonetics" || selectedAgent === "foundation" ? "en-US" : (isArabic ? "ar-SA" : "en-US");
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        unlockBadge("voice_pioneer");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputVal((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        awardXp(10, "تحدث صوتي بنجاح", "Successful speech practice");
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Speech recognition error:", e);
      setIsListening(false);
    }
  };

  // Switch Tutor
  const switchAgent = (agentId: string) => {
    stopCurrentSpeech();
    setSelectedAgent(agentId);
    setMessages([]);
    setIsTyping(false);
    const agent = AGENTS.find((a) => a.id === agentId) || AGENTS[0];

    if (!visitedTutors.includes(agentId)) {
      const updated = [...visitedTutors, agentId];
      setVisitedTutors(updated);
      if (updated.length === 6) {
        unlockBadge("all_tutors");
      }
    }


    if (voiceAutoSpeak) {
      const greeting = isArabic ? agent.quoteAr : agent.quoteEn;
      handleSpeak(greeting, agentId);
    }

    triggerCelebration(
      isArabic
        ? `أهلاً بك مع ${agent.nameAr} (${agent.genderLabelAr})! 🎨`
        : `Welcome to ${agent.nameEn}'s studio (${agent.genderLabelEn})! 🎨`
    );
  };

  // Launch classroom & whiteboard after registration and selecting tutor
  const handleStartClassroomSession = (targetAgentId?: string) => {
    const finalAgentId = targetAgentId || selectedAgent;
    const finalName = studentProfile.name.trim() || (isArabic ? "طالب الأكاديمية" : "Academy Student");
    const updated: StudentProfile = {
      ...studentProfile,
      name: finalName,
      isRegistered: true,
    };
    setStudentProfile(updated);
    localStorage.setItem("ai_tutor_student_profile", JSON.stringify(updated));

    if (finalAgentId !== selectedAgent) {
      switchAgent(finalAgentId);
    } else {
      const agent = AGENTS.find((a) => a.id === finalAgentId) || AGENTS[0];
      if (voiceAutoSpeak) {
        const greeting = isArabic
          ? `مرحباً يا ${finalName}! أنا ${agent.nameAr}، يسعدني بدء الشرح والتفاعل معك على السبورة الذكية!`
          : `Welcome ${finalName}! I am ${agent.nameEn}, excited to collaborate with you on our interactive whiteboard!`;
        handleSpeak(greeting, finalAgentId);
      }
    }

    setAppStep("classroom");
    const agentObj = AGENTS.find((a) => a.id === finalAgentId) || AGENTS[0];
    triggerCelebration(
      isArabic
        ? `تم فتح قاعة الدرس والسبورة التفاعلية مع ${agentObj.nameAr}! 🎨`
        : `Classroom and whiteboard studio opened with ${agentObj.nameEn}! 🎨`
    );
  };

  // Send message
  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputVal).trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputVal("");
    setIsTyping(true);

    let imageBase64: string | null = null;
    try {
      if (whiteboardRef.current) {
        imageBase64 = await whiteboardRef.current.getCanvasSnapshot();
      }
    } catch (e) {
      console.warn("Snapshot capture warning:", e);
    }

    if (imageBase64) {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? { ...m, imageBase64 } : m))
      );
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: selectedAgent, text: textToSend, imageBase64 })
      });
      const ct = res.headers.get("content-type") || "";
      const data: any = ct.includes("application/json") ? await res.json() : { error: `HTTP ${res.status}` };
      setIsTyping(false);
      if (!res.ok || !data.text) {
        const msg = data.error === "GEMINI_API_KEY_MISSING"
          ? (isArabic ? "⚠️ المعلم غير مفعّل: مفتاح Gemini غير مضاف في الخادم." : "⚠️ Tutor offline: Gemini API key is not configured on the server.")
          : (isArabic ? "⚠️ تعذر الوصول للمعلم، حاول مرة ثانية." : "⚠️ Couldn't reach the tutor, please try again.");
        setMessages((prev) => [...prev, {
          id: Math.random().toString(36).substring(2, 9), sender: "agent", text: msg,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
        return;
      }
      setIsConnected(true);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          sender: "agent",
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          agentName: currentAgent.nameEn
        }
      ]);
      if (Array.isArray(data.whiteboardActions)) {
        for (const act of data.whiteboardActions) whiteboardRef.current?.applyAction?.(act.tool, act.payload);
      }
      if (voiceAutoSpeak) handleSpeak(data.text, data.agentId || selectedAgent);
      awardXp(15, "محادثة مثمرة مع المعلم", "Fruitful chat with tutor");
      showTeacherPointer(isArabic ? `شرح ${currentAgent.nameAr} جاهز!` : `${currentAgent.nameEn}'s explanation is ready!`);
    } catch (err: any) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          sender: "agent",
          text: isArabic ? "⚠️ تعذر الوصول للمعلم، تأكد من الإنترنت." : "⚠️ Couldn't reach the tutor, check your connection.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // Add sample exercise on canvas
  const handleAddSampleExercise = () => {
    if (whiteboardRef.current) {
      whiteboardRef.current.addNote(
        `🎯 ${currentAgent.nameEn}'s Challenge:\n${currentAgent.sampleChallenge}`,
        selectedStickyColor
      );
      unlockBadge("board_artist");
      awardXp(20, "إدراج تمرين على السبورة", "Placed board challenge");
      showTeacherPointer(isArabic ? `تمرين ${currentAgent.nameAr} وصل للسبورة!` : `Challenge placed on board!`);
    }
  };

  const handleClearBoard = () => {
    if (whiteboardRef.current) {
      whiteboardRef.current.clear();
      triggerCelebration(isArabic ? "تم مسح السبورة! 🧽" : "Board wiped clean! 🧽");
    }
  };

  const handlePinFeedbackToCanvas = (content: string) => {
    if (whiteboardRef.current) {
      whiteboardRef.current.addNote(`💡 Note from ${currentAgent.nameEn}:\n${content.slice(0, 180)}`, "green");
      unlockBadge("board_artist");
      awardXp(15, "تثبيت ملاحظة على السبورة", "Pinned note to board");
    }
  };

  // Track 3: Insert Educational Template
  const handleInsertTemplate = (template: EducationalTemplate) => {
    if (whiteboardRef.current) {
      whiteboardRef.current.insertTemplate(template.canvasTitle, template.sections);
      setShowTemplatesModal(false);
      unlockBadge("board_artist");
      awardXp(30, "إدراج قالب تعليمي منظم", "Inserted educational template");
      triggerCelebration(isArabic ? `تم إدراج قالب ${template.nameAr}! 📋` : `Template ${template.nameEn} inserted! 📋`);
      showTeacherPointer(isArabic ? "القالب التعليمي جاهز على اللوحة!" : "Educational template is ready on canvas!");
    }
  };

  // Track 3 & 4: Download high-res whiteboard snapshot
  const handleDownloadBoard = async () => {
    if (whiteboardRef.current) {
      const ok = await whiteboardRef.current.downloadSnapshot(`whiteboard_${selectedAgent}_${Date.now()}.png`);
      if (ok) {
        awardXp(20, "تصدير السبورة كملف صورة", "Exported canvas PNG");
        triggerCelebration(isArabic ? "تم تحميل السبورة كملف صورة عالي الدقة! 📸" : "Whiteboard PNG exported successfully! 📸");
      }
    }
  };

  // Track 4: End session & generate lesson evaluation report
  const handleEndSessionAndReport = async () => {
    let canvasSnapshot: string | null = null;
    if (whiteboardRef.current) {
      try {
        canvasSnapshot = await whiteboardRef.current.getCanvasSnapshot();
      } catch (e) {
        console.warn("Could not capture snapshot for report", e);
      }
    }

    const report = generateLessonReport({
      agentId: selectedAgent,
      agentName: currentAgent.nameEn,
      agentRole: currentAgent.roleEn,
      agentAvatar: currentAgent.avatar,
      messages,
      canvasSnapshot,
      xpSession: messages.length * 15 + 30
    });

    const updatedList = saveSessionToArchive(report);
    setSavedSessionsList(updatedList);
    setCurrentReport(report);
    setShowReportModal(true);
    awardXp(40, "إنهاء الجلسة واستخراج تقرير التقييم!", "Completed lesson report!");
  };

  // Track 5: Simulation Studio handlers
  const handleStartSimulation = (pack: SimulationPack) => {
    setActiveSimulation(pack);
    setCurrentStageIndex(0);
    setSecondsRemaining(pack.stages[0].suggestedDurationSeconds);
    setIsTimerRunning(true);
    setShowSimulationStudioModal(false);

    // Switch to required specialist tutor
    setSelectedAgent(pack.agentId);

    // Write stage template onto whiteboard
    if (whiteboardRef.current) {
      whiteboardRef.current.addNote(pack.stages[0].boardTemplateNote, "violet", 80, 80);
    }

    // Add teacher's question to chat
    const agent = AGENTS.find((a) => a.id === pack.agentId) || AGENTS[0];
    const initialPrompt = pack.stages[0].promptEn;
    setMessages([
      {
        id: Math.random().toString(36).substring(2, 9),
        sender: "agent",
        text: initialPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        agentName: agent.nameEn
      }
    ]);

    if (voiceAutoSpeak) {
      handleSpeak(initialPrompt);
    }

    awardXp(30, "بدء جلسة محاكاة واقعية جديدة!", "Started realistic simulation session!");
    triggerCelebration(isArabic ? `بدأت محاكاة ${pack.titleAr}! 🎬` : `Started ${pack.titleEn}! 🎬`);
  };

  const handleNextSimulationStage = () => {
    if (!activeSimulation) return;
    const nextIdx = currentStageIndex + 1;
    if (nextIdx < activeSimulation.stages.length) {
      setCurrentStageIndex(nextIdx);
      const stage = activeSimulation.stages[nextIdx];
      setSecondsRemaining(stage.suggestedDurationSeconds);
      setIsTimerRunning(true);

      // Write next stage note on board
      if (whiteboardRef.current) {
        whiteboardRef.current.addNote(stage.boardTemplateNote, "blue", 100, 140 + nextIdx * 45);
      }

      // Add teacher prompt to chat
      const agent = AGENTS.find((a) => a.id === activeSimulation.agentId) || AGENTS[0];
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          sender: "agent",
          text: stage.promptEn,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          agentName: agent.nameEn
        }
      ]);

      if (voiceAutoSpeak) handleSpeak(stage.promptEn);
      awardXp(30, "الانتقال إلى المرحلة التالية!", "Advanced to next stage!");
    } else {
      // Completed all stages! Generate official Scorecard
      setIsTimerRunning(false);
      const grade = activeSimulation.id === "ielts_speaking" ? "Band 8.0" : "94% Excellent";
      setScorecardResults({
        pack: activeSimulation,
        finalGrade: grade,
        criteriaScores: activeSimulation.criteriaList.map((c) => ({
          nameAr: c.nameAr,
          nameEn: c.nameEn,
          weight: c.weight,
          score: activeSimulation.id === "ielts_speaking" ? (Math.random() > 0.5 ? "8.5" : "8.0") : "95%"
        }))
      });
      setShowScorecardModal(true);
      awardXp(100, "إكمال المحاكاة بنجاح باهر! 🏆", "Completed full simulation with distinction! 🏆");
      triggerCelebration();
    }
  };

  const handleExitSimulation = () => {
    setActiveSimulation(null);
    setIsTimerRunning(false);
    triggerCelebration(isArabic ? "تم إنهاء وضع المحاكاة والعودة للوضع الحر." : "Exited simulation mode.");
  };

  // Speed Quiz handler (Track 2)
  const openSpeedQuiz = () => {
    const tutorQuizzes = TUTOR_QUIZZES[selectedAgent] || TUTOR_QUIZZES.foundation;
    const randomQuiz = tutorQuizzes[Math.floor(Math.random() * tutorQuizzes.length)];
    setActiveQuiz(randomQuiz);
    setQuizSelectedOption(null);
    setQuizAnswered(false);
    setShowQuizModal(true);
  };

  const handleSelectQuizOption = (index: number) => {
    if (quizAnswered || !activeQuiz) return;
    setQuizSelectedOption(index);
    setQuizAnswered(true);

    const isCorrect = activeQuiz.options[index].isCorrect;
    if (isCorrect) {
      awardXp(50, "إجابة صحيحة في التحدي السريع!", "Correct speed quiz answer!");
      unlockBadge("speed_solver");
    } else {
      awardXp(10, "محاولة تدريبية شجاعة", "Good learning attempt");
    }
  };

  const handlePinQuizToBoard = () => {
    if (whiteboardRef.current && activeQuiz) {
      const note = activeQuiz.whiteboardNoteText || `💡 ${activeQuiz.topicEn}:\n${activeQuiz.questionEn}`;
      whiteboardRef.current.addNote(note, "blue");
      setShowQuizModal(false);
      triggerCelebration(isArabic ? "تم نقل القاعدة إلى السبورة السحرية! 📌" : "Grammar pinned to board! 📌");
    }
  };

  const formatTimerDigits = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="playful-app-wrapper" dir={isArabic ? "rtl" : "ltr"}>
      {/* Toast Notification */}
      {celebrationToast && (
        <div className="celebration-toast">
          <span>✨</span>
          <span>{celebrationToast}</span>
        </div>
      )}

      {/* Floating Particles Celebration */}
      {particles.length > 0 && (
        <div className="celebration-overlay">
          {particles.map((p) => (
            <div
              key={p.id}
              className="celebration-particle"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {p.emoji}
            </div>
          ))}
        </div>
      )}

      {/* Track 5: Active Simulation Live HUD Bar */}
      {activeSimulation && (
        <div className="simulation-hud-bar">
          <div className="sim-hud-left">
            <span className="sim-hud-icon">{activeSimulation.icon}</span>
            <div className="sim-hud-title-box">
              <span className="sim-hud-title">
                {isArabic ? activeSimulation.titleAr : activeSimulation.titleEn}
              </span>
              <span className="sim-hud-stage-name">
                {isArabic
                  ? `المرحلة ${currentStageIndex + 1} من ${activeSimulation.stages.length}: ${activeSimulation.stages[currentStageIndex].stageTitleAr}`
                  : `Stage ${currentStageIndex + 1} of ${activeSimulation.stages.length}: ${activeSimulation.stages[currentStageIndex].stageTitleEn}`}
              </span>
            </div>
          </div>

          <div className="sim-hud-center">
            <div className="sim-timer-capsule">
              <span className="timer-icon">⏱️</span>
              <span className={`timer-digits ${secondsRemaining < 20 ? "urgent" : ""}`}>
                {formatTimerDigits(secondsRemaining)}
              </span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", fontSize: "14px" }}
                title="Play/Pause Timer"
              >
                {isTimerRunning ? "⏸️" : "▶️"}
              </button>
            </div>
          </div>

          <div className="sim-hud-right">
            <button
              onClick={handleNextSimulationStage}
              className="sim-stage-next-btn"
            >
              {currentStageIndex + 1 < activeSimulation.stages.length
                ? isArabic ? "المرحلة التالية ➡️" : "Next Stage ➡️"
                : isArabic ? "إنهاء وتقييم 🏅" : "Finish & Score 🏅"}
            </button>
            <button
              onClick={handleExitSimulation}
              className="sim-exit-btn"
            >
              {isArabic ? "خروج" : "Exit"}
            </button>
          </div>
        </div>
      )}

      {/* Track 5: Simulation Studio Modal */}
      {showSimulationStudioModal && (
        <div className="playful-modal-backdrop" onClick={() => setShowSimulationStudioModal(false)}>
          <div className="playful-modal-card" style={{ maxWidth: "640px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-comic-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "24px" }}>🎭</span>
                <span className="modal-header-title">
                  {isArabic ? "استوديو المحاكاة والمقابلات التفاعلية" : "Interactive Simulation Studio"}
                </span>
              </div>
              <button onClick={() => setShowSimulationStudioModal(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-comic-body">
              <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0 }}>
                {isArabic
                  ? "اختر بيئة المحاكاة لتجربة اختبار حقيقي أو مقابلة عمل رسمية بمؤقت وتقييم تفصيلي:"
                  : "Select a simulation pack to practice real-world job interviews, official IELTS tests, or daily situations:"}
              </p>

              <div className="sim-packs-grid">
                {SIMULATION_PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    onClick={() => handleStartSimulation(pack)}
                    className="sim-pack-choice-card"
                  >
                    <div className="sim-pack-card-left">
                      <div className="sim-pack-icon-bubble">{pack.icon}</div>
                      <div className="sim-pack-text-box">
                        <span className="sim-pack-title">
                          {isArabic ? pack.titleAr : pack.titleEn}
                        </span>
                        <p className="sim-pack-subtitle">
                          {isArabic ? pack.subtitleAr : pack.subtitleEn}
                        </p>
                        <div className="sim-pack-criteria-strip">
                          {pack.criteriaList.map((c, i) => (
                            <span key={i} className="sim-criteria-chip">
                              {isArabic ? c.nameAr : c.nameEn}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button className="sim-start-cta-btn">
                      {isArabic ? "ابدأ المحاكاة 🚀" : "Start 🚀"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Track 5: Official Simulation Scorecard Modal */}
      {showScorecardModal && scorecardResults && (
        <div className="playful-modal-backdrop" onClick={() => setShowScorecardModal(false)}>
          <div className="playful-modal-card" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-comic-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "24px" }}>🏆</span>
                <span className="modal-header-title">
                  {isArabic ? "بطاقة تقييم المحاكاة الرسمية" : "Official Simulation Scorecard"}
                </span>
              </div>
              <button onClick={() => setShowScorecardModal(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-comic-body">
              <div className="sim-scorecard-box">
                <div className="scorecard-banner-row">
                  <div>
                    <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "#1e293b", display: "block" }}>
                      {isArabic ? scorecardResults.pack.titleAr : scorecardResults.pack.titleEn}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {isArabic ? "التقييم الشامل وفق معايير الجلسة" : "Comprehensive criteria evaluation"}
                    </span>
                  </div>
                  <div className="scorecard-final-grade">
                    {scorecardResults.finalGrade}
                  </div>
                </div>

                <div className="scorecard-rubric-table">
                  {scorecardResults.criteriaScores.map((c: any, i: number) => (
                    <div key={i} className="rubric-row-item">
                      <span className="rubric-name">{isArabic ? c.nameAr : c.nameEn} ({c.weight})</span>
                      <span className="rubric-score-badge">{c.score}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#ecfdf5", border: "1.5px solid #86efac", borderRadius: "12px", padding: "10px 14px", fontSize: "0.82rem", color: "#166534", fontWeight: 700 }}>
                  🎉 {isArabic ? "أداء استثنائي! تمت إضافة +100 XP إلى رصيدك التعليمي!" : "Outstanding performance! +100 XP added to your progress!"}
                </div>
              </div>
            </div>

            <div className="quiz-modal-footer">
              <button
                onClick={() => {
                  setShowScorecardModal(false);
                  handleDownloadBoard();
                }}
                className="quiz-btn-pin-board"
              >
                <span>📸</span>
                <span>{isArabic ? "حفظ السبورة والدرجات" : "Save Board & Grade"}</span>
              </button>
              <button
                onClick={() => setShowScorecardModal(false)}
                className="quiz-btn-next"
              >
                <span>{isArabic ? "متابعة التعلم ✨" : "Continue ✨"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Badges Modal (Track 2) */}
      {showBadgesModal && (
        <div className="playful-modal-backdrop" onClick={() => setShowBadgesModal(false)}>
          <div className="playful-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-comic-header">
              <h2 className="modal-header-title">
                <span>🏆</span>
                <span>{isArabic ? "أوسمة وشارات الإنجاز" : "Badges & Achievements"}</span>
              </h2>
              <button
                onClick={() => setShowBadgesModal(false)}
                className="modal-close-btn"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-comic-body">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: "14px", border: "1.5px solid #e2e8f0" }}>
                <div>
                  <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#1e293b", display: "block" }}>
                    {isArabic ? levelData.titleAr : levelData.titleEn}
                  </span>
                  <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
                    {isArabic ? `المستوى ${levelData.level} • مجموع النقاط: ${xp} XP` : `Level ${levelData.level} • Total: ${xp} XP`}
                  </span>
                </div>
                <span className="streak-pill">
                  <span>🔥</span>
                  <span>{isArabic ? `${streak} أيام تدريب` : `${streak}-day Streak`}</span>
                </span>
              </div>

              <div className="achievements-grid">
                {ACHIEVEMENTS.map((badge) => {
                  const isUnlocked = unlockedBadges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`achievement-card ${isUnlocked ? "unlocked" : "locked"}`}
                    >
                      <div className="badge-top-row">
                        <div className="badge-icon-box">{isUnlocked ? badge.icon : "🔒"}</div>
                        <span className={`badge-status-pill ${isUnlocked ? "unlocked" : "locked"}`}>
                          {isUnlocked
                            ? isArabic ? "مكتمل ⭐" : "Unlocked ⭐"
                            : isArabic ? "مغلق" : "Locked"}
                        </span>
                      </div>
                      <span className="badge-title-text">
                        {isArabic ? badge.titleAr : badge.titleEn}
                      </span>
                      <p className="badge-desc-text">
                        {isArabic ? badge.descAr : badge.descEn}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Speed Quiz Modal (Track 2) */}
      {showQuizModal && activeQuiz && (
        <div className="playful-modal-backdrop" onClick={() => setShowQuizModal(false)}>
          <div className="playful-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-comic-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "24px" }}>⚡</span>
                <span className="modal-header-title">
                  {isArabic ? "مختبر التحديات السريعة" : "Speed Quiz Lab"}
                </span>
              </div>
              <button
                onClick={() => setShowQuizModal(false)}
                className="modal-close-btn"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-comic-body">
              <span className="quiz-topic-badge">
                {isArabic ? activeQuiz.topicAr : activeQuiz.topicEn}
              </span>

              <h3 className="quiz-question-prompt">
                {isArabic ? activeQuiz.questionAr : activeQuiz.questionEn}
              </h3>

              <div className="quiz-options-list">
                {activeQuiz.options.map((option, idx) => {
                  let statusClass = "";
                  if (quizAnswered) {
                    if (option.isCorrect) statusClass = "correct";
                    else if (quizSelectedOption === idx) statusClass = "wrong";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(idx)}
                      disabled={quizAnswered}
                      className={`quiz-option-button ${statusClass}`}
                    >
                      <span>{option.text}</span>
                      {quizAnswered && option.isCorrect && <span>✅</span>}
                      {quizAnswered && quizSelectedOption === idx && !option.isCorrect && <span>❌</span>}
                    </button>
                  );
                })}
              </div>

              {quizAnswered && quizSelectedOption !== null && (
                <div
                  className={`quiz-feedback-box ${activeQuiz.options[quizSelectedOption].isCorrect ? "correct" : "wrong"}`}
                >
                  <div style={{ fontWeight: 800, marginBottom: "4px" }}>
                    {activeQuiz.options[quizSelectedOption].isCorrect
                      ? isArabic ? "🎉 إجابة ممتازة! (+50 XP)" : "🎉 Brilliant Answer! (+50 XP)"
                      : isArabic ? "💡 توضيح المعلم:" : "💡 Tutor Explanation:"}
                  </div>
                  <div>
                    {isArabic
                      ? activeQuiz.options[quizSelectedOption].explanationAr
                      : activeQuiz.options[quizSelectedOption].explanationEn}
                  </div>
                </div>
              )}
            </div>

            <div className="quiz-modal-footer">
              <button
                onClick={handlePinQuizToBoard}
                className="quiz-btn-pin-board"
                title="Pin this rule to the Magic Board"
              >
                <span>📌</span>
                <span>{isArabic ? "تثبيت القاعدة على السبورة" : "Pin Rule to Board"}</span>
              </button>

              <button
                onClick={openSpeedQuiz}
                className="quiz-btn-next"
              >
                <span>{isArabic ? "سؤال آخر ➡️" : "Next Quiz ➡️"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Educational Templates Modal (Track 3) */}
      {showTemplatesModal && (
        <div className="playful-modal-backdrop" onClick={() => setShowTemplatesModal(false)}>
          <div className="playful-modal-card" style={{ maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-comic-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "24px" }}>📋</span>
                <span className="modal-header-title">
                  {isArabic ? "قوالب السبورة التعليمية الجاهزة" : "Magic Board Educational Templates"}
                </span>
              </div>
              <button onClick={() => setShowTemplatesModal(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-comic-body">
              <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0 }}>
                {isArabic
                  ? "اختر قالباً تعليمياً لإدراجه فورياً على السبورة السحرية، مصمم لمساعدتك على تنظيم الأفكار والقواعد:"
                  : "Select an educational blueprint to insert onto the Magic Board, formatted for structured practice:"}
              </p>

              <div className="templates-selection-grid">
                {EDUCATIONAL_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleInsertTemplate(tmpl)}
                    className="template-card-item"
                  >
                    <div className="template-card-header">
                      <span className="template-card-icon">{tmpl.icon}</span>
                      <span className="template-card-name">
                        {isArabic ? tmpl.nameAr : tmpl.nameEn}
                      </span>
                    </div>
                    <p className="template-card-desc">
                      {isArabic ? tmpl.descAr : tmpl.descEn}
                    </p>
                    <span className="template-card-preview-tag">
                      {isArabic ? "إدراج بلمسة واحدة 🪄" : "1-Click Insert 🪄"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Report Card Modal (Track 4) */}
      {showReportModal && currentReport && (
        <div className="playful-modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="playful-modal-card" style={{ maxWidth: "580px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-comic-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "24px" }}>📊</span>
                <span className="modal-header-title">
                  {isArabic ? "بطاقة تقرير نهاية الدرس" : "Lesson Evaluation Report"}
                </span>
              </div>
              <button onClick={() => setShowReportModal(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-comic-body">
              <div className="report-card-container">
                <div className="report-header-banner">
                  <div className="report-tutor-lockup">
                    <div className="report-tutor-avatar">{currentReport.agentAvatar}</div>
                    <div>
                      <span className="report-title-text">
                        {isArabic ? `جلسة مع ${currentReport.agentName}` : `Session with ${currentReport.agentName}`}
                      </span>
                      <span className="report-date-text">{currentReport.dateFormatted}</span>
                    </div>
                  </div>
                  <div className="report-score-stars">
                    {"⭐".repeat(currentReport.stars)}
                  </div>
                </div>

                <div className="report-stats-strip">
                  <div className="report-stat-box">
                    <span className="stat-box-val">{currentReport.messagesCount}</span>
                    <span className="stat-box-label">{isArabic ? "تبادل رسائل" : "Messages"}</span>
                  </div>
                  <div className="report-stat-box">
                    <span className="stat-box-val">+{currentReport.xpEarned}</span>
                    <span className="stat-box-label">{isArabic ? "نقاط XP" : "XP Earned"}</span>
                  </div>
                  <div className="report-stat-box">
                    <span className="stat-box-val">{currentReport.vocabLearned.length}</span>
                    <span className="stat-box-label">{isArabic ? "مفردات مكتسبة" : "Key Vocab"}</span>
                  </div>
                </div>

                {/* Key Vocab */}
                <div className="report-section-card">
                  <span className="report-section-heading">
                    <span>💡</span>
                    <span>{isArabic ? "أبرز المفردات والتراكيب المكتسبة:" : "Key Vocabulary Acquired:"}</span>
                  </span>
                  <div className="report-vocab-chips">
                    {currentReport.vocabLearned.map((v, i) => (
                      <span key={i} className="report-vocab-chip">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tutor Advice */}
                <div className="report-advice-box">
                  <div style={{ fontWeight: 800, marginBottom: "4px" }}>
                    {isArabic ? `💬 توصية ${currentReport.agentName} للجلسة القادمة:` : `💬 ${currentReport.agentName}'s Recommendation:`}
                  </div>
                  <div>{currentReport.tutorAdvice}</div>
                </div>
              </div>
            </div>

            <div className="quiz-modal-footer">
              <button
                onClick={handleDownloadBoard}
                className="quiz-btn-pin-board"
                title="Download canvas screenshot"
              >
                <span>📸</span>
                <span>{isArabic ? "تحميل صورة السبورة" : "Download Board PNG"}</span>
              </button>

              <button
                onClick={() => {
                  window.print();
                }}
                className="quiz-btn-next"
              >
                <span>🖨️</span>
                <span>{isArabic ? "طباعة التقرير" : "Print Report"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions History Archive Modal (Track 4) */}
      {showArchiveModal && (
        <div className="playful-modal-backdrop" onClick={() => setShowArchiveModal(false)}>
          <div className="playful-modal-card" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-comic-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "24px" }}>🗂️</span>
                <span className="modal-header-title">
                  {isArabic ? "أرشيف الجلسات والدروس السابقة" : "Saved Sessions Archive"}
                </span>
              </div>
              <button onClick={() => setShowArchiveModal(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-comic-body">
              {savedSessionsList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 10px", color: "#64748b" }}>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>📚</div>
                  <h4 style={{ margin: 0, fontWeight: 800, color: "#1e293b" }}>
                    {isArabic ? "لا توجد جلسات محفوظة بعد" : "No saved sessions yet"}
                  </h4>
                  <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>
                    {isArabic
                      ? "اضغط على 'إنهاء الجلسة واستخراج التقرير' لحفظ ملخصات دروسك تلقائياً هنا."
                      : "Click 'End Session & Report' during a lesson to save summaries here."}
                  </p>
                </div>
              ) : (
                <div className="session-archive-list">
                  {savedSessionsList.map((session) => (
                    <div key={session.id} className="session-archive-card">
                      <div className="archive-card-left">
                        <div className="archive-avatar-icon">{session.agentAvatar}</div>
                        <div>
                          <span className="archive-title">
                            {session.agentName} ({session.agentRole})
                          </span>
                          <div className="archive-meta">
                            <span>{session.dateFormatted}</span> • <span>{session.messagesCount} رسائل</span> • <span>{"⭐".repeat(session.stars)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="archive-card-actions">
                        <button
                          onClick={() => {
                            setCurrentReport(session);
                            setShowArchiveModal(false);
                            setShowReportModal(true);
                          }}
                          className="archive-action-btn"
                        >
                          {isArabic ? "عرض التقرير 📄" : "View Report 📄"}
                        </button>
                        <button
                          onClick={() => {
                            const updated = deleteSavedSession(session.id);
                            setSavedSessionsList(updated);
                          }}
                          className="archive-delete-btn"
                          title="Delete Session"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="playful-navbar">
        <div className="brand-badge-group">
          <div className="brand-icon-bubble">🎓</div>
          <div className="brand-text-container">
            <h1 className="brand-main-title">
              {isArabic ? "أكاديمية المعلمين الأذكياء" : "The Dream Tutors"}
              <span style={{ fontSize: "1rem" }}>✨</span>
            </h1>
            <span className="brand-subtitle-text">
              {isArabic
                ? "منصة تفاعلية مدعومة بالذكاء الاصطناعي الصوتي ومحاكي المقابلات"
                : "Multimodal Voice, Whiteboard & Simulation Studio"}
            </span>
          </div>
        </div>

        {/* Gamification Strip & Simulation Studio CTA */}
        <div className="navbar-gamification-strip">
          <div className="level-xp-capsule" title={`${levelData.currentLevelXp} / ${levelData.nextLevelXp} XP to next level`}>
            <span className="level-badge-tag">
              Lv. {levelData.level}
            </span>
            <div className="xp-progress-track">
              <div
                className="xp-progress-fill"
                style={{ width: `${levelData.progressPercent}%` }}
              />
            </div>
            <span className="xp-text-label">{xp} XP</span>
          </div>

          <div className="streak-pill" title="Daily Practice Streak">
            <span>🔥</span>
            <span>{streak}</span>
          </div>

          <button
            onClick={() => setShowBadgesModal(true)}
            className="badges-nav-btn"
            title="View Achievements"
          >
            <span>🏆</span>
            <span>{isArabic ? "الأوسمة" : "Badges"}</span>
          </button>

          {/* Track 5: Simulation Studio Nav Button */}
          <button
            onClick={() => setShowSimulationStudioModal(true)}
            className="badges-nav-btn"
            style={{ background: "linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 100%)", borderColor: "#6366f1", color: "#312e81" }}
            title="Launch Simulation Studio (Job Interview / IELTS / Scenarios)"
          >
            <span>🎭</span>
            <span>{isArabic ? "المحاكاة" : "Simulate"}</span>
          </button>

          {/* Sessions Archive Nav Button */}
          <button
            onClick={() => {
              setSavedSessionsList(getSavedSessions());
              setShowArchiveModal(true);
            }}
            className="lang-toggle-btn"
            style={{ padding: "5px 12px" }}
            title="Session Archive"
          >
            <span>🗂️</span>
            <span>{isArabic ? "الأرشيف" : "History"}</span>
          </button>

          {/* Dream Tutors Team & Whiteboard Switch */}
          {appStep === "classroom" ? (
            <button
              onClick={() => setAppStep("tutors_selection")}
              className="tutors-switch-nav-btn"
              title={isArabic ? "استعراض فريق المعلمين وتغيير المعلم" : "Dream Tutors Showcase"}
            >
              <span>👥</span>
              <span>{isArabic ? "فريق المعلمين" : "Dream Tutors"}</span>
            </button>
          ) : (
            <button
              onClick={() => handleStartClassroomSession()}
              className="tutors-switch-nav-btn active-classroom-nav"
              title={isArabic ? "الدخول إلى قاعة السبورة الذكية" : "Go to Whiteboard"}
            >
              <span>📋</span>
              <span>{isArabic ? "السبورة الذكية" : "Whiteboard"}</span>
            </button>
          )}

          {/* Student Profile Nav Pill */}
          {studentProfile.name && (
            <div
              className="student-nav-pill"
              onClick={() => setAppStep("tutors_selection")}
              title={isArabic ? "اضغط لتعديل الملف أو تغيير المعلم" : "Click to edit student info or switch tutor"}
            >
              <span>🎓</span>
              <span className="student-nav-name">{studentProfile.name}</span>
            </div>
          )}
        </div>

        <div className="nav-actions-group">
          <div className={`status-chip ${isConnected ? "connected" : "disconnected"}`}>
            <span>{isConnected ? "🟢" : "🔴"}</span>
            <span>
              {isConnected
                ? isArabic ? "المعلم جاهز (صوت بالدور)" : "Tutor ready (turn-based voice)"
                : isArabic ? "المعلم غير متاح" : "Tutor offline"}
            </span>
          </div>

          <button
            onClick={() => setLang(isArabic ? "en" : "ar")}
            className="lang-toggle-btn"
            title="Switch Language"
          >
            <span>{isArabic ? "🇬🇧 English" : "🇸🇦 العربية"}</span>
          </button>
        </div>
      </header>

      {/* Separation of Dream Tutors Onboarding vs Interactive Classroom */}
      {appStep === "tutors_selection" ? (
        <TutorShowcase
          isArabic={isArabic}
          studentProfile={studentProfile}
          setStudentProfile={setStudentProfile}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          playingVoiceAgentId={playingVoiceAgentId}
          previewAgentVoice={previewAgentVoice}
          onConfirmAndStart={handleStartClassroomSession}
          assignedVoices={assignedVoices}
        />
      ) : (
        <div className="playful-workspace">
          {/* Left/Right Sidebar: Tutors & Speech Chat */}
          {!isChatSidebarCollapsed && (
            <aside className="tutors-chat-sidebar">
              {/* Classroom Header Bar */}
              <div className="classroom-sidebar-top-bar">
                <div className="classroom-sidebar-student-tag">
                  <span>🎓</span>
                  <span className="student-tag-name">{studentProfile.name || (isArabic ? "الطالب" : "Student")}</span>
                  <span className="student-tag-level">
                    {studentProfile.level === "beginner" ? (isArabic ? "مبتدئ" : "Beginner") : studentProfile.level === "advanced" ? (isArabic ? "متقدم" : "Advanced") : (isArabic ? "متوسط" : "Intermediate")}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => setAppStep("tutors_selection")}
                    className="classroom-switch-coach-btn"
                    title={isArabic ? "اختيار معلّم آخر من فريق المعلمين" : "Switch tutor"}
                  >
                    <span>👥</span>
                    <span>{isArabic ? "تغيير المعلم" : "Switch"}</span>
                  </button>
                  <button
                    onClick={() => setIsChatSidebarCollapsed(true)}
                    className="classroom-collapse-btn"
                    title={isArabic ? "إخفاء المحادثة لتوسيع مساحة السبورة" : "Hide chat to maximize whiteboard"}
                  >
                    ◀
                  </button>
                </div>
              </div>

          {/* Active Coach Banner */}
          <div className="active-tutor-banner">
            <div className="active-tutor-info">
              <div className={`active-tutor-avatar ${playingVoiceAgentId === currentAgent.id ? "speaking-avatar-pulse" : ""}`}>
                {currentAgent.avatar}
              </div>
              <div className="active-tutor-text">
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  <span className="active-tutor-name">
                    {isArabic ? currentAgent.nameAr : currentAgent.nameEn}
                  </span>
                  <span className={`gender-badge ${currentAgent.gender}`}>
                    {currentAgent.gender === "male" ? (isArabic ? "👨 شخصية رجل" : "👨 Male") : (isArabic ? "👩 شخصية نسائية" : "👩 Female")}
                  </span>
                </div>
                <span className="active-tutor-voice-badge">
                  {isArabic ? currentAgent.personaAr : currentAgent.personaEn}
                </span>
                <span className="voice-system-indicator">
                  🎙️ {isArabic ? "صوت الذكاء الاصطناعي:" : "Voice:"} <strong>{currentAgent.geminiVoice}</strong>
                  {assignedVoices[currentAgent.id] ? ` • ${assignedVoices[currentAgent.id]?.name}` : ""}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                onClick={() => previewAgentVoice(selectedAgent)}
                className={`bubble-tool-btn ${playingVoiceAgentId === selectedAgent ? "active" : ""}`}
                title={isArabic ? `استمع لنبرة صوت ${currentAgent.nameAr}` : `Preview ${currentAgent.nameEn}'s unique voice`}
                style={{ background: "#ede9fe", borderColor: "#a78bfa", color: "#5b21b6", fontWeight: 800 }}
              >
                <span>🔊</span>
                <span style={{ fontSize: "0.68rem" }}>{isArabic ? "تجربة الصوت" : "Test Voice"}</span>
              </button>

              <button
                onClick={() => setVoiceAutoSpeak(!voiceAutoSpeak)}
                className={`bubble-tool-btn ${voiceAutoSpeak ? "active" : ""}`}
                title={isArabic ? "تفعيل/تعطيل الرد الصوتي التلقائي" : "Toggle Auto-Voice Output"}
                style={{ background: voiceAutoSpeak ? "#ede9fe" : "#ffffff", borderColor: voiceAutoSpeak ? "#8b5cf6" : "#cbd5e1" }}
              >
                <span>{voiceAutoSpeak ? "🔊" : "🔇"}</span>
                <span style={{ fontSize: "0.68rem" }}>{voiceAutoSpeak ? (isArabic ? "صوت: مفعّل" : "Voice: ON") : (isArabic ? "صوت: صامت" : "Voice: Muted")}</span>
              </button>

              <button
                onClick={handleEndSessionAndReport}
                className="bubble-tool-btn"
                style={{ background: "#ecfdf5", borderColor: "#86efac", color: "#166534" }}
                title="End session and generate evaluation report"
              >
                <span>📊</span>
                <span style={{ fontSize: "0.68rem" }}>{isArabic ? "إنهاء وتقرير" : "Report"}</span>
              </button>
            </div>
          </div>

          {/* Track 5: Active Simulation Cue Card Banner */}
          {activeSimulation && activeSimulation.stages[currentStageIndex]?.cueCardPoints && (
            <div className="sim-cue-card-banner">
              <div className="cue-card-title">
                <span>📋</span>
                <span>{isArabic ? "نقاط الإجابة الموصى بها (Cue Card):" : "Recommended Points to Cover:"}</span>
              </div>
              <ul className="cue-card-points-list">
                {activeSimulation.stages[currentStageIndex].cueCardPoints!.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Live Voice Active Bar */}
          {(isListening || isTutorSpeaking) && (
            <div className="voice-live-banner">
              <div className="voice-live-status">
                <div className="voice-wave-visualizer">
                  <span className="wave-bar" />
                  <span className="wave-bar" />
                  <span className="wave-bar" />
                  <span className="wave-bar" />
                  <span className="wave-bar" />
                </div>
                <span>
                  {isListening
                    ? isArabic ? "الميكروفون يستمع لنطقك الآن..." : "Microphone is listening to you..."
                    : isArabic ? `${currentAgent.nameAr} يتحدث الآن بصوت طبيعي...` : `${currentAgent.nameEn} is speaking aloud...`}
                </span>
              </div>

              <button
                onClick={() => {
                  if (isListening && recognitionRef.current) recognitionRef.current.stop();
                  if (isTutorSpeaking) window.speechSynthesis.cancel();
                  setIsListening(false);
                  setIsTutorSpeaking(false);
                }}
                className="voice-stop-btn"
              >
                ⏹️ {isArabic ? "إيقاف" : "Stop"}
              </button>
            </div>
          )}

          {/* Speech Bubble Chat Stream */}
          <div className="chat-conversation-stream">
            {messages.length === 0 && (
              <div className="chat-empty-state">
                <div className="empty-avatar-icon">{currentAgent.avatar}</div>
                <h3 className="empty-state-title">
                  {isArabic
                    ? `مرحباً بك مع ${currentAgent.nameAr}!`
                    : `Welcome to ${currentAgent.nameEn}'s Studio!`}
                </h3>
                <p className="empty-state-desc">
                  {isArabic ? currentAgent.quoteAr : currentAgent.quoteEn}
                </p>
                <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                  <button
                    onClick={() => setShowSimulationStudioModal(true)}
                    className="bubble-tool-btn"
                    style={{ background: "#ede9fe", borderColor: "#a5b4fc", color: "#3730a3" }}
                  >
                    <span>🎭</span>
                    <span>{isArabic ? "محاكي المقابلات والآيلتس" : "Simulation Studio"}</span>
                  </button>
                  <button
                    onClick={openSpeedQuiz}
                    className="bubble-tool-btn"
                    style={{ background: "#fef08a", borderColor: "#eab308", color: "#854d0e" }}
                  >
                    <span>⚡</span>
                    <span>{isArabic ? "تحدي كرتوني سريع" : "Speed Challenge"}</span>
                  </button>
                  <button
                    onClick={() => setShowTemplatesModal(true)}
                    className="bubble-tool-btn"
                    style={{ background: "#e0e7ff", borderColor: "#818cf8", color: "#3730a3" }}
                  >
                    <span>📋</span>
                    <span>{isArabic ? "قوالب تعليمية" : "Templates"}</span>
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div key={msg.id} className={`speech-bubble-container ${isUser ? "user" : "agent"}`}>
                  <div className="speech-sender-header">
                    <span className="sender-name-tag">
                      {isUser
                        ? isArabic ? "🧑 الطالب" : "🧑 Student"
                        : `🤖 ${msg.agentName || (isArabic ? currentAgent.nameAr : currentAgent.nameEn)}`}
                    </span>
                    <span className="message-timestamp">{msg.timestamp}</span>
                  </div>

                  <div className="speech-bubble-body">
                    {msg.imageBase64 && (
                      <div className="snapshot-preview-box">
                        <img
                          src={msg.imageBase64}
                          alt="Whiteboard snapshot"
                          className="snapshot-preview-img"
                        />
                      </div>
                    )}
                    <div>{msg.text}</div>

                    {!isUser && (
                      <div className="bubble-tools-row">
                        <button
                          onClick={() => handleSpeak(msg.text)}
                          className="bubble-tool-btn"
                          title="Listen with custom tutor voice"
                        >
                          <span>🔊</span>
                          <span>{isArabic ? "استماع" : "Listen"}</span>
                        </button>
                        <button
                          onClick={() => handlePinFeedbackToCanvas(msg.text)}
                          className="bubble-tool-btn"
                          title="Pin this advice to the Magic Board"
                        >
                          <span>📌</span>
                          <span>{isArabic ? "تثبيت على السبورة" : "Pin to Board"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="tutor-thinking-doodle">
                <span className="thinking-pencil-icon">✏️</span>
                <span className="thinking-text">
                  {isArabic
                    ? `${currentAgent.nameAr} يفكر ويكتب على السبورة...`
                    : `${currentAgent.nameEn} is thinking & writing on board...`}
                </span>
                <div className="bouncing-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Area */}
          <div className="playful-chat-input-panel">
            <div className="quick-action-chips">
              <button
                onClick={() => handleSend(isArabic ? "يرجى فحص ومراجعة ملاحظاتي على السبورة وتصحيح الأخطاء." : "Please inspect my notes on the whiteboard and review for mistakes.")}
                disabled={isTyping}
                className="quick-chip-btn chip-inspect"
                title="Inspect Whiteboard with AI Vision"
              >
                <span>🔍</span>
                <span>{isArabic ? "فحص السبورة" : "Inspect Board"}</span>
              </button>

              <button
                onClick={() => setShowSimulationStudioModal(true)}
                className="quick-chip-btn"
                style={{ background: "#ede9fe", borderColor: "#c4b5fd", color: "#5b21b6" }}
                title="Open Simulation Studio"
              >
                <span>🎭</span>
                <span>{isArabic ? "محاكاة" : "Simulate"}</span>
              </button>

              <button
                onClick={openSpeedQuiz}
                className="quick-chip-btn"
                style={{ background: "#fffbeb", borderColor: "#fde68a", color: "#b45309" }}
                title="Open Interactive Quiz"
              >
                <span>⚡</span>
                <span>{isArabic ? "تحدي (+50 XP)" : "Quiz (+50 XP)"}</span>
              </button>

              <button
                onClick={() => setShowTemplatesModal(true)}
                className="quick-chip-btn"
                style={{ background: "#e0e7ff", borderColor: "#a5b4fc", color: "#3730a3" }}
                title="Choose Educational Template"
              >
                <span>📋</span>
                <span>{isArabic ? "قوالب" : "Templates"}</span>
              </button>

              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="quick-chip-btn"
                  title="Clear Chat"
                >
                  <span>🧹</span>
                  <span>{isArabic ? "محو" : "Clear"}</span>
                </button>
              )}
            </div>

            <div className="input-controls-row">
              <button
                onClick={toggleSpeechRecognition}
                className={`voice-mic-btn ${isListening ? "listening" : ""}`}
                title={isListening ? "Listening... click to stop" : "Speak via Microphone (Live Voice)"}
                type="button"
              >
                {isListening ? "🔴" : "🎙️"}
              </button>

              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isArabic
                    ? `تحدث مع ${currentAgent.nameAr} أو اسأله عن السبورة...`
                    : `Message ${currentAgent.nameEn} or ask about your board...`
                }
                className="playful-text-input"
              />

              <button
                onClick={() => handleSend()}
                disabled={!inputVal.trim() || isTyping}
                className="playful-send-btn"
                title="Send Message"
                type="button"
              >
                🚀
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Right/Left Main Stage: The Magic Board */}
      <main className={`magic-board-wrapper ${isChatSidebarCollapsed ? "fullwidth" : ""}`}>
        {/* Teacher Canvas Pointer Alert */}
        {teacherPointerText && (
          <div className="teacher-canvas-pointer">
            <span className="pointer-avatar">{currentAgent.avatar}</span>
            <span className="pointer-text">{teacherPointerText}</span>
            <span>✨</span>
          </div>
        )}

        {/* Top Board Toolbar */}
        <div className="magic-board-toolbar" style={{ position: "relative" }}>
          <div className="board-title-group">
            <span className="board-title-badge">
              🎨 {isArabic ? "السبورة التفاعلية الذكية" : "Interactive Whiteboard"}
            </span>
            <span className="board-coach-tag">
              {isArabic ? `مع ${currentAgent.nameAr}` : `With ${currentAgent.nameEn}`}
            </span>
            {studentProfile.name && (
              <span className="board-student-tag" title="Student Profile">
                🎓 {studentProfile.name}
              </span>
            )}
            <button
              onClick={() => setAppStep("tutors_selection")}
              className="board-tool-action-btn tool-switch-tutor-chip"
              style={{ background: "#fef3c7", borderColor: "#f59e0b", color: "#92400e", fontWeight: 800 }}
              title={isArabic ? "اختيار معلّم آخر من فريق المعلمين" : "Switch tutor"}
            >
              <span>👥</span>
              <span>{isArabic ? "فريق المعلمين" : "Switch Tutor"}</span>
            </button>
            <button
              onClick={() => setIsChatSidebarCollapsed(!isChatSidebarCollapsed)}
              className="board-tool-action-btn"
              style={{ background: "#f8fafc", borderColor: "#cbd5e1", color: "#334155" }}
              title={isChatSidebarCollapsed ? (isArabic ? "إظهار لوحة المحادثة" : "Show Chat") : (isArabic ? "توسيع السبورة بالكامل" : "Expand Board Fullscreen")}
            >
              <span>{isChatSidebarCollapsed ? (isArabic ? "💬 إظهار المحادثة" : "Show Chat") : (isArabic ? "🖥️ توسيع السبورة" : "Maximize Board")}</span>
            </button>
          </div>

            <div className="board-actions-group">
              {/* Simulation Studio shortcut (Track 5) */}
              <button
                onClick={() => setShowSimulationStudioModal(true)}
                className="board-tool-action-btn"
                style={{ background: "#ede9fe", borderColor: "#a5b4fc", color: "#3730a3" }}
                title="Launch Simulation Studio"
              >
                <span>🎭</span>
                <span>{isArabic ? "استوديو المحاكاة" : "Sim Studio"}</span>
              </button>

              {/* Templates Button */}
              <button
                onClick={() => setShowTemplatesModal(true)}
                className="board-tool-action-btn"
                style={{ background: "#ede9fe", borderColor: "#c4b5fd", color: "#5b21b6" }}
                title="Open Educational Blueprints & Templates"
              >
                <span>📋</span>
                <span>{isArabic ? "قوالب تعليمية" : "Templates"}</span>
              </button>

              {/* Sticky Note with Color Picker */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowColorPalette(!showColorPalette)}
                  className="board-tool-action-btn tool-note"
                  title="Choose sticky note color"
                >
                  <span>📝</span>
                  <span>{isArabic ? "ملاحظة لاصقة" : "Add Note"}</span>
                </button>

                {showColorPalette && (
                  <div className="color-palette-popover">
                    <span
                      onClick={() => {
                        setSelectedStickyColor("yellow");
                        setShowColorPalette(false);
                        if (whiteboardRef.current) {
                          whiteboardRef.current.addNote(isArabic ? "ملاحظة جديدة 📝" : "New Note 📝", "yellow");
                          awardXp(15, "ملاحظة صفراء", "Yellow sticky note");
                        }
                      }}
                      className="color-swatch-dot yellow"
                      title="Yellow Note"
                    />
                    <span
                      onClick={() => {
                        setSelectedStickyColor("green");
                        setShowColorPalette(false);
                        if (whiteboardRef.current) {
                          whiteboardRef.current.addNote(isArabic ? "نصيحة مميزة ✅" : "Tip Note ✅", "green");
                          awardXp(15, "ملاحظة خضراء", "Green sticky note");
                        }
                      }}
                      className="color-swatch-dot green"
                      title="Green Note"
                    />
                    <span
                      onClick={() => {
                        setSelectedStickyColor("blue");
                        setShowColorPalette(false);
                        if (whiteboardRef.current) {
                          whiteboardRef.current.addNote(isArabic ? "قاعدة هامة 💡" : "Rule Note 💡", "blue");
                          awardXp(15, "ملاحظة زرقاء", "Blue sticky note");
                        }
                      }}
                      className="color-swatch-dot blue"
                      title="Blue Note"
                    />
                    <span
                      onClick={() => {
                        setSelectedStickyColor("violet");
                        setShowColorPalette(false);
                        if (whiteboardRef.current) {
                          whiteboardRef.current.addNote(isArabic ? "مصطلح جديد 🔮" : "Idiom Note 🔮", "violet");
                          awardXp(15, "ملاحظة بنفسجية", "Violet sticky note");
                        }
                      }}
                      className="color-swatch-dot violet"
                      title="Violet Note"
                    />
                    <span
                      onClick={() => {
                        setSelectedStickyColor("red");
                        setShowColorPalette(false);
                        if (whiteboardRef.current) {
                          whiteboardRef.current.addNote(isArabic ? "انتبه للخطأ ❌" : "Correction Note ❌", "red");
                          awardXp(15, "ملاحظة حمراء", "Red sticky note");
                        }
                      }}
                      className="color-swatch-dot red"
                      title="Red Note"
                    />
                  </div>
                )}
              </div>

              {/* Speed Quiz shortcut */}
              <button
                onClick={openSpeedQuiz}
                className="board-tool-action-btn tool-challenge"
                style={{ background: "#fef9c3", borderColor: "#facc15", color: "#854d0e" }}
                title="Launch Speed Challenge Lab"
              >
                <span>⚡</span>
                <span>{isArabic ? "تحدي" : "Quiz"}</span>
              </button>

              {/* Sample Challenge */}
              <button
                onClick={handleAddSampleExercise}
                className="board-tool-action-btn tool-challenge"
                title="Place a sample challenge for active tutor"
              >
                <span>💡</span>
                <span>{isArabic ? "تمرين فوري" : "Challenge"}</span>
              </button>

              {/* AI Vision Snapshot Check */}
              <button
                onClick={() => handleSend(isArabic ? "قم بفحص كتابتي على السبورة وقدم لي تقييماً وتصحيحاً تفاعلياً." : "Analyze the handwritten work on my whiteboard and provide feedback.")}
                disabled={isTyping}
                className="board-tool-action-btn tool-inspect"
                title="AI Vision Snapshot Check"
              >
                <span>🔍</span>
                <span>{isArabic ? "فحص ذكي" : "AI Vision"}</span>
              </button>

              {/* Export Board PNG */}
              <button
                onClick={handleDownloadBoard}
                className="board-tool-action-btn"
                style={{ background: "#ecfdf5", borderColor: "#a7f3d0", color: "#065f46" }}
                title="Export Whiteboard as high-res PNG image"
              >
                <span>📸</span>
                <span>{isArabic ? "تصدير PNG" : "Export"}</span>
              </button>

              {/* Wipe Board */}
              <button
                onClick={handleClearBoard}
                className="board-tool-action-btn tool-clear"
                title="Clean Canvas"
              >
                <span>🧽</span>
                <span>{isArabic ? "مسح" : "Wipe"}</span>
              </button>
            </div>
          </div>

          {/* Interactive Whiteboard Canvas */}
          <div className="magic-canvas-container">
            <Whiteboard
              ref={whiteboardRef}
              socket={socket}
              onActionReceived={(tool) => {
                if (tool === "highlightError") {
                  triggerCelebration(isArabic ? "قام المعلم بتمييز الخطأ وتقديم التصحيح! 💡" : "Tutor highlighted a correction! 💡");
                  awardXp(25, "تصحيح لغوي دقيق", "Precision grammar correction");
                  showTeacherPointer(isArabic ? "انتبه للتصحيح الملون على السبورة! ❌✅" : "Check the correction card on board! ❌✅");
                } else if (tool === "drawBoardText") {
                  triggerCelebration(isArabic ? "تمت إضافة ملاحظة تعليمية على السبورة! ✨" : "Educational note drawn on board! ✨");
                  showTeacherPointer(isArabic ? "قام المعلم بكتابة قاعدة جديدة! 📝" : "Tutor wrote a new rule on board! 📝");
                }
              }}
            />
          </div>
        </main>
      </div>
      )}
    </div>
  );
};

export default App;
