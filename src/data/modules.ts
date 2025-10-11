import { ChecklistItem, ModuleDefinition, ModulePrompt, TaskModule } from '../types';

export const moduleDefinitions: ModuleDefinition[] = [
  {
    slug: 'daily-planning',
    title: 'Daily Planning',
    description:
      'Start your day with clarity by prioritizing tasks, blocking focus time, and aligning with goals.'
  },
  {
    slug: 'daily-shutdown',
    title: 'Daily Shutdown',
    description:
      'Wrap up the workday intentionally by reviewing accomplishments and setting up tomorrow.'
  },
  {
    slug: 'daily-highlights',
    title: 'Daily Highlights',
    description:
      'Capture the standout wins, lessons, and memorable moments worth celebrating.'
  },
  {
    slug: 'weekly-planning',
    title: 'Weekly Planning',
    description:
      'Zoom out to plan strategic goals, commitments, and priorities for the week ahead.'
  },
  {
    slug: 'weekly-review',
    title: 'Weekly Review',
    description:
      'Reflect on the past week, measure progress, and reset intentions for what is next.'
  }
];

export const modulePrompts: Record<TaskModule, ModulePrompt[]> = {
  'daily-planning': [
    {
      title: 'Define today\'s top priorities',
      description: 'List the 1-3 tasks that will make today successful.'
    },
    {
      title: 'Time-block focus work',
      description: 'Reserve calendar slots for deep work and collaboration.'
    },
    {
      title: 'Anticipate blockers',
      description: 'Identify risks that could derail your plan and note mitigation steps.'
    }
  ],
  'daily-shutdown': [
    {
      title: 'Review accomplishments',
      description: 'Check completed tasks and document key wins from the day.'
    },
    {
      title: 'Prep for tomorrow',
      description: 'Capture next-day priorities and any loose ends to revisit.'
    },
    {
      title: 'Disconnect ritual',
      description: 'Note how you will signal the end of the workday and recharge.'
    }
  ],
  'daily-highlights': [
    {
      title: 'Celebrate progress',
      description: 'Spotlight achievements that energized you or the team.'
    },
    {
      title: 'Capture learnings',
      description: 'Record insights that should inform future decisions.'
    },
    {
      title: 'Share gratitude',
      description: 'Note people or events you are grateful for today.'
    }
  ],
  'weekly-planning': [
    {
      title: 'Revisit goals',
      description: 'Align the week\'s plan with quarterly objectives and commitments.'
    },
    {
      title: 'Balance workload',
      description: 'Distribute tasks to maintain sustainable focus across the week.'
    },
    {
      title: 'Schedule checkpoints',
      description: 'Block recurring reviews to monitor progress and adjust early.'
    }
  ],
  'weekly-review': [
    {
      title: 'Look back objectively',
      description: 'Summarize what moved forward, stalled, or surprised you.'
    },
    {
      title: 'Measure outcomes',
      description: 'Compare results against your goals and note deltas.'
    },
    {
      title: 'Reset intentions',
      description: 'Capture adjustments and commitments for the upcoming cycle.'
    }
  ]
};

export const moduleChecklists: Record<TaskModule, ChecklistItem[]> = {
  'daily-planning': [
    { id: 'dp-priorities', label: 'Priorities documented' },
    { id: 'dp-calendar', label: 'Calendar updated with focus blocks' },
    { id: 'dp-blockers', label: 'Risks and blockers noted' }
  ],
  'daily-shutdown': [
    { id: 'ds-review', label: 'Reviewed completed work' },
    { id: 'ds-inbox', label: 'Inbox zeroed or triaged' },
    { id: 'ds-reset', label: 'Prepared tomorrow\'s plan' }
  ],
  'daily-highlights': [
    { id: 'dh-win', label: 'Captured a key win' },
    { id: 'dh-learning', label: 'Documented a learning' },
    { id: 'dh-gratitude', label: 'Noted gratitude or shout-out' }
  ],
  'weekly-planning': [
    { id: 'wp-goals', label: 'Weekly goals aligned with strategy' },
    { id: 'wp-schedule', label: 'Major deliverables scheduled' },
    { id: 'wp-commitments', label: 'Stakeholders informed of commitments' }
  ],
  'weekly-review': [
    { id: 'wr-progress', label: 'Progress measured' },
    { id: 'wr-retro', label: 'Lessons learned captured' },
    { id: 'wr-reset', label: 'Next steps documented' }
  ]
};
