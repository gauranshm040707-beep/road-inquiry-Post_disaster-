import { calculatePriority, DAMAGE_TYPES, ROAD_IMPORTANCE_LEVELS, PASSAGE_STATUS_LEVELS, SAFETY_RISK_LEVELS } from '../utils/priorityEngine';

// Indian Disaster Response Services
export const EMERGENCY_SERVICES = {
  NDRF: {
    id: 'ndrf',
    name: 'NDRF Life Rescue Battalion',
    shortName: 'NDRF Rescue',
    icon: 'ShieldAlert',
    category: 'Search & Life Rescue',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40'
  },
  BRO_NHAI: {
    id: 'bro_nhai',
    name: 'BRO / NHAI Heavy Earthmoving & Excavator Corps',
    shortName: 'Heavy Excavators (BRO/NHAI)',
    icon: 'Truck',
    category: 'Heavy Engineering',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
  },
  EMS_108: {
    id: 'ems_108',
    name: '108 Disaster Ambulance & Trauma Life Support',
    shortName: '108 Trauma Ambulances',
    icon: 'HeartPulse',
    category: 'Medical Evacuation',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
  },
  AIR_RECON: {
    id: 'air_recon',
    name: 'IAF / Disaster Aerial Drone Recon & Heli-Drop',
    shortName: 'Aerial Heli & Drone Recon',
    icon: 'Radio',
    category: 'Aviation & Surveillance',
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/40'
  },
  POWER_GRID: {
    id: 'power_grid',
    name: 'State Electricity Board High-Tension Repair Unit',
    shortName: 'Power Grid Restoration',
    icon: 'Zap',
    category: 'Power & Utilities',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
  },
  CIVIL_RELIEF: {
    id: 'civil_relief',
    name: 'Disaster Civil Supply & Drinking Water Tankers',
    shortName: 'Relief Rations & Water',
    icon: 'Package',
    category: 'Humanitarian Supplies',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
  }
};

// Strategic Emergency Service Hubs across India
export const INDIAN_SERVICE_HUBS = [
  {
    id: 'HUB-NDRF-08',
    name: 'NDRF 8th Battalion Regional Response Base',
    type: 'NDRF Rescue Base',
    serviceKey: 'NDRF',
    coordinates: { lat: 30.3165, lng: 78.0322 }, // Dehradun / Rishikesh corridor
    locationName: 'Dehradun Valley, Uttarakhand',
    availableUnits: '12 Deep Search Rescue Teams, 4 Inflatable Raft Units, 2 Sniffer Dog Squads',
    contact: 'NDRF Control: 0135-241212',
    status: 'ACTIVE - DISPATCHED'
  },
  {
    id: 'HUB-BRO-01',
    name: 'Border Roads Organisation (BRO) Project Shivalik Depot',
    type: 'Heavy Engineering & Earthmovers',
    serviceKey: 'BRO_NHAI',
    coordinates: { lat: 30.1033, lng: 78.2947 }, // Rishikesh Bypass
    locationName: 'Rishikesh Hill Transit Hub',
    availableUnits: '8 Tracked Excavators, 6 Shovel Dozers, 14 Tipper Trucks, Rock Blasting Crew',
    contact: 'BRO Control: 0135-243019',
    status: 'DEPLOYED ON NH-58'
  },
  {
    id: 'HUB-AIIMS-RISH',
    name: 'AIIMS Rishikesh Apex Trauma Emergency Center',
    type: '108 Medical Lifeline Hub',
    serviceKey: 'EMS_108',
    coordinates: { lat: 30.0758, lng: 78.2880 },
    locationName: 'Virbhadra, Rishikesh',
    availableUnits: '24 Advanced Life Support Ambulances, Disaster Surgical Ward (120 beds ready)',
    contact: 'Emergency Trauma: 108 / 0135-2462929',
    status: 'GREEN CORRIDOR ACTIVE'
  },
  {
    id: 'HUB-IAF-HELI',
    name: 'Jolly Grant Disaster Airbase & Drone Command',
    type: 'Aerial Evacuation & Surveillance',
    serviceKey: 'AIR_RECON',
    coordinates: { lat: 30.1897, lng: 78.1803 },
    locationName: 'Dehradun Airport Sector',
    availableUnits: '3 Mi-17 V5 Transport Choppers, 2 Chetak Light Rescue, 6 Thermal UAVs',
    contact: 'Air Triage: 0135-241031',
    status: 'AIR RECON FLYING'
  },
  {
    id: 'HUB-MUM-PUNE',
    name: 'NHAI / MSRDC Western Command Quick Response Depot',
    type: 'Heavy Machinery & Highway Patrol',
    serviceKey: 'BRO_NHAI',
    coordinates: { lat: 18.7510, lng: 73.4080 }, // Lonavala / Khandala Ghat
    locationName: 'Lonavala Expressway Base, Maharashtra',
    availableUnits: '4 Heavy Hydraulic Cranes, 8 Quick Rescue Tows, 6 Emergency Ambulances',
    contact: 'Expressway Helpline: 9822498224 / 1033',
    status: 'ON STANDBY'
  }
];

export const INITIAL_REPORTS = [
  {
    id: 'IND-2026-101',
    roadName: 'Rishikesh - Badrinath National Highway (NH-58), Chamoli Pass',
    sector: 'Uttarakhand - Garhwal Himalayan Sector',
    coordinates: { lat: 30.3753, lng: 79.3312 },
    damageType: 'Landslide / Mudslide',
    severity: 'High',
    roadImportance: ROAD_IMPORTANCE_LEVELS.LIFELINE,
    passageStatus: PASSAGE_STATUS_LEVELS.BLOCKED,
    publicSafetyRisk: SAFETY_RISK_LEVELS.IMMINENT,
    reportedAt: '2026-10-22T08:15:00Z',
    inspector: 'Commander Rajesh Sharma (BRO Task Force)',
    status: 'Repair Required',
    photos: ['/images/landslide.jpg'],
    description: 'Massive rockslide triggered by torrential cloudburst. Over 650 cubic meters of boulders, mud, and severed pine trees have obliterated 90 meters of NH-58 near Chamoli. All pilgrim, civilian, and army supply convoys completely halted.',
    estimatedRepairHours: 48,
    requiredServices: [
      'Heavy Excavators (BRO/NHAI)',
      'NDRF Rescue',
      '108 Trauma Ambulances',
      'Aerial Heli & Drone Recon'
    ],
    requiredEquipment: ['BRO Tracked Rock Breaker 35T', 'Hydraulic Dozers (4x)', 'Wire Rope Winch', 'Pre-cast Concrete Cribs'],
    inspectionHistory: [
      {
        id: 'LOG-IND-01',
        timestamp: '2026-10-22T08:30:00Z',
        user: 'District Magistrate Office, Chamoli',
        action: 'Disaster Warning Issued',
        note: 'NH-58 closed for all traffic. Green corridor requested via Tehri route.'
      },
      {
        id: 'LOG-IND-02',
        timestamp: '2026-10-22T09:45:00Z',
        user: 'BRO Project Shivalik',
        action: 'Heavy Machinery Dispatched',
        note: 'Two 35-ton hydraulic rock breakers deployed from Joshimath base.'
      },
      {
        id: 'LOG-IND-03',
        timestamp: '2026-10-22T11:20:00Z',
        user: 'NDRF 8th Battalion',
        action: 'Rescue Perimeter Established',
        note: 'Stranded civilian passengers safely evacuated to transit camp at Pipalkoti.'
      }
    ],
    isSample: true
  },
  {
    id: 'IND-2026-102',
    roadName: 'Mumbai - Pune Expressway (Bhor Ghat Section, Km 42)',
    sector: 'Maharashtra - Western Ghats Transit Zone',
    coordinates: { lat: 18.7562, lng: 73.3421 },
    damageType: 'Bridge Collapse / Structural Crack',
    severity: 'High',
    roadImportance: ROAD_IMPORTANCE_LEVELS.LIFELINE,
    passageStatus: PASSAGE_STATUS_LEVELS.BLOCKED,
    publicSafetyRisk: SAFETY_RISK_LEVELS.IMMINENT,
    reportedAt: '2026-10-22T09:05:00Z',
    inspector: 'Senior Eng. A. Deshmukh (MSRDC)',
    status: 'Under Inspection',
    photos: ['/images/bridge.jpg'],
    description: 'Post-monsoon foundation shift observed on Khandala Viaduct Pier 12. Transverse concrete crack measures 18mm with exposed rebar. Both Mumbai-bound lanes shut down due to imminent structural collapse risk.',
    estimatedRepairHours: 60,
    requiredServices: [
      'Heavy Excavators (BRO/NHAI)',
      '108 Trauma Ambulances',
      'Power Grid Restoration'
    ],
    requiredEquipment: ['Heavy Crane 50T', 'Hydraulic Shoring Jacks', 'Non-Destructive Ultrasonic Sensors', 'Epoxy Grout Pump'],
    inspectionHistory: [
      {
        id: 'LOG-IND-04',
        timestamp: '2026-10-22T09:20:00Z',
        user: 'Highway Safety Patrol',
        action: 'Expressway Alert Logged',
        note: 'Traffic diverted to Old Mumbai-Pune Highway (NH-48).'
      },
      {
        id: 'LOG-IND-05',
        timestamp: '2026-10-22T10:15:00Z',
        user: 'MSRDC Structural Wing',
        action: 'Laser Deflection Audit',
        note: '18mm displacement confirmed. Immediate steel shoring required before reopening.'
      }
    ],
    isSample: true
  },
  {
    id: 'IND-2026-103',
    roadName: 'NH-66 Mumbai - Goa Highway (Vashishti River Bridge Approach, Chiplun)',
    sector: 'Konkan - Coastal River Basin',
    coordinates: { lat: 17.5323, lng: 73.5182 },
    damageType: 'Flood / Submerged Roadway',
    severity: 'High',
    roadImportance: ROAD_IMPORTANCE_LEVELS.ARTERIAL,
    passageStatus: PASSAGE_STATUS_LEVELS.EMERGENCY_ONLY,
    publicSafetyRisk: SAFETY_RISK_LEVELS.STRUCTURAL,
    reportedAt: '2026-10-22T07:40:00Z',
    inspector: 'Deputy Collector Patil (Ratnagiri REOC)',
    status: 'Pending',
    photos: ['/images/flood.jpg'],
    description: 'Vashishti river breached safety embankment in Chiplun. Over 1.8 km of 4-lane highway submerged under 4.5 feet of turbulent muddy water. Foundation scour suspected near north abutment.',
    estimatedRepairHours: 36,
    requiredServices: [
      'NDRF Rescue',
      'Relief Rations & Water',
      '108 Trauma Ambulances'
    ],
    requiredEquipment: ['NDRF Inflatable Motor Boats (6x)', 'High-Capacity Dewatering Sludge Pumps', 'Echo Sounder Sonar'],
    inspectionHistory: [
      {
        id: 'LOG-IND-06',
        timestamp: '2026-10-22T07:45:00Z',
        user: 'Central Water Commission (CWC)',
        action: 'Danger Mark Crossed',
        note: 'Red flood alert broadcasted for Chiplun municipal belt.'
      }
    ],
    isSample: true
  },
  {
    id: 'IND-2026-104',
    roadName: 'Delhi - Meerut Expressway (Hindan River Approach Bridge, Ghaziabad)',
    sector: 'Delhi NCR - Eastern Medical Corridor',
    coordinates: { lat: 28.6692, lng: 77.4538 },
    damageType: 'Deep Sinkhole / Asphalt Failure',
    severity: 'Medium',
    roadImportance: ROAD_IMPORTANCE_LEVELS.LIFELINE,
    passageStatus: PASSAGE_STATUS_LEVELS.SINGLE_LANE,
    publicSafetyRisk: SAFETY_RISK_LEVELS.STRUCTURAL,
    reportedAt: '2026-10-22T10:30:00Z',
    inspector: 'Executive Eng. Vikramjit Singh (NHAI Delhi Unit)',
    status: 'Under Inspection',
    photos: ['/images/sinkhole.jpg'],
    description: 'Burst subterranean 1200mm storm drain caused rapid sub-base erosion, opening a 20-foot wide crater beneath the expressway shoulder and left transit lane. Exposed gas pipeline secured.',
    estimatedRepairHours: 24,
    requiredServices: [
      'Heavy Excavators (BRO/NHAI)',
      'Power Grid Restoration'
    ],
    requiredEquipment: ['Hydro-Vacuum Excavator', 'Pre-cast Concrete Box Culvert', 'Dry Lean Concrete Mixer'],
    inspectionHistory: [
      {
        id: 'LOG-IND-07',
        timestamp: '2026-10-22T10:35:00Z',
        user: 'Traffic Control Room Delhi',
        action: 'Lane Diversion Activated',
        note: 'Single lane traffic allowed with 20km/h restriction.'
      }
    ],
    isSample: true
  },
  {
    id: 'IND-2026-105',
    roadName: 'Wayanad Thamarassery Mountain Pass (NH-766, Hairpin Bend 9)',
    sector: 'Kerala - Western Ghats Sector',
    coordinates: { lat: 11.5034, lng: 76.0245 },
    damageType: 'Landslide / Mudslide',
    severity: 'High',
    roadImportance: ROAD_IMPORTANCE_LEVELS.ARTERIAL,
    passageStatus: PASSAGE_STATUS_LEVELS.BLOCKED,
    publicSafetyRisk: SAFETY_RISK_LEVELS.IMMINENT,
    reportedAt: '2026-10-22T06:15:00Z',
    inspector: 'Inspector Mathew K. (Kerala SDRF)',
    status: 'Repair Required',
    photos: ['/images/landslide.jpg'],
    description: 'Debris flow from upper hill slope collapsed retaining wall across hairpin curve 9. Essential food grain and medical supply line connecting Kozhikode to Wayanad district completely severed.',
    estimatedRepairHours: 32,
    requiredServices: [
      'Heavy Excavators (BRO/NHAI)',
      'NDRF Rescue',
      'Relief Rations & Water'
    ],
    requiredEquipment: ['JCB Excavators (3x)', 'Gabion Metal Mattresses', 'Chainsaw Clearing Teams'],
    inspectionHistory: [
      {
        id: 'LOG-IND-08',
        timestamp: '2026-10-22T06:30:00Z',
        user: 'Wayanad District Collectorate',
        action: 'Emergency Declared',
        note: 'Emergency transit convoy ordered via Kuttiyadi alternative route.'
      }
    ],
    isSample: true
  },
  {
    id: 'IND-2026-106',
    roadName: 'Kullu - Manali Highway (NH-3 Beas River Corridor, Raison)',
    sector: 'Himachal Pradesh - Beas Valley Sector',
    coordinates: { lat: 32.0596, lng: 77.1487 },
    damageType: 'Severe Potholes / Washout',
    severity: 'High',
    roadImportance: ROAD_IMPORTANCE_LEVELS.LIFELINE,
    passageStatus: PASSAGE_STATUS_LEVELS.EMERGENCY_ONLY,
    publicSafetyRisk: SAFETY_RISK_LEVELS.IMMINENT,
    reportedAt: '2026-10-22T11:45:00Z',
    inspector: 'Col. K. Verma (BRO Project Rohtang)',
    status: 'Under Inspection',
    photos: ['/images/flood.jpg'],
    description: 'Swollen Beas river eroded 140m of road foundation along NH-3. Half of the two-lane roadway has collapsed into the river canyon. Critical lifeline to Manali and Leh-Ladakh defense corridor.',
    estimatedRepairHours: 54,
    requiredServices: [
      'Heavy Excavators (BRO/NHAI)',
      'Aerial Heli & Drone Recon',
      'NDRF Rescue'
    ],
    requiredEquipment: ['Heavy Boulders (600T)', 'Heavy Crane 40T', 'Reinforced Soil Retaining Mesh'],
    inspectionHistory: [
      {
        id: 'LOG-IND-09',
        timestamp: '2026-10-22T11:55:00Z',
        user: 'BRO Emergency Operations',
        action: 'Military Emergency Declared',
        note: 'BRO engineers constructing emergency single-track hillside diversion.'
      }
    ],
    isSample: true
  },
  {
    id: 'IND-2026-107',
    roadName: 'NH-44 Grand Trunk Highway (Ambala Cantt Overpass)',
    sector: 'Punjab / Haryana - GT Road Corridor',
    coordinates: { lat: 30.3782, lng: 76.7767 },
    damageType: 'Surface Fissures / Buckling',
    severity: 'Low',
    roadImportance: ROAD_IMPORTANCE_LEVELS.ARTERIAL,
    passageStatus: PASSAGE_STATUS_LEVELS.PASSABLE,
    publicSafetyRisk: SAFETY_RISK_LEVELS.LOW,
    reportedAt: '2026-10-22T05:30:00Z',
    inspector: 'Assistant Eng. Gaurav Joshi (NHAI Ambala)',
    status: 'Completed',
    photos: ['/images/bridge.jpg'],
    description: 'Monsoon seepage caused asphalt surface undulation and minor fissures along fast lane shoulder. Cold bituminous mix applied and verified. Full four lanes cleared and certified safe.',
    estimatedRepairHours: 6,
    requiredServices: [
      'Heavy Excavators (BRO/NHAI)'
    ],
    requiredEquipment: ['Cold Bituminous Patch Unit', 'Vibratory Mini Roller', 'Traffic Cones'],
    inspectionHistory: [
      {
        id: 'LOG-IND-10',
        timestamp: '2026-10-22T05:40:00Z',
        user: 'NHAI Highway Patrol 1033',
        action: 'Routine Surface Log',
        note: 'Patch work initiated immediately.'
      },
      {
        id: 'LOG-IND-11',
        timestamp: '2026-10-22T09:10:00Z',
        user: 'NHAI Project Director',
        action: 'Repairs Completed',
        note: 'Clearance certificate issued. Road restored to full speed.'
      }
    ],
    isSample: true
  },
  {
    id: 'IND-2026-108',
    roadName: 'Guwahati - Shillong National Highway (NH-6, Nongpoh Ghat)',
    sector: 'North East - Assam / Meghalaya Corridor',
    coordinates: { lat: 25.8892, lng: 91.8741 },
    damageType: 'Debris & Fallen Trees',
    severity: 'Medium',
    roadImportance: ROAD_IMPORTANCE_LEVELS.ARTERIAL,
    passageStatus: PASSAGE_STATUS_LEVELS.SINGLE_LANE,
    publicSafetyRisk: SAFETY_RISK_LEVELS.MODERATE,
    reportedAt: '2026-10-22T10:00:00Z',
    inspector: 'Officer T. Sangma (Meghalaya SDRF)',
    status: 'Pending',
    photos: ['/images/sinkhole.jpg'],
    description: 'Severe squall and heavy rains uprooted 6 massive eucalyptus trees and snapped high-tension electric cables across northbound lane. Single lane traffic moving with Meghalaya police escort.',
    estimatedRepairHours: 14,
    requiredServices: [
      'Power Grid Restoration',
      'Heavy Excavators (BRO/NHAI)'
    ],
    requiredEquipment: ['Meghalaya Energy Corp Boom Truck', 'Hydraulic Crane', 'Industrial Chainsaws'],
    inspectionHistory: [
      {
        id: 'LOG-IND-12',
        timestamp: '2026-10-22T10:10:00Z',
        user: 'Nongpoh Police Station',
        action: 'Traffic Advisory Broadcast',
        note: 'Power isolated; clearance crew en route.'
      }
    ],
    isSample: true
  }
];

// Initialize all reports with automated priority calculations
export function getInitialReports() {
  return INITIAL_REPORTS.map(report => {
    const priorityData = calculatePriority({
      severity: report.severity,
      passageStatus: report.passageStatus,
      roadImportance: report.roadImportance,
      publicSafetyRisk: report.publicSafetyRisk,
      damageType: report.damageType
    });

    return {
      ...report,
      priorityScore: priorityData.score,
      priorityLevel: priorityData.level,
      priorityReasons: priorityData.reasons
    };
  });
}
