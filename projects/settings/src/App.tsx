import { CheckCircleIcon, ChevronDownIcon, DesktopIcon, FullScreenIcon, MobileIcon } from './icons';
import { useState } from 'react';
import { DISTRICT_NAME_DEFAULTS, INITIAL_PAGE_TEXT, shownText, SUBTEXT_DEFAULTS } from './page-text';
import PageTextSection from './PagetextSection';

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
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [pageText, setPageText] = useState(INITIAL_PAGE_TEXT);

  const districtName = shownText(pageText.districtName, DISTRICT_NAME_DEFAULTS);
  const subtext = shownText(pageText.subtext, SUBTEXT_DEFAULTS);

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
                {pageText.districtName.show && (
                  <h2 className="preview__name" style={{ color: districtName.color }}>
                    {districtName.text}
                  </h2>
                )}
                {pageText.subtext.show && (
                  <p className="preview__portal" style={{ color: subtext.color }}>
                    {subtext.text}
                  </p>
                )}

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
          {SECTIONS.map((section) => {
            const isOpen = openSection === section;
            return (
              <div className={isOpen ? 'section section--open' : 'section'} key={section}>
                <button
                  className="section__header"
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenSection(isOpen ? null : section)}
                >
                  {section}
                  <ChevronDownIcon />
                </button>

                {isOpen && (
                  <div className="section__body">
                    {section === 'Page Text' ? (
                      <PageTextSection value={pageText} onChange={setPageText} />
                    ) : (
                      `${section} settings will go here.`
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </aside>
      </div>
    </div>
  );
}
