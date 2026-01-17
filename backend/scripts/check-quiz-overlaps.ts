import { quizzes } from '../src/data/quizzes';

// Extract all questions from each section
const sectionQuestions: { [key: string]: Array<{ id: number; question: string }> } = {};
const finalQuestions: Array<{ id: number; question: string }> = [];

// Get section questions
['section1', 'section2', 'section3', 'section4'].forEach(section => {
  const sectionKey = section as keyof typeof quizzes;
  if (quizzes[sectionKey]) {
    sectionQuestions[section] = quizzes[sectionKey].questions.map(q => ({
      id: q.id,
      question: q.question.trim()
    }));
  }
});

// Get final questions
if (quizzes.final) {
  finalQuestions.push(...quizzes.final.questions.map(q => ({
    id: q.id,
    question: q.question.trim()
  })));
}

// Check for overlaps
const overlaps: Array<{
  finalId: number;
  finalQuestion: string;
  section: string;
  sectionId: number;
  sectionQuestion: string;
}> = [];

finalQuestions.forEach(finalQ => {
  Object.keys(sectionQuestions).forEach(section => {
    sectionQuestions[section].forEach(sectionQ => {
      // Check for exact matches
      if (finalQ.question === sectionQ.question) {
        overlaps.push({
          finalId: finalQ.id,
          finalQuestion: finalQ.question,
          section: section,
          sectionId: sectionQ.id,
          sectionQuestion: sectionQ.question
        });
      }
    });
  });
});

// Print results
console.log('=== QUIZ OVERLAP ANALYSIS ===\n');
console.log(`Section 1 questions: ${sectionQuestions.section1?.length || 0}`);
console.log(`Section 2 questions: ${sectionQuestions.section2?.length || 0}`);
console.log(`Section 3 questions: ${sectionQuestions.section3?.length || 0}`);
console.log(`Section 4 questions: ${sectionQuestions.section4?.length || 0}`);
console.log(`Final quiz questions: ${finalQuestions.length}`);
console.log('\n=== OVERLAPS FOUND ===\n');

if (overlaps.length === 0) {
  console.log('✅ NO OVERLAPS FOUND - All final quiz questions are unique!');
  console.log('\n✅ The final quiz contains all unique questions that do not overlap with section quizzes.');
} else {
  console.log(`⚠️  Found ${overlaps.length} overlapping questions:\n`);
  overlaps.forEach((overlap, idx) => {
    console.log(`${idx + 1}. Final Quiz Q${overlap.finalId} overlaps with ${overlap.section} Q${overlap.sectionId}`);
    console.log(`   Question: "${overlap.finalQuestion.substring(0, 100)}${overlap.finalQuestion.length > 100 ? '...' : ''}"`);
    console.log('');
  });
  console.log('\n⚠️  WARNING: Some final quiz questions overlap with section quiz questions!');
}

// Also check for similar questions (not exact matches)
console.log('\n=== CHECKING FOR SIMILAR QUESTIONS (not exact matches) ===\n');
const similarQuestions: Array<{
  finalId: number;
  finalQuestion: string;
  section: string;
  sectionId: number;
  sectionQuestion: string;
}> = [];

finalQuestions.forEach(finalQ => {
  Object.keys(sectionQuestions).forEach(section => {
    sectionQuestions[section].forEach(sectionQ => {
      // Check for similar questions (same topic but different wording)
      const finalLower = finalQ.question.toLowerCase();
      const sectionLower = sectionQ.question.toLowerCase();
      
      // Check if they're asking about the same concept
      const finalKeywords = finalLower.split(' ').filter(w => w.length > 4);
      const sectionKeywords = sectionLower.split(' ').filter(w => w.length > 4);
      const commonKeywords = finalKeywords.filter(k => sectionKeywords.includes(k));
      
      // If they share significant keywords and are asking similar things
      if (commonKeywords.length >= 3 && finalQ.question !== sectionQ.question) {
        // Check if they're asking the same thing
        const isSimilar = 
          (finalLower.includes('accidental success') && sectionLower.includes('accidental success')) ||
          (finalLower.includes('trajectory status') && sectionLower.includes('trajectory status')) ||
          (finalLower.includes('critical error') && sectionLower.includes('critical error')) ||
          (finalLower.includes('task status') && sectionLower.includes('task status')) ||
          (finalLower.includes('autoeval') && sectionLower.includes('autoeval')) ||
          (finalLower.includes('infrastructure error') && sectionLower.includes('infrastructure error')) ||
          (finalLower.includes('prompt error') && sectionLower.includes('prompt error')) ||
          (finalLower.includes('output error') && sectionLower.includes('output error')) ||
          (finalLower.includes('early stopping') && sectionLower.includes('early stopping')) ||
          (finalLower.includes('thought verification') && sectionLower.includes('thought verification'));
        
        if (isSimilar) {
          similarQuestions.push({
            finalId: finalQ.id,
            finalQuestion: finalQ.question,
            section: section,
            sectionId: sectionQ.id,
            sectionQuestion: sectionQ.question
          });
        }
      }
    });
  });
});

if (similarQuestions.length > 0) {
  console.log(`⚠️  Found ${similarQuestions.length} similar questions (same topic, different wording):\n`);
  similarQuestions.forEach((similar, idx) => {
    console.log(`${idx + 1}. Final Quiz Q${similar.finalId} is similar to ${similar.section} Q${similar.sectionId}`);
    console.log(`   Final: "${similar.finalQuestion.substring(0, 80)}${similar.finalQuestion.length > 80 ? '...' : ''}"`);
    console.log(`   Section: "${similar.sectionQuestion.substring(0, 80)}${similar.sectionQuestion.length > 80 ? '...' : ''}"`);
    console.log('');
  });
} else {
  console.log('✅ No similar questions found - all questions are unique in both wording and topic!');
}

console.log('\n=== SUMMARY ===');
console.log(`Total section questions: ${(sectionQuestions.section1?.length || 0) + (sectionQuestions.section2?.length || 0) + (sectionQuestions.section3?.length || 0) + (sectionQuestions.section4?.length || 0)}`);
console.log(`Total final quiz questions: ${finalQuestions.length}`);
console.log(`Exact overlaps: ${overlaps.length}`);
console.log(`Similar questions: ${similarQuestions.length}`);
