export const AM_ROSTER = [
  "Sarah Jenkins",
  "Michael Chen",
  "Elena Rodriguez",
  "David Thompson",
  "Jessica Wu",
];
export const ROLES = [
  "Founder / CEO",
  "Marketing Director",
  "Clinical Lead",
  "Operations Manager",
  "Other",
];
export const MARKETS = [
  "USA",
  "UK",
  "Australia",
  "Canada",
  "Europe",
  "Middle East",
  "Asia",
];
export const CURRENCIES = ["USD", "GBP", "EUR", "AUD", "CAD"];

export const SPEND_BANDS = {
  USD: ["<$5k", "$5k-$15k", "$15k-$50k", "$50k-$150k", "$150k+"],
  GBP: ["<£4k", "£4k-£12k", "£12k-£40k", "£40k-£120k", "£120k+"],
  EUR: ["<€4.5k", "€4.5k-€14k", "€14k-€45k", "€45k-€135k", "€135k+"],
};

export const GROWTH_SYSTEMS = [
  "Patient Acquisition System",
  "Brand Authority Engine",
  "Conversion & Retention Layer",
  "AI Efficiency Layer",
];

const VAL_IMPACT_OPTIONS = [
  { label: "Improved", value: "Improved" },
  { label: "Slightly Improved", value: "Slightly_improved" },
  { label: "No Change", value: "No_change" },
  { label: "Worse", value: "Worse" },
  { label: "Too Early to Tell", value: "Too_early" },
  { label: "Not Sure", value: "Not_sure" },
];

const VAL_TREND_OPTIONS = [
  { label: "Better", value: "Better" },
  { label: "Same", value: "Same" },
  { label: "Worse", value: "Worse" },
  { label: "Too Early", value: "Too_early" },
  { label: "Not Sure", value: "Not_sure" },
];

export const SECTIONS = [
  {
    id: "onboarding",
    title: "Onboarding & Kickoff",
    questions: [
      {
        id: "ONB_1",
        text: "Kickoff made goals and success metrics clear.",
        type: "rating",
        required: true,
        allowNotDelivered: true,
      },
      {
        id: "ONB_2",
        text: "Roles and responsibilities were clear (MDS vs our team).",
        type: "rating",
        required: true,
      },
      {
        id: "ONB_3",
        text: "Access requirements were clear (accounts, pixels, assets, approvals).",
        type: "rating",
        required: true,
      },
      {
        id: "ONB_4",
        text: "Onboarding felt organized and confidence-building.",
        type: "rating",
        required: true,
      },
      {
        id: "ONB_5",
        text: "What was the #1 friction in onboarding? (Give a specific example.)",
        type: "open-text",
        required: true,
      },
    ],
  },
  {
    id: "exec_summary",
    title: "Executive Summary",
    questions: [
      {
        id: "EXE_SAT",
        text: "Overall satisfaction with MDS.",
        type: "rating",
        required: true,
      },
      {
        id: "EXE_VALUE",
        text: "Value relative to outcomes achieved so far.",
        type: "rating",
        required: true,
      },
      {
        id: "EXE_UNDERSTAND",
        text: "MDS understood our business and patient journey.",
        type: "rating",
        required: true,
      },
      {
        id: "EXE_DELIVERY",
        text: "Delivery cadence matched what we agreed.",
        type: "rating",
        required: true,
        allowNotDelivered: true,
      },
      {
        id: "EXE_PROGRESS",
        text: "Progress toward goals so far.",
        type: "rating",
        required: true,
        allowNotDelivered: true,
      },
      {
        id: "CES_1",
        text: "It was easy to move work forward with MDS (request → delivery).",
        type: "rating",
        required: true,
      },
      {
        id: "CES_4",
        text: "Communication channels were clear (WhatsApp / email / meetings).",
        type: "rating",
        required: true,
      },
      {
        id: "VAL_1",
        text: "Impact on patient acquisition / bookings so far is:",
        type: "single-select",
        options: VAL_IMPACT_OPTIONS,
        required: true,
      },
      {
        id: "VAL_2",
        text: "Lead quality / booking quality trend is:",
        type: "single-select",
        options: VAL_TREND_OPTIONS,
        required: true,
      },
      {
        id: "NPS_1",
        text: "Likelihood to recommend MDS (0–10).",
        type: "nps",
        required: true,
      },
      {
        id: "NPS_REASON",
        text: "What is the main reason for your score? (Be specific.)",
        type: "open-text",
        required: true,
      },
      {
        id: "WIN_1",
        text: "What was the most valuable outcome so far? (Concrete example.)",
        type: "open-text",
        required: true,
      },
      {
        id: "GAP_1",
        text: "What is the single biggest bottleneck or risk right now?",
        type: "open-text",
        required: true,
      },
    ],
    deepDiveAdds: [
      {
        id: "DD_CONF_90",
        text: "Confidence in the next 90-day plan.",
        type: "rating",
        required: false,
      },
      {
        id: "DD_90_OUTCOME",
        text: "What outcome matters most in the next 90 days?",
        type: "single-select",
        options: [
          "Bookings",
          "Revenue",
          "Lead quality",
          "Retention",
          "Brand authority",
          "Operational efficiency",
          "Other",
        ],
        required: false,
      },
    ],
  },
  {
    id: "trust_safety",
    title: "Trust, Safety & Medical Credibility",
    questions: [
      {
        id: "SAFE_1",
        text: "MDS protected medical credibility (no risky promises).",
        type: "rating",
        required: true,
      },
      {
        id: "SAFE_2",
        text: "Brand tone felt premium and trustworthy for our patients.",
        type: "rating",
        required: true,
      },
      {
        id: "SAFE_3",
        text: "We felt safe/confident approving published content.",
        type: "rating",
        required: true,
      },
    ],
  },
  {
    id: "am_scorecard",
    title: "Account Manager Scorecard",
    questions: [
      {
        id: "AM_RESP",
        text: "Responsiveness and availability when needed.",
        type: "rating",
        required: true,
      },
      {
        id: "AM_PROACTIVE",
        text: "Proactive updates (we didn’t have to chase).",
        type: "rating",
        required: true,
      },
      {
        id: "AM_OWN",
        text: "Ownership until issues are resolved.",
        type: "rating",
        required: true,
      },
      {
        id: "AM_COORD",
        text: "Cross-team coordination (right people involved).",
        type: "rating",
        required: true,
      },
      {
        id: "AM_KEEP",
        text: "What should your AM keep doing? (Example.)",
        type: "open-text",
        required: true,
      },
      {
        id: "AM_CHANGE",
        text: "What should your AM change first to improve outcomes?",
        type: "open-text",
        required: true,
      },
    ],
  },
  {
    id: "ops_timelines",
    title: "Scope, Timelines & Change Requests",
    questions: [
      {
        id: "OPS_1",
        text: "Scope was clear from the start (included vs not included).",
        type: "rating",
        required: true,
      },
      {
        id: "OPS_2",
        text: "Timelines were realistic and transparent.",
        type: "rating",
        required: true,
      },
      {
        id: "OPS_3",
        text: "When priorities changed, MDS adapted smoothly.",
        type: "rating",
        required: true,
      },
      {
        id: "OPS_4",
        text: "Change requests were handled fairly and efficiently.",
        type: "rating",
        required: true,
        allowNotApplicable: true,
      },
    ],
  },
  {
    id: "close_out",
    title: "Advocacy & Close-out",
    questions: [
      {
        id: "CL_1",
        text: "If you could change ONE thing about MDS, what would it be?",
        type: "open-text",
        required: true,
      },
      {
        id: "CL_FU",
        text: "Permission to follow up?",
        type: "single-select",
        required: true,
        options: ["Yes", "No"],
      },
      {
        id: "CL_CHAN",
        text: "Preferred channel",
        type: "single-select",
        options: ["WhatsApp", "Email", "Call"],
      },
      {
        id: "ADV_2",
        text: "Would you refer MDS to a peer if we addressed your #1 gap?",
        type: "single-select",
        options: ["Yes", "No", "Not yet"],
        required: false,
      },
      {
        id: "ADV_2A",
        text: "What must change first for you to refer us?",
        type: "open-text",
        required: true,
      },
    ],
  },
];

export const MODULES = [
  {
    id: "WEB",
    name: "Web & Conversion",
    questions: [
      {
        id: "WEB_1",
        text: "The website/landing work improved conversion.",
        type: "rating",
        required: true,
        allowNotDelivered: true,
      },
      {
        id: "WEB_2",
        text: "UX clarity improved patient trust.",
        type: "rating",
        required: true,
      },
      {
        id: "WEB_3",
        text: "Copy quality was medically credible.",
        type: "rating",
        required: true,
      },
      {
        id: "WEB_4",
        text: "Mobile experience is strong.",
        type: "rating",
        required: true,
      },
      {
        id: "WEB_WIN",
        text: "Most valuable improvement from web? (Example)",
        type: "open-text",
        required: true,
      },
      {
        id: "WEB_FIX",
        text: "#1 change for next month?",
        type: "open-text",
        required: true,
      },
    ],
  },
  {
    id: "ORG",
    name: "Organic Social Media",
    questions: [
      {
        id: "ORG_1",
        text: "Content strategy and pillars were clear.",
        type: "rating",
        required: true,
      },
      {
        id: "ORG_2",
        text: "Brand voice consistency across posts.",
        type: "rating",
        required: true,
      },
      {
        id: "ORG_4",
        text: "Posting consistency matched what we agreed.",
        type: "rating",
        required: true,
        allowNotDelivered: true,
      },
      {
        id: "ORG_6",
        text: "Overall impact on brand trust and demand.",
        type: "rating",
        required: true,
      },
      {
        id: "ORG_WIN",
        text: "Most valuable outcome? (Example)",
        type: "open-text",
        required: true,
      },
      {
        id: "ORG_FIX",
        text: "#1 change for next month?",
        type: "open-text",
        required: true,
      },
    ],
  },
  {
    id: "PAID",
    name: "Paid Advertising & Performance Media",
    questions: [
      {
        id: "PAID_1",
        text: "Strategy clarity (funnel, targeting, offer).",
        type: "rating",
        required: true,
      },
      {
        id: "PAID_2",
        text: "Budget allocation and pacing felt confident.",
        type: "rating",
        required: true,
      },
      {
        id: "PAID_3",
        text: "Lead quality / booking quality met expectations.",
        type: "rating",
        required: true,
      },
      {
        id: "PAID_6",
        text: "Reporting clarity and usefulness.",
        type: "rating",
        required: true,
      },
      {
        id: "PAID_WIN",
        text: "Biggest performance win? (Example)",
        type: "open-text",
        required: true,
      },
      {
        id: "PAID_FIX",
        text: "#1 change for next month?",
        type: "open-text",
        required: true,
      },
    ],
  },
  {
    id: "SB",
    name: "Strategy & Brand",
    questions: [
      {
        id: "SB_1",
        text: "Positioning and differentiation are clear.",
        type: "rating",
        required: true,
      },
      {
        id: "SB_3",
        text: "Brand feels premium and medically credible.",
        type: "rating",
        required: true,
      },
      {
        id: "SB_5",
        text: "Deliverables were actionable for execution.",
        type: "rating",
        required: true,
      },
      {
        id: "SB_6",
        text: "Leadership alignment improved.",
        type: "rating",
        required: true,
      },
      {
        id: "SB_WIN",
        text: "Most valuable insight? (Example)",
        type: "open-text",
        required: true,
      },
      {
        id: "SB_FIX",
        text: "#1 change for next 90 days?",
        type: "open-text",
        required: true,
      },
    ],
  },
  {
    id: "VP",
    name: "Video Production",
    questions: [
      {
        id: "VP_2",
        text: "On-site professionalism and coordination.",
        type: "rating",
        required: true,
      },
      { id: "VP_4", text: "Brand alignment.", type: "rating", required: true },
      {
        id: "VP_6",
        text: "Overall production quality.",
        type: "rating",
        required: true,
      },
      {
        id: "VP_WIN",
        text: "Biggest win from production? (Example)",
        type: "open-text",
        required: true,
      },
      {
        id: "VP_FIX",
        text: "#1 change for next shoot?",
        type: "open-text",
        required: true,
      },
    ],
  },
  {
    id: "AI",
    name: "AI Layer (Chatbots, Voice Agents, Automations)",
    questions: [
      {
        id: "AI_1",
        text: "AI system goals and flows were clear.",
        type: "rating",
        required: true,
      },
      {
        id: "AI_3",
        text: "Response quality (accuracy + tone).",
        type: "rating",
        required: true,
      },
      {
        id: "AI_5",
        text: "Impact on missed leads / response time.",
        type: "rating",
        required: true,
        allowNotDelivered: true,
      },
      {
        id: "AI_6",
        text: "Overall value of the AI layer.",
        type: "rating",
        required: true,
      },
      {
        id: "AI_WIN",
        text: "Biggest blocker to adoption today?",
        type: "open-text",
        required: true,
      },
      {
        id: "AI_FIX",
        text: "#1 fast fix for next 30 days?",
        type: "open-text",
        required: true,
      },
    ],
  },
];

export const MINI_BLOCK_QUESTIONS = [
  { id: "MINI_Q", text: "Delivery quality", type: "rating", required: true },
  {
    id: "MINI_S",
    text: "Speed and responsiveness",
    type: "rating",
    required: true,
  },
  { id: "MINI_I", text: "Impact so far", type: "rating", required: true },
  {
    id: "MINI_C",
    text: "One improvement (optional)",
    type: "open-text",
    required: false,
  },
];

export const RECOVERY_QUESTIONS = [
  {
    id: "REC_WHAT",
    text: "What happened? (Give a specific example.)",
    type: "open-text",
    required: true,
  },
  {
    id: "REC_FIX",
    text: "What would fix it fastest in the next 30 days?",
    type: "open-text",
    required: true,
  },
];

export const SurveyMode = {
  CORE: "core",
  DEEP: "deep",
};

export const Tenure = {
  ZERO_THREE: "0-3",
  THREE_SIX: "3-6",
  SIX_TWELVE: "6-12",
  ONE_TWO_YEARS: "1-2y",
  TWO_PLUS_YEARS: "2y+",
};
