import React from "react";
import { AGENTS, Agent } from "../config/tutorAgents";

export interface StudentProfile {
  name: string;
  level: "beginner" | "intermediate" | "advanced";
  goal: string;
  isRegistered: boolean;
}

export const STUDENT_GOALS = [
  { id: "grammar", labelAr: "تأسيس وقواعد إنجليزية 📘", labelEn: "Grammar & Foundation 📘", defaultTutor: "foundation" },
  { id: "conversation", labelAr: "محادثة وطلاقة يومية 🗣️", labelEn: "Casual & Idioms 🗣️", defaultTutor: "free_talk" },
  { id: "business", labelAr: "إنجليزية الأعمال والمقابلات 💼", labelEn: "Business & Interviews 💼", defaultTutor: "business_pro" },
  { id: "ielts", labelAr: "التحضير لاختبار الآيلتس 🎯", labelEn: "IELTS Speaking Prep 🎯", defaultTutor: "ielts_examiner" },
  { id: "phonetics", labelAr: "مخارج الحروف وتصحيح النطق 🎤", labelEn: "Pronunciation & Phonetics 🎤", defaultTutor: "phonetics" },
  { id: "roleplay", labelAr: "سيناريوهات ومواقف واقعية ✈️", labelEn: "Real-world Scenarios ✈️", defaultTutor: "roleplay" },
];

export interface TutorShowcaseProps {
  isArabic: boolean;
  studentProfile: StudentProfile;
  setStudentProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  selectedAgent: string;
  setSelectedAgent: (agentId: string) => void;
  playingVoiceAgentId: string | null;
  previewAgentVoice: (agentId: string) => void;
  onConfirmAndStart: (agentId?: string) => void;
  assignedVoices?: Record<string, SpeechSynthesisVoice | null>;
}

export const TutorShowcase: React.FC<TutorShowcaseProps> = ({
  isArabic,
  studentProfile,
  setStudentProfile,
  selectedAgent,
  setSelectedAgent,
  playingVoiceAgentId,
  previewAgentVoice,
  onConfirmAndStart,
  assignedVoices = {}
}) => {
  const currentAgent = AGENTS.find((a: Agent) => a.id === selectedAgent) || AGENTS[0];

  return (
    <div className="onboarding-tutors-screen">
      {/* Hero Welcome Card */}
      <div className="onboarding-hero-card">
        <div className="onboarding-hero-badge">
          <span>✨</span>
          <span>{isArabic ? "بوابة التسجيل واختيار المعلم الذكي" : "Student Registration & Dream Tutors"}</span>
        </div>
        <h2 className="onboarding-hero-title">
          {isArabic
            ? "سجّل بياناتك كطالب، ثم اختر معلماً من الفريق لدخول السبورة التفاعلية"
            : "Register your profile, choose your mentor, and launch your whiteboard studio"}
        </h2>
        <p className="onboarding-hero-desc">
          {isArabic
            ? "تم فصل فريق المعلمين في هذه الواجهة المستقلة لتتعرف على نبرة صوت كل معلم وتخصصه براحة تامة، ثم تنطلق مباشرة إلى السبورة التفاعلية بدون أي تشتيت!"
            : "Explore each teacher's direct voice and specialized pedagogy in this dedicated portal, then launch directly to your focused whiteboard classroom!"}
        </p>
      </div>

      {/* Step 1: Student Profile & Learning Goal */}
      <div className="student-registration-section">
        <div className="reg-section-header">
          <span className="reg-step-number">1</span>
          <div>
            <h3 className="reg-section-title">
              {isArabic ? "بيانات الطالب والهدف التعليمي" : "Student Profile & Goal"}
            </h3>
            <p className="reg-section-subtitle">
              {isArabic
                ? "أدخل اسمك وحدد مستواك لتخصيص محتوى الشرح والتحديات المكتوبة على السبورة"
                : "Set your name and English proficiency level to personalize board lessons"}
            </p>
          </div>
        </div>

        <div className="student-reg-fields-grid">
          {/* Name Input */}
          <div className="reg-field-group">
            <label className="reg-field-label">
              <span>👤</span>
              <span>{isArabic ? "اسم الطالب / المتعلم:" : "Student Name:"}</span>
            </label>
            <input
              type="text"
              value={studentProfile.name}
              onChange={(e) => setStudentProfile({ ...studentProfile, name: e.target.value })}
              placeholder={isArabic ? "مثال: عبد الله، سارة، محمد..." : "e.g., Alex, Sarah, David..."}
              className="reg-text-input"
            />
          </div>

          {/* Level Picker */}
          <div className="reg-field-group">
            <label className="reg-field-label">
              <span>📊</span>
              <span>{isArabic ? "المستوى الحالي في الإنجليزية:" : "Current English Level:"}</span>
            </label>
            <div className="level-pills-row">
              {[
                { id: "beginner", labelAr: "🟢 مبتدئ (Beginner)", labelEn: "🟢 Beginner" },
                { id: "intermediate", labelAr: "🟡 متوسط (Intermediate)", labelEn: "🟡 Intermediate" },
                { id: "advanced", labelAr: "🟣 متقدم (Advanced)", labelEn: "🟣 Advanced" },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setStudentProfile({ ...studentProfile, level: lvl.id as any })}
                  className={`level-select-pill ${studentProfile.level === lvl.id ? "active" : ""}`}
                >
                  {isArabic ? lvl.labelAr : lvl.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Goal Picker */}
        <div className="reg-goal-group">
          <label className="reg-field-label">
            <span>🎯</span>
            <span>{isArabic ? "ما هو هدفك أو مجالك الأساسي؟" : "Primary Learning Objective:"}</span>
          </label>
          <div className="goal-pills-grid">
            {STUDENT_GOALS.map((g) => {
              const isSelected = studentProfile.goal === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setStudentProfile({ ...studentProfile, goal: g.id });
                    setSelectedAgent(g.defaultTutor);
                  }}
                  className={`goal-select-pill ${isSelected ? "active" : ""}`}
                >
                  <span>{isArabic ? g.labelAr : g.labelEn}</span>
                  {isSelected && <span className="goal-check">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step 2: Dedicated Dream Tutors Showcase */}
      <div className="tutors-showcase-section">
        <div className="reg-section-header">
          <span className="reg-step-number">2</span>
          <div>
            <h3 className="reg-section-title">
              {isArabic ? "فريق المعلمين المتخصصين (The Dream Tutors)" : "The Dream Tutors Team"}
            </h3>
            <p className="reg-section-subtitle">
              {isArabic
                ? "استمع لنبرة صوت المعلم المباشرة، وتعرّف على أسلوبه، ثم اضغط لاختياره ودخول السبورة التفاعلية"
                : "Listen to each coach's direct voice and pedagogy, then select your mentor to start the board"}
            </p>
          </div>
        </div>

        <div className="tutors-showcase-grid">
          {AGENTS.map((agent: Agent) => {
            const isSelected = agent.id === selectedAgent;
            const isPlayingVoice = playingVoiceAgentId === agent.id;
            return (
              <div
                key={agent.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedAgent(agent.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedAgent(agent.id);
                  }
                }}
                className={`tutor-showcase-card ${agent.colorClass} ${isSelected ? "selected" : ""}`}
              >
                {isSelected && (
                  <div className="selected-card-tag">
                    ⭐ {isArabic ? "المعلم المختار" : "Selected Mentor"}
                  </div>
                )}

                <div className="tutor-card-top">
                  <div className={`tutor-showcase-avatar ${isPlayingVoice ? "speaking-pulse" : ""}`}>
                    {agent.avatar}
                    {isPlayingVoice && <span className="card-live-wave">🔊</span>}
                  </div>
                  <div className="tutor-card-meta">
                    <h4 className="tutor-card-name">
                      {isArabic ? agent.nameAr : agent.nameEn}
                    </h4>
                    <span className="tutor-card-role">
                      {isArabic ? agent.roleAr : agent.roleEn}
                    </span>
                    <div className="tutor-card-badges">
                      <span className={`gender-badge ${agent.gender}`}>
                        {agent.gender === "male" ? (isArabic ? "👨 شخصية رجل" : "👨 Male") : (isArabic ? "👩 شخصية نسائية" : "👩 Female")}
                      </span>
                      <span className="voice-code-badge">
                        🎙️ {agent.geminiVoice}
                        {assignedVoices[agent.id] ? ` (${assignedVoices[agent.id]?.name.slice(0, 14)})` : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="tutor-card-quote">
                  "{isArabic ? agent.quoteAr : agent.quoteEn}"
                </p>

                <p className="tutor-card-persona">
                  {isArabic ? agent.personaAr : agent.personaEn}
                </p>

                <div className="tutor-card-actions">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      previewAgentVoice(agent.id);
                    }}
                    className={`voice-preview-btn ${isPlayingVoice ? "playing" : ""}`}
                    title={isArabic ? `استمع لنبرة صوت ${agent.nameAr} المباشرة` : `Test ${agent.nameEn}'s direct voice`}
                  >
                    {isPlayingVoice
                      ? (isArabic ? "🔊 يتحدث الآن..." : "🔊 Speaking...")
                      : (isArabic ? "🎙️ استمع للصوت المباشر" : "🎙️ Test Direct Voice")}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfirmAndStart(agent.id);
                    }}
                    className={`select-and-launch-btn ${isSelected ? "primary-launch" : ""}`}
                  >
                    {isSelected
                      ? (isArabic ? "🚀 بدء الدرس ودخول السبورة الآن" : "🚀 Launch Whiteboard Now")
                      : (isArabic ? "اختيار ودخول السبورة" : "Choose & Launch")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="onboarding-bottom-action-bar">
        <div className="bottom-bar-info">
          <div className="active-tutor-mini-avatar">{currentAgent.avatar}</div>
          <div>
            <span className="bottom-bar-label">
              {isArabic ? "المعلم المختار حالياً:" : "Selected Tutor:"}
            </span>
            <span className="bottom-bar-name">
              {isArabic ? currentAgent.nameAr : currentAgent.nameEn} — {isArabic ? currentAgent.roleAr : currentAgent.roleEn}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onConfirmAndStart(selectedAgent)}
          className="bottom-bar-launch-button"
        >
          <span>🚀</span>
          <span>
            {isArabic
              ? `تأكيد وبدء الدرس مع ${currentAgent.nameAr} على السبورة التفاعلية`
              : `Confirm & Launch Whiteboard with ${currentAgent.nameEn}`}
          </span>
        </button>
      </div>
    </div>
  );
};
