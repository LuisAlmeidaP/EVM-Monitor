import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProyectosListado } from './screens/ProyectosListado/ProyectosListado';
import { ActividadesListado } from './screens/ActividadesListado/ActividadesListado';
import { AnalisisEvmActividad } from './screens/AnalisisEvmActividad/AnalisisEvmActividad';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProyectosListado />} />
        <Route path="/proyectos/:proyectoId/actividades" element={<ActividadesListado />} />
        <Route path="/actividades/:actividadId/analisis-evm" element={<AnalisisEvmActividad />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
