import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './views/layouts/MainLayout';
import Dashboard from './views/pages/Dashboard';
import Members from './views/pages/Members';
import TutorDetails from './views/pages/TutorDetails';
import ProSel from './views/pages/ProSel';
import Newsletter from './views/pages/Newsletter';
import ArticleDetails from './views/pages/ArticleDetails';
import Projects from './views/pages/Projects';
import ProjectDetails from './views/pages/ProjectDetails';
import Login from './views/pages/Login';
import Admin from './views/pages/Admin';
import Events from './views/pages/Events';
import EventDetails from './views/pages/EventDetails';
import ProtectedRoute from './components/ui/ProtectedRoute';
import ScrollToTop from './components/layout/ScrollToTop';

import About from './views/pages/About';
import Partnerships from './views/pages/Partnerships';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="tutors" element={<Navigate to="/members?tab=tutors" replace />} />
          <Route path="tutors/:id" element={<TutorDetails />} />
          <Route path="prosel" element={<ProSel />} />
          <Route path="newsletter" element={<Newsletter />} />
          <Route path="newsletter/:id" element={<ArticleDetails />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="partnerships" element={<Partnerships />} />
          <Route path="about" element={<About />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:slug" element={<EventDetails />} />
          <Route path="numeros" element={<Navigate to="/about" replace />} />
          <Route path="liao-em-numeros" element={<Navigate to="/about" replace />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/admin/:section" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
