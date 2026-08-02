import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProyectosListado } from './screens/ProyectosListado/ProyectosListado';
import { ActividadesListado } from './screens/ActividadesListado/ActividadesListado';
import { AnalisisEvmActividad } from './screens/AnalisisEvmActividad/AnalisisEvmActividad';
import { DashboardProyecto } from './screens/DashboardProyecto/DashboardProyecto';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProyectosListado />} />
        <Route path="/proyectos/:proyectoId/actividades" element={<ActividadesListado />} />
        <Route path="/proyectos/:proyectoId/dashboard" element={<DashboardProyecto />} />
        <Route path="/actividades/:actividadId/analisis-evm" element={<AnalisisEvmActividad />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
