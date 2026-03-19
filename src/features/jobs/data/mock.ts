export type JobCategory = 'residential' | 'industrial';

export type JobStatus =
  | 'assigned'
  | 'survey_scheduling'
  | 'survey_ready'
  | 'installation_scheduling'
  | 'installation_ready'
  | 'completed';

export interface Job {
  id: string;
  jobId: string;
  name: string;
  location: string;
  coords: { latitude: number; longitude: number };
  category: JobCategory;
  status: JobStatus;
  client: string;
  phone: string;
  system: string;
  assignedDate: string;
  surveyDate?: string;
  installationDate?: string;
}

export const JOBS: Job[] = [
  {
    id: '1',
    jobId: '#4021',
    name: 'Westside Station',
    location: '990 Beverly Blvd, Los Angeles, CA',
    coords: { latitude: 34.0736, longitude: -118.3695 },
    category: 'residential',
    status: 'assigned',
    client: 'John Doe',
    phone: '+1 555-0123',
    system: 'Level 2 AC',
    assignedDate: 'Oct 25, 2024',
  },
  {
    id: '2',
    jobId: '#4022',
    name: 'Tesla Hub',
    location: '12 5th Avenue, New York, NY',
    coords: { latitude: 40.7736, longitude: -73.9654 },
    category: 'industrial',
    status: 'survey_scheduling',
    client: 'Sarah Chen',
    phone: '+1 555-0198',
    system: 'DC Fast Charge',
    assignedDate: 'Oct 26, 2024',
  },
  {
    id: '3',
    jobId: '#4023',
    name: 'Greenway Condos',
    location: '44 Park Road, San Francisco, CA',
    coords: { latitude: 37.7694, longitude: -122.4862 },
    category: 'residential',
    status: 'survey_ready',
    client: 'Marcus Lee',
    phone: '+1 555-0241',
    system: 'Level 2 AC',
    assignedDate: 'Oct 20, 2024',
    surveyDate: 'Nov 01, 2024',
  },
  {
    id: '4',
    jobId: '#4024',
    name: 'Logistics Center',
    location: 'Port 7, Long Beach, CA',
    coords: { latitude: 33.7701, longitude: -118.2137 },
    category: 'industrial',
    status: 'installation_scheduling',
    client: 'Diana Park',
    phone: '+1 555-0372',
    system: 'DC Fast Charge x4',
    assignedDate: 'Oct 15, 2024',
    surveyDate: 'Oct 28, 2024',
  },
  {
    id: '5',
    jobId: '#4025',
    name: 'Private Villa',
    location: '102 Malibu Dr, Malibu, CA',
    coords: { latitude: 34.0259, longitude: -118.7798 },
    category: 'residential',
    status: 'installation_ready',
    client: 'Robert Kim',
    phone: '+1 555-0489',
    system: 'Level 2 AC',
    assignedDate: 'Oct 10, 2024',
    surveyDate: 'Oct 22, 2024',
    installationDate: 'Nov 05, 2024',
  },
  {
    id: '6',
    jobId: '#4026',
    name: 'Retail Plaza',
    location: 'Westfield Mall, 10800 W Pico Blvd, Los Angeles, CA',
    coords: { latitude: 34.0531, longitude: -118.4241 },
    category: 'industrial',
    status: 'completed',
    client: 'Alice Wong',
    phone: '+1 555-0561',
    system: 'Level 2 AC x2',
    assignedDate: 'Sep 28, 2024',
    surveyDate: 'Oct 05, 2024',
    installationDate: 'Oct 18, 2024',
  },
];
