import { Button, Label, Slider, Card } from '@/components'
import { useDisplaySettingsStore } from '@/store'
import { Settings, RotateCcw } from 'lucide-react'
import { useState } from 'react'

const FONT_FAMILIES = [
  { name: 'Inter', label: 'Inter' },
  { name: 'Georgia', label: 'Georgia' },
  { name: 'Times New Roman', label: 'Times New Roman' },
  { name: 'Arial', label: 'Arial' },
  { name: 'Courier New', label: 'Courier New' },
  { name: 'Verdana', label: 'Verdana' },
]

export function DisplaySettings() {
  const [isOpen, setIsOpen] = useState(false)
  const { fontFamily, fontSize, setFontFamily, setFontSize, reset } =
    useDisplaySettingsStore()

  return (
    <div className='relative'>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant='outline'
        size='icon'
        className='relative'>
        <Settings className='h-4 w-4' />
      </Button>

      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-40'
            onClick={() => setIsOpen(false)}
          />
          <Card className='absolute right-0 top-12 z-50 w-80 p-4 space-y-4 shadow-lg'>
            <div className='flex items-center justify-between'>
              <h3 className='font-medium'>Display Settings</h3>
              <Button
                onClick={reset}
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0'>
                <RotateCcw className='h-4 w-4' />
              </Button>
            </div>

            {/* Font Family */}
            <div className='space-y-2'>
              <Label>Font Family</Label>
              <div className='grid grid-cols-2 gap-2'>
                {FONT_FAMILIES.map((font) => (
                  <Button
                    key={font.name}
                    onClick={() => setFontFamily(font.name)}
                    variant={fontFamily === font.name ? 'default' : 'outline'}
                    size='sm'
                    className='justify-start'>
                    <span style={{ fontFamily: font.name }}>{font.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <Label>Font Size</Label>
                <span className='text-sm text-muted-foreground'>
                  {fontSize}px
                </span>
              </div>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                min={24}
                max={96}
                step={4}
                className='w-full'
              />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>24px</span>
                <span>96px</span>
              </div>
            </div>

            {/* Preview */}
            <div className='space-y-2'>
              <Label>Preview</Label>
              <div className='border rounded-lg p-4 bg-accent/10 text-center'>
                <span
                  style={{
                    fontFamily,
                    fontSize: `${fontSize}px`,
                  }}>
                  Sample
                </span>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
