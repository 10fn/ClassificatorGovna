import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Species } from './pages/Species/Species';
import { Properties } from './pages/Properties/Properties';
import { PropsWithValues } from './pages/PropsWithValues/PropsWithValues';
import { ToggleClassProps } from './pages/ToggleClassProps/ToggleClassProps';
import { IdentifyClass } from './pages/IdentityClass/IdentityClass';
import { TogglePropValues } from './pages/TogglePropValues/TogglePropValues';
import { CompletenessCheck } from './pages/CompletenesCheck/CompletenessCheck'

function KnowledgeBaseEditor() {
  const location = useLocation();

  const tabs = [
    { label: 'Виды оружий', path: '/species' },
    { label: 'Свойства', path: '/properties' },
    { label: 'Возможные значения', path: '/possible-values' },
    { label: 'Активация свойств', path: '/property-descriptions' },
    { label: 'Активация значений', path: '/property-values' },
    { label: 'Проверка полноты знаний', path: '/completeness-check' },
    { label: 'Определить класс', path: '/identify' },
  ];

  return (
    <div className="d-flex flex-column vh-100">
      {/* Горизонтальные вкладки сверху */}
      <div className="bg-danger text-white">
        <ul className="nav nav-pills justify-content-center">
          {tabs.map((tab) => (
            <li key={tab.path} className="nav-item">
              <Link
                to={tab.path}
                className={`nav-link ${location.pathname.includes(tab.path) ? 'active bg-white text-dark' : 'text-white'}`}
              >
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Контентная область */}
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
