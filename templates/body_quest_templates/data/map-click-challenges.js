// BODY QUEST — map-click challenge prompts
// Edit: data/organ-cards.json (Level 1), level2-questions.json (Level 2),
//       level3-questions.json (Level 3), level4-questions.json (Level 4)
// Each organ has a "challengePrompts" array of 5 pre-written strings. Edit those directly.

function getMapClickChallengePool(organId, promptType) {
  if (promptType === 'function') {
    // Level 1: read directly from level1-questions
    const l1 = ORGANS_LEVEL1[organId] || {};
    return (l1.challengePrompts || []).slice(0, 5);
  }

  if (promptType === 'disease') {
    // Level 2: read directly from level2 data
    const l2 = ORGANS_LEVEL2[organId] || {};
    return (l2.challengePrompts || []).slice(0, 5);
  }

  if (promptType === 'food') {
    // Level 3: read directly from level3 data
    const l3 = ORGANS_LEVEL3[organId] || {};
    return (l3.challengePrompts || []).slice(0, 5);
  }

  if (promptType === 'symptom') {
    // Level 4: read directly from level4 data
    const l4 = ORGANS_LEVEL4[organId] || {};
    return (l4.challengePrompts || []).slice(0, 5);
  }

  return [];
}
