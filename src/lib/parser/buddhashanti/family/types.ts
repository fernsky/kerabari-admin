interface EnumeratorIntroduction {
  enumerator_name: string;
  enumerator_phone: string;
  enumerator_id: string;
  building_token: string;
}

interface Location {
  type: "Point";
  coordinates: [number, number, number];
  properties: {
    accuracy: number;
  };
}

interface FamilyIdentification {
  ward_no: number;
  area_code: string;
  house_token_number: string;
  fam_symno: string;
  ask_owner_only: string;
  doi: string;
  tmp_location: Location;
  location: string;
  locality: string;
  dev_org: string;
  head_name: string;
  head_ph: string;
  members: {
    are_a_family: string;
    total_mem: number;
    is_sanitized: string;
  };
  ewheres: {
    are_ewhere: string;
  };
}

interface HouseholdInfo {
  h_oship: string;
  h_oship_oth?: string | null;
  tmp_is_safe: string;
  is_safe: string;
  wsrc: string;
  water_src_oth?: string | null;
  water_puri: string;
  toilet_type: string;
  solid_waste: string;
  solid_waste_oth?: string | null;
  primary_cf: string;
  primary_es: string;
  primary_es_oth?: string | null;
  facilitites: string;
  fem_prop: string;
  loaned_organization: string;
  loan_use: string;
  has_bacc: string;
  has_insurance: string;
  health_org: string;
  heatlth_org_oth?: string | null;
  income_sources: string;
  municipal_suggestions: string;
  municipal_suggestions_oth?: string | null;
}

interface FamilyHistoryInfo {
  NID?: string | null;
  caste: string;
  caste_oth?: string | null;
  ancestrial_lang: string;
  ancestrial_lang_oth?: string | null;
  mother_tounge_primary: string;
  mother_tounge_primary_oth?: string | null;
  religion: string;
  religion_other?: string | null;
}

interface DeathDetails {
  death_enumerator: string;
  death_house_head_name: string;
  death_ward_no: string;
  death_name: string;
  death_gender: string;
  death_age: number;
  death_cause: string;
  fertile_death_condition?: string | null;
  __id: string;
}

interface DeathInfo {
  has_recent_death: string;
  dno: {
    death_no: number;
    death_details: DeathDetails[];
  };
}

interface BirthPlaceInfo {
  birth_place: string;
  birth_province?: string | null;
  birth_district?: string | null;
  birth_country?: string | null;
}

interface PriorLocationInfo {
  prior_location?: string | null;
  prior_province?: string | null;
  prior_district?: string | null;
  prior_country?: string | null;
  residence_reasons: string;
  residence_reasons_other?: string | null;
}

interface GrassAreaDescription {
  grasses_note?: string | null;
  grass_bigha: number;
  grass_kattha: number;
  grass_dhur: number;
  grass_area: string;
  grass_area_note?: string | null;
}

interface CropAreaDescription {
  frop_note?: string | null;
  fcrop_bigha: number;
  fcrop_kattha: number;
  fcrop_dhur: number;
  fcrop_area: string;
  fcrop_area_note?: string | null;
}

interface CropProduction {
  frop_note_prod?: string | null;
  BA01_11: number;
  BA01_12: number;
  BA01_13: number;
  BA01_14: number;
  fcrop_prod: string;
}

interface FoodCropDetails {
  dfc: string;
  fcrop_ward_no: string;
  fcrop: string;
  fcrop_enumerator: string;
  fcrop_house_head_name: string;
  fcrop_area_description: CropAreaDescription;
  fp: CropProduction;
  __id: string;
}

interface AgricultureInfo {
  has_agland: string;
  aglands_oship: string;
  agricultural_land_count: string;
  is_farmer: string;
  total_male_farmer: number;
  total_female_farmer: number;
  food: {
    fcrops: string;
    fcrop_details: FoodCropDetails[];
    // ... similar structures for pulses, oil seeds, vegetables, etc.
  };
  months_sustained_from_agriculture: string;
  has_husbandry: string;
  animals: string;
  aprods: string;
  has_aquacultured: string;
  has_apicultured: string;
  months_involved_in_agriculture: string;
  agri_machines: string;
}

interface IndividualInfo {
  ind_ward_no: string;
  dind: string;
  ind_enumerator: string;
  ind_house_head_name: string;
  name: string;
  gender: string;
  age: number;
  citizenof: string;
  citizenof_oth?: string | null;
  individual_history_info: {
    caste_individual?: string | null;
    caste_oth_individual?: string | null;
    ancestrial_lang_individual?: string | null;
    ancestrial_lang_oth_individual?: string | null;
    mother_tounge_primary_individual?: string | null;
    mother_tounge_primary_oth_individual?: string | null;
    religion_individual?: string | null;
    religion_other_individual?: string | null;
  };
  mrd: {
    marital_status: string;
    married_age: number;
  };
  __id: string;
}

interface SystemInfo {
  submissionDate: string;
  updatedAt?: string | null;
  submitterId: string;
  submitterName: string;
  attachmentsPresent: number;
  attachmentsExpected: number;
  status?: string | null;
  reviewState?: string | null;
  deviceId: string;
  edits: number;
  formVersion: string;
}

interface HealthDetails {
  dhlth: string;
  health_ward_no: string;
  health_name: string;
  health_age: string;
  health_enumerator: string;
  health_house_head_name: string;
  chronic: {
    has_chronic_disease: string;
    primary_chronic_disease: string;
    other_chronic_disease: string | null;
  };
  is_disabled: string;
  disability: {
    dsbltp: string;
    other_disability_type: string | null;
    disability_cause: string;
    other_disability_cause: string | null;
  };
  __id: string;
}

interface FertilityDetails {
  fertility_ward_no: string;
  fertility_name: string;
  fertility_age: string;
  fertility_gender: string;
  fertility_marital_status: string;
  fertility_enumerator: string;
  fertility_house_head_name: string;
  ftd: {
    gave_live_birth: string | null;
    alive_sons: number | null;
    alive_daughters: number | null;
    total_born_children: number | null;
    NFTBRTH: string | null;
    has_dead_children: string | null;
    dead_sons: number | null;
    dead_daughters: number | null;
    total_dead_children: number | null;
    NFTDEAD: string | null;
    frcb: {
      gave_recent_live_birth: string | null;
      recent_alive_sons: number | null;
      recent_alive_daughters: number | null;
      total_recent_children: number | null;
      NFTRBRTH: string | null;
      recent_delivery_location: string | null;
      prenatal_checkup: string | null;
    };
    delivery_age: number | null;
  };
  __id: string;
}

interface AbsenteeLocation {
  abs_location: string;
  abs_province?: string | null;
  abs_district?: string | null;
  abs_country?: string | null;
  FOREIGN: string;
}

interface AbsenteeIdentification {
  abs_age: number;
  abs_edulvl: string;
  ABSPRD: string;
  absence_reason: string;
  abl: AbsenteeLocation;
  sent_cash: string;
  cash: number;
}

interface Absentee {
  dabs: string;
  absentees_ward_no: string;
  abs_name: string;
  abs_gender: string;
  abs_prior_edulvl: string;
  abs_prior_age: string;
  abs_enumerator: string;
  abs_house_head_name: string;
  is_absent: string;
  abid: AbsenteeIdentification;
  __id: string;
}

interface EconomyEducationDetails {
  work_barrier: string;
  work_availability: string;
}

interface EconomyDetails {
  m_work: string;
  primary_occu: string;
  EA02: EconomyEducationDetails;
}

interface Economy {
  deco: string;
  economy_ward_no: string;
  eco_age: string;
  eco_name: string;
  eco_enumerator: string;
  eco_house_head_name: string;
  ed: EconomyDetails;
  __id: string;
}

interface EducationDetails {
  is_literate: string;
  edu_level: string;
  primary_sub: string | null;
}

interface EducationTraining {
  has_training: string;
  primary_skill: string;
}

interface Education {
  dedu: string;
  education_ward_no: string;
  edu_age: string;
  edu_name: string;
  edu_enumerator: string;
  edu_house_head_name: string;
  edd: EducationDetails;
  goes_school: string;
  school_barrier: string | null;
  edt: EducationTraining;
  __id: string;
}

export interface RawFamily {
  intro?: string | null;
  audio_monitoring: string;
  enumerator_introduction: EnumeratorIntroduction;
  last_house_token_number?: string | null;
  start_doi: string;
  id: FamilyIdentification;
  A?: string | null;
  hh_count: string;
  hh: HouseholdInfo;
  family_history_info: FamilyHistoryInfo;
  NED?: string | null;
  education_count: string;
  education: Education[];
  NH?: string | null;
  health_count: string;
  health: HealthDetails[];
  NFT?: string | null;
  fertility_count: string;
  fertility: FertilityDetails[];
  NDD?: string | null;
  death: DeathInfo;
  NAR?: string | null;
  absentees_count: string;
  absentees: Absentee[];
  has_remittance: string;
  remittance_expenses: string;
  NMG?: string | null;
  bp: BirthPlaceInfo;
  plocation: PriorLocationInfo;
  NEA?: string | null;
  economy_count: string;
  economy: Economy[];
  B?: string | null;
  agri_count: string;
  agri: AgricultureInfo;
  himg: string;
  himg_selfie: string;
  meta: {
    instanceID: string;
    instanceName: string;
  };
  __id: string;
  __system: SystemInfo;
  individual: IndividualInfo[];
}
