import { Link } from 'react-router-dom';
// import ThemeToggle from './themeToggle';
import cls from 'classnames';

interface NavBarProps {
	className?: string;
}

const NavBar: React.FC<NavBarProps> = ({ className }) => {
	const linkStyle: string = 'hover:opacity-70 underline-offset-2 transition duration-300 text-base-content';
	return (
		<>
			<div
				className={cls(
					className,
					'flex flex-row justify-between items-center mt-3.5 py-2 border bg-base-200 border-base-content rounded-lg'
				)}
			>
				<nav className='w-full'>
					<ul className='flex flex-row justify-center gap-x-2'>
						<li>
							<Link to='/' className={linkStyle}>
								home
							</Link>
						</li>
						<li>
							<Link to='/task' className={linkStyle}>
								task
							</Link>
						</li>
						<li>
							<Link to='/createTask' className={linkStyle}>
								create Task
							</Link>
						</li>
					</ul>
				</nav>
				{/* <ThemeToggle /> */}
			</div>
		</>
	);
};

export default NavBar;
