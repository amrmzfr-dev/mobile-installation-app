export type JobCategory = 'residential' | 'industrial';

export interface Job {
  id: string;
  jobId: string;
  name: string;
  location: string;
  category: JobCategory;
}

export const JOBS: Job[] = [
  {
    id: '1',
    jobId: '#4021',
    name: 'Westside Station',
    location: '990 Beverly Hills, CA',
    category: 'residential',
  },
  {
    id: '2',
    jobId: '#4022',
    name: 'Tesla Hub',
    location: '12 5th Avenue, NY',
    category: 'industrial',
  },
  {
    id: '3',
    jobId: '#4023',
    name: 'Greenway Condos',
    location: '44 Park Road, SF',
    category: 'residential',
  },
  {
    id: '4',
    jobId: '#4024',
    name: 'Logistics Center',
    location: 'Port 7, Long Beach',
    category: 'industrial',
  },
  {
    id: '5',
    jobId: '#4025',
    name: 'Private Villa',
    location: '102 Malibu Dr, CA',
    category: 'residential',
  },
  {
    id: '6',
    jobId: '#4026',
    name: 'Retail Plaza',
    location: 'Mall Entrance 4',
    category: 'industrial',
  },
];
