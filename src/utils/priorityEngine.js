/**
 * Automated Disaster Road Priority Calculation Engine
 * Evaluates damage reports algorithmically based on:
 * 1. Damage Severity (Weight: 35%)
 * 2. Passage Accessibility / Blockage (Weight: 25%)
 * 3. Road Lifeline Importance (Hospital / Evac Corridor) (Weight: 25%)
 * 4. Public Safety & Structural Risk (Weight: 15%)
 */

export const DAMAGE_TYPES = [
  'Bridge Collapse / Structural Crack',
  'Landslide / Mudslide',
  'Flood / Submerged Roadway',
  'Deep Sinkhole / Asphalt Failure',
  'Severe Potholes / Washout',
  'Debris & Fallen Trees',
  'Surface Fissures / Buckling'
];

export const ROAD_IMPORTANCE_LEVELS = {
  LIFELINE: 'Critical Lifeline (Hospital / Evac Route)',
  ARTERIAL: 'Major Arterial Highway',
  SECONDARY: 'Secondary Collector Road',
  LOCAL: 'Local Residential Road'
};

export const PASSAGE_STATUS_LEVELS = {
  BLOCKED: 'Completely Blocked (0% Traffic Flow)',
  EMERGENCY_ONLY: '4x4 / Emergency Vehicles Only',
  SINGLE_LANE: 'Single Lane Alternating Flow',
  PASSABLE: 'Passable with Caution'
};

export const SAFETY_RISK_LEVELS = {
  IMMINENT: 'Imminent Threat to Life / Ongoing Collapse',
  STRUCTURAL: 'Severe Structural Integrity Hazard',
  MODERATE: 'Moderate Hazard (Pavement Failure)',
  LOW: 'Low Hazard / Minor Debris'
};

export function calculatePriority({
  severity,
  passageStatus,
  roadImportance,
  publicSafetyRisk,
  damageType
}) {
  let score = 0;
  const reasons = [];

  // 1. Severity Score (0 - 35)
  if (severity === 'High') {
    score += 35;
    reasons.push('High Damage Severity: Critical structural impact or widespread destruction (+35 pts)');
  } else if (severity === 'Medium') {
    score += 20;
    reasons.push('Medium Damage Severity: Substantial road degradation requiring machinery (+20 pts)');
  } else {
    score += 10;
    reasons.push('Low Damage Severity: Surface-level damage or localized debris (+10 pts)');
  }

  // 2. Passage Status Score (0 - 25)
  if (passageStatus === PASSAGE_STATUS_LEVELS.BLOCKED || passageStatus === 'Completely Blocked') {
    score += 25;
    reasons.push('Total Blockage: All civilian & first responder transit severed (+25 pts)');
  } else if (passageStatus === PASSAGE_STATUS_LEVELS.EMERGENCY_ONLY || passageStatus === '4x4 / Emergency Only') {
    score += 18;
    reasons.push('Restricted Passage: Closed to regular civilian vehicles (+18 pts)');
  } else if (passageStatus === PASSAGE_STATUS_LEVELS.SINGLE_LANE || passageStatus === 'Single Lane') {
    score += 10;
    reasons.push('Partial Bottleneck: Single lane alternating creates severe delays (+10 pts)');
  } else {
    score += 4;
    reasons.push('Limited Impairment: Passable with reduced speed limits (+4 pts)');
  }

  // 3. Road Importance / Lifeline Score (0 - 25)
  if (roadImportance === ROAD_IMPORTANCE_LEVELS.LIFELINE || roadImportance === 'Critical Lifeline') {
    score += 25;
    reasons.push('Critical Lifeline: Direct corridor to regional trauma center or evacuation hub (+25 pts)');
  } else if (roadImportance === ROAD_IMPORTANCE_LEVELS.ARTERIAL || roadImportance === 'Major Arterial') {
    score += 18;
    reasons.push('Major Arterial: Vital transport backbone supporting regional relief distribution (+18 pts)');
  } else if (roadImportance === ROAD_IMPORTANCE_LEVELS.SECONDARY || roadImportance === 'Secondary Collector') {
    score += 10;
    reasons.push('Secondary Collector: Connects neighborhood clusters to arterials (+10 pts)');
  } else {
    score += 5;
    reasons.push('Local Road: Feeds residential streets with low traffic density (+5 pts)');
  }

  // 4. Public Safety Risk (0 - 15)
  if (publicSafetyRisk === SAFETY_RISK_LEVELS.IMMINENT || publicSafetyRisk === 'Imminent Threat') {
    score += 15;
    reasons.push('Imminent Hazard: Active erosion, falling boulders, or flash flood zone (+15 pts)');
  } else if (publicSafetyRisk === SAFETY_RISK_LEVELS.STRUCTURAL || publicSafetyRisk === 'High Hazard') {
    score += 10;
    reasons.push('Structural Risk: Foundation compromised or pier failure risk (+10 pts)');
  } else if (publicSafetyRisk === SAFETY_RISK_LEVELS.MODERATE || publicSafetyRisk === 'Moderate') {
    score += 5;
    reasons.push('Moderate Hazard: Tire/suspension damage hazard or hydroplaning risk (+5 pts)');
  } else {
    score += 2;
    reasons.push('Low Hazard: Low probability of secondary vehicle accidents (+2 pts)');
  }

  // Clamp score between 0 and 100
  score = Math.min(100, Math.max(0, score));

  // Determine Level
  let level = 'Low';
  if (score >= 70) {
    level = 'High';
  } else if (score >= 40) {
    level = 'Medium';
  } else {
    level = 'Low';
  }

  return {
    score,
    level,
    reasons
  };
}

export function getPriorityBadgeColor(level) {
  switch (level?.toLowerCase()) {
    case 'high':
    case 'critical':
      return {
        bg: 'bg-red-500/15',
        border: 'border-red-500/40',
        text: 'text-red-400',
        dot: 'bg-red-500',
        glow: 'shadow-red-500/20'
      };
    case 'medium':
      return {
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/40',
        text: 'text-amber-400',
        dot: 'bg-amber-500',
        glow: 'shadow-amber-500/20'
      };
    case 'low':
    default:
      return {
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/40',
        text: 'text-emerald-400',
        dot: 'bg-emerald-500',
        glow: 'shadow-emerald-500/20'
      };
  }
}

export function getStatusBadgeColor(status) {
  switch (status) {
    case 'Pending':
      return {
        bg: 'bg-slate-700/50',
        border: 'border-slate-600',
        text: 'text-slate-300',
        label: 'Pending Triage'
      };
    case 'Under Inspection':
      return {
        bg: 'bg-sky-500/15',
        border: 'border-sky-500/40',
        text: 'text-sky-400',
        label: 'Under Inspection'
      };
    case 'Repair Required':
      return {
        bg: 'bg-orange-500/15',
        border: 'border-orange-500/40',
        text: 'text-orange-400',
        label: 'Repair Required'
      };
    case 'Completed':
      return {
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/40',
        text: 'text-emerald-400',
        label: 'Cleared / Completed'
      };
    default:
      return {
        bg: 'bg-slate-800',
        border: 'border-slate-700',
        text: 'text-slate-400',
        label: status
      };
  }
}
