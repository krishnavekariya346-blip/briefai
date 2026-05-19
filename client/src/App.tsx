import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BriefNew from './pages/BriefNew';
import BriefDetail from './pages/BriefDetail';
import ProposalsList from './pages/ProposalsList';
import ProposalDetail from './pages/ProposalDetail';
import PublicProposal from './pages/PublicProposal';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/p/:slug" element={<PublicProposal />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/briefs/new" element={<BriefNew />} />
        <Route path="/briefs/:id" element={<BriefDetail />} />
        <Route path="/proposals" element={<ProposalsList />} />
        <Route path="/proposals/:id" element={<ProposalDetail />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
