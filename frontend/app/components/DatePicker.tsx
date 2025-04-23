'use client'

import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerProps {
	date: Date | undefined
	setDate: (date: Date | undefined) => void
	placeholder?: string
}

export function DatePicker({ date, setDate, placeholder = 'בחר תאריך' }: DatePickerProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" className={cn('w-full justify-start text-right font-normal', !date && 'text-muted-foreground')}>
					<div className="flex items-center gap-2">
						<CalendarIcon className="h-4 w-4" />
						{date ? format(date, 'PPP', { locale: he }) : <span>{placeholder}</span>}
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={he} />
			</PopoverContent>
		</Popover>
	)
}
