import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { HashRouter } from 'react-router-dom';
import { StrictMode } from 'react';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<HashRouter basename='/'>
			<App />
		</HashRouter>
	</StrictMode>
);
