'use client'

import { Github, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Footer() {
	return (
		<footer className="bg-green-900 text-white mt-auto">
			<div className="container mx-auto p-4 text-center">
				<p className="text-sm flex items-center justify-center gap-2">
					<span>כל הזכויות שמורות &copy; {new Date().getFullYear()} - אפליקציית כדורגל שכונתי</span>
					<Heart className="h-4 w-4 text-red-400 animate-pulse" />
				</p>
				<div className={cn('flex justify-center mt-2')}>
					<a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-200 transition-colors">
						<Github className="h-5 w-5" />
					</a>
				</div>
			</div>
		</footer>
	)
}
