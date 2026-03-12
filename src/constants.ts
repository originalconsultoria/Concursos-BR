export const ESFERA_PATTERNS: Record<string, RegExp> = {
  "Legislativo Estadual e Distrital": /\b(alesp|alerj|al-[a-z]{2}|ale[a-z]{2}|alba|almg|cldf|assembleia-legislativa)\b/i,
  "Federal e Nacional": /\b(camara-dos-deputados|senado|emgepron|instituto-rio-branco|inss|ibge|receita-federal|ebserh|ministerio|funai|ibama|icmbio|agu|cgu|bndes|caixa|banco-do-brasil)\b/i,
  "Judiciário e Defensoria": /\b(tj-[a-z]{2}|tjdft|trf-[0-9]+|trt-[0-9]+|tre-[a-z]{2}|stf|stj|mpe?-[a-z]{2}|mpf|mpt|mpu|dpe-[a-z]{2}|dpu|pge|pgm|tribunal|defensoria)\b/i,
  "Militar e Segurança": /\b(marinha(-do-brasil)?|aeronautica|exercito|bombeiros?|cbm[a-z]{2}|pm[a-z]{2}|pm-[a-z]{2}|pc[a-z]{2}|pc-[a-z]{2}|policia-(militar|civil|penal|federal)|prf|pf|guarda(-municipal)?|gcm)\b/i,
  "Estadual e Controle": /\b(ses-[a-z]{2}|sesa(-[a-z]{2})?|seduc|sefaz|detran|fhemig|fahece|tce(-[a-z]{2})?|tcm(-[a-z]{2})?|governo-d[eo]|procon-[a-z]{2}|susepe|iasb|fhemeron|hcfmb)\b/i,
  "Municipal (Prefeituras, Câmaras e Saúde Local)": /\b(prefeitura|camara-(?!dos-deputados)|camara-municipal|saae[a-z]?|smae|cismetro|craisa|ima-de|semae|daem|fms|sms(-[a-z\-]+)?|iss(-[a-z\-]+)?)\b/i,
  "Universitária e Educação": /\b(uf[a-z]{2,5}|unb|usp|unesp|unicamp|funcamp|furb|if[a-z]{2}|instituto-federal|universidade)\b/i,
  "Conselhos Profissionais": /\b(cr[a-z]{1,2}-[a-z]{2}|cr[a-z]{1,2}-[0-9]+|crea|coren|crm|cro|creci|oab|cau-[a-z]{2})\b/i
};

export const MODALIDADE_PATTERNS: Record<string, RegExp> = {
  "Concurso e Processo Seletivo": /concursos?[- ]e[- ]processos?[- ]seletivos?|processos?[- ]seletivos?[- ]e[- ]concursos?/i,
  "Processo Seletivo (Temporário/CLT)": /processos?[- ]seletivos?|sele[cç][aã]o|sele[cç][oõ]es|seleciona|\bpss\b/i,
  "Exame de Admissão / Militar": /exames?[- ]de[- ]admiss[aã]o|admiss[aã]o/i,
  "Concurso Público (Efetivo)": /concursos?[- ]p[uú]blicos?|concursos?/i
};

export const BRAZILIAN_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO', 'BR'
];

export const ESCOLARIDADE_OPTIONS = [
  "Alfabetizado", "Fundamental", "Médio", "Técnico", "Superior"
];
