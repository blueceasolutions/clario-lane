import { Card, CardContent, CardHeader, CardTitle } from '@/components'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Props = {
  weeklyProgress: {
    day: string
    wpm: number | null
    comprehension: number | null
    fullDate: Date
  }[]
}

export const ProgressCharts = ({ weeklyProgress }: Props) => {
  return (
    <div className='grid md:grid-cols-2 gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>Reading Speed Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={weeklyProgress}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='#e5e7eb'
                  className='dark:stroke-gray-700'
                />
                <XAxis
                  dataKey='day'
                  stroke='#6b7280'
                  className='dark:stroke-gray-400'
                />
                <YAxis stroke='#6b7280' className='dark:stroke-gray-400' />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--popover-foreground))',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                />
                <Line
                  type='monotone'
                  dataKey='wpm'
                  stroke='#4f46e5'
                  strokeWidth={2}
                  dot={{ fill: '#4f46e5', r: 4 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comprehension Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={weeklyProgress}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='#e5e7eb'
                  className='dark:stroke-gray-700'
                />
                <XAxis
                  dataKey='day'
                  stroke='#6b7280'
                  className='dark:stroke-gray-400'
                />
                <YAxis
                  stroke='#6b7280'
                  domain={[0, 100]}
                  className='dark:stroke-gray-400'
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--popover-foreground))',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                />
                <Line
                  type='monotone'
                  dataKey='comprehension'
                  stroke='#10b981'
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
