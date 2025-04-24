'use client';

import Link from 'next/link';
import {useState, useEffect, useRef} from 'react';
import {useAuth} from '../context/AuthContext';
import {cn} from '@/lib/utils';
import {Users, Volleyball, Trophy, LogOut, User} from 'lucide-react';

const Navbar = () => {
	const {user, logout} = useAuth();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [activeLink, setActiveLink] = useState('');
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [scrolled, setScrolled] = useState(false);

	// Set active link based on current path
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const path = window.location.pathname;
			if (path.includes('/players')) setActiveLink('players');
			else if (path.includes('/matches')) setActiveLink('matches');
			else if (path.includes('/table')) setActiveLink('table');
			else setActiveLink('');

			const handleScroll = () => {
				setScrolled(window.scrollY > 20);
			};

			window.addEventListener('scroll', handleScroll);
			return () => window.removeEventListener('scroll', handleScroll);
		}
	}, []);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (isMenuOpen && !target.closest('.mobile-menu-container') && !target.closest('.hamburger-button')) {
				closeMenu();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isMenuOpen]);

	// Prevent scrolling when menu is open
	useEffect(() => {
		if (isMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [isMenuOpen]);

	const toggleMenu = () => {
		if (!isMenuOpen) {
			openMenu();
		} else {
			closeMenu();
		}
	};

	const openMenu = () => {
		setIsMenuOpen(true);
	};

	const closeMenu = () => {
		setIsMenuOpen(false);
	};

	const handleLinkClick = (linkName: string) => {
		setActiveLink(linkName);
		setIsMenuOpen(false);
	};

	const NavLinks = () => (
		<>
			<Link
				href='/players'
				className={cn(
					'nav-link-item hover:text-green-200 transition-all flex items-center gap-2 group relative px-3 py-1.5 rounded-lg',
					activeLink === 'players' && 'text-green-200 bg-green-800/30'
				)}
				onClick={() => handleLinkClick('players')}>
				<div className='flex items-center gap-2 z-10'>
					<Users
						className={cn(
							'h-4 w-4 transition-all duration-300 group-hover:scale-110',
							activeLink === 'players' ? 'text-green-300' : 'text-green-100'
						)}
					/>
					<span className='font-medium'>שחקנים</span>
				</div>
				<div className='absolute inset-0 bg-gradient-to-r from-green-800/0 via-green-800/20 to-green-800/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
			</Link>
			<Link
				href='/matches'
				className={cn(
					'nav-link-item hover:text-green-200 transition-all flex items-center gap-2 group relative px-3 py-1.5 rounded-lg',
					activeLink === 'matches' && 'text-green-200 bg-green-800/30'
				)}
				onClick={() => handleLinkClick('matches')}>
				<div className='flex items-center gap-2 z-10'>
					<Volleyball
						className={cn(
							'h-4 w-4 transition-all duration-300 group-hover:scale-110',
							activeLink === 'matches' ? 'text-green-300' : 'text-green-100'
						)}
					/>
					<span className='font-medium'>משחקים</span>
				</div>
				<div className='absolute inset-0 bg-gradient-to-r from-green-800/0 via-green-800/20 to-green-800/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
			</Link>
			<Link
				href='/table'
				className={cn(
					'nav-link-item hover:text-green-200 transition-all flex items-center gap-2 group relative px-3 py-1.5 rounded-lg',
					activeLink === 'table' && 'text-green-200 bg-green-800/30'
				)}
				onClick={() => handleLinkClick('table')}>
				<div className='flex items-center gap-2 z-10'>
					<Trophy
						className={cn(
							'h-4 w-4 transition-all duration-300 group-hover:scale-110',
							activeLink === 'table' ? 'text-green-300' : 'text-green-100'
						)}
					/>
					<span className='font-medium'>טבלת ליגה</span>
				</div>
				<div className='absolute inset-0 bg-gradient-to-r from-green-800/0 via-green-800/20 to-green-800/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
			</Link>
		</>
	);

	return (
		<>
			<style
				jsx
				global>{`
				.nav-container {
					transition: all 0.3s ease;
				}

				.nav-container.scrolled {
					background: rgba(3, 32, 15, 0.8);
					backdrop-filter: blur(8px);
					box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
				}

				.hamburger-lines span {
					transition: transform 0.3s ease, opacity 0.2s ease, width 0.3s ease;
				}

				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				@keyframes slideIn {
					from {
						transform: translateX(100%);
					}
					to {
						transform: translateX(0);
					}
				}

				@keyframes pulse {
					0% {
						transform: scale(1);
						opacity: 0.8;
					}
					50% {
						transform: scale(1.08);
						opacity: 1;
					}
					100% {
						transform: scale(1);
						opacity: 0.8;
					}
				}

				@keyframes glow {
					0% {
						box-shadow: 0 0 5px rgba(74, 222, 128, 0);
					}
					50% {
						box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
					}
					100% {
						box-shadow: 0 0 5px rgba(74, 222, 128, 0);
					}
				}

				@keyframes gradientShift {
					0% {
						background-position: 0% 50%;
					}
					50% {
						background-position: 100% 50%;
					}
					100% {
						background-position: 0% 50%;
					}
				}

				.animate-menu-container {
					animation: fadeIn 0.3s ease forwards;
				}

				.animate-menu-content {
					animation: slideIn 0.4s ease forwards;
				}

				.nav-link-item {
					position: relative;
					overflow: hidden;
				}

				.nav-link-item::after {
					content: '';
					position: absolute;
					bottom: 0;
					right: 0;
					width: 0;
					height: 2px;
					background: linear-gradient(to left, transparent, #4ade80, transparent);
					transition: width 0.3s ease;
				}

				.nav-link-item:hover::after {
					width: 100%;
				}

				.login-button {
					position: relative;
					overflow: hidden;
					z-index: 1;
					background: linear-gradient(120deg, rgba(22, 101, 52, 0.5) 0%, rgba(16, 185, 129, 0.5) 100%);
					background-size: 200% 200%;
					animation: gradientShift 5s ease infinite;
					backdrop-filter: blur(4px);
					border: 1px solid rgba(74, 222, 128, 0.2);
				}

				.login-button:hover {
					animation: glow 1.5s infinite;
				}

				.user-status {
					position: relative;
					background: linear-gradient(120deg, rgba(22, 101, 52, 0.3) 0%, rgba(16, 185, 129, 0.3) 100%);
					background-size: 200% 200%;
					animation: gradientShift 5s ease infinite;
					backdrop-filter: blur(4px);
					border: 1px solid rgba(74, 222, 128, 0.2);
				}

				.status-indicator {
					animation: pulse 2s infinite;
				}

				.logo-text {
					background: linear-gradient(to right, #4ade80, #a7f3d0);
					-webkit-background-clip: text;
					color: transparent;
					transition: all 0.3s ease;
				}

				.logo-text:hover {
					text-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
				}

				.logout-button {
					background: linear-gradient(120deg, #166534 0%, #059669 100%);
					background-size: 200% 200%;
					transition: all 0.3s ease;
					border: 1px solid rgba(74, 222, 128, 0.2);
					position: relative;
					overflow: hidden;
				}

				.logout-button:hover {
					background-position: right center;
					box-shadow: 0 5px 15px rgba(16, 185, 129, 0.2);
					transform: translateY(-2px);
				}

				.logout-button:active {
					transform: translateY(0);
				}

				.logout-button::after {
					content: '';
					position: absolute;
					top: -50%;
					left: -60%;
					width: 20px;
					height: 200%;
					background: rgba(255, 255, 255, 0.1);
					transform: rotate(35deg);
					transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
				}

				.logout-button:hover::after {
					left: 100%;
				}

				.mobile-menu-bg {
					background: radial-gradient(
						ellipse at bottom,
						rgba(16, 64, 36, 0.9) 0%,
						rgba(6, 24, 15, 0.95) 100%
					);
				}

				.user-menu-dropdown {
					background: linear-gradient(to bottom, rgba(16, 64, 36, 0.95), rgba(6, 24, 15, 0.98));
					backdrop-filter: blur(10px);
					border: 1px solid rgba(74, 222, 128, 0.1);
					box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.3);
					transform-origin: top right;
					animation: scaleIn 0.2s ease-out;
				}

				@keyframes scaleIn {
					from {
						opacity: 0;
						transform: scale(0.95);
					}
					to {
						opacity: 1;
						transform: scale(1);
					}
				}
			`}</style>

			<div
				className={cn(
					'nav-container fixed top-0 right-0 left-0 z-50 px-6 transition-all',
					scrolled && 'scrolled'
				)}>
				<div className='flex justify-between items-center h-16 max-w-7xl mx-auto'>
					<Link
						href='/'
						className='text-2xl font-bold transition-all'>
						<span className='logo-text'>כדורגל שכונתי</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className='hidden md:flex space-x-reverse space-x-6'>
						{user ? (
							<>
								<NavLinks />
								<div className='flex items-center space-x-reverse space-x-4'>
									<div className='user-status relative flex items-center group'>
										<div className='flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer hover:bg-green-800/20'>
											<div className='status-indicator w-2 h-2 bg-green-400 rounded-full'></div>
											<span className='text-green-200 font-medium'>{user.name}</span>
											<User className='h-4 w-4 text-green-200 ml-1' />
										</div>

										<div className='user-menu-dropdown absolute hidden group-hover:block top-full right-0 mt-2 w-48 rounded-md overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
											<div className='py-2'>
												<button
													onClick={logout}
													className='logout-button w-full text-left px-4 py-2.5 text-white flex items-center gap-2'>
													<LogOut className='h-4 w-4' />
													<span>התנתק</span>
												</button>
											</div>
										</div>
									</div>
								</div>
							</>
						) : (
							<Link
								href='/login'
								className='login-button text-white px-4 py-2 rounded-md transition-all hover:-translate-y-0.5 flex items-center justify-center'>
								התחברות
							</Link>
						)}
					</nav>

					{/* Hamburger Button with improved animation */}
					<button
						ref={buttonRef}
						className='hamburger-button md:hidden text-white p-2 focus:outline-none relative h-12 w-12 flex items-center justify-center overflow-hidden transition-all duration-200'
						onClick={toggleMenu}
						aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}>
						<div className='absolute inset-0 rounded-full transition-all duration-300 opacity-0 hover:opacity-100 hover:bg-green-800/20'></div>

						<div className='flex flex-col items-end justify-center gap-1.5 w-6'>
							<span
								className={cn(
									'block h-0.5 rounded-full bg-white transition-all duration-300',
									isMenuOpen ? 'w-6 translate-y-2 rotate-45' : 'w-6'
								)}></span>
							<span
								className={cn(
									'block h-0.5 rounded-full bg-white transition-all duration-300',
									isMenuOpen ? 'opacity-0 w-0' : 'opacity-100 w-4'
								)}></span>
							<span
								className={cn(
									'block h-0.5 rounded-full bg-white transition-all duration-300',
									isMenuOpen ? 'w-6 -translate-y-2 -rotate-45' : 'w-6'
								)}></span>
						</div>
					</button>
				</div>

				{/* Mobile Menu with improved animation */}
				<div
					className={`mobile-menu-container fixed md:hidden inset-0 z-40 backdrop-blur-lg transition-all duration-300 ${
						isMenuOpen ? 'opacity-100 visible animate-menu-container' : 'opacity-0 invisible'
					}`}
					style={{top: '64px'}}>
					<div
						className={`mobile-menu-bg h-[calc(100vh-64px)] p-6 transition-all duration-500 ${
							isMenuOpen ? 'translate-x-0 animate-menu-content' : 'translate-x-full'
						}`}>
						<nav className='flex flex-col space-y-6 pt-4'>
							{user ? (
								<>
									<div className='space-y-2'>
										<Link
											href='/players'
											className={cn(
												'block py-3 px-4 rounded-lg transition-all duration-300 bg-gradient-to-r hover:from-green-800/5 hover:to-green-800/20 flex items-center gap-3',
												activeLink === 'players'
													? 'from-green-800/10 to-green-800/30 text-green-200'
													: 'text-white'
											)}
											onClick={() => handleLinkClick('players')}>
											<Users
												className={cn(
													'transition-transform duration-300',
													activeLink === 'players' ? 'text-green-300 h-5 w-5' : 'h-4 w-4'
												)}
											/>
											<span
												className={cn(
													'transition-all duration-300',
													activeLink === 'players' && 'font-medium'
												)}>
												שחקנים
											</span>
										</Link>

										<Link
											href='/matches'
											className={cn(
												'block py-3 px-4 rounded-lg transition-all duration-300 bg-gradient-to-r hover:from-green-800/5 hover:to-green-800/20 flex items-center gap-3',
												activeLink === 'matches'
													? 'from-green-800/10 to-green-800/30 text-green-200'
													: 'text-white'
											)}
											onClick={() => handleLinkClick('matches')}>
											<Volleyball
												className={cn(
													'transition-transform duration-300',
													activeLink === 'matches' ? 'text-green-300 h-5 w-5' : 'h-4 w-4'
												)}
											/>
											<span
												className={cn(
													'transition-all duration-300',
													activeLink === 'matches' && 'font-medium'
												)}>
												משחקים
											</span>
										</Link>

										<Link
											href='/table'
											className={cn(
												'block py-3 px-4 rounded-lg transition-all duration-300 bg-gradient-to-r hover:from-green-800/5 hover:to-green-800/20 flex items-center gap-3',
												activeLink === 'table'
													? 'from-green-800/10 to-green-800/30 text-green-200'
													: 'text-white'
											)}
											onClick={() => handleLinkClick('table')}>
											<Trophy
												className={cn(
													'transition-transform duration-300',
													activeLink === 'table' ? 'text-green-300 h-5 w-5' : 'h-4 w-4'
												)}
											/>
											<span
												className={cn(
													'transition-all duration-300',
													activeLink === 'table' && 'font-medium'
												)}>
												טבלת ליגה
											</span>
										</Link>
									</div>

									<div className='pt-6 mt-2 border-t border-green-800/30'>
										<div className='user-status flex items-center gap-3 px-4 py-3 rounded-lg mb-4'>
											<div className='status-indicator w-2.5 h-2.5 bg-green-400 rounded-full'></div>
											<span className='text-green-200 font-medium'>{user.name}</span>
											<User className='h-4 w-4 text-green-200 ml-1' />
										</div>
										<button
											onClick={() => {
												logout();
												setIsMenuOpen(false);
											}}
											className='logout-button w-full py-2.5 px-4 rounded-md text-white flex items-center justify-center gap-2 rtl'>
											<LogOut className='h-4 w-4' />
											<span>התנתק</span>
										</button>
									</div>
								</>
							) : (
								<Link
									href='/login'
									className='login-button block w-full text-center py-3 px-4 rounded-md text-white font-medium'
									onClick={() => setIsMenuOpen(false)}>
									התחברות
								</Link>
							)}
						</nav>
					</div>
				</div>
			</div>

			{/* Spacer to prevent content from hiding behind fixed navbar */}
			<div className='h-16'></div>
		</>
	);
};

export default Navbar;
