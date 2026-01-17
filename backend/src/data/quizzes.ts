// Quiz questions for all sections
export const quizzes = {
  section1: {
    title: "Foundation & Error Categorization Quiz",
    questions: [
      {
        id: 1,
        question: "What is your primary role as an annotator?",
        options: [
          "To create new AI models",
          "To review model trajectories, identify errors, and mark the main cause of failure",
          "To write code for the models",
          "To manage the platform"
        ],
        correctAnswer: 1,
        explanation: "Your role is to review the entire trajectory of the model, identify where errors happened, and mark the main cause of failure."
      },
      {
        id: 2,
        question: "What is a model trajectory?",
        options: [
          "The path a model takes through different websites",
          "The step-by-step process of a model's thoughts and actions from start to final output",
          "The final result only",
          "The errors made by the model"
        ],
        correctAnswer: 1,
        explanation: "A trajectory is the complete step-by-step process including the model's thoughts (what it plans to do) and actions until it concludes with a final output."
      },
      {
        id: 3,
        question: "Why is accurate annotation important?",
        options: [
          "To complete tasks faster",
          "To ensure models can be improved and retrained based on feedback",
          "To earn more points",
          "It's not that important"
        ],
        correctAnswer: 1,
        explanation: "Accurate annotation ensures each model trajectory is evaluated correctly so the model can be improved and retrained."
      },
      {
        id: 4,
        question: "What is the purpose of the EC Example Library?",
        options: [
          "To list all websites",
          "To explain all error types a model can make and help identify errors correctly",
          "To show model outputs",
          "To track progress"
        ],
        correctAnswer: 1,
        explanation: "The EC Example Library explains all error types, provides definitions, key points to check, and examples of correct/incorrect cases."
      },
      {
        id: 5,
        question: "What are the main error categories covered in EC Library?",
        options: [
          "Prompt Errors, Model Actions, Model Thoughts, Output Errors, Infrastructure Errors, Tool Errors",
          "Only Prompt Errors",
          "Only Output Errors",
          "None"
        ],
        correctAnswer: 0,
        explanation: "The main error categories include Prompt Errors, Incorrect/Missed Model Actions, Incorrect/Missed Model Thoughts, Output Errors, Infrastructure Errors, and Tool Errors."
      },
      {
        id: 6,
        question: "What are Prompt Errors?",
        options: [
          "Errors in the model's output",
          "Errors related to how the prompt was interpreted or understood",
          "Errors in the website",
          "Errors in the code"
        ],
        correctAnswer: 1,
        explanation: "Prompt Errors are errors related to how the model interpreted or understood the task prompt."
      },
      {
        id: 7,
        question: "Give an example of Incorrect Model Action",
        options: [
          "The model clicked the wrong button",
          "The model wrote good code",
          "The model completed the task",
          "The model followed instructions"
        ],
        correctAnswer: 0,
        explanation: "Incorrect Model Actions include clicking wrong buttons, navigating to wrong pages, or performing actions that don't match the task requirements."
      },
      {
        id: 8,
        question: "What are Missed Model Actions?",
        options: [
          "Actions that were completed",
          "Actions that the model should have taken but didn't",
          "Actions that were correct",
          "Actions that were fast"
        ],
        correctAnswer: 1,
        explanation: "Missed Model Actions are required actions that the model should have performed but skipped or didn't complete."
      },
      {
        id: 9,
        question: "What are Incorrect Model Thoughts?",
        options: [
          "When the model thinks correctly",
          "When the model's reasoning or planning is wrong",
          "When the model doesn't think",
          "When the model thinks too much"
        ],
        correctAnswer: 1,
        explanation: "Incorrect Model Thoughts refer to errors in the model's reasoning, planning, or decision-making process."
      },
      {
        id: 10,
        question: "What are Infrastructure Errors?",
        options: [
          "Model mistakes",
          "Errors caused by system issues, not the model's fault",
          "User errors",
          "Website errors only"
        ],
        correctAnswer: 1,
        explanation: "Infrastructure Errors (Non-Model Fault Errors) are issues caused by system problems, not the model's actions."
      },
      {
        id: 11,
        question: "What are Tool Errors?",
        options: [
          "Errors in the model's thinking",
          "Errors related to tool usage, functionality, or tool-related issues",
          "Errors in the prompt",
          "Errors in the output"
        ],
        correctAnswer: 1,
        explanation: "Tool Errors are errors related to how tools are used, tool functionality issues, or problems with tool execution."
      },
      {
        id: 12,
        question: "What are Output Errors?",
        options: [
          "Errors in the model's reasoning",
          "Errors in the final output or results produced by the model",
          "Errors in the prompt",
          "Errors in tool usage"
        ],
        correctAnswer: 1,
        explanation: "Output Errors are errors in the final output or results produced by the model, such as incorrect summaries, wrong answers, or missing information."
      },
      {
        id: 13,
        question: "What is Thought Verification error?",
        options: [
          "When the model thinks correctly",
          "When the model's thoughts/reasoning do not acknowledge or notice previous step errors",
          "When the model doesn't think at all",
          "When the model thinks too much"
        ],
        correctAnswer: 1,
        explanation: "Thought Verification error occurs when the model's reasoning ignores or does not acknowledge previous step errors, continuing with the same flawed reasoning."
      },
      {
        id: 14,
        question: "When reviewing a model trajectory, what should you focus on?",
        options: [
          "Only the final output",
          "The entire step-by-step process including thoughts and actions",
          "Only the errors",
          "Only the successful steps"
        ],
        correctAnswer: 1,
        explanation: "You should review the entire trajectory, including all thoughts (what the model planned) and actions (what it did) from start to finish to identify where errors occurred."
      },
      {
        id: 15,
        question: "What should you do before marking an error?",
        options: [
          "Mark immediately",
          "Check the key points and definitions from the EC Example Library for that error type",
          "Guess the error type",
          "Skip the error"
        ],
        correctAnswer: 1,
        explanation: "Before marking an error, you should check the key points and definitions from the EC Example Library to ensure you're categorizing it correctly."
      },
      {
        id: 16,
        question: "A model incorrectly interprets 'find hotels near the beach' as 'find hotels with beach views'. What type of error is this?",
        options: [
          "Model Action Error",
          "Prompt Error",
          "Output Error",
          "Infrastructure Error"
        ],
        correctAnswer: 1,
        explanation: "This is a Prompt Error - the model misunderstood or misinterpreted the prompt requirements."
      },
      {
        id: 17,
        question: "A model plans to click a button but then clicks a different button instead. What type of error occurred?",
        options: [
          "Prompt Error",
          "Incorrect Model Action",
          "Missed Model Action",
          "Output Error"
        ],
        correctAnswer: 1,
        explanation: "This is an Incorrect Model Action - the model performed a different action than what it planned or what was required."
      },
      {
        id: 18,
        question: "A model's reasoning shows it understood the task correctly, but its final summary contains incorrect information. What is the primary error type?",
        options: [
          "Prompt Error",
          "Model Thought Error",
          "Output Error",
          "Tool Error"
        ],
        correctAnswer: 2,
        explanation: "This is an Output Error - the model's reasoning was correct but the final output contains errors."
      },
      {
        id: 19,
        question: "When should you mark multiple errors in a trajectory?",
        options: [
          "Never - only mark one error",
          "Always mark all errors you find",
          "Mark the critical error and other significant errors that occurred, but focus on the root cause",
          "Only mark errors in the final step"
        ],
        correctAnswer: 2,
        explanation: "You should mark the critical error (root cause) and other significant errors, but always identify which one is the critical error that caused failure."
      },
      {
        id: 20,
        question: "A model encounters a 'site cannot be reached' error due to proxy issues. How should this be categorized?",
        options: [
          "Prompt Error",
          "Model Action Error",
          "Infrastructure Error (Non-Model Fault)",
          "Output Error"
        ],
        correctAnswer: 2,
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
          "Good, Bad, Maybe, Sometimes",
          "Complete, Incomplete, Error, None",
          "Pass, Fail, Skip, Retry"
        ],
        correctAnswer: 0,
        explanation: "The four possible cases are Success, Failure, Cannot Be Determined, and Accidental Success."
      },
      {
        id: 2,
        question: "When should a task be marked as 'Failure'?",
        options: [
          "When the prompt requirements are not met",
          "When the task is completed",
          "When the model tries hard",
          "Never"
        ],
        correctAnswer: 0,
        explanation: "A task should be marked as Failure when the prompt requirements are not met, the output includes incorrect information, or the model couldn't complete the process."
      },
      {
        id: 3,
        question: "What is 'Accidental Success'?",
        options: [
          "When the model succeeds by luck",
          "When the model returns zero results without thorough research, but zero is correct",
          "When the model always succeeds",
          "When success is guaranteed"
        ],
        correctAnswer: 1,
        explanation: "Accidental Success occurs when the model returns zero results without conducting thorough research, but manual verification confirms zero results are correct."
      },
      {
        id: 4,
        question: "When should 'Cannot Be Determined' be used?",
        options: [
          "When unsure",
          "When prompt requirements can't be fulfilled due to technical limitations or ambiguity",
          "Always",
          "Never"
        ],
        correctAnswer: 1,
        explanation: "Cannot Be Determined applies when prompts require audio/video interpretation, booking past events, logging into private accounts, or lack sufficient clarity."
      },
      {
        id: 5,
        question: "What is a Critical Error?",
        options: [
          "Any error",
          "The main mistake that caused the task to fail",
          "A small error",
          "An error that doesn't matter"
        ],
        correctAnswer: 1,
        explanation: "Critical Error is the main mistake that caused the task to fail - the root cause, not just symptoms."
      },
      {
        id: 6,
        question: "What is the difference between Critical Error and Primary Error?",
        options: [
          "No difference",
          "Critical Error is the root cause of failure, Primary Error is any marked error",
          "They are the same",
          "Primary Error is worse"
        ],
        correctAnswer: 1,
        explanation: "Critical Error identifies the root cause of failure, while Primary Error can be any error marked in the trajectory."
      },
      {
        id: 7,
        question: "How should you identify the Critical Error?",
        options: [
          "Mark the first error you see",
          "Trace back to find the root cause that led to failure",
          "Mark any error",
          "Guess"
        ],
        correctAnswer: 1,
        explanation: "You should trace back through the trajectory to find the root cause - the specific error that led the model to go wrong."
      },
      {
        id: 8,
        question: "What should a Task Status explanation include?",
        options: [
          "Just the status",
          "Number of results, how error impacted trajectory, discrepancy with manual verification, conclusive statement",
          "Nothing",
          "Only errors"
        ],
        correctAnswer: 1,
        explanation: "Task Status explanation should include number of results, how errors impacted trajectory, discrepancy with manual verification, and a conclusive statement."
      },
      {
        id: 9,
        question: "A model returns 3 results, but manual verification shows there should be 5 results. The model's summary correctly lists the 3 results it found. What is the task status?",
        options: [
          "Success - the model found results",
          "Failure - missing results means requirements not met",
          "Accidental Success",
          "Cannot Be Determined"
        ],
        correctAnswer: 1,
        explanation: "This is Failure - the prompt requirements (finding all available results) are not met. Missing results means the task is incomplete."
      },
      {
        id: 10,
        question: "A model stops searching after finding one result, assuming the task is complete. However, manual verification shows 5 results exist. What is the critical error?",
        options: [
          "Output Error",
          "Early Stopping (Premature Task Satisfaction)",
          "Prompt Error",
          "Tool Error"
        ],
        correctAnswer: 1,
        explanation: "This is Early Stopping - the model stopped prematurely assuming the task was complete, when it should have continued searching."
      },
      {
        id: 11,
        question: "When writing a Task Status explanation for Failure, what is the most important element?",
        options: [
          "Just stating it's a failure",
          "Clearly explaining how the identified error(s) impacted the trajectory and final output",
          "Listing all errors",
          "Describing the model's effort"
        ],
        correctAnswer: 1,
        explanation: "The most important element is explaining how the identified error(s) impacted the trajectory and final output, showing the connection between error and failure."
      },
      {
        id: 12,
        question: "A model searches correctly, finds zero results, and reports zero results. Manual verification confirms zero results are correct. However, the model didn't check all required sources. What is the task status?",
        options: [
          "Success",
          "Failure",
          "Accidental Success",
          "Cannot Be Determined"
        ],
        correctAnswer: 2,
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
          "The same as Task Status",
          "A separate evaluation of whether the trajectory itself was successful or failed",
          "Not important",
          "The final output only"
        ],
        correctAnswer: 1,
        explanation: "Trajectory Status evaluates whether the trajectory (the process) was successful or failed, separate from Task Status."
      },
      {
        id: 2,
        question: "When should a trajectory be marked as Success?",
        options: [
          "Always",
          "When the trajectory followed the correct process and steps",
          "Never",
          "When the task succeeded"
        ],
        correctAnswer: 1,
        explanation: "A trajectory should be marked as Success when it followed the correct process, even if the task status is different."
      },
      {
        id: 3,
        question: "What is AutoEval?",
        options: [
          "A manual process",
          "An automated system that evaluates trajectories",
          "A type of error",
          "Not used"
        ],
        correctAnswer: 1,
        explanation: "AutoEval is an automated system that evaluates model trajectories, but it has limitations and may need override."
      },
      {
        id: 4,
        question: "When should you override AutoEval?",
        options: [
          "Never",
          "When AutoEval's evaluation is incorrect or doesn't match manual verification",
          "Always",
          "When it's convenient"
        ],
        correctAnswer: 1,
        explanation: "You should override AutoEval when its evaluation is incorrect, doesn't match manual verification, or misses critical errors."
      },
      {
        id: 5,
        question: "What is the relationship between Task Status and Trajectory Status?",
        options: [
          "They are always the same",
          "They can be different - a trajectory can succeed but task fail, or vice versa",
          "Trajectory Status doesn't matter",
          "They are unrelated"
        ],
        correctAnswer: 1,
        explanation: "Task Status and Trajectory Status can differ - a trajectory can follow correct process (Success) but task can still fail, or trajectory can be flawed but task succeed."
      },
      {
        id: 6,
        question: "What are AutoEval limitations?",
        options: [
          "It's perfect",
          "It may miss nuanced errors, misinterpret context, or fail to identify root causes",
          "It has no limitations",
          "It's always wrong"
        ],
        correctAnswer: 1,
        explanation: "AutoEval may miss nuanced errors, misinterpret context, fail to identify root causes, or not understand complex scenarios."
      },
      {
        id: 7,
        question: "What is the complete annotation workflow?",
        options: [
          "Just marking errors",
          "From prompt → model trajectory → review → identify errors → mark status → submit evaluation",
          "Only reviewing",
          "Just submitting"
        ],
        correctAnswer: 1,
        explanation: "The complete workflow includes receiving prompt, reviewing model trajectory, identifying errors, marking task/trajectory status, and submitting evaluation."
      },
      {
        id: 8,
        question: "If Task Status is Failure and the critical error occurred in step 42 (the final step), what should the Trajectory Status be?",
        options: [
          "Failure",
          "Success",
          "Cannot Be Determined",
          "Accidental Success"
        ],
        correctAnswer: 1,
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
          "Accept AutoEval's decision",
          "Override AutoEval, mark as Failure, and provide clear reasoning",
          "Ignore the error",
          "Mark it as Cannot Be Determined"
        ],
        correctAnswer: 1,
        explanation: "You must override AutoEval when it's incorrect. Mark the trajectory correctly and provide clear reasoning for your decision."
      },
      {
        id: 11,
        question: "What is the key difference between Task Status and Trajectory Status?",
        options: [
          "Task Status evaluates the final output, Trajectory Status evaluates the process",
          "They are identical",
          "Only Task Status matters",
          "Trajectory Status is optional"
        ],
        correctAnswer: 0,
        explanation: "Task Status evaluates whether the final output meets requirements. Trajectory Status evaluates whether the process/steps were correct."
      },
      {
        id: 12,
        question: "In the annotation workflow, when should you verify your error categorization using the EC Library?",
        options: [
          "Never",
          "Only at the end",
          "Before marking any error, to ensure correct categorization",
          "Only for critical errors"
        ],
        correctAnswer: 2,
        explanation: "You should verify error categorization using the EC Library before marking errors to ensure you're using the correct error type and following guidelines."
      }
    ]
  },
  final: {
    title: "Final Comprehensive Quiz - All Sections",
    questions: [
      {
        id: 1,
        question: "In an H2H comparison, Model A makes a UI Grounding Mistake in Step 8 but recovers and finds all 5 correct results. Model B follows perfect process but finds only 3 results due to a Missed Filter error. Both outputs correctly summarize what they found. What should the Process classification be?",
        options: [
          "A Strongly - Model A recovered from error",
          "B Strongly - Model B had better process",
          "B Slightly - Model B's process was better despite missing results",
          "Neutral - Both had process errors"
        ],
        correctAnswer: 2,
        explanation: "B Slightly - Model B followed a better process (perfect until the missed filter), while Model A made a UI Grounding Mistake. Process evaluation focuses on execution quality, not outcome."
      },
      {
        id: 2,
        question: "A model trajectory: Steps 1-25 show correct reasoning and actions. Step 26: Model encounters a tool timeout error (Infrastructure Error). Step 27: Model incorrectly assumes the tool failed due to its own mistake and switches to a different approach. Step 28-35: Model continues with flawed approach. Step 36: Final output is incorrect. What is the Critical Error?",
        options: [
          "Infrastructure Error in Step 26",
          "Incorrect Model Thought in Step 27 (misinterpreting infrastructure error)",
          "Output Error in Step 36",
          "Tool Error in Step 26"
        ],
        correctAnswer: 1,
        explanation: "The Critical Error is the Incorrect Model Thought in Step 27. The infrastructure error wasn't the model's fault, but the model's incorrect interpretation of that error led to the wrong approach and failure."
      },
      {
        id: 3,
        question: "In H2H evaluation, Model A's output has perfect Key Results but includes minor formatting differences (extra spacing, different emoji usage). Model B's output has identical Key Results with standard formatting. Both processes were correct. What should the Outcome classification be?",
        options: [
          "A Slightly - better formatting",
          "B Slightly - cleaner output",
          "Neutral - cosmetic differences don't affect meaning",
          "A Strongly - more detailed"
        ],
        correctAnswer: 2,
        explanation: "Neutral - Cosmetic differences like spacing and emojis should not influence outcome preference unless they affect meaning. Both have identical Key Results."
      },
      {
        id: 4,
        question: "A model's trajectory shows: Step 1-5: Correct search initiation. Step 6: Model's thought says 'I should check all sources' but then clicks 'Submit' without checking. Step 7: Model realizes mistake and tries to go back but page has refreshed. Step 8: Model starts over correctly. Step 9-20: Perfect execution. Step 21: Correct output with all results. What errors should be marked?",
        options: [
          "No errors - final output is correct",
          "Missed Model Action in Step 6 (didn't check sources as planned)",
          "Incorrect Model Action in Step 6 (clicked Submit prematurely)",
          "Both Missed Model Action and Incorrect Model Action in Step 6"
        ],
        correctAnswer: 3,
        explanation: "Both errors occurred - the model planned to check sources (thought) but didn't (Missed Action), and clicked Submit prematurely (Incorrect Action). However, since the model recovered and produced correct output, Task Status would be Success."
      },
      {
        id: 5,
        question: "Task Status = Success, Trajectory Status = Failure (due to critical error in Step 12 that was later corrected). In H2H comparison with another model that had Success/Success, how should Process be classified?",
        options: [
          "Neutral - both achieved success",
          "Other model Slightly - cleaner process",
          "Other model Strongly - no errors in process",
          "Cannot determine without seeing both trajectories"
        ],
        correctAnswer: 1,
        explanation: "Other model Slightly - A trajectory with errors (even if corrected) is inferior to one without errors. Process evaluation focuses on execution quality."
      },
      {
        id: 6,
        question: "A model encounters a Temporal Mistake (books an event for wrong date) in Step 15, realizes the error in Step 18, corrects it in Step 19, and completes task successfully. What is the Critical Error, and what are Task/Trajectory Status?",
        options: [
          "Critical: Temporal Mistake Step 15. Task: Success, Trajectory: Success (error was corrected)",
          "Critical: Temporal Mistake Step 15. Task: Success, Trajectory: Failure (error occurred)",
          "Critical: Missed Correction Step 18. Task: Success, Trajectory: Success",
          "No Critical Error - task succeeded"
        ],
        correctAnswer: 1,
        explanation: "Critical Error is the Temporal Mistake in Step 15. Task Status = Success (requirements met). Trajectory Status = Failure (error occurred in process, even though corrected)."
      },
      {
        id: 7,
        question: "In H2H, Model A finds 5 results with perfect process. Model B finds 5 results but made a UI Hallucination error in Step 10 (clicked non-existent button, but system handled it gracefully). Both outputs are identical. Process classification?",
        options: [
          "A Strongly - perfect process",
          "A Slightly - cleaner process",
          "Neutral - both found same results",
          "B Slightly - Model B had to work around error"
        ],
        correctAnswer: 1,
        explanation: "A Slightly - Model A had a cleaner process without errors. Even though Model B recovered, the UI Hallucination represents a process flaw that Model A avoided."
      },
      {
        id: 8,
        question: "A model's Step 5 thought says 'I need to filter by date range'. Step 6 action: Model clicks filter button correctly. Step 7 thought: 'The filter didn't work, I'll try a different approach' (but filter actually worked, model just didn't notice). Step 8: Model uses alternative method unnecessarily. What error type is Step 7?",
        options: [
          "Missed Model Action - didn't notice filter worked",
          "Incorrect Model Thought - misread filter results",
          "UI Grounding Mistake - didn't verify filter state",
          "Tool Error - filter didn't work properly"
        ],
        correctAnswer: 2,
        explanation: "Incorrect Model Thought - the model's reasoning was wrong. It thought the filter didn't work when it actually did. This is a thought/reasoning error, not an action error."
      },
      {
        id: 9,
        question: "Model A's output includes all Key Results plus valuable Supplementary Information (extra context, related links). Model B's output has identical Key Results but no Supplementary Information. Both processes were correct. Outcome classification?",
        options: [
          "A Strongly - more comprehensive",
          "A Slightly - additional useful information",
          "Neutral - Key Results are same",
          "B Slightly - more concise"
        ],
        correctAnswer: 1,
        explanation: "A Slightly - Supplementary Information that adds value (not just cosmetic) provides a meaningful advantage. This is a minor but meaningful difference in outcome quality."
      },
      {
        id: 10,
        question: "A trajectory has: Step 1-20: Perfect execution. Step 21: Model's thought acknowledges a potential issue from Step 15 but says 'I'll proceed anyway'. Step 22: Model continues and completes task successfully. Step 23: Output is correct. What error occurred?",
        options: [
          "Thought Verification Error in Step 21 - acknowledged issue but didn't address it",
          "No error - task succeeded",
          "Missed Model Action - should have addressed the issue",
          "Output Error - output should have been different"
        ],
        correctAnswer: 0,
        explanation: "Thought Verification Error - the model acknowledged a previous step issue but chose to ignore it rather than address it. Even though the task succeeded, this represents flawed reasoning."
      },
      {
        id: 11,
        question: "In H2H comparison, both models have identical Key Results. Model A's process took 45 steps with no errors. Model B's process took 30 steps with no errors. Process classification?",
        options: [
          "B Strongly - more efficient",
          "B Slightly - fewer steps",
          "Neutral - both processes were correct",
          "A Slightly - more thorough"
        ],
        correctAnswer: 2,
        explanation: "Neutral - Do not penalize longer trajectories if they're correct. Only penalize inefficiency tied to mistakes. Both processes were error-free, so they're comparable."
      },
      {
        id: 12,
        question: "A model trajectory shows multiple errors: Step 8 (Prompt Error - misunderstood requirement), Step 15 (Incorrect Action - wrong button), Step 22 (Output Error - wrong summary). Task failed. Which is the Critical Error and why?",
        options: [
          "Output Error Step 22 - final output was wrong",
          "Prompt Error Step 8 - root cause that led to all subsequent errors",
          "Incorrect Action Step 15 - action error caused failure",
          "All three are equally critical"
        ],
        correctAnswer: 1,
        explanation: "Prompt Error Step 8 is the Critical Error - it's the root cause. The model misunderstood from the start, which led to wrong actions and wrong output. Trace back to find the root cause."
      },
      {
        id: 13,
        question: "Model A in H2H makes an Info Hallucination (visual) error in Step 12, sees incorrect information on screen, but corrects itself in Step 15 after double-checking. Model B has no errors. Both achieve same correct outcome. Process classification?",
        options: [
          "Neutral - both achieved correct outcome",
          "B Slightly - no errors in process",
          "A Slightly - Model A showed self-correction ability",
          "B Strongly - perfect process"
        ],
        correctAnswer: 1,
        explanation: "B Slightly - Model B had a cleaner process without errors. While Model A's self-correction is good, the Info Hallucination represents a process flaw that Model B avoided."
      },
      {
        id: 14,
        question: "A model's Step 10 thought: 'I should verify the results match the requirements'. Step 11 action: Model scrolls through results but doesn't actually verify. Step 12: Model proceeds assuming results are correct. What type of error is Step 11?",
        options: [
          "Missed Model Action - didn't verify as planned",
          "Incorrect Model Thought - verification wasn't needed",
          "Thought Verification Error - didn't follow through on verification plan",
          "No error - verification was optional"
        ],
        correctAnswer: 0,
        explanation: "Missed Model Action - the model planned to verify (thought) but didn't actually perform the verification action. This is a missed action, not a thought error."
      },
      {
        id: 15,
        question: "In H2H, Model A's output has a minor factual error in Supplementary Information (wrong date for a related event) but correct Key Results. Model B has identical correct Key Results and no Supplementary Information. Outcome classification?",
        options: [
          "B Slightly - no errors",
          "B Strongly - Model A has factual error",
          "Neutral - Key Results are same",
          "A Slightly - more information despite error"
        ],
        correctAnswer: 1,
        explanation: "B Strongly - A factual error in Supplementary Information is significant. Even though Key Results are correct, the error in supplementary info represents a major outcome flaw."
      },
      {
        id: 16,
        question: "A model trajectory: Step 1-18 perfect. Step 19: Tool returns error message 'Invalid input format'. Step 20: Model's thought says 'The tool error means my approach is wrong' (but tool error was due to formatting, not approach). Step 21-25: Model switches to wrong approach. Step 26: Failure. Critical Error?",
        options: [
          "Tool Error Step 19",
          "Incorrect Model Thought Step 20 - misinterpreted tool error",
          "Prompt Error - wrong approach from start",
          "Output Error Step 26"
        ],
        correctAnswer: 1,
        explanation: "Incorrect Model Thought Step 20 - the model misinterpreted the tool error. The tool error was a formatting issue, but the model incorrectly concluded its approach was wrong, leading to failure."
      },
      {
        id: 17,
        question: "Model A finds 4 results with perfect process. Model B finds 5 results (one extra) but made a UI Grounding Mistake in Step 8 that didn't affect outcome. Both outputs correctly list what they found. Outcome classification?",
        options: [
          "B Strongly - found more results",
          "B Slightly - more comprehensive",
          "A Slightly - cleaner process",
          "Neutral - both correct"
        ],
        correctAnswer: 1,
        explanation: "B Slightly - Finding more results (5 vs 4) represents a meaningful outcome difference. The UI Grounding Mistake affects Process evaluation, not Outcome."
      },
      {
        id: 18,
        question: "A model's Step 7 thought: 'I need to check the date filter'. Step 8: Model clicks date filter correctly. Step 9 thought: 'The results look filtered but I'm not sure, let me check the filter settings again'. Step 10: Model re-checks and confirms filter is correct. Step 11: Continues. Is Step 9 an error?",
        options: [
          "Yes - Thought Verification Error - unnecessary doubt",
          "Yes - Missed Model Action - should have trusted first check",
          "No error - verification is good practice",
          "Yes - Incorrect Model Thought - doubted correct filter"
        ],
        correctAnswer: 2,
        explanation: "No error - Double-checking and verification is good practice, not an error. The model was being thorough. Errors involve mistakes, not careful verification."
      },
      {
        id: 19,
        question: "In H2H, both models have identical processes and outcomes, but Model A's trajectory is marked as 'Unsure' due to a bad prompt (ambiguous requirements). Model B's trajectory is marked normally. How should this be handled?",
        options: [
          "Mark Process and Outcome as Unsure for Model A, Neutral for Model B",
          "Mark both as Unsure - comparison invalid",
          "Mark Model B Strongly - only valid comparison",
          "Mark Neutral - both had same process/outcome"
        ],
        correctAnswer: 1,
        explanation: "If one trajectory is Unsure due to non-model issues (bad prompt), the comparison becomes invalid. Both should be marked as Unsure - you cannot fairly compare when one has invalid conditions."
      },
      {
        id: 20,
        question: "A comprehensive annotation requires evaluating: (1) Error identification across trajectory, (2) Critical Error determination, (3) Task Status with explanation, (4) Trajectory Status with reasoning, (5) AutoEval override if needed, (6) H2H comparison if applicable. What is the correct order of these steps?",
        options: [
          "1 → 2 → 3 → 4 → 5 → 6 (sequential)",
          "1 → 2 → 5 → 3 → 4 → 6 (check AutoEval before determining status)",
          "1 → 5 → 2 → 3 → 4 → 6 (check AutoEval first, then determine errors)",
          "Any order - doesn't matter"
        ],
        correctAnswer: 0,
        explanation: "Correct order: (1) Identify all errors, (2) Determine Critical Error, (3) Determine Task Status, (4) Determine Trajectory Status, (5) Override AutoEval if needed, (6) Complete H2H if applicable. This ensures logical flow from error identification to final evaluation."
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
          "Comparing one model's output",
          "Comparing two AI model outputs for the same prompt to determine which performs better",
          "Evaluating only the final output",
          "Not used in annotation"
        ],
        correctAnswer: 1,
        explanation: "H2H Evaluation compares two AI model outputs for the same prompt to determine which performs better from a user's perspective, evaluating both Process and Outcome."
      },
      {
        id: 2,
        question: "What are the two main dimensions of H2H comparison?",
        options: [
          "Speed and Accuracy",
          "Process and Outcome",
          "Input and Output",
          "Quality and Quantity"
        ],
        correctAnswer: 1,
        explanation: "H2H comparison happens along two dimensions: Process (how the model executes) and Outcome (quality of final result)."
      },
      {
        id: 3,
        question: "What are the six classification categories in H2H?",
        options: [
          "Good, Bad, Neutral",
          "A Strongly, A Slightly, Neutral, B Slightly, B Strongly, Unsure",
          "Success, Failure, Cannot Determine",
          "Better, Worse, Same"
        ],
        correctAnswer: 1,
        explanation: "The six categories are: A Strongly, A Slightly, Neutral, B Slightly, B Strongly, and Unsure."
      },
      {
        id: 4,
        question: "In Outcome Evaluation, what are the three categories of output information?",
        options: [
          "Good, Bad, Neutral",
          "Key Results, Supplementary Information, Cosmetic Differences",
          "Process, Outcome, Errors",
          "Main, Secondary, Tertiary"
        ],
        correctAnswer: 1,
        explanation: "Outcome evaluation divides output into: Key Results (core info), Supplementary Information (additional details), and Cosmetic Differences (formatting/tone)."
      },
      {
        id: 5,
        question: "When should you use 'Strongly' classification?",
        options: [
          "For any difference",
          "For major factual or process differences, focusing on Key Results or crucial steps",
          "For cosmetic differences",
          "Always"
        ],
        correctAnswer: 1,
        explanation: "Strongly classification is for major factual or process differences, focusing on Key Results or crucial steps that significantly impact user experience."
      },
      {
        id: 6,
        question: "When should you use 'Slightly' classification?",
        options: [
          "For major differences",
          "For minor yet meaningful differences, focusing on Supplementary info or small process edge",
          "For cosmetic differences",
          "Never"
        ],
        correctAnswer: 1,
        explanation: "Slightly classification is for minor yet meaningful differences that focus on Supplementary information or small process advantages."
      },
      {
        id: 7,
        question: "What is the difference between 'Neutral' and 'Unsure'?",
        options: [
          "They are the same",
          "Neutral: Comparable results. Unsure: Non-model issues make comparison invalid",
          "Neutral: One is better. Unsure: Both are bad",
          "No difference"
        ],
        correctAnswer: 1,
        explanation: "Neutral means both models are comparable. Unsure means comparison is invalid due to non-model issues (bad prompts, tool errors, infrastructure problems)."
      },
      {
        id: 8,
        question: "What should you include in H2H reasoning notes?",
        options: [
          "Just the classification",
          "Always include step numbers and error types, specify what made the difference",
          "Vague descriptions",
          "Nothing"
        ],
        correctAnswer: 1,
        explanation: "Always include step numbers and error types (e.g., Step 3: UI Grounding Error), and specify what information or process difference made the classification."
      },
      {
        id: 9,
        question: "Should you penalize a model for having a longer trajectory?",
        options: [
          "Yes, always",
          "No, only penalize inefficiency tied to mistakes",
          "Yes, shorter is always better",
          "Never penalize"
        ],
        correctAnswer: 1,
        explanation: "Do not penalize longer trajectories. Only penalize inefficiency that comes from mistakes. Longer but correct trajectories should not be penalized."
      },
      {
        id: 10,
        question: "What are common Process Error Types in H2H evaluation?",
        options: [
          "Only output errors",
          "UI Grounding Mistake, UI Hallucination, Info Hallucination, Temporal Mistake, Early Stopping, Missed Filter",
          "No process errors",
          "Only cosmetic errors"
        ],
        correctAnswer: 1,
        explanation: "Common Process Error Types include: UI Grounding Mistake, UI Hallucination, Info Hallucination (visual), Temporal Mistake, Early Stopping or Premature Ending, Missed Filter or Page Steps."
      },
      {
        id: 11,
        question: "In Outcome Evaluation, should cosmetic differences (emojis, spacing, tone) influence classification?",
        options: [
          "Yes, always",
          "No, do not count unless they affect meaning",
          "Sometimes",
          "Only for Strongly"
        ],
        correctAnswer: 1,
        explanation: "Cosmetic differences like emojis, spacing, or tone should not influence outcome preference unless they affect meaning. Focus on user impact."
      },
      {
        id: 12,
        question: "What should you do if both models make similar mistakes but one takes more steps?",
        options: [
          "Always prefer shorter",
          "Mark as Neutral if errors are similar and only length differs",
          "Always prefer longer",
          "Mark as Unsure"
        ],
        correctAnswer: 1,
        explanation: "If both processes make similar errors but differ only in length, mark as Neutral. Do not penalize length alone."
      },
      {
        id: 13,
        question: "When writing H2H reasoning, what format should you use?",
        options: [
          "Single line",
          "Multi-line format with clear structure: Both models did X, Model A did Y but Model B did Z, Therefore...",
          "No format needed",
          "Only mention the winner"
        ],
        correctAnswer: 1,
        explanation: "Use multi-line reasoning format: Start with what both models did, then specify differences, include step numbers and error types, end with classification reasoning."
      },
      {
        id: 14,
        question: "What is a Golden Set in H2H evaluation?",
        options: [
          "A set of perfect examples",
          "A weekly collection of H2H examples used for calibration and ensuring consistency",
          "Only Strongly classifications",
          "Not used"
        ],
        correctAnswer: 1,
        explanation: "Golden Set is a weekly collection of H2H examples including Process and Outcome annotations, examples of all classifications, used for calibration and quality assurance."
      },
      {
        id: 15,
        question: "What perspective should you take when evaluating H2H comparisons?",
        options: [
          "Model's perspective",
          "User's perspective - what difference would they care about?",
          "Technical perspective only",
          "Speed perspective"
        ],
        correctAnswer: 1,
        explanation: "Always think from the user's perspective - what difference would meaningfully change their experience or understanding?"
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
