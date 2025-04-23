import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import QueryProvider from './context/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'אפליקציית כדורגל שכונתי',
	description: 'ארגון משחקי כדורגל ומעקב אחר סטטיסטיקות הליגה'
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="he" dir="rtl">
			<body className={inter.className}>
				<QueryProvider>
					<AuthProvider>
						<div className="flex flex-col min-h-screen">
							<header className="bg-green-800 text-white shadow-md">
								<div className="container mx-auto p-4">
									<Navbar />
								</div>
							</header>

							<main className="flex-grow container mx-auto p-4">
								<Toaster />
								{children}
							</main>

							<footer className="bg-gray-100 border-t">
								<div className="container mx-auto p-4 text-center text-gray-600">&copy; {new Date().getFullYear()} אפליקציית כדורגל שכונתי</div>
							</footer>
						</div>
					</AuthProvider>
				</QueryProvider>
			</body>
		</html>
	)
}
