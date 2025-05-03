import react, { useContext } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Homepage from './Pages/Homepage';
import PropertyForm from './Pages/PropertyForm';
import Roomdahboard from './Pages/Roomdahboard';
import RoomChecklist from './Pages/RoomChecklist';
import Editform from './Pages/Editform';
import Login from './Pages/Login';
import Register from './Pages/Register';
import { AdminContext } from './Context/AdminContext';
import Mainpage from './Pages/Mainpage';
import Maintenancepage from './Pages/Maintenancepage';
import Adminpage from './Pages/Adminpage';
import Propertymaintain from './Pages/Propertymaintain';
import PropertyMaintenanceDetail from './Pages/PropertyMaintenanceDetail';
import PropertyMaintenanceForm from './Pages/property-maintenance-form';
import EditMaintenancepage from './Pages/EditMaintenancepage';


function App() {
  const {adminToken} = useContext(AdminContext);

  
  

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/mainpage" element={  <Mainpage />} />
        <Route path="/maintenance" element={ <Maintenancepage />} />
        <Route path="/adminpage" element={<Adminpage />} />
        <Route path="/propertymaintain" element={ <Propertymaintain />} />
        <Route path="/maintenance/property/:propertyId" element={<PropertyMaintenanceForm />} />
        <Route path="/maintenance/property/edit/:propertyId" element={<EditMaintenancepage />} />
        <Route path="/propertyform" element={<PropertyForm />} />
        <Route path="/propertyform/:id" element={<Editform />} />
        <Route path="/room/:id" element={<Roomdahboard />} />
        <Route path="/room/checklist/:id" element={<RoomChecklist />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
