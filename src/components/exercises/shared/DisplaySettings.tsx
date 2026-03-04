import { Button, Label, Slider, Card } from '@/components'
import { useDisplaySettingsStore } from '@/store'
import { useAdjustedFontSize } from './useAdjustedFontSize'
import { RotateCcw } from 'lucide-react'

const FONT_FAMILIES = [
  { name: 'Inter', label: 'Inter' },
  { name: 'Georgia', label: 'Georgia' },
  { name: 'Times New Roman', label: 'Times New Roman' },
  { name: 'Arial', label: 'Arial' },
  { name: 'Courier New', label: 'Courier New' },
  { name: 'Verdana', label: 'Verdana' },
]

export function DisplaySettings() {
  const { fontFamily, fontSize, setFontFamily, setFontSize, reset } =
    useDisplaySettingsStore()
  const adjustedFontSize = useAdjustedFontSize()

  return (
    <div>
      <Card className='bg-transparent border-0 shadow-none'>
        <div className='flex px-0 items-center justify-between'>
          <h3 className='font-medium'>Display Settings</h3>
          <Button
            onClick={reset}
            size='sm'
            className='h-8 w-8 p-0  rounded-full'>
            <RotateCcw className='h-4 w-4' />
          </Button>
        </div>

        {/* Preview */}
        <div className='space-y-1 bg-card p-4 rounded-xl shadow-lg shadow-primary/10'>
          <Label className='font-medium'>Preview</Label>
          <div className=' p-4 bg-accent/10 text-center'>
            <span
              style={{
                fontFamily,
                fontSize: `${adjustedFontSize}em`,
              }}>
              Sample
            </span>
          </div>
        </div>

        {/* Font Size */}
        <div className='space-y-2 bg-card p-4 rounded-xl shadow-lg shadow-primary/10'>
          <div className='flex justify-between items-center'>
            <Label>Font Size</Label>
            <span className='text-sm text-muted-foreground'>{fontSize}x</span>
          </div>
          <Slider
            value={[fontSize]}
            onValueChange={(value) => setFontSize(value[0])}
            min={1}
            max={4}
            step={0.2}
            className='w-full'
          />
          <div className='flex justify-between text-xs text-muted-foreground'>
            <span>1x</span>
            <span>4x</span>
          </div>
        </div>

        {/* Font Family */}
        <div className='space-y-2 bg-card p-4 rounded-xl shadow-lg shadow-primary/10'>
          <Label>Typography</Label>
          <div className='grid grid-cols-2 gap-2'>
            {FONT_FAMILIES.map((font) => (
              <Button
                key={font.name}
                onClick={() => setFontFamily(font.name)}
                variant={fontFamily === font.name ? 'default' : 'outline'}
                size='lg'
                className='rounded-full'>
                <span style={{ fontFamily: font.name }}>{font.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
