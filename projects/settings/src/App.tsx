import { CheckCircleIcon, ChevronDownIcon, DesktopIcon, FullScreenIcon, MobileIcon } from './icons';

const SECTIONS = [
  'URL Configuration',
  'Page Appearance',
  'Monogram & Logo',
  'Page Text',
  'Sign-in Block',
  'SSO Sign In Options',
  'Alternate Sign-in Options',
  'Footer',
];

export default function App() {
  return (
    <div className="settings">
      <header className="page-header">
        <h1 className="page-header__title">Vanity Page Configuration</h1>
        <div className="page-header__actions">
          <button className="button button--secondary" type="button">
            Save
          </button>
          <button className="button button--primary" type="button" disabled>
            <CheckCircleIcon />
            Publish
          </button>
        </div>
      </header>

      <div className="layout">
        <section className="editor">
          <div className="toolbar">
            <button className="tab tab--active" type="button">
              <DesktopIcon />
              Desktop View
            </button>
            <button className="tab" type="button">
              <MobileIcon />
              Mobile View
            </button>
            <button className="button button--secondary toolbar__preview" type="button">
              <FullScreenIcon />
              Full Screen Preview
            </button>
          </div>

          <div className="preview">
            <div className="preview__page">
              <div className="preview__body">
                <span className="preview__monogram">L</span>
                <h2 className="preview__name">Laguna Beach School District</h2>
                <p className="preview__portal">Onflo Support Portal</p>

                <div className="sign-in">
                  <h3 className="sign-in__title">Sign in to continue</h3>
                  <button className="sign-in__option" type="button">
                    Sign in with Email
                  </button>
                  <button className="sign-in__option sign-in__option--guest" type="button">
                    Continue as Guest
                  </button>
                </div>
              </div>

              <footer className="preview__footer">
                <span>© 2026 Laguna Beach School District. All rights reserved.</span>
                <span>
                  Powered by <strong className="preview__brand">onflo</strong>
                </span>
              </footer>
            </div>
          </div>
        </section>

        <aside className="sections">
          {SECTIONS.map((section) => (
            <button className="section" type="button" aria-expanded={false} key={section}>
              {section}
              <ChevronDownIcon />
            </button>
          ))}
        </aside>
      </div>
    </div>
  );
}
