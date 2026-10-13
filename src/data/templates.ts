import { TemplateSection } from "../components/Whiteboard";

export interface EducationalTemplate {
  id: string;
  agentId: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  icon: string;
  canvasTitle: string;
  sections: TemplateSection[];
}

export const EDUCATIONAL_TEMPLATES: EducationalTemplate[] = [
  {
    id: "ielts_essay_structure",
    agentId: "ielts_examiner",
    nameAr: "هيكل مقال الآيلتس (Band 8+ Essay)",
    nameEn: "IELTS Essay Architecture",
    descAr: "تقسيم منهجي للمقدمة وفقرات العرض والخاتمة مع الروابط الأكاديمية.",
    descEn: "Band 8+ four-paragraph essay structure with cohesive linking words.",
    icon: "🎯",
    canvasTitle: "IELTS Academic Writing Task 2 Structure",
    sections: [
      {
        title: "Paragraph 1: Introduction",
        content: "• Hook & Paraphrase of Prompt: 'It is often argued that...'\n• Clear Thesis Statement & Stance: 'This essay contends that...'",
        color: "blue"
      },
      {
        title: "Paragraph 2: Body Paragraph 1 (Primary Argument)",
        content: "• Topic Sentence: 'First and foremost, the primary justification...'\n• Concrete Example: 'For instance, recent empirical data demonstrates...'\n• Concluding Result: 'Consequently, this reinforces...'",
        color: "green"
      },
      {
        title: "Paragraph 3: Body Paragraph 2 (Counterpoint / Nuance)",
        content: "• Topic Sentence: 'Notwithstanding the aforementioned benefits...'\n• Supporting Evidence & Counter-analysis: 'Specifically, critics highlight...'\n• Summary Link: 'Therefore, a balanced equilibrium is essential.'",
        color: "violet"
      },
      {
        title: "Paragraph 4: Conclusion",
        content: "• Restatement of Thesis: 'In conclusion, despite notable challenges...'\n• Final Recommendation / Future Outlook: 'It is highly recommended that...'",
        color: "yellow"
      }
    ]
  },
  {
    id: "business_email_blueprint",
    agentId: "business_pro",
    nameAr: "هيكل الإيميل المهني الرسمي (Executive Email)",
    nameEn: "Executive Email Blueprint",
    descAr: "نموذج لمراسلات العمل الاحترافية والمتابعة مع العملاء والمدراء.",
    descEn: "Standard corporate email architecture for proposals and follow-ups.",
    icon: "💼",
    canvasTitle: "Professional Corporate Email Framework",
    sections: [
      {
        title: "1. Subject Line & Salutation",
        content: "Subject: Project Update: Q3 Deliverables & Milestone Review\nSalutation: 'Dear Mr./Ms. [Last Name],' or 'Dear [Team Name],'",
        color: "blue"
      },
      {
        title: "2. The Opening & Purpose Statement",
        content: "• 'I hope this email finds you well.'\n• 'I am writing to provide a concise status update regarding our proposal...'",
        color: "green"
      },
      {
        title: "3. Key Discussion Points & Action Items",
        content: "• Deliverable 1: Design Phase completed on schedule.\n• Deliverable 2: Budget review finalized with +5% cost efficiency.\n• Action Required: Please review attachment by Thursday 5:00 PM.",
        color: "yellow"
      },
      {
        title: "4. Professional Sign-off & Next Steps",
        content: "• 'Please do not hesitate to reach out if you have any questions.'\n• 'Sincerely, / Best regards,'\n• [Your Name & Professional Title]",
        color: "violet"
      }
    ]
  },
  {
    id: "verb_tense_comparison",
    agentId: "foundation",
    nameAr: "مصفوفة مقارنة الأزمنة (Verb Tense Matrix)",
    nameEn: "Verb Tense Comparison Matrix",
    descAr: "مقارنة بصرية بين المضارع التام، الماضي البسيط، والماضي المستمر.",
    descEn: "Timeline breakdown between Present Perfect, Simple Past, and Continuous.",
    icon: "📚",
    canvasTitle: "English Verb Tense Matrix & Timeline",
    sections: [
      {
        title: "Present Perfect (have/has + V3) — Relevant to Present",
        content: "• Rule: Action happened at unspecified time with present impact.\n• Example: 'I have lived in London for five years' (still living there).",
        color: "blue"
      },
      {
        title: "Past Simple (V2) — Finished in Past Time",
        content: "• Rule: Completed past action with explicit finished time marker.\n• Example: 'I lived in London in 2018' (action is 100% finished).",
        color: "red"
      },
      {
        title: "Past Continuous (was/were + V-ing) — Interrupted Action",
        content: "• Rule: Ongoing action interrupted by another sudden past event.\n• Example: 'I was walking home when it began to rain heavily.'",
        color: "green"
      }
    ]
  },
  {
    id: "word_family_collocations",
    agentId: "free_talk",
    nameAr: "شجرة العائلة اللغوية والتلازمات (Word Family & Idioms)",
    nameEn: "Word Family & Collocation Tree",
    descAr: "استكشاف اشتقاقات الكلمة (اسم، فعل، صفة، حال) وتراكيبها الاصطلاحية.",
    descEn: "Branching map of word derivations, collocations, and idiomatic phrases.",
    icon: "💬",
    canvasTitle: "Word Family & Natural Collocations Map",
    sections: [
      {
        title: "Target Word: 'DECIDE' (Verb)",
        content: "• Definition: To make a definitive choice between alternatives.\n• Natural Collocation: 'Decide in favor of' / 'Firmly decide'",
        color: "blue"
      },
      {
        title: "Derivations (Family Members)",
        content: "• Noun: 'Decision' (make a tough decision)\n• Adjective: 'Decisive' (a decisive leader)\n• Adverb: 'Decisively' (acted decisively under pressure)",
        color: "violet"
      },
      {
        title: "Idioms & Natural Expressions",
        content: "• 'Make up your mind' = حسم الأمر\n• 'Sit on the fence' = التردد وعدم اتخاذ القرار\n• 'Cross that bridge when we come to it'",
        color: "yellow"
      }
    ]
  },
  {
    id: "phonetics_breakdown",
    agentId: "phonetics",
    nameAr: "بطاقة النطق الصوتي ومخارج الحروف (IPA Acoustic Map)",
    nameEn: "IPA Phonetics & Articulation Guide",
    descAr: "دليل تشريح مخارج الحروف، موضع اللسان والشفتين والأصوات المتقاربة.",
    descEn: "Articulatory phonetics guide with mouth shapes, tongue positions, and IPA.",
    icon: "🎤",
    canvasTitle: "Phonetic Articulation & Minimal Pair Guide",
    sections: [
      {
        title: "Acoustic Target: /θ/ vs /ð/ (Dental Fricatives)",
        content: "• /θ/ Unvoiced (soft 'th'): 'think', 'thought', 'breath'\n• /ð/ Voiced (vibrating vocal cords): 'this', 'there', 'breathe'",
        color: "blue"
      },
      {
        title: "Mouth Shape & Mechanics",
        content: "• Place tip of tongue lightly between front teeth.\n• Do not bite; allow gentle steady airflow.\n• Touch larynx: feel vocal cord vibration for /ð/, silent for /θ/.",
        color: "green"
      },
      {
        title: "Practice Drill Sentences",
        content: "• 'They thought three thousand things through.'\n• 'My mother and brother live together there.'",
        color: "violet"
      }
    ]
  },
  {
    id: "roleplay_airport",
    agentId: "roleplay",
    nameAr: "سيناريو السفر والمطار (Airport Transit Roleplay)",
    nameEn: "Airport Transit Dialogue Flow",
    descAr: "خريطة سيناريو التعامل في مكتب الترانزيت واستبدال التذاكر.",
    descEn: "Interactive dialogic branch for airline check-in and transit desks.",
    icon: "🎭",
    canvasTitle: "Airport Connection & Baggage Roleplay Flow",
    sections: [
      {
        title: "Stage 1: Greeting & State Problem",
        content: "Passenger: 'Good morning, my inbound flight was delayed by 40 minutes.'\nAgent: 'Let me pull up your booking reference, please.'",
        color: "blue"
      },
      {
        title: "Stage 2: Inquire About Connection & Gate",
        content: "Passenger: 'Will my checked baggage be transferred automatically?'\nAgent: 'Yes, it is checked through all the way to your final destination.'",
        color: "green"
      },
      {
        title: "Stage 3: Boarding Pass & Final Instructions",
        content: "Agent: 'Here is your updated boarding pass for Gate B14.'\nPassenger: 'Thank you immensely for your swift assistance!'",
        color: "yellow"
      }
    ]
  }
];
