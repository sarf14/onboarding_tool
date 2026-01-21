// Quiz questions for all sections
// IMPORTANT: Each option tests different concepts, not just reworded versions

export const quizzes = {
  section1: {
    title: "Foundation & Error Categorization Quiz",
    questions: [
      {
        id: 1,
        question: "What is your primary role as an annotator?",
        options: [
          "To review model trajectories, identify errors, and mark the main cause of failure",
          "To only check if the final output is correct or incorrect",
          "To count how many steps the model took to complete the task",
          "To verify that all tools were used correctly"
        ],
        correctAnswer: 0,
        explanation: "Your role is to review the entire trajectory of the model, identify where errors happened, and mark the main cause of failure."
      },
      {
        id: 2,
        question: "What is a model trajectory?",
        options: [
          "The step-by-step process of a model's thoughts and actions from start to final output",
          "Only the final output produced by the model",
          "The list of tools the model used during execution",
          "The time it took for the model to complete the task"
        ],
        correctAnswer: 0,
        explanation: "A trajectory is the complete step-by-step process including the model's thoughts (what it plans to do) and actions until it concludes with a final output."
      },
      {
        id: 3,
        question: "Why is accurate annotation important?",
        options: [
          "To ensure models can be improved and retrained based on feedback",
          "To track how fast models complete tasks",
          "To count the number of tools used",
          "To verify internet connectivity during model execution"
        ],
        correctAnswer: 0,
        explanation: "Accurate annotation ensures each model trajectory is evaluated correctly so the model can be improved and retrained."
      },
      {
        id: 4,
        question: "What is the purpose of the EC Example Library?",
        options: [
          "To explain all error types a model can make and help identify errors correctly",
          "To list all the websites a model can visit",
          "To track model execution speed",
          "To store model training data"
        ],
        correctAnswer: 0,
        explanation: "The EC Example Library explains all error types, provides definitions, key points to check, and examples of correct/incorrect cases."
      },
      {
        id: 5,
        question: "What are the main error categories covered in EC Library?",
        options: [
          "Prompt Errors, Model Actions, Model Thoughts, Output Errors, Infrastructure Errors, Tool Errors",
          "Network Errors, Speed Errors, Format Errors, Color Errors",
          "Login Errors, Payment Errors, Search Errors, Display Errors",
          "Time Errors, Date Errors, Location Errors, Language Errors"
        ],
        correctAnswer: 0,
        explanation: "The main error categories include Prompt Errors, Incorrect/Missed Model Actions, Incorrect/Missed Model Thoughts, Output Errors, Infrastructure Errors, and Tool Errors."
      },
      {
        id: 6,
        question: "What are Prompt Errors?",
        options: [
          "Errors related to how the prompt was interpreted or understood",
          "Errors caused by slow internet connection",
          "Errors in the final output formatting",
          "Errors when clicking buttons"
        ],
        correctAnswer: 0,
        explanation: "Prompt Errors are errors related to how the model interpreted or understood the task prompt."
      },
      {
        id: 7,
        question: "Give an example of Incorrect Model Action",
        options: [
          "The model clicked the wrong button",
          "The model took too long to respond",
          "The final output had spelling mistakes",
          "The model used too many tools"
        ],
        correctAnswer: 0,
        explanation: "Incorrect Model Actions include clicking wrong buttons, navigating to wrong pages, or performing actions that don't match the task requirements."
      },
      {
        id: 8,
        question: "What are Missed Model Actions?",
        options: [
          "Actions that the model should have taken but didn't",
          "Actions that took too long to execute",
          "Actions that produced incorrect output",
          "Actions that used the wrong tool"
        ],
        correctAnswer: 0,
        explanation: "Missed Model Actions are required actions that the model should have performed but skipped or didn't complete."
      },
      {
        id: 9,
        question: "What are Incorrect Model Thoughts?",
        options: [
          "When the model's reasoning or planning is wrong",
          "When the model types slowly",
          "When the output format is incorrect",
          "When buttons don't respond to clicks"
        ],
        correctAnswer: 0,
        explanation: "Incorrect Model Thoughts refer to errors in the model's reasoning, planning, or decision-making process."
      },
      {
        id: 10,
        question: "What are Infrastructure Errors?",
        options: [
          "Errors caused by system issues, not the model's fault",
          "Errors in the model's reasoning",
          "Errors in the final output",
          "Errors when clicking buttons"
        ],
        correctAnswer: 0,
        explanation: "Infrastructure Errors (Non-Model Fault Errors) are issues caused by system problems, not the model's actions."
      },
      {
        id: 11,
        question: "What are Tool Errors?",
        options: [
          "Errors related to tool usage, functionality, or tool-related issues",
          "Errors in the model's understanding of the prompt",
          "Errors in the final output formatting",
          "Errors caused by network timeouts"
        ],
        correctAnswer: 0,
        explanation: "Tool Errors are errors related to how tools are used, tool functionality issues, or problems with tool execution."
      },
      {
        id: 12,
        question: "What are Output Errors?",
        options: [
          "Errors in the final output or results produced by the model",
          "Errors in the model's planning phase",
          "Errors when tools fail to execute",
          "Errors caused by system crashes"
        ],
        correctAnswer: 0,
        explanation: "Output Errors are errors in the final output or results produced by the model, such as incorrect summaries, wrong answers, or missing information."
      },
      {
        id: 13,
        question: "What is Thought Verification error?",
        options: [
          "When the model's thoughts/reasoning do not acknowledge or notice previous step errors",
          "When the model clicks buttons too quickly",
          "When the final output has formatting issues",
          "When tools return empty results"
        ],
        correctAnswer: 0,
        explanation: "Thought Verification error occurs when the model's reasoning ignores or does not acknowledge previous step errors, continuing with the same flawed reasoning."
      },
      {
        id: 14,
        question: "When reviewing a model trajectory, what should you focus on?",
        options: [
          "The entire step-by-step process including thoughts and actions",
          "Only whether the final output is correct",
          "Only the number of tools used",
          "Only the time taken to complete"
        ],
        correctAnswer: 0,
        explanation: "You should review the entire trajectory, including all thoughts (what the model planned) and actions (what it did) from start to finish to identify where errors occurred."
      },
      {
        id: 15,
        question: "What should you do before marking an error?",
        options: [
          "Check the key points and definitions from the EC Example Library for that error type",
          "Count how many steps the model took",
          "Check if the internet connection was stable",
          "Verify the model's execution speed"
        ],
        correctAnswer: 0,
        explanation: "Before marking an error, you should check the key points and definitions from the EC Example Library to ensure you're categorizing it correctly."
      },
      {
        id: 16,
        question: "A model incorrectly interprets 'find hotels near the beach' as 'find hotels with beach views'. What type of error is this?",
        options: [
          "Prompt Error",
          "Model Action Error",
          "Output Error",
          "Infrastructure Error"
        ],
        correctAnswer: 0,
        explanation: "This is a Prompt Error - the model misunderstood or misinterpreted the prompt requirements."
      },
      {
        id: 17,
        question: "A model plans to click a button but then clicks a different button instead. What type of error occurred?",
        options: [
          "Incorrect Model Action",
          "Missed Model Action",
          "Prompt Error",
          "Output Error"
        ],
        correctAnswer: 0,
        explanation: "This is an Incorrect Model Action - the model performed a different action than what it planned or what was required."
      },
      {
        id: 18,
        question: "A model's reasoning shows it understood the task correctly, but its final summary contains incorrect information. What is the primary error type?",
        options: [
          "Output Error",
          "Model Thought Error",
          "Prompt Error",
          "Tool Error"
        ],
        correctAnswer: 0,
        explanation: "This is an Output Error - the model's reasoning was correct but the final output contains errors."
      },
      {
        id: 19,
        question: "When should you mark multiple errors in a trajectory?",
        options: [
          "Mark the critical error and other significant errors that occurred, but focus on the root cause",
          "Mark only the first error you find",
          "Mark only errors in the final output",
          "Mark all errors equally without prioritizing"
        ],
        correctAnswer: 0,
        explanation: "You should mark the critical error (root cause) and other significant errors, but always identify which one is the critical error that caused failure."
      },
      {
        id: 20,
        question: "A model encounters a 'site cannot be reached' error due to proxy issues. How should this be categorized?",
        options: [
          "Infrastructure Error (Non-Model Fault)",
          "Model Action Error",
          "Prompt Error",
          "Output Error"
        ],
        correctAnswer: 0,
        explanation: "This is an Infrastructure Error - it's caused by system issues (proxy/network problems), not the model's fault."
      }
    ]
  },
  section2: {
    title: "Task Status & Critical Error Quiz",
    questions: [
      {
        id: 1,
        question: "What are the four possible task status cases?",
        options: [
          "Success, Failure, Cannot Be Determined, Accidental Success",
          "Fast, Slow, Medium, Very Slow",
          "Correct, Incorrect, Partial, Unknown",
          "Complete, Incomplete, Pending, Cancelled"
        ],
        correctAnswer: 0,
        explanation: "The four possible cases are Success, Failure, Cannot Be Determined, and Accidental Success."
      },
      {
        id: 2,
        question: "When should a task be marked as 'Failure'?",
        options: [
          "When the prompt requirements are not met",
          "When the model takes longer than expected",
          "When the model uses many tools",
          "When the output format is different"
        ],
        correctAnswer: 0,
        explanation: "A task should be marked as Failure when the prompt requirements are not met, the output includes incorrect information, or the model couldn't complete the process."
      },
      {
        id: 3,
        question: "What is 'Accidental Success'?",
        options: [
          "When the model returns zero results without thorough research, but zero is correct",
          "When the model completes the task very quickly",
          "When the model uses the correct tools",
          "When the output format matches exactly"
        ],
        correctAnswer: 0,
        explanation: "Accidental Success occurs when the model returns zero results without conducting thorough research, but manual verification confirms zero results are correct."
      },
      {
        id: 4,
        question: "When should 'Cannot Be Determined' be used?",
        options: [
          "When prompt requirements can't be fulfilled due to technical limitations or ambiguity",
          "When the model takes too long",
          "When the output is partially correct",
          "When some tools fail"
        ],
        correctAnswer: 0,
        explanation: "Cannot Be Determined applies when prompts require audio/video interpretation, booking past events, logging into private accounts, or lack sufficient clarity."
      },
      {
        id: 5,
        question: "What is a Critical Error?",
        options: [
          "The main mistake that caused the task to fail",
          "Any error that occurs during execution",
          "Errors in the final output only",
          "Errors that take a long time to fix"
        ],
        correctAnswer: 0,
        explanation: "Critical Error is the main mistake that caused the task to fail - the root cause, not just symptoms."
      },
      {
        id: 6,
        question: "What is the difference between Critical Error and Primary Error?",
        options: [
          "Critical Error is the root cause of failure, Primary Error is any marked error",
          "Critical Error happens first, Primary Error happens last",
          "Critical Error is in thoughts, Primary Error is in actions",
          "Critical Error affects output, Primary Error doesn't"
        ],
        correctAnswer: 0,
        explanation: "Critical Error identifies the root cause of failure, while Primary Error can be any error marked in the trajectory."
      },
      {
        id: 7,
        question: "How should you identify the Critical Error?",
        options: [
          "Trace back to find the root cause that led to failure",
          "Mark the first error you encounter",
          "Mark the error in the final step",
          "Mark all errors equally"
        ],
        correctAnswer: 0,
        explanation: "You should trace back through the trajectory to find the root cause - the specific error that led the model to go wrong."
      },
      {
        id: 8,
        question: "What should a Task Status explanation include?",
        options: [
          "Number of results, how error impacted trajectory, discrepancy with manual verification, conclusive statement",
          "Only whether the task succeeded or failed",
          "Only the number of steps taken",
          "Only the tools used"
        ],
        correctAnswer: 0,
        explanation: "Task Status explanation should include number of results, how errors impacted trajectory, discrepancy with manual verification, and a conclusive statement."
      },
      {
        id: 9,
        question: "A model returns 3 results, but manual verification shows there should be 5 results. The model's summary correctly lists the 3 results it found. What is the task status?",
        options: [
          "Failure - missing results means requirements not met",
          "Success - the model found some results",
          "Cannot Be Determined - unclear requirements",
          "Accidental Success - model got lucky"
        ],
        correctAnswer: 0,
        explanation: "This is Failure - the prompt requirements (finding all available results) are not met. Missing results means the task is incomplete."
      },
      {
        id: 10,
        question: "A model stops searching after finding one result, assuming the task is complete. However, manual verification shows 5 results exist. What is the critical error?",
        options: [
          "Early Stopping (Premature Task Satisfaction)",
          "Prompt Error",
          "Output Format Error",
          "Tool Error"
        ],
        correctAnswer: 0,
        explanation: "This is Early Stopping - the model stopped prematurely assuming the task was complete, when it should have continued searching."
      },
      {
        id: 11,
        question: "When writing a Task Status explanation for Failure, what is the most important element?",
        options: [
          "Clearly explaining how the identified error(s) impacted the trajectory and final output",
          "Listing all tools used",
          "Counting the number of steps",
          "Describing the output format"
        ],
        correctAnswer: 0,
        explanation: "The most important element is explaining how the identified error(s) impacted the trajectory and final output, showing the connection between error and failure."
      },
      {
        id: 12,
        question: "A model searches correctly, finds zero results, and reports zero results. Manual verification confirms zero results are correct. However, the model didn't check all required sources. What is the task status?",
        options: [
          "Accidental Success",
          "Success",
          "Failure",
          "Cannot Be Determined"
        ],
        correctAnswer: 0,
        explanation: "This is Accidental Success - the model returned zero results without thorough research, but zero is correct. The model got lucky."
      }
    ]
  },
  section3: {
    title: "Trajectory Status, AutoEval & Workflow Quiz",
    questions: [
      {
        id: 1,
        question: "What is Trajectory Status?",
        options: [
          "A separate evaluation of whether the trajectory itself was successful or failed",
          "The same as Task Status",
          "A measure of how fast the model executed",
          "A count of tools used"
        ],
        correctAnswer: 0,
        explanation: "Trajectory Status evaluates whether the trajectory (the process) was successful or failed, separate from Task Status."
      },
      {
        id: 2,
        question: "When should a trajectory be marked as Success?",
        options: [
          "When the trajectory followed the correct process and steps",
          "When the final output is correct",
          "When the model used many tools",
          "When execution was fast"
        ],
        correctAnswer: 0,
        explanation: "A trajectory should be marked as Success when it followed the correct process, even if the task status is different."
      },
      {
        id: 3,
        question: "What is AutoEval?",
        options: [
          "An automated system that evaluates trajectories",
          "A tool for testing internet speed",
          "A database for storing outputs",
          "A format for final results"
        ],
        correctAnswer: 0,
        explanation: "AutoEval is an automated system that evaluates model trajectories, but it has limitations and may need override."
      },
      {
        id: 4,
        question: "When should you override AutoEval?",
        options: [
          "When AutoEval's evaluation is incorrect or doesn't match manual verification",
          "Always, because AutoEval is always wrong",
          "Never, AutoEval is always correct",
          "Only when the output format is wrong"
        ],
        correctAnswer: 0,
        explanation: "You should override AutoEval when its evaluation is incorrect, doesn't match manual verification, or misses critical errors."
      },
      {
        id: 5,
        question: "What is the relationship between Task Status and Trajectory Status?",
        options: [
          "They can be different - a trajectory can succeed but task fail, or vice versa",
          "They are always the same",
          "Trajectory Status always determines Task Status",
          "Task Status always determines Trajectory Status"
        ],
        correctAnswer: 0,
        explanation: "Task Status and Trajectory Status can differ - a trajectory can follow correct process (Success) but task can still fail, or trajectory can be flawed but task succeed."
      },
      {
        id: 6,
        question: "What are AutoEval limitations?",
        options: [
          "It may miss nuanced errors, misinterpret context, or fail to identify root causes",
          "It is always 100% accurate",
          "It only works with fast connections",
          "It requires manual input for every step"
        ],
        correctAnswer: 0,
        explanation: "AutoEval may miss nuanced errors, misinterpret context, fail to identify root causes, or not understand complex scenarios."
      },
      {
        id: 7,
        question: "What is the complete annotation workflow?",
        options: [
          "From prompt → model trajectory → review → identify errors → mark status → submit evaluation",
          "Only check final output",
          "Count tools used",
          "Measure execution time"
        ],
        correctAnswer: 0,
        explanation: "The complete workflow includes receiving prompt, reviewing model trajectory, identifying errors, marking task/trajectory status, and submitting evaluation."
      },
      {
        id: 8,
        question: "If Task Status is Failure and the critical error occurred in step 42 (the final step), what should the Trajectory Status be?",
        options: [
          "Success",
          "Failure",
          "Cannot Be Determined",
          "Accidental Success"
        ],
        correctAnswer: 0,
        explanation: "If the critical error is in the last step only (e.g., Summarization Failure or Dissatisfactory Output), Trajectory Status should be Success - the process was correct."
      },
      {
        id: 9,
        question: "If Task Status is Failure and the critical error occurred in step 15 (middle of trajectory), what should the Trajectory Status be?",
        options: [
          "Failure",
          "Success",
          "Cannot Be Determined",
          "Accidental Success"
        ],
        correctAnswer: 0,
        explanation: "If the critical error occurs in the middle or earlier part of the trajectory (not the final step), Trajectory Status should be Failure."
      },
      {
        id: 10,
        question: "AutoEval marks a trajectory as Success, but you find a critical error in step 20 that caused failure. What should you do?",
        options: [
          "Override AutoEval, mark as Failure, and provide clear reasoning",
          "Accept AutoEval's evaluation",
          "Mark as Success anyway",
          "Skip evaluation"
        ],
        correctAnswer: 0,
        explanation: "You must override AutoEval when it's incorrect. Mark the trajectory correctly and provide clear reasoning for your decision."
      },
      {
        id: 11,
        question: "What is the key difference between Task Status and Trajectory Status?",
        options: [
          "Task Status evaluates the final output, Trajectory Status evaluates the process",
          "They evaluate the same thing",
          "Task Status evaluates speed, Trajectory Status evaluates correctness",
          "Task Status counts tools, Trajectory Status counts steps"
        ],
        correctAnswer: 0,
        explanation: "Task Status evaluates whether the final output meets requirements. Trajectory Status evaluates whether the process/steps were correct."
      },
      {
        id: 12,
        question: "In the annotation workflow, when should you verify your error categorization using the EC Library?",
        options: [
          "Before marking any error, to ensure correct categorization",
          "After marking all errors",
          "Only for critical errors",
          "Never, it's not necessary"
        ],
        correctAnswer: 0,
        explanation: "You should verify error categorization using the EC Library before marking errors to ensure you're using the correct error type and following guidelines."
      }
    ]
  },
  section4: {
    title: "H2H Evaluation Quiz",
    questions: [
      {
        id: 1,
        question: "What is H2H Evaluation?",
        options: [
          "Comparing two AI model outputs for the same prompt to determine which performs better",
          "Comparing execution speeds of models",
          "Counting tools used by each model",
          "Measuring output length"
        ],
        correctAnswer: 0,
        explanation: "H2H Evaluation compares two AI model outputs for the same prompt to determine which performs better from a user's perspective, evaluating both Process and Outcome."
      },
      {
        id: 2,
        question: "What are the two main dimensions of H2H comparison?",
        options: [
          "Process and Outcome",
          "Speed and Accuracy",
          "Tools and Steps",
          "Length and Format"
        ],
        correctAnswer: 0,
        explanation: "H2H comparison happens along two dimensions: Process (how the model executes) and Outcome (quality of final result)."
      },
      {
        id: 3,
        question: "What are the six classification categories in H2H?",
        options: [
          "A Strongly, A Slightly, Neutral, B Slightly, B Strongly, Unsure",
          "Fast, Medium, Slow, Very Fast, Very Slow, Unknown",
          "Correct, Incorrect, Partial, Complete, Incomplete, Unknown",
          "Good, Bad, Average, Excellent, Poor, Uncertain"
        ],
        correctAnswer: 0,
        explanation: "The six categories are: A Strongly, A Slightly, Neutral, B Slightly, B Strongly, and Unsure."
      },
      {
        id: 4,
        question: "In Outcome Evaluation, what are the three categories of output information?",
        options: [
          "Key Results, Supplementary Information, Cosmetic Differences",
          "Fast Results, Slow Results, Medium Results",
          "Long Output, Short Output, Medium Output",
          "Correct Output, Incorrect Output, Partial Output"
        ],
        correctAnswer: 0,
        explanation: "Outcome evaluation divides output into: Key Results (core info), Supplementary Information (additional details), and Cosmetic Differences (formatting/tone)."
      },
      {
        id: 5,
        question: "When should you use 'Strongly' classification?",
        options: [
          "For major factual or process differences, focusing on Key Results or crucial steps",
          "For minor differences in formatting",
          "For speed differences",
          "For tool usage differences"
        ],
        correctAnswer: 0,
        explanation: "Strongly classification is for major factual or process differences, focusing on Key Results or crucial steps that significantly impact user experience."
      },
      {
        id: 6,
        question: "When should you use 'Slightly' classification?",
        options: [
          "For minor yet meaningful differences, focusing on Supplementary info or small process edge",
          "For major output differences",
          "For speed differences only",
          "For tool count differences"
        ],
        correctAnswer: 0,
        explanation: "Slightly classification is for minor yet meaningful differences that focus on Supplementary information or small process advantages."
      },
      {
        id: 7,
        question: "What is the difference between 'Neutral' and 'Unsure'?",
        options: [
          "Neutral: Comparable results. Unsure: Non-model issues make comparison invalid",
          "Neutral means one is better, Unsure means both are equal",
          "Neutral means fast, Unsure means slow",
          "They mean the same thing"
        ],
        correctAnswer: 0,
        explanation: "Neutral means both models are comparable. Unsure means comparison is invalid due to non-model issues (bad prompts, tool errors, infrastructure problems)."
      },
      {
        id: 8,
        question: "What should you include in H2H reasoning notes?",
        options: [
          "Always include step numbers and error types, specify what made the difference",
          "Only the final output",
          "Only execution speed",
          "Only tool counts"
        ],
        correctAnswer: 0,
        explanation: "Always include step numbers and error types (e.g., Step 3: UI Grounding Error), and specify what information or process difference made the classification."
      },
      {
        id: 9,
        question: "Should you penalize a model for having a longer trajectory?",
        options: [
          "No, only penalize inefficiency tied to mistakes",
          "Yes, always penalize longer trajectories",
          "Yes, if it's more than 50 steps",
          "Yes, if it's slower"
        ],
        correctAnswer: 0,
        explanation: "Do not penalize longer trajectories. Only penalize inefficiency that comes from mistakes. Longer but correct trajectories should not be penalized."
      },
      {
        id: 10,
        question: "What are common Process Error Types in H2H evaluation?",
        options: [
          "UI Grounding Mistake, UI Hallucination, Info Hallucination, Temporal Mistake, Early Stopping, Missed Filter",
          "Speed Errors, Format Errors, Length Errors, Tool Errors",
          "Login Errors, Payment Errors, Search Errors, Display Errors",
          "Network Errors, Timeout Errors, Connection Errors, Server Errors"
        ],
        correctAnswer: 0,
        explanation: "Common Process Error Types include: UI Grounding Mistake, UI Hallucination, Info Hallucination (visual), Temporal Mistake, Early Stopping or Premature Ending, Missed Filter or Page Steps."
      },
      {
        id: 11,
        question: "In Outcome Evaluation, should cosmetic differences (emojis, spacing, tone) influence classification?",
        options: [
          "No, do not count unless they affect meaning",
          "Yes, always count them",
          "Yes, if they're different",
          "Yes, if output is longer"
        ],
        correctAnswer: 0,
        explanation: "Cosmetic differences like emojis, spacing, or tone should not influence outcome preference unless they affect meaning. Focus on user impact."
      },
      {
        id: 12,
        question: "What should you do if both models make similar mistakes but one takes more steps?",
        options: [
          "Mark as Neutral if errors are similar and only length differs",
          "Always mark the shorter one as better",
          "Always mark the longer one as worse",
          "Skip the comparison"
        ],
        correctAnswer: 0,
        explanation: "If both processes make similar errors but differ only in length, mark as Neutral. Do not penalize length alone."
      },
      {
        id: 13,
        question: "When writing H2H reasoning, what format should you use?",
        options: [
          "Multi-line format with clear structure: Both models did X, Model A did Y but Model B did Z, Therefore...",
          "Single sentence only",
          "Just list the errors",
          "Only mention the winner"
        ],
        correctAnswer: 0,
        explanation: "Use multi-line reasoning format: Start with what both models did, then specify differences, include step numbers and error types, end with classification reasoning."
      },
      {
        id: 14,
        question: "What is a Golden Set in H2H evaluation?",
        options: [
          "A weekly collection of H2H examples used for calibration and ensuring consistency",
          "A set of golden colored outputs",
          "The fastest model outputs",
          "The longest model outputs"
        ],
        correctAnswer: 0,
        explanation: "Golden Set is a weekly collection of H2H examples including Process and Outcome annotations, examples of all classifications, used for calibration and quality assurance."
      },
      {
        id: 15,
        question: "What perspective should you take when evaluating H2H comparisons?",
        options: [
          "User's perspective - what difference would they care about?",
          "Developer's perspective",
          "System's perspective",
          "Speed perspective"
        ],
        correctAnswer: 0,
        explanation: "Always think from the user's perspective - what difference would meaningfully change their experience or understanding?"
      }
    ]
  },
  final: {
    title: "Final Comprehensive Quiz - All Sections",
    questions: [
      {
        id: 1,
        question: "When should you mark a Bad Prompt?",
        options: [
          "When the prompt itself is impossible or unclear",
          "When the model gives wrong output",
          "When the model misunderstands instructions",
          "When the site fails to load"
        ],
        correctAnswer: 0,
        explanation: "Bad Prompt should be marked when the prompt itself is impossible to fulfill, unclear, ambiguous, or contains errors that prevent proper task completion."
      },
      {
        id: 2,
        question: "When NOT to mark UI Grounding Error?",
        options: [
          "When model scrolls or reads instead of clicking",
          "When it misinterprets element",
          "When it clicks on a non-existent element"
        ],
        correctAnswer: 0,
        explanation: "UI Grounding Error is NOT marked when the model scrolls or reads instead of clicking - that's normal behavior. UI Grounding Error occurs when the model misinterprets or misunderstands UI elements."
      },
      {
        id: 3,
        question: "What is Missed Use of UI Element?",
        options: [
          "Failing to use or incorrectly using tools like filters or search bars",
          "Failing to extract data",
          "Misunderstanding prompt",
          "Clicking wrong link"
        ],
        correctAnswer: 0,
        explanation: "Missed Use of UI Element occurs when the model fails to use available UI elements (like filters, search bars, dropdowns) that would help complete the task, or uses them incorrectly."
      },
      {
        id: 4,
        question: "When should you mark a Dissatisfactory Output?",
        options: [
          "When the final answer doesn't meet requirements or format",
          "A hallucination occurred in trajectory and it is reflected in output",
          "When the model provides irrelevant information (without acknowledgement)",
          "When the model fails to address the core intent of the task"
        ],
        correctAnswer: 0,
        explanation: "Dissatisfactory Output should be marked when the final answer doesn't meet the specified requirements, format, or quality standards, even if the process was correct."
      },
      {
        id: 5,
        question: "What is a Thought Verification Error?",
        options: [
          "Model fails to recognize previous step failure",
          "Model repeats the same failed action"
        ],
        correctAnswer: 0,
        explanation: "Thought Verification Error occurs when the model's reasoning fails to recognize, acknowledge, or respond to a previous step's failure, continuing with flawed reasoning."
      },
      {
        id: 6,
        question: "What is UI Hallucination?",
        options: [
          "Model invents a non-existent UI element",
          "Clicks wrong link",
          "Reads incorrect information from image",
          "Misunderstands filter"
        ],
        correctAnswer: 0,
        explanation: "UI Hallucination occurs when the model believes a UI element exists (and tries to interact with it) when it actually doesn't exist on the page."
      },
      {
        id: 7,
        question: "What are Dynamic Events?",
        options: [
          "Unexpected pop-ups or ads blocking model actions",
          "Tool errors",
          "Prompt misunderstanding",
          "Login issues"
        ],
        correctAnswer: 0,
        explanation: "Dynamic Events are unexpected UI changes like pop-ups, ads, modals, or page elements that appear dynamically and block or interfere with the model's actions."
      },
      {
        id: 8,
        question: "When a tool call executes but returns an empty or incorrect value, it is",
        options: [
          "Tool Error",
          "Early Stopping",
          "Information Hallucination"
        ],
        correctAnswer: 0,
        explanation: "When a tool executes successfully but returns empty or incorrect data, this is a Tool Error - the tool functionality issue, not the model's fault."
      },
      {
        id: 9,
        question: "The model retrieves correct data using a tool but then adds extra unsupported details in the final response.",
        options: [
          "Information Hallucination (text)",
          "Tool Error",
          "Dissatisfactory output"
        ],
        correctAnswer: 0,
        explanation: "This is Information Hallucination (text) - the model adds information that wasn't in the source data, inventing details in the text output."
      },
      {
        id: 10,
        question: "While solving a task, you notice that the model has produced incorrect information. How would you trace the source of this error, and which error categories could it potentially fall under?",
        options: [
          "Trace back through trajectory to find where incorrect info originated - could be Prompt Error, Info Hallucination, Tool Error, or Output Error",
          "Only mark it as Output Error since it's in the final output",
          "Only check the last step",
          "Ignore it if the task succeeded"
        ],
        correctAnswer: 0,
        explanation: "You must trace back through the trajectory to find where incorrect information originated. It could be a Prompt Error (misunderstood from start), Info Hallucination (added false info), Tool Error (tool provided wrong data), or Output Error (correct data but wrong output)."
      },
      {
        id: 11,
        question: "If the task status is 'Success,' can the trajectory status still be marked as 'Failure'?",
        options: [
          "Yes",
          "No"
        ],
        correctAnswer: 0,
        explanation: "Yes - Task Status and Trajectory Status are independent. A task can succeed (correct output) even if the trajectory had errors (flawed process that was corrected or didn't affect outcome)."
      },
      {
        id: 12,
        question: "Can a task be considered successful if it produces the correct result but with incorrect reasoning?",
        options: [
          "Yes",
          "No"
        ],
        correctAnswer: 0,
        explanation: "Yes - Task Status evaluates the final output. If the output meets requirements, the task is Success, even if the reasoning/process had errors (which would affect Trajectory Status)."
      },
      {
        id: 13,
        question: "What should the trajectory status be if the model has done everything correctly, yet the prompt itself is bad?",
        options: [
          "Success",
          "Failure",
          "Cannot be determined"
        ],
        correctAnswer: 0,
        explanation: "Success - Trajectory Status evaluates the model's process. If the model followed correct steps given the prompt (even if prompt was bad), the trajectory is Success. The bad prompt affects Task Status, not Trajectory Status."
      },
      {
        id: 14,
        question: "What's the difference between Info Hallucination(visual) & Info Hallucination(text)?",
        options: [
          "Visual: Model misreads/sees wrong info from images/screens. Text: Model adds unsupported details in written output",
          "Visual is faster, Text is slower",
          "Visual is in images, Text is in words",
          "They are the same"
        ],
        correctAnswer: 0,
        explanation: "Info Hallucination (visual) occurs when the model misreads or incorrectly interprets information from visual elements (images, screens, UI). Info Hallucination (text) occurs when the model adds unsupported or invented details in written/text output."
      },
      {
        id: 15,
        question: "If the tool read_texts_and_links is called in step X and produces an incorrect output in step Y, which step should be marked as a Tool Error?",
        options: [
          "X",
          "Y"
        ],
        correctAnswer: 0,
        explanation: "X - The Tool Error should be marked where the tool was called (step X), not where the incorrect output appears (step Y). The error is in the tool execution, not in how the output was used."
      },
      {
        id: 16,
        question: "What is the difference between Thought Verification Error & Looping Over Failed Action?",
        options: [
          "Thought Verification: Model doesn't recognize previous failure in reasoning. Looping: Model repeats same failed action multiple times",
          "They are the same",
          "Thought Verification is in thoughts, Looping is in output",
          "Thought Verification is faster, Looping is slower"
        ],
        correctAnswer: 0,
        explanation: "Thought Verification Error is a reasoning failure - the model's thoughts don't acknowledge/recognize a previous step's error. Looping Over Failed Action is a behavioral pattern - the model keeps repeating the same action that already failed."
      },
      {
        id: 17,
        question: "How do you differentiate between a Tool Error and an Information Hallucination (text)?",
        options: [
          "Tool Error: Tool returns wrong/empty data. Info Hallucination: Model adds unsupported details not from tool output",
          "Tool Error is faster, Info Hallucination is slower",
          "Tool Error is in tools, Info Hallucination is in text",
          "They are the same"
        ],
        correctAnswer: 0,
        explanation: "Tool Error occurs when the tool itself returns incorrect or empty data. Information Hallucination (text) occurs when the model adds details that weren't in the tool's output - the model invents information."
      },
      {
        id: 18,
        question: "If the final step contains a hallucination that is not found anywhere else in the trajectory, to which EC should it be assigned?",
        options: [
          "Information Hallucination(text)",
          "Dissatisfactory Output"
        ],
        correctAnswer: 0,
        explanation: "Information Hallucination (text) - If the hallucination appears only in the final step and wasn't present in earlier steps, it's the model adding unsupported information in the output, which is Info Hallucination (text)."
      },
      {
        id: 19,
        question: "Which of the following errors can occur in the output step?",
        options: [
          "Information Hallucination (Text)",
          "Tool Error",
          "Early Stopping (Premature Task Satisfaction)",
          "Early Stopping (Insufficient Persistence)"
        ],
        correctAnswer: 0,
        explanation: "Information Hallucination (Text) can occur in the output step when the model adds unsupported details. Tool Errors occur during tool calls, and Early Stopping occurs before the output step."
      },
      {
        id: 20,
        question: "Under which Error Category should this be classified? (Captionless Image)",
        options: [
          "UI Grounding",
          "UI Hallucination",
          "UI Misunderstanding"
        ],
        correctAnswer: 0,
        explanation: "UI Grounding - When a model misinterprets or misunderstands a UI element (like a captionless image), it's a UI Grounding error - the model grounded its understanding incorrectly on the visual element."
      },
      {
        id: 21,
        question: "If the model misunderstands current date or makes date-time calculation mistake in the final step, under which EC it should be classified?",
        options: [
          "Time Misunderstanding",
          "Dissatisfactory Output"
        ],
        correctAnswer: 0,
        explanation: "Time Misunderstanding - Errors related to date/time calculations or understanding the current date/time should be classified as Time Misunderstanding, especially when they occur in the final step affecting the output."
      }
    ]
  }
};

// Export function to get quiz by section
export const getQuiz = (section: string) => {
  const sectionKey = section as keyof typeof quizzes;
  if (!quizzes[sectionKey]) return null;
  return quizzes[sectionKey] || null;
};
