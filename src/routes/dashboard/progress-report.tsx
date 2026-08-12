import { Button, Card, CardContent } from '@/components'
import { fetchPracticeSessions, fetchUserProfile } from '@/integration'
import { downloadCsv, generateProgressCsv } from '@/lib'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Download, Printer } from 'lucide-react'

export const Route = createFileRoute('/dashboard/progress-report')({
  component: RouteComponent,
})

// A richer sample than the progress page's charts need, since a report is
// meant to show the full history someone might want to hand to an
// employer/school, not just a recent trend.
const REPORT_SESSION_LIMIT = 200

function ReportStat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className='p-4'>
        <p className='text-2xl font-bold'>{value}</p>
        <p className='text-sm text-muted-foreground'>{label}</p>
      </CardContent>
    </Card>
  )
}

function RouteComponent() {
  const { data: userProfile } = useQuery(fetchUserProfile)
  const { data: sessions } = useQuery(
    fetchPracticeSessions(userProfile?.id, REPORT_SESSION_LIMIT),
  )

  const rows = sessions ?? []
  const totalSessions = rows.length
  const totalWords = rows.reduce((sum, s) => sum + (s.total_words ?? 0), 0)
  const avgComprehension = totalSessions
    ? Math.round(
        rows.reduce((sum, s) => sum + s.comprehension, 0) / totalSessions,
      )
    : 0

  const handleDownloadCsv = () => {
    const csv = generateProgressCsv(
      rows.map((s) => ({
        created_at: s.created_at,
        wpm: s.wpm,
        comprehension: s.comprehension,
        total_words: s.total_words,
        duration: s.duration,
      })),
    )
    downloadCsv(
      `clariolane-progress-${format(new Date(), 'yyyy-MM-dd')}.csv`,
      csv,
    )
  }

  if (!userProfile) return null

  return (
    <div className='max-w-3xl mx-auto space-y-6 print:space-y-4'>
      {/* Controls -- hidden when printing */}
      <div className='flex flex-wrap items-center justify-between gap-3 print:hidden'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Progress Report
          </h2>
          <p className='text-muted-foreground text-sm mt-1'>
            A printable summary you can save as a PDF or export as CSV.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            className='gap-2'
            onClick={handleDownloadCsv}>
            <Download className='w-4 h-4' />
            Download CSV
          </Button>
          <Button className='gap-2' onClick={() => window.print()}>
            <Printer className='w-4 h-4' />
            Save as PDF
          </Button>
        </div>
      </div>

      {/* Printable report content */}
      <div className='space-y-6'>
        <div>
          <h1 className='text-xl font-bold'>
            Clariolane Reading Progress Report
          </h1>
          <p className='text-sm text-muted-foreground'>
            {userProfile.name} &middot; Generated{' '}
            {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <ReportStat
            label='Baseline WPM'
            value={userProfile.baseline_wpm ?? 0}
          />
          <ReportStat
            label='Current WPM'
            value={userProfile.current_wpm ?? 0}
          />
          <ReportStat
            label='Avg. Comprehension'
            value={`${avgComprehension}%`}
          />
          <ReportStat label='Total Sessions' value={totalSessions} />
        </div>

        <p className='text-sm text-muted-foreground'>
          {totalWords.toLocaleString()} total words read across the sessions
          below.
        </p>

        <Card>
          <CardContent className='p-0'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b text-left text-muted-foreground'>
                  <th className='p-3 font-medium'>Date</th>
                  <th className='p-3 font-medium'>WPM</th>
                  <th className='p-3 font-medium'>Comprehension</th>
                  <th className='p-3 font-medium'>Words</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((session) => (
                  <tr key={session.id} className='border-b last:border-0'>
                    <td className='p-3'>
                      {session.created_at
                        ? format(new Date(session.created_at), 'MMM d, yyyy')
                        : '—'}
                    </td>
                    <td className='p-3'>{session.wpm}</td>
                    <td className='p-3'>
                      {Math.round(session.comprehension)}%
                    </td>
                    <td className='p-3'>{session.total_words ?? 0}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className='p-6 text-center text-muted-foreground'>
                      No practice sessions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
