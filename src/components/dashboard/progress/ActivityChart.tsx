import { Card, CardContent, CardHeader, CardTitle } from '@/components'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

type Props = {
  sessionData: {
    week: string
    sessions: number
    avgWPM: number
  }[]
}

export const ActivityChart = ({ sessionData }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={sessionData}>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#e5e7eb'
                className='dark:stroke-gray-700'
              />
              <XAxis
                dataKey='week'
                stroke='#6b7280'
                className='dark:stroke-gray-400'
              />
              <YAxis
                yAxisId='left'
                stroke='#6b7280'
                className='dark:stroke-gray-400'
              />
              <YAxis
                yAxisId='right'
                orientation='right'
                stroke='#6b7280'
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
              <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
              <Bar
                yAxisId='left'
                dataKey='sessions'
                fill='#4f46e5'
                name='Sessions'
              />
              <Bar
                yAxisId='right'
                dataKey='avgWPM'
                fill='#06b6d4'
                name='Avg WPM'
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
