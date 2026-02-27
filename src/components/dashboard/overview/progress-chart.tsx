import { Card, CardContent, CardHeader, CardTitle } from '@/components'
import { motion } from 'motion/react'

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts'

type data = {
  session: string
  wpm?: number
  comprehension: number
}

type Props = {
  progressData: data[]
  title: string
  xDataKey: string
  yDataKey: string
}
export const ProgressChart = (props: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}>
      <Card className='bg-white dark:bg-zinc-900 border-none shadow-sm'>
        <CardHeader>
          <CardTitle className='text-base font-medium text-gray-900 dark:text-white'>
            Reading Speed History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-64'>
            <ResponsiveContainer
              width='100%'
              height='100%'
              className={'p-0 m-0'}>
              <AreaChart
                data={props.progressData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id='colorWpm' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id='colorComprehension'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'>
                    <stop offset='5%' stopColor='#22c55e' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#22c55e' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray='3 3'
                  vertical={false}
                  stroke='#f3f4f6'
                  className='dark:stroke-zinc-800'
                />
                <XAxis
                  dataKey={props.yDataKey}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  yAxisId='left'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                  yAxisId='right'
                  orientation='right'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  itemStyle={{ padding: 0 }}
                  cursor={{
                    stroke: '#8b5cf6',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'comprehension')
                      return [`${value}%`, 'Comprehension']
                    if (name === 'wpm') return [`${value} WPM`, 'Reading Speed']
                    return [value, name]
                  }}
                />
                <Area
                  yAxisId='left'
                  type='monotone'
                  dataKey={'wpm'}
                  stroke='#8b5cf6'
                  fillOpacity={0.6}
                  fill='url(#colorWpm)'
                  strokeWidth={2}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
                <Area
                  yAxisId='right'
                  type='monotone'
                  dataKey={'comprehension'}
                  stroke='#22c55e'
                  fillOpacity={0.6}
                  fill='url(#colorComprehension)'
                  strokeWidth={2}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
