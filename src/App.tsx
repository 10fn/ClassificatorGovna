import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Species } from './pages/Species/Species';
import { Properties } from './pages/Properties/Properties';
import { PropsWithValues } from './pages/PropsWithValues/PropsWithValues';
import { ToggleClassProps } from './pages/ToggleClassProps/ToggleClassProps';
import { CompletenessCheck } from './pages/CompletenesCheck/CompletenessCheck';
import { IdentifyClass } from './pages/IdentityClass/IdentityClass';
import { TogglePropValues } from './pages/TogglePropValues/TogglePropValues';

function KnowledgeBaseEditor() {
  const location = useLocation();

  const tabs = [
    { label: 'Виды музыки', path: '/species' },
    { label: 'Свойства', path: '/properties' },
    { label: 'Возможные значения', path: '/possible-values' },
    { label: 'Активация свойств', path: '/property-descriptions' },
    { label: 'Активация значений', path: '/property-values' },
    { label: 'Проверка полноты знаний', path: '/completeness-check' },
    { label: 'Определить класс', path: '/identify' },
  ];

  return (
    <div className="d-flex vh-100">
      {/* Синяя боковая панель */}
      <div className="bg-primary text-white" style={{ width: '220px', minWidth: '220px' }}>
        <div className="nav flex-column nav-pills h-100">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`nav-link text-start py-3 px-4 ${
                location.pathname.includes(tab.path)
                  ? 'active bg-white text-primary fw-bold'
                  : 'text-white'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Контентная часть */}
      <div className="flex-grow-1 p-4 overflow-auto bg-light">
        <Routes>
          <Route path="/species" element={<Species />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/possible-values" element={<PropsWithValues />} />
          <Route path="/property-descriptions" element={<ToggleClassProps />} />
          <Route path="/property-values" element={<TogglePropValues />} />
          <Route path="/identify" element={<IdentifyClass />} />
          <Route path="/completeness-check" element={<CompletenessCheck />} />
          <Route path="/" element={<div className="p-3">Выберите вкладку</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default KnowledgeBaseEditor;
