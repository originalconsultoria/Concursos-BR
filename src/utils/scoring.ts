import { Concurso, ScoringRule, UserProfileScoring } from '../store';

export const calculateScore = (concurso: Concurso, rules: ScoringRule[], profile: UserProfileScoring): number => {
  let score = 0;

  // Profile-based scoring
  if (concurso.location && profile.ufs_desejadas[concurso.location]) {
    score += profile.ufs_desejadas[concurso.location];
  }

  if (concurso.esfera && profile.esferas_preferidas[concurso.esfera]) {
    score += profile.esferas_preferidas[concurso.esfera];
  }

  if (concurso.modalidade && profile.modalidades_preferidas[concurso.modalidade]) {
    score += profile.modalidades_preferidas[concurso.modalidade];
  }

  // Custom rules
  rules.forEach(rule => {
    const fieldValue = String(concurso[rule.field as keyof Concurso] || '').toLowerCase();
    const ruleValue = rule.value.toLowerCase();

    switch (rule.condition) {
      case 'contains':
        if (fieldValue.includes(ruleValue)) score += rule.points;
        break;
      case 'equals':
        if (fieldValue === ruleValue) score += rule.points;
        break;
      case 'greater_than':
        if (parseFloat(fieldValue.replace(/[^\d.]/g, '')) > parseFloat(ruleValue)) score += rule.points;
        break;
      case 'less_than':
        if (parseFloat(fieldValue.replace(/[^\d.]/g, '')) < parseFloat(ruleValue)) score += rule.points;
        break;
    }
  });

  return score;
};
