/** Sample data for the prototype. All names and numbers are made up. */

export type Applicant = {
  id: string;
  name: string;
  phone: string;
  state: string;
  city: string;
  applied: string;
  dob: string;
  email: string;
  lic: string;
  licExp: string;
  licDays: number;
  plate: string;
  vname: string;
  make: string;
  type: 'Auto' | 'Mini' | 'Sedan' | 'SUV';
  year: number;
  colour: string;
  ins: string;
  insDays: number;
  permit: string;
};

export const APPLICANTS: Applicant[] = [
  { id: 'd1', name: 'Sreejith Pillai', phone: '9846122031', state: 'Kerala', city: 'Kochi', applied: 'Today, 08:14', dob: '14 Mar 1988', email: 'sreejith.p@example.com', lic: 'KL07 20110012345', licExp: '13 Mar 2031', licDays: 1616, plate: 'KL 07 DF 2210', vname: 'Swift Dzire', make: 'Maruti Suzuki', type: 'Sedan', year: 2021, colour: 'White', ins: '20 Jan 2027', insDays: 103, permit: '30 Jun 2028' },
  { id: 'd2', name: 'Fathima Rasheed', phone: '9562004417', state: 'Kerala', city: 'Kozhikode', applied: 'Today, 11:42', dob: '02 Jul 1992', email: 'fathima.r@example.com', lic: 'KL11 20150045871', licExp: '01 Jul 2035', licDays: 3187, plate: 'KL 11 BQ 7745', vname: 'Ape City', make: 'Piaggio', type: 'Auto', year: 2020, colour: 'Yellow-Black', ins: '02 Nov 2026', insDays: 14, permit: '15 Sep 2027' },
  { id: 'd3', name: 'Arun Mathew', phone: '9447330918', state: 'Kerala', city: 'Thrissur', applied: 'Yesterday, 19:05', dob: '21 Nov 1985', email: '', lic: 'KL08 20090076543', licExp: '29 Oct 2026', licDays: 10, plate: 'KL 08 AZ 1904', vname: 'Ertiga', make: 'Maruti Suzuki', type: 'SUV', year: 2019, colour: 'Silver', ins: '11 Apr 2027', insDays: 174, permit: '01 Dec 2027' },
  { id: 'd4', name: 'Vignesh Kumar', phone: '9790411250', state: 'Tamil Nadu', city: 'Coimbatore', applied: 'Yesterday, 16:30', dob: '09 Jan 1994', email: 'vignesh.k@example.com', lic: 'TN37 20160098765', licExp: '08 Jan 2036', licDays: 3368, plate: 'TN 37 CK 5521', vname: 'Etios', make: 'Toyota', type: 'Sedan', year: 2018, colour: 'Grey', ins: '28 Feb 2027', insDays: 132, permit: '31 Jan 2028' },
  { id: 'd5', name: 'Joby Varghese', phone: '9895507712', state: 'Kerala', city: 'Kottayam', applied: '17 Oct, 10:12', dob: '30 Apr 1990', email: 'joby.v@example.com', lic: 'KL05 20120034567', licExp: '29 Apr 2032', licDays: 2019, plate: 'KL 05 AH 3307', vname: 'Wagon R', make: 'Maruti Suzuki', type: 'Mini', year: 2022, colour: 'Blue', ins: '19 May 2027', insDays: 212, permit: '10 Mar 2028' },
  { id: 'd6', name: 'Nisha Thomas', phone: '9061218845', state: 'Kerala', city: 'Kochi', applied: '17 Oct, 09:01', dob: '17 Aug 1993', email: 'nisha.t@example.com', lic: 'KL07 20170011223', licExp: '16 Aug 2037', licDays: 3953, plate: 'KL 07 CB 8890', vname: 'RE Compact', make: 'Bajaj', type: 'Auto', year: 2023, colour: 'Green-Yellow', ins: '01 Aug 2027', insDays: 286, permit: '14 Feb 2029' },
];

export type Rejected = { name: string; phone: string; city: string; when: string; reason: string };
export const REJECTED: Rejected[] = [
  { name: 'Manoj Kumar', phone: '9746551203', city: 'Kollam', when: '15 Oct', reason: 'Licence photo blurred; number not readable.' },
  { name: 'Deepak Raj', phone: '9633018876', city: 'Palakkad', when: '13 Oct', reason: 'RC owner name does not match driver.' },
  { name: 'Saravanan M', phone: '9443120987', city: 'Madurai', when: '11 Oct', reason: 'Insurance expired 12 Sep 2026.' },
];

export type Step = 'profile' | 'licence' | 'vehicle';
export const STEPS: Step[] = ['profile', 'licence', 'vehicle'];
export const STEP_LABEL: Record<Step, string> = { profile: 'Profile', licence: 'Licence', vehicle: 'Vehicle' };
export const REASONS: Record<Step, string[]> = {
  profile: ['Photo is blurred', 'Face not clearly visible', 'Name doesn’t match licence'],
  licence: ['Licence photo blurred', 'Licence expired', 'Number doesn’t match photo'],
  vehicle: ['RC owner name doesn’t match', 'Insurance expired', 'Plate not visible in photo'],
};

/** Driver registrations per state and stage (Reports). */
export const REG_STAGES = [
  ['approved', 'Approved'],
  ['waiting', 'Waiting'],
  ['docs', 'Docs missing'],
  ['rejected', 'Rejected'],
] as const;
export type RegRow = { state: string; approved: number; waiting: number; docs: number; rejected: number };
export const REG_SUMMARY: RegRow[] = [
  { state: 'Kerala', approved: 1312, waiting: 126, docs: 318, rejected: 84 },
  { state: 'Tamil Nadu', approved: 148, waiting: 22, docs: 61, rejected: 17 },
  { state: 'Karnataka', approved: 59, waiting: 9, docs: 24, rejected: 6 },
];

/** Completed trips per day, oldest first; the last entry is today. */
export const TRIPS_DAILY = [612, 588, 640, 701, 745, 812, 690, 655, 702, 734, 768, 831, 904, 742];
export const dayLabel = (i: number) => {
  const d = new Date(2026, 9, 19 - (TRIPS_DAILY.length - 1 - i));
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export type TripStatus = 'Completed' | 'Started' | 'Accepted' | 'Cancelled (driver)' | 'Cancelled (passenger)' | 'Rejected';
export const STATUS_COUNTS: Record<TripStatus, number> = {
  Completed: 611,
  Started: 38,
  Accepted: 21,
  'Cancelled (driver)': 29,
  'Cancelled (passenger)': 34,
  Rejected: 9,
};
export const shortStatus = (s: TripStatus) => (s === 'Cancelled (driver)' ? 'Driver cancelled' : s === 'Cancelled (passenger)' ? 'Rider cancelled' : s);

export type Trip = {
  id: string;
  when: string;
  from: string;
  to: string;
  driver: string;
  dphone: string;
  pax: string;
  pphone: string;
  cat: string;
  status: TripStatus;
  fare: number;
  km: number;
  mode: 'Cash' | 'Online';
  earn: number;
  plat: number;
  gst: number;
  otp: string;
};

export const TRIPS: Trip[] = [
  { id: 'TRP-90412', when: '21:42', from: 'Lulu Mall, Edappally', to: 'Infopark Phase 1, Kakkanad', driver: 'Anil Kumar', dphone: '9847012390', pax: 'Meera Nair', pphone: '9847012345', cat: 'Sedan', status: 'Completed', fare: 248.4, km: 11.4, mode: 'Online', earn: 233.5, plat: 12.4, gst: 2.5, otp: '4827' },
  { id: 'TRP-90409', when: '21:31', from: 'Vyttila Hub', to: 'MG Road Metro', driver: 'Shaji P', dphone: '9846331120', pax: 'Rahul Menon', pphone: '9562113340', cat: 'Auto', status: 'Started', fare: 96.2, km: 4.8, mode: 'Cash', earn: 90.4, plat: 4.8, gst: 1.0, otp: '1093' },
  { id: 'TRP-90401', when: '21:12', from: 'Cochin Airport T3', to: 'Aluva Metro', driver: 'Biju Joseph', dphone: '9895200071', pax: 'Anjali S', pphone: '9605771201', cat: 'SUV', status: 'Completed', fare: 612, km: 14.2, mode: 'Online', earn: 575.3, plat: 30.6, gst: 6.1, otp: '5512' },
  { id: 'TRP-90398', when: '20:58', from: 'Kaloor Stadium', to: 'Panampilly Nagar', driver: 'Riyas K', dphone: '9744120983', pax: 'Thomas George', pphone: '9447220145', cat: 'Mini', status: 'Cancelled (passenger)', fare: 142, km: 5.9, mode: 'Cash', earn: 0, plat: 0, gst: 0, otp: '7714' },
  { id: 'TRP-90392', when: '20:41', from: 'Thrissur Round', to: 'Punkunnam', driver: 'Sunil V', dphone: '9061884512', pax: 'Divya R', pphone: '9846009821', cat: 'Auto', status: 'Completed', fare: 71.5, km: 3.1, mode: 'Cash', earn: 67.2, plat: 3.6, gst: 0.7, otp: '2281' },
  { id: 'TRP-90387', when: '20:22', from: 'Fort Kochi', to: 'Ernakulam South', driver: 'Anil Kumar', dphone: '9847012390', pax: 'Kiran P', pphone: '9895621004', cat: 'Sedan', status: 'Cancelled (driver)', fare: 288, km: 12.8, mode: 'Online', earn: 0, plat: 0, gst: 0, otp: '6640' },
  { id: 'TRP-90380', when: '19:57', from: 'Kozhikode Beach', to: 'Mavoor Road', driver: 'Faisal M', dphone: '9562774410', pax: 'Haris A', pphone: '9633445120', cat: 'Auto', status: 'Accepted', fare: 84, km: 3.9, mode: 'Cash', earn: 0, plat: 0, gst: 0, otp: '3305' },
  { id: 'TRP-90371', when: '19:30', from: 'Technopark Phase 3', to: 'Thampanoor', driver: 'Ajay Nair', dphone: '9746002193', pax: 'Lekha M', pphone: '9447881276', cat: 'Mini', status: 'Completed', fare: 318.9, km: 15.6, mode: 'Online', earn: 299.8, plat: 15.9, gst: 3.2, otp: '9021' },
];

export const DRIVER = {
  name: 'Anil Kumar',
  phone: '9847012390',
  id: 'DRV-2208',
  plate: 'KL 07 CK 4521',
  vehicle: 'Maruti Dzire · White · Sedan',
  status: 'Online',
  rating: 4.8,
  version: '2.0.0 (6)',
  rideReq: 214,
  pendingPay: 1,
  cancelToday: 0,
  unpaidKm: '38.5 km',
  verified: 'Yes',
  device: 'Redmi Note 13 · Android 14',
  lastTrip: 'TRP-90412 · 21:42',
  area: 'Edappally, Kochi',
  lastSeen: '1 min ago',
};

export const PASSENGER = {
  name: 'Meera Nair',
  phone: '9847012345',
  email: 'meera.nair@example.com',
  id: 'PAX-77310',
  wallet: 140,
  km: 412.6,
  carbon: 18.2,
  latest: 'TRP-90412',
  cancelToday: 0,
  cancelTotal: 3,
  version: '2.0.0 (100)',
  status: 'Idle',
};

export const AREAS = ['Kerala', 'Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Tamil Nadu', 'Karnataka'];

export const ENVS = {
  PROD: { label: 'Production', host: 'tok-apim-prod.azure-api.net' },
  STG: { label: 'Staging', host: 'tok-apim-stgng.azure-api.net' },
} as const;

export const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
export const initials = (n: string) =>
  n
    .split(' ')
    .map(x => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
