// Centralized constants for the Question Paper generator
import COMPREHENSIVE_SUBJECTS from './subjects.json';

// Export the comprehensive subject list from JSON
export const SUBJECTS_LIST = COMPREHENSIVE_SUBJECTS;

// Legacy subject list (keeping for backward compatibility)
export const SUBJECTS: string[] = [
  // --- CBSE Class 10 Core ---
  "English",
  "Hindi",
  "Mathematics",
  "Science",
  "Social Science",
  "Information Technology",
  "Computer Applications",
  "Sanskrit",
  "French",
  "German",
  // --- CBSE Class 12 Streams ---
  // Science
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Informatics Practices",
  "Physical Education",
  "Engineering Graphics",
  "Biotechnology",
  // Commerce
  "Accountancy",
  "Business Studies",
  "Economics",
  "Applied Mathematics",
  "Entrepreneurship",
  // Arts/Humanities
  "History",
  "Geography",
  "Political Science",
  "Sociology",
  "Psychology",
  "Home Science",
  "Philosophy",
  "Legal Studies",
  "Fine Arts",
  "Music",
  // --- College / B.Tech / BCA / Engineering ---
  // Computer & IT
  "Data Structures",
  "Algorithms",
  "Operating Systems",
  "Database Management System",
  "Computer Networks",
  "Software Engineering",
  "Object-Oriented Programming",
  "Theory of Computation",
  "Artificial Intelligence",
  "Machine Learning",
  "Cyber Security",
  "Web Development",
  "Mobile App Development",
  "Cloud Computing",
  // Electronics & Electrical
  "Digital Electronics",
  "Analog Electronics",
  "Microprocessors",
  "Embedded Systems",
  "VLSI Design",
  "Signals and Systems",
  "Control Systems",
  "Power Electronics",
  // Mechanical
  "Engineering Mechanics",
  "Thermodynamics",
  "Fluid Mechanics",
  "Manufacturing Processes",
  "Automobile Engineering",
  "Robotics",
  // Civil
  "Structural Engineering",
  "Surveying",
  "Environmental Engineering",
  "Transportation Engineering",
  "Hydrology",
  // Core Subjects
  "Mathematics I",
  "Mathematics II",
  "Physics for Engineers",
  "Engineering Chemistry",
  "Engineering Drawing",
  "Communication Skills",
  // Management & Humanities
  "Economics for Engineers",
  "Environmental Studies",
  "Ethics in Engineering",
  "Management Principles",
];

export const QUESTION_TYPES: string[] = [
 "Multiple Choice Questions (MCQs)",
"True or False Questions",
"Fill in the Blanks Questions",
"Match the Following Questions",
"Very Short Answer Questions",
"Short Answer Questions",
"Long Answer Questions",
"One Word Answer Questions",
"Assertion-Reason Questions",
"Case Study-Based Questions",
"Diagram-Based Questions",
"Numerical Problem Questions",
"Derivation Questions",
"Proof-Based Questions",
"Definition Questions",
"Explain with Example Questions",
"Distinguish Between Questions",
"Label the Diagram Questions",
"Coding Questions",
"Output Prediction Questions",
"Debugging Questions",
"Algorithm or Flowchart Questions",
"Comprehension-Based Questions",
"Application-Based Questions",
"Data Interpretation Questions",
"Hotspot/Interactive Questions",
"Sequencing or Ordering Questions",
"Assertion-Reason with MCQ Format"
];

export const DIFFICULTY_OPTIONS = [
  { value: "very-easy", label: "Very Easy" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "very-hard", label: "Very Hard" },
] as const;

export const AUDIENCE_OPTIONS = [
  { value: "school", label: "School" },
  { value: "undergraduate", label: "Under Graduate" },
  { value: "postgraduate", label: "Post Graduate" },
  { value: "phd", label: "PhD" },
] as const;

export const BOARD_OPTIONS: string[] = [
  "CBSE",
  "Cambridge (IGCSE)",
  "Edexcel (IGCSE)",
  "ICSE",
  "ISC",
  "International Baccalaureate (IB)",
];

export const CLASS_OPTIONS: string[] = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);

export const UNDERGRADUATE_DEGREES = [
  // B.Tech Branches
  { value: "btech_cse", label: "B.Tech - Computer Science and Engineering (CSE)" },
  { value: "btech_it", label: "B.Tech - Information Technology (IT)" },
  { value: "btech_ece", label: "B.Tech - Electronics and Communication Engineering (ECE)" },
  { value: "btech_eee", label: "B.Tech - Electrical and Electronics Engineering (EEE)" },
  { value: "btech_mech", label: "B.Tech - Mechanical Engineering" },
  { value: "btech_civil", label: "B.Tech - Civil Engineering" },
  { value: "btech_chem", label: "B.Tech - Chemical Engineering" },
  { value: "btech_aero", label: "B.Tech - Aeronautical Engineering" },
  { value: "btech_auto", label: "B.Tech - Automobile Engineering" },
  { value: "btech_bio", label: "B.Tech - Biotechnology" },
  { value: "btech_ai", label: "B.Tech - Artificial Intelligence and Machine Learning" },
  { value: "btech_ds", label: "B.Tech - Data Science" },
  { value: "btech_cyber", label: "B.Tech - Cyber Security" },
  { value: "btech_env", label: "B.Tech - Environmental Engineering" },
  { value: "btech_biomed", label: "B.Tech - Biomedical Engineering" },

  // B.E. Branches
  { value: "be_cse", label: "B.E. - Computer Science and Engineering" },
  { value: "be_ece", label: "B.E. - Electronics and Communication Engineering" },
  { value: "be_eee", label: "B.E. - Electrical and Electronics Engineering" },
  { value: "be_mech", label: "B.E. - Mechanical Engineering" },
  { value: "be_civil", label: "B.E. - Civil Engineering" },
  { value: "be_production", label: "B.E. - Production Engineering" },
  { value: "be_instrumentation", label: "B.E. - Instrumentation Engineering" },

  // Science & IT
  { value: "bsc_cs", label: "B.Sc - Computer Science" },
  { value: "bsc_it", label: "B.Sc - Information Technology" },
  { value: "bsc_ds", label: "B.Sc - Data Science" },
  { value: "bsc_ai", label: "B.Sc - Artificial Intelligence" },
  { value: "bsc_physics", label: "B.Sc - Physics" },
  { value: "bsc_chemistry", label: "B.Sc - Chemistry" },
  { value: "bsc_math", label: "B.Sc - Mathematics" },
  { value: "bsc_bio", label: "B.Sc - Biology" },
  { value: "bsc_biotech", label: "B.Sc - Biotechnology" },
  { value: "bsc_agriculture", label: "B.Sc - Agriculture" },
  { value: "bsc_horticulture", label: "B.Sc - Horticulture" },
  { value: "bsc_microbiology", label: "B.Sc - Microbiology" },
  { value: "bsc_env", label: "B.Sc - Environmental Science" },
  { value: "bsc_stats", label: "B.Sc - Statistics" },

  // Paramedical & Medical Allied
  { value: "bmlt", label: "BMLT - Bachelor of Medical Laboratory Technology" },
  { value: "bmrit", label: "BMRIT - Bachelor of Medical Radiology and Imaging Technology" },
  { value: "bopt", label: "B.Optom - Bachelor of Optometry" },
  { value: "bot", label: "BOT - Bachelor of Occupational Therapy" },
  { value: "bph", label: "BPH - Bachelor of Public Health" },
  { value: "bsc_nursing", label: "B.Sc - Nursing" },
  { value: "bpharm", label: "B.Pharm - Bachelor of Pharmacy" },
  { value: "bpt", label: "BPT - Bachelor of Physiotherapy" },
  { value: "bds", label: "BDS - Bachelor of Dental Surgery" },
  { value: "mbbs", label: "MBBS - Bachelor of Medicine, Bachelor of Surgery" },

  // Management, Commerce & Law
  { value: "bba", label: "BBA - Bachelor of Business Administration" },
  { value: "bms", label: "BMS - Bachelor of Management Studies" },
  { value: "bcom", label: "B.Com - Bachelor of Commerce" },
  { value: "ba_llb", label: "BA LLB - Integrated Bachelor of Arts and Law" },
  { value: "bba_llb", label: "BBA LLB - Integrated Bachelor of Business Administration and Law" },
  { value: "llb", label: "LLB - Bachelor of Laws" },

  // Arts, Design & Humanities
  { value: "ba_english", label: "BA - English" },
  { value: "ba_history", label: "BA - History" },
  { value: "ba_economics", label: "BA - Economics" },
  { value: "ba_psychology", label: "BA - Psychology" },
  { value: "ba_sociology", label: "BA - Sociology" },
  { value: "ba_political", label: "BA - Political Science" },
  { value: "ba_media", label: "BA - Journalism & Mass Communication" },
  { value: "bfa", label: "BFA - Bachelor of Fine Arts" },
  { value: "bdes", label: "B.Des - Bachelor of Design" },
  { value: "bfashion", label: "B.Fashion - Bachelor of Fashion Design" },
  { value: "barch", label: "B.Arch - Bachelor of Architecture" },
  { value: "bpa", label: "BPA - Bachelor of Performing Arts" },

  // Vocational / Specialized
  { value: "bvoc", label: "B.Voc - Bachelor of Vocation" },
  { value: "bskills", label: "B.Skills - Bachelor of Skills" },
  { value: "blib", label: "B.Lib - Bachelor of Library Science" },
  { value: "bca", label: "BCA - Bachelor of Computer Applications" },
] as const;

export const POSTGRADUATE_DEGREES = [
  // M.Tech Branches
  { value: "mtech_cse", label: "M.Tech - Computer Science and Engineering" },
  { value: "mtech_it", label: "M.Tech - Information Technology" },
  { value: "mtech_ece", label: "M.Tech - Electronics and Communication Engineering" },
  { value: "mtech_eee", label: "M.Tech - Electrical and Electronics Engineering" },
  { value: "mtech_mech", label: "M.Tech - Mechanical Engineering" },
  { value: "mtech_civil", label: "M.Tech - Civil Engineering" },
  { value: "mtech_chem", label: "M.Tech - Chemical Engineering" },
  { value: "mtech_ai", label: "M.Tech - Artificial Intelligence" },
  { value: "mtech_ds", label: "M.Tech - Data Science" },
  { value: "mtech_vlsi", label: "M.Tech - VLSI Design" },
  { value: "mtech_embedded", label: "M.Tech - Embedded Systems" },
  { value: "mtech_cyber", label: "M.Tech - Cyber Security" },
  { value: "mtech_env", label: "M.Tech - Environmental Engineering" },
  { value: "mtech_biomed", label: "M.Tech - Biomedical Engineering" },

  // M.E. Branches
  { value: "me_cse", label: "M.E. - Computer Science and Engineering" },
  { value: "me_ece", label: "M.E. - Electronics and Communication Engineering" },
  { value: "me_mech", label: "M.E. - Mechanical Engineering" },
  { value: "me_civil", label: "M.E. - Civil Engineering" },

  // Science & IT
  { value: "msc_cs", label: "M.Sc - Computer Science" },
  { value: "msc_it", label: "M.Sc - Information Technology" },
  { value: "msc_ds", label: "M.Sc - Data Science" },
  { value: "msc_ai", label: "M.Sc - Artificial Intelligence" },
  { value: "msc_physics", label: "M.Sc - Physics" },
  { value: "msc_chemistry", label: "M.Sc - Chemistry" },
  { value: "msc_math", label: "M.Sc - Mathematics" },
  { value: "msc_bio", label: "M.Sc - Biology" },
  { value: "msc_biotech", label: "M.Sc - Biotechnology" },
  { value: "msc_microbiology", label: "M.Sc - Microbiology" },
  { value: "msc_env", label: "M.Sc - Environmental Science" },
  { value: "msc_stats", label: "M.Sc - Statistics" },

  // Paramedical & Medical Allied
  { value: "mlt", label: "MMLT - Master of Medical Laboratory Technology" },
  { value: "mrit", label: "MMRIT - Master of Medical Radiology and Imaging Technology" },
  { value: "mopt", label: "M.Optom - Master of Optometry" },
  { value: "mot", label: "MOT - Master of Occupational Therapy" },
  { value: "mph", label: "MPH - Master of Public Health" },
  { value: "msc_nursing", label: "M.Sc - Nursing" },
  { value: "mpharm", label: "M.Pharm - Master of Pharmacy" },
  { value: "mpt", label: "MPT - Master of Physiotherapy" },
  { value: "mds", label: "MDS - Master of Dental Surgery" },
  { value: "md", label: "MD - Doctor of Medicine" },
  { value: "ms", label: "MS - Master of Surgery" },
  { value: "mvsc", label: "M.V.Sc - Master of Veterinary Science" },

  // Management, Commerce & Law
  { value: "mca", label: "MCA - Master of Computer Applications" },
  { value: "mba", label: "MBA - Master of Business Administration" },
  { value: "mba_finance", label: "MBA - Finance" },
  { value: "mba_hr", label: "MBA - Human Resources" },
  { value: "mba_marketing", label: "MBA - Marketing" },
  { value: "mba_ba", label: "MBA - Business Analytics" },
  { value: "mcom", label: "M.Com - Master of Commerce" },
  { value: "llm", label: "LLM - Master of Laws" },
  { value: "mpa", label: "MPA - Master of Public Administration" },
  { value: "mpp", label: "MPP - Master of Public Policy" },

  // Arts, Design & Humanities
  { value: "ma_english", label: "MA - English" },
  { value: "ma_history", label: "MA - History" },
  { value: "ma_economics", label: "MA - Economics" },
  { value: "ma_psychology", label: "MA - Psychology" },
  { value: "ma_sociology", label: "MA - Sociology" },
  { value: "ma_political", label: "MA - Political Science" },
  { value: "ma_media", label: "MA - Journalism & Mass Communication" },
  { value: "mfa", label: "MFA - Master of Fine Arts" },
  { value: "mdes", label: "M.Des - Master of Design" },
  { value: "march", label: "M.Arch - Master of Architecture" },
  { value: "mlis", label: "MLIS - Master of Library and Information Science" },
] as const;


export const TYPEAHEAD_DEFAULTS = {
  threshold: 0.35,
  limit: 8,
};
