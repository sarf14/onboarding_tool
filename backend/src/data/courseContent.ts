// Course content organized by sections (self-paced)
import { pageContent, pageUrls } from './pageContent';

export const courseContent = {
  section1: {
    title: "Foundation & Error Categorization",
    description: "Learn the fundamentals of annotation, understand error types, and master the EC Example Library",
    estimatedDuration: "6-7 hours",
    topics: [
      "Welcome & Overview",
      "What You Will Do (Role as Annotator)",
      "Understanding Model Trajectories",
      "The Annotation Process Overview",
      "Why Read the EC Example Library",
      "Error Categories Overview",
      "Prompt Errors",
      "Incorrect/Missed Model Actions",
      "Incorrect/Missed Model Thoughts",
      "Output Errors",
      "Infrastructure Errors (Non-Model Fault)",
      "Tool Errors",
      "Error Identification Techniques"
    ],
    activities: [
      {
        name: "Read: Page 1 content - What You Will Do",
        type: "read",
        content: pageContent[1],
        pageUrl: pageUrls[1],
        pageNumber: 1
      },
      {
        name: "Read: Page 2 content - Reading the Error Categorization Doc",
        type: "read",
        content: pageContent[2],
        pageUrl: pageUrls[2],
        pageNumber: 2
      },
      {
        name: "Read: EC Example Library Document (Part 1) - Prompt Errors & Model Actions",
        type: "read",
        content: `Read Part 1 of the EC Example Library Document focusing on:

• Prompt Errors - Understanding how to identify errors related to prompt interpretation and requirements
• Incorrect/Missed Model Actions - Learning to recognize when the model takes wrong actions or fails to take required actions

This section covers definitions, key points to check before marking, and examples of correct and incorrect cases for these error types. Focus on understanding how to identify and categorize Prompt Errors and Model Action errors correctly during annotation.

Document Link: https://docs.google.com/document/d/1DoA-BXK5q4Mi7iM_E50_kP09q0LuIchI/edit`,
        pageUrl: "https://docs.google.com/document/d/1DoA-BXK5q4Mi7iM_E50_kP09q0LuIchI/edit",
        pageNumber: null
      },
      {
        name: "Watch: Introduction materials",
        type: "watch",
        content: "Watch introduction videos to understand the annotation process and platforms.",
        pageUrl: null,
        pageNumber: null
      },
      {
        name: "Read: EC Example Library Document (Part 2) - Model Thoughts, Output, Infrastructure & Tool Errors",
        type: "read",
        content: `Continue reading Part 2 of the EC Example Library Document focusing on:

• Incorrect/Missed Model Thoughts - Understanding errors in the model's reasoning and thought process
• Output Errors - Learning to identify errors in the final output or results
• Infrastructure Errors (Non-Model Fault) - Recognizing errors caused by external factors, not the model itself
• Tool Errors - Understanding errors related to tool usage and functionality

This section covers definitions, key points to check before marking, and examples of correct and incorrect cases for these advanced error types. Focus on understanding how to identify and categorize these error types correctly during annotation.

Document Link: https://docs.google.com/document/d/1aPI7fuT-rmNlH56MNq9Npvt-gv8xY0vb/edit`,
        pageUrl: "https://docs.google.com/document/d/1aPI7fuT-rmNlH56MNq9Npvt-gv8xY0vb/edit",
        pageNumber: null
      }
    ],
    videoUrl: "https://drive.google.com/file/d/1fjbC8MeyBfmUL5ZWofzoR-UXbmSgWEo6/view",
    videoEmbedUrl: "https://drive.google.com/file/d/1fjbC8MeyBfmUL5ZWofzoR-UXbmSgWEo6/preview",
    documents: [
      {
        name: "EC Example Library Document (Part 1) - Prompt Errors & Model Actions",
        url: "https://docs.google.com/document/d/1DoA-BXK5q4Mi7iM_E50_kP09q0LuIchI/edit",
        type: "document"
      },
      {
        name: "EC Example Library Document (Part 2) - Model Thoughts, Output, Infrastructure & Tool Errors",
        url: "https://docs.google.com/document/d/1aPI7fuT-rmNlH56MNq9Npvt-gv8xY0vb/edit",
        type: "document"
      }
    ],
    hasQuiz: true
  },
  section2: {
    title: "Task Status & Critical Error",
    description: "Master task status definitions and learn to identify critical errors that cause task failure",
    estimatedDuration: "6-7 hours",
    topics: [
      "Understanding the Four Possible Cases",
      "Success: Definition and Criteria",
      "Failure: Definition and Criteria",
      "Cannot Be Determined: When and Why",
      "Accidental Success: Identifying and Marking",
      "Writing Task Status Explanations",
      "What is Critical Error?",
      "Critical Error vs Primary Error",
      "Root Cause Analysis",
      "Identifying the Main Mistake",
      "Writing Critical Error Explanations",
      "Critical Error Examples"
    ],
    activities: [
      {
        name: "Read: Page 3 content - Cases",
        type: "read",
        content: pageContent[3],
        pageUrl: pageUrls[3],
        pageNumber: 3
      },
      {
        name: "Read: Page 4 content - Task Status Definitions",
        type: "read",
        content: pageContent[4],
        pageUrl: pageUrls[4],
        pageNumber: 4
      },
      {
        name: "Study: Task Status Definitions table",
        type: "study",
        content: `Study the Task Status Definitions table to understand Success, Failure, Accidental Success, and Cannot Be Determined cases.

Review the table that shows:
- Task Status categories and their definitions
- Efficient ways of writing status explanations for each category
- Key points to include when documenting task status

Focus on understanding when to use each status and how to write clear, comprehensive explanations.`,
        pageUrl: pageUrls[4],
        pageNumber: 4,
        imageUrl: "/task-status-definitions-table.png"
      },
      {
        name: "Practice: Determining task status from examples",
        type: "practice",
        content: `Practice determining task status from provided examples. Apply the definitions you've learned to evaluate different scenarios.

Access the practice spreadsheet and solve the tasks:
https://docs.google.com/spreadsheets/d/1J_PGSEpwnoQdRkijG2pKXWOP5BBhKRp0HKFEVZAt-cQ/edit?gid=802472771#gid=802472771

For each task in the spreadsheet:
- Determine the task status (Success, Failure, Accidental Success, or Cannot Be Determined)
- Write a clear explanation following the guidelines from the Task Status Definitions table
- Use the efficient way of writing status explanations as shown in the table`,
        pageUrl: "https://docs.google.com/spreadsheets/d/1J_PGSEpwnoQdRkijG2pKXWOP5BBhKRp0HKFEVZAt-cQ/edit?gid=802472771#gid=802472771",
        pageNumber: null
      },
      {
        name: "Study: How to Write Critical and Step Errors",
        type: "study",
        content: `Study how to write critical and step errors correctly.

Review the Error Categorization Notes format which shows:
- How to identify Critical Errors (Early Stopping, Dissatisfactory Output)
- How to document Other Errors (Bot Detection, Time Misunderstanding, etc.)
- The proper format for writing error explanations
- How to reference specific steps where errors occurred

Key points:
- Critical errors are the main mistakes that caused task failure
- Step errors are other errors that occurred but weren't the primary cause
- Always reference the specific step numbers where errors occurred
- Provide clear explanations of what went wrong and why it matters`,
        pageUrl: null,
        pageNumber: null,
        imageUrl: "/error-categorization-notes.png"
      },
      {
        name: "Practice: Finding critical errors in sample trajectories",
        type: "practice",
        content: `Practice finding critical errors in sample trajectories. Learn to identify the root cause of failure, not just symptoms.

Access the practice spreadsheet and solve the tasks:
https://docs.google.com/spreadsheets/d/1J_PGSEpwnoQdRkijG2pKXWOP5BBhKRp0HKFEVZAt-cQ/edit?gid=802472771#gid=802472771

For each task in the spreadsheet:
- Identify the critical error (the main mistake that caused failure)
- Document any other errors that occurred
- Write clear explanations following the format you learned
- Reference specific step numbers where errors occurred`,
        pageUrl: "https://docs.google.com/spreadsheets/d/1J_PGSEpwnoQdRkijG2pKXWOP5BBhKRp0HKFEVZAt-cQ/edit?gid=802472771#gid=802472771",
        pageNumber: null
      }
    ],
    documents: [],
    hasQuiz: true
  },
  section3: {
    title: "Trajectory Status, AutoEval & Workflow",
    description: "Understand trajectory status marking, AutoEval system, and the complete annotation workflow",
    estimatedDuration: "6-7 hours",
    topics: [
      "Understanding Trajectory Status",
      "Trajectory Status Marking Rules",
      "Relationship between Task Status and Trajectory Status",
      "When to Mark Trajectory as Success vs Failure",
      "AutoEval System Overview",
      "How AutoEval Works",
      "AutoEval Limitations",
      "When to Override AutoEval",
      "Complete Annotation Flow",
      "From Prompt to Final Evaluation",
      "Step-by-Step Review Process",
      "How Everything Works Together",
      "Practical Workflow Walkthrough"
    ],
    activities: [
      {
        name: "Read: Trajectory Status & AutoEval",
        type: "read",
        content: `${pageContent[6]}

${pageContent[7]}`,
        pageUrl: "https://autonex-onboard.vercel.app/OnboardingDoc",
        pageNumber: null
      },
      {
        name: "Read: Autoeval EC (AE EC) Library document",
        type: "read",
        content: "Read the Autoeval EC (AE EC) Library document to understand AutoEval error categorization.",
        pageUrl: "https://docs.google.com/document/d/1-LP9bhZb-kuQ9fyNKczHb9jhhAK9HrMY/edit#heading=h.wkvsm04l11ir",
        pageNumber: null
      },
      {
        name: "Study: Trajectory Status decision tree",
        type: "study",
        content: `${pageContent[6]}

${pageContent[7]}

Study the trajectory status decision tree and AutoEval system to understand when to mark trajectories as success or failure, and how AutoEval assists in the evaluation process.`,
        pageUrl: "https://autonex-onboard.vercel.app/OnboardingDoc",
        pageNumber: null
      },
      {
        name: "Practice: Determining trajectory status",
        type: "practice",
        content: `Practice determining trajectory status from provided examples.

Access the practice spreadsheet and solve the tasks:
https://docs.google.com/spreadsheets/d/1J_PGSEpwnoQdRkijG2pKXWOP5BBhKRp0HKFEVZAt-cQ/edit?gid=802472771#gid=802472771

For each task in the spreadsheet:
- Determine the trajectory status based on the task status and where the critical error occurred
- Apply the trajectory status marking rules you learned
- Provide clear explanations for your decisions`,
        pageUrl: "https://docs.google.com/spreadsheets/d/1J_PGSEpwnoQdRkijG2pKXWOP5BBhKRp0HKFEVZAt-cQ/edit?gid=802472771#gid=802472771",
        pageNumber: null
      },
      {
        name: "Watch: QC Reviewing Process & Tracking Critical Error",
        type: "watch",
        content: `Watch these videos to understand the QC reviewing process and how to track critical errors in trajectories.

Video 1: Autonex QC Reviewing Process
https://drive.google.com/file/d/1M2xoiXDG30jI_BhO0CfaWRVJVxkPJWl3/view?t=79

Video 2: Tracking the Critical Error
https://drive.google.com/file/d/1UqiPQ-0NCNB3ba3g5emssNltapH5Op0j/view`,
        pageUrl: null,
        pageNumber: null,
        videoUrl: "https://drive.google.com/file/d/1M2xoiXDG30jI_BhO0CfaWRVJVxkPJWl3/view?t=79",
        videoEmbedUrl: "https://drive.google.com/file/d/1M2xoiXDG30jI_BhO0CfaWRVJVxkPJWl3/preview",
        videoUrl2: "https://drive.google.com/file/d/1UqiPQ-0NCNB3ba3g5emssNltapH5Op0j/view",
        videoEmbedUrl2: "https://drive.google.com/file/d/1UqiPQ-0NCNB3ba3g5emssNltapH5Op0j/preview"
      },
      {
        name: "Practice: Complete annotation workflow",
        type: "practice",
        content: `Practice following the complete annotation flow from prompt to final evaluation.

Access the practice spreadsheet and solve the tasks:
https://docs.google.com/spreadsheets/d/1nfn_fUZ1j2I-NSeglz6f5yhgiyC4sHuFP_xa7qHXQBw/edit?gid=1163692311#gid=1163692311

For each task in the spreadsheet:
- Review the trajectory
- Identify errors and mark the critical error
- Determine task status and trajectory status
- Complete the annotation workflow`,
        pageUrl: "https://docs.google.com/spreadsheets/d/1nfn_fUZ1j2I-NSeglz6f5yhgiyC4sHuFP_xa7qHXQBw/edit?gid=1163692311#gid=1163692311",
        pageNumber: null
      }
    ],
    documents: [
      {
        name: "Autoeval EC (AE EC) Library",
        url: "https://docs.google.com/document/d/1-LP9bhZb-kuQ9fyNKczHb9jhhAK9HrMY/edit#heading=h.wkvsm04l11ir",
        type: "document"
      }
    ],
    hasQuiz: true
  },
  section4: {
    title: "H2H (Head-to-Head) Evaluation",
    description: "Learn to compare two AI model outputs and determine which performs better from a user's perspective",
    estimatedDuration: "6-7 hours",
    topics: [
      "What is H2H Evaluation",
      "Process vs Outcome Evaluation",
      "Outcome Evaluation Categories",
      "Key Results vs Supplementary Information",
      "Process Evaluation Guidelines",
      "Common Process Errors",
      "Note Format & Reasoning Structure",
      "Neutral vs Unsure Classification",
      "Persistence & Efficiency Guidelines",
      "Common Errors and Pitfalls",
      "Golden Set & Calibration",
      "Best Practices for H2H Review"
    ],
    activities: [
      {
        name: "Read: What is H2H Evaluation",
        type: "read",
        content: `H2H Evaluation (Head-to-Head Evaluation) compares two AI model outputs for the same prompt to determine which performs better from a user's perspective.

The comparison happens along two main dimensions:
1. Process - How the model executes the task (its step-by-step reasoning or trajectory).
2. Outcome - The quality, accuracy, and usefulness of the final result (the task output).

Annotators classify each comparison into one of six categories:
• A Strongly
• A Slightly
• Neutral
• B Slightly
• B Strongly
• Unsure

Definitions:
• Neutral: Both models are equally effective, or differences are too small to impact the user task.
• Unsure: The comparison cannot be made fairly due to non-model-related issues (e.g., infrastructure errors, bad prompts, or tool failures).

H2H is about comparing two models (A vs B) on Process and Outcome.`,
        pageUrl: "https://autonex-onboard.vercel.app/OnboardingDoc",
        pageNumber: null
      },
      {
        name: "Read: Outcome Evaluation",
        type: "read",
        content: `Outcome evaluation compares the final outputs produced by the models.
Annotators should divide each output into three parts to identify what type of difference matters.

Categories of Output Information:
• Key Results: Core information directly tied to the task's main intent and explicit requirements.
→ Meaningful errors or omissions → Strongly classification
• Supplementary Information: Relevant, accurate, and useful additional details.
→ Minor missing or added information → Slightly classification
• Cosmetic Differences: Formatting, layout, or tone.
→ Do not count unless they affect meaning.

Focus on What Matters:
• Consider user impact: would the difference meaningfully change the user's experience or understanding?
• Cosmetic differences such as emojis, spacing, or stylistic phrasing should not influence outcome preference.
• Do Not Count: Differences like emojis, spacing, tone, or presentation.

Focus on user impact. Key Results = Strong. Supplementary = Slight. Cosmetic = Ignore.`,
        pageUrl: "https://autonex-onboard.vercel.app/OnboardingDoc",
        pageNumber: null
      },
      {
        name: "Read: Process Evaluation",
        type: "read",
        content: `Process evaluation focuses on how each model performs the task — the actions taken, order of steps, and correctness of those actions.

Annotators Should:
• Verify whether both models reached all required pages or steps.
• Note mistakes such as skipped actions, hallucinations, or incorrect filters.
• Reward logical persistence when it helps complete the task.
• Penalize inefficiency only if it causes or results from mistakes.

Common Process Error Types:
• UI Grounding Mistake
• UI Hallucination
• Info Hallucination (visual)
• Temporal Mistake
• Early Stopping or Premature Ending
• Missed Filter or Page Steps

Persistence and Efficiency:
• Reward persistence that helps reach the correct outcome.
• Do not reward irrelevant persistence (e.g., scrolling far beyond the timeframe).
• Longer processes are acceptable if accurate; penalize only when inefficiency stems from mistakes.
• If both models make similar mistakes and one takes more steps → Neutral.

Process is about *how* the model worked. Look for missed steps, errors, or hallucinations.`,
        pageUrl: "https://autonex-onboard.vercel.app/OnboardingDoc",
        pageNumber: null
      },
      {
        name: "Read: Note Format & Neutral vs Unsure",
        type: "read",
        content: `Preferred Note Format:
- Both models did X / did not fulfill key requirements by missing out on...
- Model A fulfilled supplementary requirements by giving information about... but Model B did not.
- Model A committed X error in Y step but Model B did not.
- Always include step numbers and error types (e.g., Step 3: UI Grounding Error).

Example:
- In terms of key requirements, both models... failed to apply the "most recent" filter...
- In terms of supplementary information, Model A made time misunderstanding errors in steps 45 and 39...
- This led to temporal mislabeling in the output as well.
- Hence, Model B is slightly preferred as compared to Model A.

---

Neutral vs. Unsure:

Neutral:
Use when both models:
• Produce similar key and supplementary information, or
• Have differences too minor to affect user satisfaction.

Unsure:
Use when the comparison is invalid because of issues outside model control, such as:
• Bad or unclear prompts
• Cases where Tool error is critical (e.g., read_text_and_links failure)
• Infrastructure issues (timeouts, unresponsive sites)
Example: "Infrastructure failure - website timeout, bot issue, run crash"

Always use specific step numbers and error types in your reasoning. 'Neutral' and 'Unsure' are not the same.`,
        pageUrl: "https://autonex-onboard.vercel.app/OnboardingDoc",
        pageNumber: null
      },
      {
        name: "Read: Persistence & Common Errors",
        type: "read",
        content: `Persistence and Efficiency Guidelines:
• Reward persistence when logical and directed at task completion.
• Do not reward persistence that goes beyond scope or repeats actions unnecessarily.
• Longer but correct trajectories should not be penalized.
• If both processes make similar errors but differ only in length → mark Neutral.

Common Errors and Pitfalls:
• Process: Preferring shorter trajectory blindly.
→ Correct: Only penalize inefficiency tied to mistakes.
• Process: Missing step numbers.
→ Correct: Always include step numbers and specify error types.
• Outcome: Over-weighting cosmetic differences.
→ Correct: Ignore formatting, emojis, or tone.
• Outcome: Vague reasoning ("A had more info").
→ Correct: Specify what information made the difference.
• All: Annotating wrong model.
→ Correct: Ensure reasoning matches selected preference.

Don't penalize a model just for being longer. Only penalize inefficiency that comes from mistakes.`,
        pageUrl: "https://autonex-onboard.vercel.app/OnboardingDoc",
        pageNumber: null
      },
      {
        name: "Read: Golden Set & Best Practices",
        type: "read",
        content: `Golden Set and Calibration:
A Golden Set of H2H examples is collected weekly to ensure consistency and quality.
Each batch should include:
• Both Process and Outcome annotations
• Examples of Neutral, Slightly, and Strongly classifications
• Diverse prompts and model comparisons
These serve as the reference for evaluating annotation accuracy and alignment.

Final Notes and Best Practices:
• Always align written reasoning with the selected preference.
• Think from the user's perspective - what difference would they care about?
• Separate Process and Outcome reasoning clearly.
• When in doubt or facing unclear prompts, request clarification early.
• If both models perform identically, select Neutral.
• Use the multi-line reasoning format for clarity and professionalism.
• Avoid vague phrases like "A had more info" — always specify what and why.

Your reasoning must always match your final selection (A/B/Neutral). Think from the user's perspective.`,
        pageUrl: "https://autonex-onboard.vercel.app/OnboardingDoc",
        pageNumber: null
      },
      {
        name: "Study: Quick Reference Guide",
        type: "study",
        content: `Study the H2H Quick Reference Guide:

Classification Summary:
• Strongly (A/B): Major factual or process differences. Focus on Key Results or crucial steps.
• Slightly (A/B): Minor yet meaningful differences. Focus on Supplementary info or small process edge.
• Neutral: Comparable results or equally flawed. User would not notice difference.
• Unsure: Non-model issue (tool/prompt/infrastructure). Invalid comparison.

Example Reasoning Structures:

Process Example:
- In terms of key steps, both models followed similar trajectories.
- However, Model A correctly applied the date and price filters, while Model B missed the date filter entirely.
- Therefore, Model A is slightly better than Model B.

Outcome Example:
- Both outputs address the main task correctly. However, Model B adds detailed supplementary information about product variants, which enhances completeness.
- Therefore, Model B is slightly better than Model A.

Use this summary as a quick check before finalizing your classification.`,
        pageUrl: "https://autonex-onboard.vercel.app/OnboardingDoc",
        pageNumber: null
      },
      {
        name: "Take H2H Evaluation Quiz",
        type: "practice",
        content: "Complete the H2H Evaluation quiz to test your understanding of Process vs Outcome evaluation, classification categories, and best practices.",
        pageUrl: null,
        pageNumber: null
      },
      {
        name: "Practice: H2H Evaluation Tasks",
        type: "practice",
        content: `Practice H2H evaluation on real examples.

Access the practice spreadsheet and complete the H2H evaluation tasks:
https://docs.google.com/spreadsheets/d/1Ak7_D7qkolgRf6RdaJsiDo2egadH6Vh8qf10pt8giE0/edit?gid=983939059#gid=983939059

For each task in the spreadsheet:
- Compare Model A and Model B on Process and Outcome
- Classify as A Strongly, A Slightly, Neutral, B Slightly, B Strongly, or Unsure
- Write clear reasoning following the preferred note format
- Include step numbers and error types in your reasoning
- Think from the user's perspective`,
        pageUrl: "https://docs.google.com/spreadsheets/d/1Ak7_D7qkolgRf6RdaJsiDo2egadH6Vh8qf10pt8giE0/edit?gid=983939059#gid=983939059",
        pageNumber: null
      }
    ],
    documents: [],
    hasQuiz: true
  }
};
