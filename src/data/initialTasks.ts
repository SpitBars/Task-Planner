import { Task } from '../types';

export const initialTasks: Task[] = [
  {
    id: 'seed-dp-1',
    module: 'daily-planning',
    title: 'Outline top three deliverables',
    description: 'Focus on product review, roadmap sync, and OKR updates.',
    status: 'in-progress',
    dueDate: new Date().toISOString().slice(0, 10)
  },
  {
    id: 'seed-ds-1',
    module: 'daily-shutdown',
    title: 'Update async status message',
    description: 'Summarize today\'s wins and blockers in Slack.',
    status: 'not-started'
  },
  {
    id: 'seed-dh-1',
    module: 'daily-highlights',
    title: 'Celebrate design handoff milestone',
    description: 'Design and engineering paired to ship the billing flow mockups.',
    status: 'done',
    highlighted: true
  },
  {
    id: 'seed-wp-1',
    module: 'weekly-planning',
    title: 'Plan sprint goals with team',
    description: 'Define 2 product increments aligned to quarterly OKRs.',
    status: 'in-progress'
  },
  {
    id: 'seed-wr-1',
    module: 'weekly-review',
    title: 'Retrospective notes',
    description: 'Capture friction points from the experiments backlog.',
    status: 'not-started'
  }
];
