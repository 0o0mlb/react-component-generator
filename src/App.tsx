import { useState, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import { usePersistentState } from './hooks/usePersistentState';
import {
  STORAGE_KEYS,
  addToHistory,
  parseApiKeys,
  parseHistory,
  parseProvider,
} from './utils/storage';
import type { Provider } from './types';
import './App.css';

const PROVIDER_CONFIG = {
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { label: 'Google', placeholder: 'AIza...' },
} as const;

function App() {
  const [apiKeys, setApiKeys] = usePersistentState<Record<Provider, string>>(
    STORAGE_KEYS.apiKeys,
    { anthropic: '', google: '' },
    parseApiKeys,
  );
  const [history, setHistory] = usePersistentState<string[]>(
    STORAGE_KEYS.history,
    [],
    parseHistory,
  );
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = usePersistentState<Provider>(
    STORAGE_KEYS.provider,
    'google',
    parseProvider,
  );
  const apiKey = apiKeys[provider];
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({
    anthropic: false,
    google: false,
  });
  const { components, isLoading, error, generate, removeComponent, clearAll } =
    useComponentGenerator();

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setEnvKeys(data.envKeys))
      .catch(() => {});
  }, []);

  const hasEnvKey = envKeys[provider];

  const handleGenerate = (prompt: string) => {
    if (!apiKey.trim() && !hasEnvKey) {
      alert(`${PROVIDER_CONFIG[provider].label} API 키를 입력하거나 .env에 설정해주세요.`);
      return;
    }
    setHistory((prev) => addToHistory(prev, prompt));
    generate(prompt, apiKey || undefined, provider);
  };

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
  };

  const activeProvider = PROVIDER_CONFIG[provider].label;

  return (
    <div className="app">
      <header className="menubar">
        <div className="menubar-brand">
          <span className="brand-mark" aria-hidden="true">RC</span>
          <span>React 컴포넌트 생성기</span>
        </div>
        <div className="menubar-status" aria-label="현재 작업 상태">
          <span>
            Provider: <strong>{activeProvider}</strong>
          </span>
          <span>
            컴포넌트: <strong>{components.length}</strong>
          </span>
        </div>
      </header>

      <div className="desk-title">
        <h1>프롬프트로 만드는 UI 워크벤치</h1>
        <p>요청을 입력하면 React 컴포넌트를 만들고, 바로 미리보고 코드로 확인합니다.</p>
      </div>

      <main className="workspace">
        <section className="win composer-panel" aria-label="컴포넌트 생성">
          <div className="win-title">
            <span>새 컴포넌트</span>
          </div>
          <div className="win-body">
            <PromptInput onGenerate={handleGenerate} isLoading={isLoading} history={history} />
          </div>
        </section>

        <aside className="win settings-panel" aria-label="실행 설정">
          <div className="win-title">
            <span>실행 설정</span>
          </div>
          <div className="win-body">
            <div className="provider-select">
              <label htmlFor="provider">Provider</label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value as Provider)}
              >
                {Object.entries(PROVIDER_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="api-key-input">
              <label htmlFor="api-key">API Key</label>
              <div className="api-key-field">
                <input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKeys((prev) => ({ ...prev, [provider]: e.target.value }))}
                  placeholder={
                    hasEnvKey
                      ? '서버 키 사용 중 (직접 입력으로 덮어쓰기 가능)'
                      : PROVIDER_CONFIG[provider].placeholder
                  }
                />
                <button
                  className="btn-toggle-key"
                  onClick={() => setShowKey(!showKey)}
                  type="button"
                >
                  {showKey ? '숨기기' : '보기'}
                </button>
              </div>
              <p className={`key-status ${hasEnvKey ? 'key-status--ready' : ''}`}>
                {hasEnvKey
                  ? '.env 키가 연결되어 있습니다.'
                  : '직접 입력하거나 서버 환경변수를 설정하세요.'}
              </p>
            </div>
          </div>
        </aside>
      </main>

      {error && (
        <div className="error-banner" role="alert">
          <strong>오류</strong>
          <p>{error}</p>
        </div>
      )}

      <section className="results-section">
        {components.length > 0 && (
          <div className="results-header">
            <h2>생성된 컴포넌트</h2>
            <button className="btn-clear" onClick={clearAll}>
              전체 삭제
            </button>
          </div>
        )}

        {components.length === 0 && !isLoading && (
          <div className="win empty-state">
            <div className="win-title">
              <span>비어 있음</span>
            </div>
            <div className="win-body empty-body">
              <div className="empty-screen" aria-hidden="true">
                <span className="empty-prompt">&gt; ready</span>
                <div className="empty-canvas">
                  <div className="empty-card empty-card--primary" />
                  <div className="empty-card" />
                  <div className="empty-card empty-card--wide" />
                </div>
              </div>
              <div className="empty-copy">
                <h2>아직 만든 컴포넌트가 없어요.</h2>
                <p>위 입력창에 만들고 싶은 UI를 적고 생성을 누르세요.</p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="win loading-card" role="status">
            <div className="win-title">
              <span>생성 중</span>
            </div>
            <div className="win-body">
              <p>컴포넌트를 생성하고 있습니다...</p>
              <div className="loading-bar" aria-hidden="true">
                <i />
              </div>
            </div>
          </div>
        )}

        <div className="results-grid">
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onRemove={removeComponent}
              onRegenerate={handleGenerate}
              isLoading={isLoading}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
