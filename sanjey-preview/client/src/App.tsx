import {Route,Switch,Router} from 'wouter';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
export default function App(){return <ErrorBoundary><Router ssrPath="/"><Switch><Route path="/" component={Home}/><Route component={NotFound}/></Switch></Router></ErrorBoundary>;}
