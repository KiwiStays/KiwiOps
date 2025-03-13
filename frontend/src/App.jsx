import react from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Homepage from './Pages/Homepage';
import PropertyForm from './Pages/Propertyform';
import Roomdahboard from './Pages/Roomdahboard';
import RoomChecklist from './Pages/RoomChecklist';
import Editform from './Pages/Editform';


function App() {

  
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
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
