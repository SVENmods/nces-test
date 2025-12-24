import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/home'
import CreateTask from './pages/createTask'
import TaskPage from './pages/Task'

function App() {
	return (
		<div className='relative px-1 min-h-screen'>
			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/createTask' element={<CreateTask />} />
				<Route path='/tasks/:id' element={<TaskPage />} />
			</Routes>
		</div>
	)
}

export default App
