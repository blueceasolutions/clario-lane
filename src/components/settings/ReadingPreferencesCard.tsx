import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
} from '@/components/ui'
import { useSettingsStore, type FontFace, type Theme } from '@/store'

export function ReadingPreferencesCard() {
  const {
    fontFace,
    fontSizeScale,
    theme,
    setFontFace,
    setFontSizeScale,
    setTheme,
  } = useSettingsStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reading Preferences</CardTitle>
        <CardDescription>Customize your reading experience.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <Label>Font Face</Label>
          <Select
            value={fontFace}
            onValueChange={(value) => setFontFace(value as FontFace)}>
            <SelectTrigger>
              <SelectValue placeholder='Select a font' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Inter'>Inter</SelectItem>
              <SelectItem value='Dyslexie'>Dyslexie</SelectItem>
              <SelectItem value='Serif'>Serif</SelectItem>
              <SelectItem value='Mono'>Mono</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label>Font Size</Label>
            <span className='text-sm text-muted-foreground'>
              {fontSizeScale}%
            </span>
          </div>
          <Slider
            value={[fontSizeScale]}
            onValueChange={(value) => setFontSizeScale(value[0])}
            min={75}
            max={150}
            step={5}
          />
        </div>

        <div className='space-y-2'>
          <Label>Theme</Label>
          <Select
            value={theme}
            onValueChange={(value) => setTheme(value as Theme)}>
            <SelectTrigger>
              <SelectValue placeholder='Select a theme' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='auto'>System</SelectItem>
              <SelectItem value='light'>Light</SelectItem>
              <SelectItem value='dark'>Dark</SelectItem>
              <SelectItem value='sepia'>Sepia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
