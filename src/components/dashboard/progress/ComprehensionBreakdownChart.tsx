import { Card, CardContent, CardHeader, CardTitle } from '@/components'
import {
  calculateComprehensionByCategory,
  calculateComprehensionByDifficulty,
  type SessionWithPassage,
} from '@/lib'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Props = {
  sessions: SessionWithPassage[]
}

const tooltipStyles = {
  contentStyle: {
    backgroundColor: 'hsl(var(--popover))',
    borderColor: 'hsl(var(--border))',
    color: 'hsl(var(--popover-foreground))',
    borderRadius: '8px',
  },
  itemStyle: { color: 'hsl(var(--popover-foreground))' },
  labelStyle: { color: 'hsl(var(--popover-foreground))' },
}

export const ComprehensionBreakdownChart = ({ sessions }: Props) => {
  const byCategory = calculateComprehensionByCategory(sessions)
  const byDifficulty = calculateComprehensionByDifficulty(sessions)

  if (byCategory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comprehension Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground py-8 text-center'>
            Practice a few passages from the library and this will show
            which topics and difficulties are capping your comprehension.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='grid md:grid-cols-2 gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>Comprehension by Topic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={byCategory} layout='vertical'>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='#e5e7eb'
                  className='dark:stroke-gray-700'
                />
                <XAxis
                  type='number'
                  domain={[0, 100]}
                  stroke='#6b7280'
                  className='dark:stroke-gray-400'
                />
                <YAxis
                  type='category'
                  dataKey='category'
                  width={90}
                  stroke='#6b7280'
                  className='dark:stroke-gray-400'
                />
                <Tooltip
                  {...tooltipStyles}
                  formatter={(value, _name, item) => [
                    `${value}% (${item.payload.sessionCount} session${
                      item.payload.sessionCount === 1 ? '' : 's'
                    })`,
                    'Avg. comprehension',
                  ]}
                />
                <Bar dataKey='avgComprehension' fill='#10b981' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comprehension by Difficulty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={byDifficulty}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='#e5e7eb'
                  className='dark:stroke-gray-700'
                />
                <XAxis
                  dataKey='difficulty'
                  stroke='#6b7280'
                  className='dark:stroke-gray-400'
                />
                <YAxis
                  domain={[0, 100]}
                  stroke='#6b7280'
                  className='dark:stroke-gray-400'
                />
                <Tooltip
                  {...tooltipStyles}
                  formatter={(value, _name, item) => [
                    `${value}% (${item.payload.sessionCount} session${
                      item.payload.sessionCount === 1 ? '' : 's'
                    })`,
                    'Avg. comprehension',
                  ]}
                />
                <Bar dataKey='avgComprehension' fill='#10b981' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
