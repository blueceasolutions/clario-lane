import type { AnyFieldApi, Updater } from '@tanstack/react-form'
import { ChevronDownIcon } from 'lucide-react'
import * as React from 'react'
import {
  Button,
  Calendar,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components'

type Props = {
  onChange?: (value?: Updater<Date | string>) => void
  field?: AnyFieldApi
}
export function DatePicker({ field }: Props) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className='flex flex-col gap-3'>
      <Label htmlFor={field?.name} className='px-1'>
        Date of birth
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            id={field?.name}
            type='button'
            size={'lg'}
            className=' justify-between font-normal'>
            {field?.state.value
              ? field?.state.value.toDateString()
              : 'Select date'}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
          <Calendar
            mode='single'
            selected={field?.state.value}
            onDayClick={field?.handleBlur}
            captionLayout='dropdown'
            onSelect={(date) => {
              field?.handleChange(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
