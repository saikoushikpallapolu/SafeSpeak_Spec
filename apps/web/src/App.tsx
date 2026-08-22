import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

// Pages
import Splash from './pages/Splash'
import Characters from './pages/Characters'
import CheckIn from './pages/CheckIn'
import Matching from './pages/Matching'
import MatchFound from './pages/MatchFound'
import Chat from './pages/Chat'
import VoiceState from './pages/VoiceState'
import MildNudge from './pages/MildNudge'
import CrisisOverlay from './pages/CrisisOverlay'
import Report from './pages/Report'
import Reflection from './pages/Reflection'
import Resources from './pages/Resources'
import Friends from './pages/Friends'
import AddFriend from './pages/AddFriend'
import RoomsBrowse from './pages/RoomsBrowse'
import GroupRoom from './pages/GroupRoom'
import InstallPrompt from './components/common/InstallPrompt'
import JudgeTesterDrawer from './components/common/JudgeTesterDrawer'

export default function App() {
  const location = useLocation()

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Splash />} />
          <Route path="/characters" element={<Characters />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/matching" element={<Matching />} />
          <Route path="/match-found" element={<MatchFound />} />
          <Route path="/chat/:roomId" element={<Chat />} />
          <Route path="/chat/:roomId/voice" element={<VoiceState />} />
          <Route path="/safety/nudge" element={<MildNudge />} />
          <Route path="/safety/crisis" element={<CrisisOverlay />} />
          <Route path="/report" element={<Report />} />
          <Route path="/reflection" element={<Reflection />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/friends/add" element={<AddFriend />} />
          <Route path="/rooms" element={<RoomsBrowse />} />
          <Route path="/rooms/:roomId" element={<GroupRoom />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <InstallPrompt />
      <JudgeTesterDrawer />
    </>
  )
}
