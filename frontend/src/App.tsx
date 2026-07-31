import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProyectosListado } from './screens/ProyectosListado/ProyectosListado';
import { ActividadesListado } from './screens/ActividadesListado/ActividadesListado';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProyectosListado />} />
        <Route path="/proyectos/:proyectoId/actividades" element={<ActividadesListado />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
