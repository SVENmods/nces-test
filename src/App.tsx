import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/home';
import CreateTask from './pages/createTask';
import Task from './pages/task';
import NavBar from './components/system/NavBar';

function App() {
	return (
		<>
			<div className='relative px-1 min-h-screen'>
				<NavBar className='top-0 z-11 sticky' />
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/createTask' element={<CreateTask />} />
					<Route path='/task' element={<Task />} />
				</Routes>
			</div>
		</>
	);
}

export default App;
