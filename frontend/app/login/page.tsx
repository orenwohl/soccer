'use client'

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

// Login form schema
const loginSchema = z.object({
	email: z.string().email({ message: 'נא להזין כתובת דוא״ל תקינה' }),
	password: z.string().min(6, { message: 'הסיסמה חייבת להכיל לפחות 6 תווים' })
})

// Signup form schema
const signupSchema = z.object({
	name: z.string().min(2, { message: 'השם חייב להכיל לפחות 2 תווים' }),
	email: z.string().email({ message: 'נא להזין כתובת דוא״ל תקינה' }),
	password: z.string().min(6, { message: 'הסיסמה חייבת להכיל לפחות 6 תווים' })
})

type LoginFormValues = z.infer<typeof loginSchema>
type SignupFormValues = z.infer<typeof signupSchema>

export default function AuthPage() {
	const [activeTab, setActiveTab] = useState<string>('login')
	const { login, register, loading } = useAuth()

	// Login form
	const loginForm = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: ''
		}
	})

	// Signup form
	const signupForm = useForm<SignupFormValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			name: '',
			email: '',
			password: ''
		}
	})

	const onLoginSubmit = async (values: LoginFormValues) => {
		await login(values.email, values.password)
	}

	const onSignupSubmit = async (values: SignupFormValues) => {
		await register(values.name, values.email, values.password)
	}

	return (
		<div dir="rtl" className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
			<h1 className="text-2xl font-bold mb-6 text-center">כדורגל שכונתי</h1>

			<Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
				<TabsList className="grid w-full grid-cols-2 mb-6">
					<TabsTrigger value="login" className="text-center">
						התחברות
					</TabsTrigger>
					<TabsTrigger value="signup" className="text-center">
						הרשמה
					</TabsTrigger>
				</TabsList>

				<TabsContent value="login" className="mt-2">
					<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
						<Form {...loginForm}>
							<form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
								<FormField
									control={loginForm.control}
									name="email"
									render={({ field }) => (
										<FormItem className="text-right">
											<FormLabel>דוא״ל</FormLabel>
											<FormControl>
												<Input placeholder="הזן את הדוא״ל שלך" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={loginForm.control}
									name="password"
									render={({ field }) => (
										<FormItem className="text-right">
											<FormLabel>סיסמה</FormLabel>
											<FormControl>
												<Input type="password" placeholder="הזן את הסיסמה שלך" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button type="submit" className="w-full" disabled={loading}>
									{loading ? 'מתחבר...' : 'התחבר'}
								</Button>
							</form>
						</Form>
					</motion.div>
				</TabsContent>

				<TabsContent value="signup" className="mt-2">
					<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
						<Form {...signupForm}>
							<form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
								<FormField
									control={signupForm.control}
									name="name"
									render={({ field }) => (
										<FormItem className="text-right">
											<FormLabel>שם מלא</FormLabel>
											<FormControl>
												<Input placeholder="הזן את שמך המלא" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={signupForm.control}
									name="email"
									render={({ field }) => (
										<FormItem className="text-right">
											<FormLabel>דוא״ל</FormLabel>
											<FormControl>
												<Input placeholder="הזן את הדוא״ל שלך" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={signupForm.control}
									name="password"
									render={({ field }) => (
										<FormItem className="text-right">
											<FormLabel>סיסמה</FormLabel>
											<FormControl>
												<Input type="password" placeholder="בחר סיסמה" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button type="submit" className="w-full" disabled={loading}>
									{loading ? 'נרשם...' : 'הירשם'}
								</Button>
							</form>
						</Form>
					</motion.div>
				</TabsContent>
			</Tabs>

			<div className="mt-6 text-center">
				<p className="text-muted-foreground mb-2">או התחבר באמצעות</p>
				<Button variant="outline" className="w-full" onClick={() => alert('התחברות עם גוגל תהיה זמינה בקרוב')}>
					גוגל
				</Button>
			</div>
		</div>
	)
}
