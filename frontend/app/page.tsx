import Link from 'next/link';

export default function Home() {
	return (
		<div className='space-y-8'>
			<section className='text-center py-12'>
				<h1 className='text-4xl font-bold text-green-800 mb-4'>כדורגל שכונתי</h1>
				<p className='text-xl text-gray-600 max-w-2xl mx-auto'>
					ארגון משחקים, איזון קבוצות ומעקב אחר סטטיסטיקות עם החברים שלך
				</p>
			</section>

			<section className='grid md:grid-cols-3 gap-6'>
				<DashboardCard
					title='שחקנים'
					icon='👤'
					href='/players'
					description='רישום וניהול שחקנים עם דירוגים'
				/>
				<DashboardCard
					title='משחקים'
					icon='⚽'
					href='/matches'
					description='יצירת משחקים ורישום תוצאות'
				/>
				<DashboardCard
					title='טבלת ליגה'
					icon='🏆'
					href='/table'
					description='צפייה בדירוג הנוכחי וסטטיסטיקות'
				/>
			</section>

			<section className='py-6'>
				<h2 className='text-2xl font-bold text-green-800 mb-4'>פעולות מהירות</h2>
				<div className='flex flex-wrap gap-4'>
					<Link
						href='/matches/new'
						className='bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md transition-colors'>
						יצירת משחק
					</Link>
					<Link
						href='/players/new'
						className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors'>
						הוספת שחקן
					</Link>
					<Link
						href='/matches/generate'
						className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors'>
						יצירת קבוצות
					</Link>
				</div>
			</section>
		</div>
	);
}

function DashboardCard({
	title,
	icon,
	href,
	description,
}: {
	title: string;
	icon: string;
	href: string;
	description: string;
}) {
	return (
		<Link
			href={href}
			className='block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border'>
			<div className='flex items-center mb-4'>
				<span className='text-4xl ml-3'>{icon}</span>
				<h2 className='text-xl font-bold'>{title}</h2>
			</div>
			<p className='text-gray-600'>{description}</p>
		</Link>
	);
}
