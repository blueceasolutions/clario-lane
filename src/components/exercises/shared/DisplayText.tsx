import { useDisplaySettingsStore, useSettingsStore } from '@/store'
import { useAdjustedFontSize } from './useAdjustedFontSize'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { tokenizeForBionic, splitBionicWord } from '@/lib'

type DisplayTextProps = {
  children: ReactNode
  className?: string
}

// Renders `text` with bionic reading applied: bold prefix per word, exact
// original whitespace preserved. Falls back to plain text for anything
// that isn't a string (e.g. the "Loading…"/"Complete!" placeholders some
// callers pass in still work fine either way, but non-string children like
// nested elements are rendered as-is rather than risk mangling them).
function BionicText({ text }: { text: string }) {
  const tokens = tokenizeForBionic(text)
  return (
    <>
      {tokens.map((token, index) => {
        if (token.isWhitespace) return token.text
        const { bold, rest } = splitBionicWord(token.text)
        return (
          <span key={index}>
            <strong className='font-bold'>{bold}</strong>
            {rest}
          </span>
        )
      })}
    </>
  )
}

export function DisplayText({ children, className = '' }: DisplayTextProps) {
  const { fontFamily } = useDisplaySettingsStore()
  const bionicReading = useSettingsStore((s) => s.bionicReading)
  const adjustedFontSize = useAdjustedFontSize()

  return (
    <span
      className={cn('text', className)}
      style={{
        fontFamily,
        fontSize: `${adjustedFontSize}em`,
      }}>
      {bionicReading && typeof children === 'string' ? (
        <BionicText text={children} />
      ) : (
        children
      )}
    </span>
  )
}
