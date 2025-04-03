import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Landing from './pages/Landing';
import Admin from './pages/Admin';
import Adminhome from './pages/Adminhome';
import Users from './pages/User';
import Userhome from './pages/Userhome';
function App(){
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing/>}/>
      <Route path="/admin" element={<Admin/>}/>
      <Route path="/admin-dashboard" element={<Adminhome/>}/>
      <Route path="/user" element={<Users/>}/>
      <Route path="/user-dashboard" element={<Userhome/>}/>
    </Routes>
    </BrowserRouter>
    </>
  )
};
export default App;