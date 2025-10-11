import {
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  ClockIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  PaperAirplaneIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

export const navigation = [
  { name: 'Overview', to: '/', icon: HomeIcon },
  { name: 'Calendar', to: '/calendar', icon: CalendarDaysIcon },
  { name: 'Analytics', to: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', to: '/settings', icon: Cog6ToothIcon }
];

export const quickActions = [
  { name: 'New Task', icon: PencilSquareIcon },
  { name: 'New Meeting', icon: CalendarDaysIcon },
  { name: 'Send Update', icon: PaperAirplaneIcon }
];

export const days = [
  {
    name: 'Monday',
    date: '24',
    focus: 'Sprint planning',
    tasks: [
      {
        id: 'task-1',
        title: 'Design system review',
        time: '9:00 AM',
        duration: '60 min',
        tags: ['Design', 'UX'],
        assignees: ['AL'],
        subtasks: [
          { id: 'task-1-1', title: 'Audit color tokens', done: true },
          { id: 'task-1-2', title: 'Review spacing scale', done: false }
        ]
      },
      {
        id: 'task-2',
        title: 'Product sync',
        time: '11:30 AM',
        duration: '30 min',
        tags: ['Meeting'],
        assignees: ['BW', 'CT'],
        subtasks: [
          { id: 'task-2-1', title: 'Draft talking points', done: true }
        ]
      }
    ]
  },
  {
    name: 'Tuesday',
    date: '25',
    focus: 'Build roadmap',
    tasks: [
      {
        id: 'task-3',
        title: 'Write sprint brief',
        time: '10:00 AM',
        duration: '90 min',
        tags: ['Docs'],
        assignees: ['DL'],
        subtasks: [
          { id: 'task-3-1', title: 'Outline milestones', done: false },
          { id: 'task-3-2', title: 'Collect estimates', done: false }
        ]
      },
      {
        id: 'task-4',
        title: 'Interview candidate',
        time: '1:30 PM',
        duration: '45 min',
        tags: ['People'],
        assignees: ['AL', 'HR'],
        subtasks: []
      }
    ]
  },
  {
    name: 'Wednesday',
    date: '26',
    focus: 'Ship release notes',
    tasks: [
      {
        id: 'task-5',
        title: 'QA regression suite',
        time: '9:30 AM',
        duration: '2 hr',
        tags: ['QA'],
        assignees: ['QA'],
        subtasks: [
          { id: 'task-5-1', title: 'Mobile smoke test', done: true },
          { id: 'task-5-2', title: 'API load test', done: false }
        ]
      },
      {
        id: 'task-6',
        title: 'Publish release notes',
        time: '3:00 PM',
        duration: '45 min',
        tags: ['Comms'],
        assignees: ['MK'],
        subtasks: [
          { id: 'task-6-1', title: 'Draft changelog', done: true },
          { id: 'task-6-2', title: 'Prep announcement', done: false }
        ]
      }
    ]
  }
];

export const agenda = [
  {
    id: 'agenda-1',
    title: 'Weekly check-in',
    time: 'Today · 4:30 PM',
    description: 'Confirm blockers with the engineering squad and track action items.'
  },
  {
    id: 'agenda-2',
    title: 'Follow-up emails',
    time: 'Tomorrow · 9:00 AM',
    description: 'Send recap emails with next steps for each interview candidate.'
  },
  {
    id: 'agenda-3',
    title: 'Customer feedback',
    time: 'Tomorrow · 2:00 PM',
    description: 'Review survey results and highlight wins for the leadership update.'
  }
];

export const inbox = [
  {
    id: 'inbox-1',
    title: 'Marketing brief ready',
    meta: '5 min ago',
    icon: ChatBubbleOvalLeftEllipsisIcon
  },
  {
    id: 'inbox-2',
    title: 'Design tokens updated',
    meta: '18 min ago',
    icon: ClockIcon
  }
];
