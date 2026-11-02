/* Yojana Saathi — rules engine. Deterministic eligibility matching.
   No LLM, no API. Profile in -> matched schemes with reasons out. */

const OPS = {
  eq:      (a, b) => a === b,
  neq:     (a, b) => a !== b,
  in:      (a, b) => Array.isArray(b) && b.includes(a),
  not_in:  (a, b) => Array.isArray(b) && !b.includes(a),
  gte:     (a, b) => typeof a === 'number' && a >= b,
  lte:     (a, b) => typeof a === 'number' && a <= b,
  gt:      (a, b) => typeof a === 'number' && a > b,
  lt:      (a, b) => typeof a === 'number' && a < b,
};

function rulePasses(rule, profile) {
  // OR-group: {any: [rule, rule, ...]} passes if at least one sub-rule passes
  if (rule.any && Array.isArray(rule.any)) {
    return rule.any.some(r => rulePasses(r, profile));
  }
  const val = profile[rule.field];
  if (val === undefined || val === null || val === '') return false; // unknown -> fail closed
  const op = OPS[rule.op];
  if (!op) return false;
  return op(val, rule.value);
}

// Returns { matched: [...], nearMiss: [...] }
// nearMiss = schemes failing on exactly ONE rule (tells user what would unlock it)
function matchSchemes(schemes, profile, lang) {
  const matched = [], nearMiss = [];
  for (const s of schemes) {
    if (s.states && !s.states.includes('all') && !s.states.includes(profile.state)) continue;
    const failed = (s.rules || []).filter(r => !rulePasses(r, profile));
    if (failed.length === 0) {
      matched.push({ scheme: s, reasons: explainRules(s, profile, lang) });
    } else if (failed.length === 1) {
      nearMiss.push({ scheme: s, blockedBy: failed[0], explain: s.rule_explain[lang] });
    }
  }
  // Biggest benefit first (numeric hint when present, else stable order)
  matched.sort((a, b) => (b.scheme.benefit_value || 0) - (a.scheme.benefit_value || 0));
  return { matched, nearMiss };
}

function explainRules(scheme, profile, lang) {
  return scheme.rule_explain[lang] || scheme.rule_explain.en;
}

// Profile completeness: which fields are still unknown
const PROFILE_FIELDS = [
  'age','gender','state','area','occupation','annual_income','land_owned',
  'caste_category','bpl','disability','student','girl_child_age',
  'pregnant','income_tax_payer','govt_employee','street_vendor','artisan'
];

function missingFields(profile) {
  return PROFILE_FIELDS.filter(f => profile[f] === undefined || profile[f] === null || profile[f] === '');
}
