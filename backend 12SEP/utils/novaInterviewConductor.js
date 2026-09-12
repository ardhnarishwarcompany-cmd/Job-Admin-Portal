import { groqChat } from "./groqClient.js";

const ROLE_BANKS = [
  {
    match: /(software|developer|engineer|frontend|backend|full.?stack|react|node|javascript|typescript|python|java|devops|qa|tester|data|tech|it|web)/i,
    questions: [
      ["Role & experience", "Please walk me through your software development experience and the type of projects you have worked on."],
      ["Technical fundamentals", "Which technologies are strongest for you, and how have you used them in a real project?"],
      ["Problem solving", "Tell me about a difficult technical problem you solved. How did you find the root cause and what was the result?"],
      ["Architecture", "Describe a project where you had to make an important design or architecture decision. What trade-offs did you consider?"],
      ["Debugging & quality", "Tell me about a production bug or quality issue you handled. How did you investigate it and prevent it from happening again?"],
      ["Collaboration", "Describe a disagreement with a developer, tester, product owner, or manager. How did you resolve it?"],
      ["Delivery", "How do you prioritize work when you have multiple tasks, changing requirements, and a tight deadline?"],
      ["Role fit", "Why are you a strong fit for this role, and what would you aim to improve or deliver in your first 90 days?"],
    ],
  },
  {
    match: /(human resource|hr\b|recruit|talent|hr executive|hr manager|people)/i,
    questions: [
      ["HR & introduction", "Please walk me through your HR or recruitment experience and the kind of roles or teams you have supported."],
      ["Sourcing", "How do you source and shortlist candidates for a difficult or hard-to-fill position?"],
      ["Screening", "What do you look for during an initial candidate screening, and how do you keep the process fair and consistent?"],
      ["Stakeholder management", "Tell me about a time a hiring manager and a candidate had different expectations. How did you handle it?"],
      ["Candidate experience", "How would you handle a candidate who is unhappy about delays or lack of communication during recruitment?"],
      ["Conflict handling", "Describe a workplace conflict you helped resolve. What approach did you take?"],
      ["Metrics", "Which recruitment or HR metrics do you consider important, and how have you used data to improve a process?"],
      ["Role fit", "What makes you a strong fit for this HR role, and what value would you aim to deliver in your first 90 days?"],
    ],
  },
  {
    match: /(sales|business development|bdm|account manager|relationship manager|inside sales|field sales)/i,
    questions: [
      ["Sales experience", "Please describe your sales or business development experience and the customers or markets you have handled."],
      ["Prospecting", "How do you identify and prioritize prospects when you need to build a new sales pipeline?"],
      ["Discovery", "How do you understand a customer's real need before proposing a product or service?"],
      ["Objection handling", "Tell me about a difficult customer objection you handled. What did you say and what happened next?"],
      ["Closing", "Describe a deal you successfully closed. What was the key factor that helped you win it?"],
      ["Targets", "How do you organize your work when you have aggressive monthly targets and several active opportunities?"],
      ["Relationships", "How do you maintain a strong customer relationship after the sale?"],
      ["Role fit", "Why are you a strong fit for this sales role, and what would you target in your first 90 days?"],
    ],
  },
  {
    match: /(finance|account|accountant|accounts|audit|tax|banking|financial)/i,
    questions: [
      ["Finance experience", "Please summarize your finance or accounting experience and the types of responsibilities you have handled."],
      ["Accuracy", "What checks do you perform to keep financial records accurate and complete?"],
      ["Problem solving", "Tell me about a financial or accounting discrepancy you found. How did you investigate and resolve it?"],
      ["Reporting", "Describe a financial report or analysis you prepared and how it helped a manager make a decision."],
      ["Compliance", "How do you stay organized when working with deadlines, policies, audits, or compliance requirements?"],
      ["Stakeholders", "Tell me about a time you had to explain a financial issue to someone without a finance background."],
      ["Priorities", "How do you manage several urgent finance tasks at the same time, especially around a closing deadline?"],
      ["Role fit", "Why are you a strong fit for this finance role, and what value would you aim to deliver in your first 90 days?"],
    ],
  },
  {
    match: /(marketing|digital marketing|seo|social media|content|brand|performance marketing)/i,
    questions: [
      ["Marketing experience", "Please walk me through your marketing experience and the campaigns or channels you have managed."],
      ["Strategy", "How do you turn a business goal into a practical marketing plan?"],
      ["Campaign execution", "Tell me about a campaign you worked on. What did you do, and what result did it achieve?"],
      ["Measurement", "Which marketing metrics do you use to decide whether a campaign is working?"],
      ["Optimization", "Describe a campaign that was not performing well. How did you diagnose the problem and improve it?"],
      ["Content & audience", "How do you adapt a message for different audiences or channels?"],
      ["Priorities", "How do you balance several campaigns, deadlines, and stakeholder requests at the same time?"],
      ["Role fit", "Why are you a strong fit for this marketing role, and what would you aim to achieve in your first 90 days?"],
    ],
  },
  {
    match: /(customer service|customer support|bpo|call center|voice|non.?voice|support executive|client support)/i,
    questions: [
      ["Customer service", "Please describe your customer service or support experience and the type of customers you have handled."],
      ["Difficult customer", "Tell me about a difficult customer interaction. How did you calm the situation and reach a useful outcome?"],
      ["Communication", "How do you make sure a customer understands your explanation when they are confused or frustrated?"],
      ["Problem solving", "Describe a customer issue that was not straightforward. How did you investigate it and resolve it?"],
      ["Prioritization", "How do you manage several customer requests when many of them appear urgent?"],
      ["Quality", "What does good customer service mean to you, and how do you measure whether you are delivering it?"],
      ["Teamwork", "Tell me about a time you worked with another team to resolve a customer problem."],
      ["Role fit", "Why are you a strong fit for this support role, and what value would you aim to deliver in your first 90 days?"],
    ],
  },
];

const GENERAL_PLAN = [
  ["Introduction", "Please introduce yourself, summarize your professional background, and tell me why you are interested in this role."],
  ["Role knowledge", "What is the most important skill for this role, and how have you used that skill in a real work situation?"],
  ["Problem solving", "Tell me about a difficult problem you solved. How did you identify the cause, what did you do, and what was the result?"],
  ["Communication", "Tell me about a time you had to explain a complex task or idea to someone who was not familiar with it."],
  ["Teamwork", "Describe a time you had a disagreement with a teammate or stakeholder. How did you handle it?"],
  ["Ownership", "Tell me about a task or project where you took ownership from start to finish. What did you achieve?"],
  ["Priorities", "How do you decide what to work on first when you have multiple deadlines and changing priorities?"],
  ["Role fit", "What makes you a strong fit for this role, and what value would you aim to deliver in your first 90 days?"],
];

const pickRolePlan = (jobTitle = "") => {
  const title = String(jobTitle || "").trim();
  const bank = ROLE_BANKS.find((item) => item.match.test(title));
  const source = bank?.questions || GENERAL_PLAN;
  return source.map(([category, prompt]) => ({ category, prompt }));
};

const buildSystemPrompt = (ctx) => `You are Recruweb's professional AI interviewer.
Conduct a structured 8-question interview for "${ctx.jobTitle || "the role"}" with "${ctx.candidateName || "the candidate"}".
Ask one primary question at a time. The persisted question plan is authoritative:
${(ctx.questionPlan || GENERAL_PLAN).map((q, i) => `${i + 1}. [${q.category}] ${q.prompt}`).join("\n")}
Current question number: ${(ctx.questionIndex || 0) + 1}.
If the candidate asks you to repeat, clarify, rephrase, or give a neutral example, keep the SAME question active. Do not evaluate that request as an answer and do not advance.
Only advance after a meaningful candidate answer or an explicit confirmed skip.
Never reveal scoring criteria or coach the candidate toward an answer.`;

const clamp = (value, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Number(value) || 0));

const fallbackEvaluation = (answer, category = "") => {
  const text = String(answer || "").trim();
  const words = text.split(/\s+/).filter(Boolean);
  const lower = text.toLowerCase();
  const detail = Math.min(35, Math.round(words.length * 0.45));
  const example = /(example|project|client|customer|result|achieved|implemented|resolved|experience|because|therefore)/i.test(text) ? 20 : 0;
  const structure = /(first|then|next|finally|situation|task|action|result|step)/i.test(text) ? 15 : 0;
  const communication = clamp(35 + detail + (words.length >= 35 ? 15 : 0) + (/[.!?]/.test(text) ? 5 : 0));
  const skills = clamp(30 + detail + example + structure);
  const technical = /technical|software|finance|marketing|sales|support|situational|problem solving/i.test(category)
    ? clamp(30 + detail + example + (/(api|database|sql|javascript|python|system|debug|testing|process|workflow|security|server|software|tool|customer|client|recruit|hiring|campaign|revenue)/i.test(lower) ? 20 : 0))
    : clamp(45 + example + Math.round(detail * 0.5));
  const score = Math.round((communication * 0.35 + skills * 0.4 + technical * 0.25) * 10) / 10;
  return {
    score,
    skills: Math.round(skills),
    communication: Math.round(communication),
    technical: Math.round(technical),
    relevance: Math.round(skills),
    clarity: Math.round(communication),
    depth: Math.round((skills + technical) / 2),
    evidence: example ? 80 : 35,
    note: "Browser transcript was evaluated with the structured fallback evaluator.",
  };
};

const scoreAnswer = async (ctx, answer, question) => {
  try {
    const raw = await groqChat({
      system:
        'You are a strict, fair interview evaluator. Return ONLY JSON with keys: ' +
        '{"score":0-100,"skills":0-100,"communication":0-100,"technical":0-100,' +
        '"relevance":0-100,"clarity":0-100,"depth":0-100,"evidence":0-100,"note":"short note"}. ' +
        "Judge only the candidate's actual answer. Do not invent experience. " +
        "A response is an answer if it meaningfully attempts the question; do not require a perfect or keyword-matching answer to advance.",
      messages: [{
        role: "user",
        content: `Target role: ${ctx.jobTitle || "General"}\nCategory: ${question?.category || "General"}\nQuestion: ${question?.prompt || ""}\nCandidate answer: ${answer}`,
      }],
      maxTokens: 240,
      temperature: 0.15,
      json: true,
    });
    const p = JSON.parse(raw);
    return {
      score: Math.round(clamp(p.score) * 10) / 10,
      skills: Math.round(clamp(p.skills)),
      communication: Math.round(clamp(p.communication)),
      technical: Math.round(clamp(p.technical)),
      relevance: Math.round(clamp(p.relevance)),
      clarity: Math.round(clamp(p.clarity)),
      depth: Math.round(clamp(p.depth)),
      evidence: Math.round(clamp(p.evidence)),
      note: String(p.note || ""),
    };
  } catch {
    return fallbackEvaluation(answer, question?.category);
  }
};

const normalize = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

const detectIntent = (answer) => {
  const text = normalize(answer);
  if (!text) return "empty";

  // Keep explicit repeat/clarification requests out of answer scoring.
  if (
    /\b(can|could|would|will)\s+you\s+(please\s+)?(repeat|say that again|ask that again)\b/.test(text) ||
    /\b(please\s+)?repeat(?:\s+the)?\s+question\b/.test(text) ||
    /\brepeat\s+(it|that|again|question)\b/.test(text) ||
    /\b(ask|say)\s+(it|that|the question)\s+again\b/.test(text) ||
    /\b(can|could)\s+you\s+ask\s+(the\s+question\s+)?again\b/.test(text) ||
    /\b(i\s+didn'?t|i\s+did not)\s+(hear|understand|get)\b/.test(text) ||
    /^again[.!?]*$/.test(text) ||
    /^repeat[.!?]*$/.test(text) ||
    /^question[.!?]*again$/.test(text)
  ) return "repeat";

  if (
    /\b(i\s+(do not|don't|did not|didn't)\s+understand)\b/.test(text) ||
    /\bwhat\s+do\s+you\s+mean\b/.test(text) ||
    /\bcan\s+you\s+(explain|clarify|rephrase)\b/.test(text) ||
    /\bcould\s+you\s+(explain|clarify|rephrase)\b/.test(text) ||
    /\b(in|with)\s+(simpler|simple)\s+(words|language)\b/.test(text)
  ) return "clarification";

  if (/\b(can|could|would)\s+you\s+(give|provide)\s+(me\s+)?an?\s+example\b/.test(text) || /\bwhat kind of example\b/.test(text)) {
    return "example";
  }

  if (/\b(skip|next question|move to the next question)\b/.test(text) && text.split(/\s+/).length <= 12) {
    return "skip";
  }

  return "answer";
};

const clarificationResponse = (question, kind, count) => {
  const prompt = question?.prompt || "";
  if (kind === "repeat") {
    return `Of course. I'll repeat the question once: ${prompt}`;
  }
  if (kind === "example") {
    return `Sure. I'm asking you to describe a real situation related to this question and explain what you personally did and what happened as a result. The question is: ${prompt}`;
  }
  if (count >= 2) {
    return `No problem. Let me make it even simpler. In practical terms, I'm asking: ${prompt}`;
  }
  return `No problem. Let me rephrase it more simply. ${prompt}`;
};

export const getInterviewPlan = (jobTitle = "") => pickRolePlan(jobTitle);

export const startNovaInterview = async ({ candidateName, jobTitle }) => {
  const plan = getInterviewPlan(jobTitle);
  const ctx = { candidateName, jobTitle, questionPlan: plan, questionIndex: 0 };
  let greeting = `Hello ${candidateName || "there"}, welcome to your Recruweb interview. I’ll be conducting your interview today for the ${jobTitle || "role"} position. Please answer naturally and take your time. If you do not understand a question, you can ask me to repeat or explain it. I’ll wait for your answer before moving to the next question.`;
  try {
    const generated = await groqChat({
      system: buildSystemPrompt(ctx),
      messages: [{
        role: "user",
        content: `Give a warm, concise spoken welcome for the candidate. Say that you are their Recruweb AI interviewer, mention the target role, explain that they can ask to repeat or clarify a question, and say that you will move forward only after their answer. Do not ask the first question yet.`,
      }],
      maxTokens: 150,
      temperature: 0.35,
    });
    if (generated?.trim()) greeting = generated.trim();
  } catch {}
  return {
    greeting,
    firstQuestion: plan[0].prompt,
    phase: "core",
    questionPlan: plan,
  };
};

export const processNovaAnswer = async (ctx, answer, { timedOut = false, timeoutReason = "max_time" } = {}) => {
  const plan = ctx.questionPlan?.length ? ctx.questionPlan : getInterviewPlan(ctx.jobTitle);
  const idx = Number(ctx.questionIndex || 0);
  const question = plan[idx];
  const safeAnswer = String(answer || "").trim();
  const intent = detectIntent(safeAnswer);

  // Conversation intents are never scored and never advance questionIndex.
  if (["repeat", "clarification", "example"].includes(intent)) {
    const previousClarifications = (ctx.transcript || []).filter(
      (item) => item.role === "candidate" && item.intent && ["repeat", "clarification", "example"].includes(item.intent) && Number(item.questionIndex) === idx,
    ).length;
    const response = clarificationResponse(question, intent, previousClarifications + 1);
    const now = new Date().toISOString();
    return {
      phase: "core",
      phaseTurns: ctx.phaseTurns || idx,
      turns: ctx.turns || 0,
      questionIndex: idx,
      questionPlan: plan,
      questionStartedAt: ctx.questionStartedAt || new Date(),
      transcript: [
        ...(ctx.transcript || []),
        { role: "candidate", content: safeAnswer, intent, questionIndex: idx, timestamp: now },
        { role: "robot", content: response, intent, questionIndex: idx, category: question?.category, timestamp: now },
      ],
      scores: ctx.scores || [],
      answerEvaluations: ctx.answerEvaluations || [],
      askedQuestions: ctx.askedQuestions || [],
      action: intent === "repeat" ? "repeat_question" : "clarify_question",
      response,
      done: false,
      advance: false,
      intent,
      evaluationSummary: ctx.evaluationSummary || null,
      aiRecommendation: null,
    };
  }

  if (intent === "skip") {
    const now = new Date().toISOString();
    const response = `Okay, we'll skip this question and continue.`;
    const skipped = {
      questionIndex: idx,
      category: question?.category,
      question: question?.prompt,
      answer: "",
      skipped: true,
      score: null,
      timedOut: false,
    };
    const answers = [...(ctx.answerEvaluations || []), skipped];
    const nextIndex = idx + 1;
    if (nextIndex >= plan.length) {
      return {
        phase: "closing",
        phaseTurns: nextIndex,
        turns: (ctx.turns || 0) + 1,
        questionIndex: nextIndex,
        questionPlan: plan,
        transcript: [...(ctx.transcript || []), { role: "candidate", content: safeAnswer, intent, questionIndex: idx, timestamp: now }, { role: "robot", content: response, timestamp: now }],
        scores: ctx.scores || [],
        answerEvaluations: answers,
        askedQuestions: ctx.askedQuestions || [],
        action: "conclude",
        response,
        done: true,
        advance: true,
        avgScore: ctx.scores?.length ? Math.round((ctx.scores.reduce((a,b)=>a+b,0)/ctx.scores.length)*10)/10 : 0,
        evaluationSummary: { totalQuestions: plan.length, answeredQuestions: answers.filter(a => a.answer).length, timedOutQuestions: 0 },
        aiRecommendation: "REVIEW",
      };
    }
    const nextQuestion = plan[nextIndex];
    return {
      phase: "core",
      phaseTurns: nextIndex,
      turns: (ctx.turns || 0) + 1,
      questionIndex: nextIndex,
      questionPlan: plan,
      questionStartedAt: new Date(),
      transcript: [...(ctx.transcript || []), { role: "candidate", content: safeAnswer, intent, questionIndex: idx, timestamp: now }, { role: "robot", content: response, timestamp: now }, { role: "robot", content: nextQuestion.prompt, category: nextQuestion.category, questionIndex: nextIndex, timestamp: now }],
      scores: ctx.scores || [],
      answerEvaluations: answers,
      askedQuestions: [...(ctx.askedQuestions || []), nextQuestion.prompt],
      action: "skip_question",
      response: `${response} ${nextQuestion.prompt}`,
      done: false,
      advance: true,
      evaluationSummary: null,
      aiRecommendation: null,
    };
  }

  // Any meaningful non-conversational response is treated as an answer.
  // Correctness affects the score, not whether the interview advances.
  const transcript = [...(ctx.transcript || []), {
    role: "candidate",
    content: safeAnswer || (timeoutReason === "silence_timeout" ? "[No answer provided]" : "[No answer provided]"),
    intent: "answer",
    category: question?.category,
    questionIndex: idx,
    timedOut,
    timeoutReason: timedOut ? timeoutReason : null,
    timestamp: new Date().toISOString(),
  }];

  const feedback = safeAnswer
    ? await scoreAnswer(ctx, safeAnswer, question)
    : {
        score: 0, skills: 0, communication: 0, technical: 0,
        relevance: 0, clarity: 0, depth: 0, evidence: 0,
        note: "No answer was received before the configured time limit.",
      };

  const scores = [...(ctx.scores || []), feedback.score];
  const answers = [...(ctx.answerEvaluations || []), {
    questionIndex: idx,
    category: question?.category,
    question: question?.prompt,
    answer: safeAnswer,
    timedOut,
    skipped: false,
    ...feedback,
  }];

  const nextIndex = idx + 1;
  if (nextIndex >= plan.length) {
    const avg = Math.round((scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1)) * 10) / 10;
    const avgOf = (key) => Math.round(
      (answers.reduce((sum, item) => sum + Number(item[key] || 0), 0) / Math.max(answers.length, 1)) * 10
    ) / 10;
    const evaluationSummary = {
      skills: avgOf("skills"),
      communication: avgOf("communication"),
      technical: avgOf("technical"),
      overall: avg,
      answeredQuestions: answers.filter((a) => a.answer).length,
      timedOutQuestions: answers.filter((a) => a.timedOut).length,
      totalQuestions: plan.length,
    };
    const closing = "Thank you. That completes your interview. Your responses have been recorded successfully. Please wait for the results while the hiring team reviews your responses.";
    return {
      phase: "closing",
      phaseTurns: 0,
      turns: (ctx.turns || 0) + 1,
      questionIndex: nextIndex,
      questionPlan: plan,
      transcript: [...transcript, { role: "robot", content: closing, timestamp: new Date().toISOString() }],
      scores,
      answerEvaluations: answers,
      askedQuestions: [...(ctx.askedQuestions || []), question?.prompt].filter(Boolean),
      action: "conclude",
      response: closing,
      score: feedback.score,
      done: true,
      advance: true,
      avgScore: avg,
      evaluationSummary,
      aiRecommendation: avg >= 60 ? "PASS" : "FAIL",
    };
  }

  const nextQuestion = plan[nextIndex];
  const response = nextQuestion.prompt;
  return {
    phase: "core",
    phaseTurns: nextIndex,
    turns: (ctx.turns || 0) + 1,
    questionIndex: nextIndex,
    questionPlan: plan,
    questionStartedAt: new Date(),
    transcript: [...transcript, {
      role: "robot",
      content: response,
      category: nextQuestion.category,
      questionIndex: nextIndex,
      timestamp: new Date().toISOString(),
    }],
    scores,
    answerEvaluations: answers,
    askedQuestions: [...(ctx.askedQuestions || []), question?.prompt].filter(Boolean),
    action: "ask_question",
    response,
    score: feedback.score,
    done: false,
    advance: true,
    evaluationSummary: null,
    aiRecommendation: null,
  };
};

export { scoreAnswer };
