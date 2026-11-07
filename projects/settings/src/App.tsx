import { useEffect, useState, type ReactNode } from 'react';
import { ApiError, deleteLogo, getLogo, getVanitySection, saveLogo, saveVanitySection } from './api/vanity-page';
import {
  CheckCircleIcon,
  ChevronDownIcon,
  DesktopIcon,
  FullScreenIcon,
  GoogleIcon,
  MobileIcon,
} from './components/icons';
import { shownColor } from './lib/colors';
import { shownText } from './lib/text';
import {
  alternateSignInToSave,
  EMAIL_DEFAULTS,
  GUEST_DEFAULTS,
  INITIAL_ALTERNATE_SIGN_IN,
  type AlternateSignIn,
} from './sections/alternate-sign-in/alternate-sign-in';
import AlternateSignInSection from './sections/alternate-sign-in/AlternateSignInSection';
import {
  copyrightDefaults,
  FOOTER_BACKGROUND_DEFAULT,
  footerToSave,
  INITIAL_FOOTER,
  type Footer,
} from './sections/footer/footer';
import FooterSection from './sections/footer/FooterSection';
import {
  INITIAL_MONOGRAM_LOGO,
  monogramLogoToSave,
  NO_LOGO,
  shownMonogram,
  type LogoState,
  type MonogramLogo,
} from './sections/monogram-logo/monogram-logo';
import MonogramLogoSection from './sections/monogram-logo/MonogramLogoSection';
import {
  CARD_BACKGROUND_DEFAULT,
  INITIAL_PAGE_APPEARANCE,
  PAGE_BACKGROUND_DEFAULT,
  pageAppearanceToSave,
  type PageAppearance,
} from './sections/page-appearance/page-appearance';
import {
  DISTRICT_NAME_DEFAULTS,
  INITIAL_PAGE_TEXT,
  pageTextToSave,
  SUBTEXT_DEFAULTS,
  type PageText,
} from './sections/page-text/page-text';
import PageAppearanceSection from './sections/page-appearance/PageAppearanceSection';
import PageTextSection from './sections/page-text/PageTextSection';
import {
  HEADING_DEFAULTS,
  INITIAL_SIGN_IN_BLOCK,
  SIGN_IN_CARD_DEFAULT,
  signInBlockToSave,
  type SignInBlock,
} from './sections/sign-in-block/sign-in-block';
import SignInBlockSection from './sections/sign-in-block/SignInBlockSection';
import {
  GOOGLE_DEFAULTS,
  INITIAL_SSO_SIGN_IN,
  ssoSignInToSave,
  type SsoSignIn,
} from './sections/sso-sign-in/sso-sign-in';
import SsoSignInSection from './sections/sso-sign-in/SsoSignInSection';
import {
  INITIAL_URL_CONFIGURATION,
  isValidSlug,
  VANITY_BASE_URL,
  type UrlConfiguration,
} from './sections/url-configuration/url-configuration';
import UrlConfigurationSection from './sections/url-configuration/UrlConfigurationSection';

const SAVE_MESSAGES = {
  idle: '',
  saving: 'Saving...',
  saved: 'Saved',
  invalid: 'Enter a full colour code, like #C02020, before saving.',
  invalidUrl: 'Fix the page URL before saving.',
  urlTaken: 'That page URL is already taken. Choose another.',
  failed: 'Could not save. Please try again.',
};

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
  const [pageAppearance, setPageAppearance] = useState(INITIAL_PAGE_APPEARANCE);
  const [monogramLogo, setMonogramLogo] = useState(INITIAL_MONOGRAM_LOGO);
  const [logo, setLogo] = useState<LogoState>(NO_LOGO);
  const [signInBlock, setSignInBlock] = useState(INITIAL_SIGN_IN_BLOCK);
  const [ssoSignIn, setSsoSignIn] = useState(INITIAL_SSO_SIGN_IN);
  const [alternateSignIn, setAlternateSignIn] = useState(INITIAL_ALTERNATE_SIGN_IN);
  const [footer, setFooter] = useState(INITIAL_FOOTER);
  const [urlConfiguration, setUrlConfiguration] = useState(INITIAL_URL_CONFIGURATION);
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const [saveState, setSaveState] = useState<keyof typeof SAVE_MESSAGES>('idle');

  const districtName = shownText(pageText.districtName, DISTRICT_NAME_DEFAULTS);
  const subtext = shownText(pageText.subtext, SUBTEXT_DEFAULTS);
  const pageBackground = shownColor(pageAppearance.pageBackground, PAGE_BACKGROUND_DEFAULT);
  const cardBackground = shownColor(pageAppearance.cardBackground, CARD_BACKGROUND_DEFAULT);
  const buttonRadius = pageAppearance.buttonCorners === 'square' ? 0 : undefined;
  const monogram = shownMonogram(monogramLogo, districtName.text);
  const showLogo = monogramLogo.show === 'logo' && logo.url !== null;
  const signInHeading = shownText(signInBlock.heading, HEADING_DEFAULTS);
  const signInCardStyle = {
    background: shownColor(signInBlock.cardBackground, SIGN_IN_CARD_DEFAULT),
    border: signInBlock.showBorder ? undefined : 'none',
    borderRadius: signInBlock.corners === 'square' ? 0 : undefined,
  };
  const googleButton = shownText(ssoSignIn.google, GOOGLE_DEFAULTS);
  const emailButton = shownText(alternateSignIn.email, EMAIL_DEFAULTS);
  const guestButton = shownText(alternateSignIn.guest, GUEST_DEFAULTS);
  const showAlternateOptions = alternateSignIn.email.show || alternateSignIn.guest.show;
  const copyright = shownText(footer.copyright, copyrightDefaults(districtName.text));
  const footerBackground = shownColor(footer.background, FOOTER_BACKGROUND_DEFAULT);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getVanitySection<PageText>('page-text'),
      getVanitySection<PageAppearance>('page-appearance'),
      getVanitySection<MonogramLogo>('monogram-logo'),
      getLogo(),
      getVanitySection<SignInBlock>('sign-in-block'),
      getVanitySection<AlternateSignIn>('alternate-sign-in'),
      getVanitySection<Footer>('footer'),
      getVanitySection<UrlConfiguration>('url-configuration'),
      getVanitySection<SsoSignIn>('sso-sign-in'),
    ])
      .then(
        ([
          savedText,
          savedAppearance,
          savedMonogram,
          savedLogo,
          savedSignInBlock,
          savedAlternateSignIn,
          savedFooter,
          savedUrlConfiguration,
          savedSsoSignIn,
        ]) => {
        if (cancelled) {
          return;
        }
        if (savedText) {
          setPageText(savedText);
        }
        if (savedAppearance) {
          setPageAppearance(savedAppearance);
        }
        if (savedMonogram) {
          setMonogramLogo(savedMonogram);
        }
        if (savedLogo) {
          setLogo({ url: URL.createObjectURL(savedLogo), file: null, changed: false });
        }
        if (savedSignInBlock) {
          setSignInBlock(savedSignInBlock);
        }
        if (savedAlternateSignIn) {
          setAlternateSignIn(savedAlternateSignIn);
        }
        if (savedFooter) {
          setFooter(savedFooter);
        }
        if (savedUrlConfiguration) {
          setUrlConfiguration(savedUrlConfiguration);
        }
        if (savedSsoSignIn) {
          setSsoSignIn(savedSsoSignIn);
        }
        setLoadState('loaded');
        },
      )
      .catch(() => {
        if (!cancelled) {
          setLoadState('failed');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function changePageText(value: PageText): void {
    setPageText(value);
    setSaveState('idle');
  }

  function changePageAppearance(value: PageAppearance): void {
    setPageAppearance(value);
    setSaveState('idle');
  }

  function changeMonogramLogo(value: MonogramLogo): void {
    setMonogramLogo(value);
    setSaveState('idle');
  }

  function changeLogo(value: LogoState): void {
    setLogo(value);
    setSaveState('idle');
  }

  function changeSignInBlock(value: SignInBlock): void {
    setSignInBlock(value);
    setSaveState('idle');
  }

  function changeSsoSignIn(value: SsoSignIn): void {
    setSsoSignIn(value);
    setSaveState('idle');
  }

  function changeAlternateSignIn(value: AlternateSignIn): void {
    setAlternateSignIn(value);
    setSaveState('idle');
  }

  function changeFooter(value: Footer): void {
    setFooter(value);
    setSaveState('idle');
  }

  function changeUrlConfiguration(value: UrlConfiguration): void {
    setUrlConfiguration(value);
    setSaveState('idle');
  }

  // Uploads a newly chosen logo, or deletes a removed one. An unchanged logo isn't sent again.
  function saveLogoChange(value: LogoState): Promise<void> | null {
    if (!value.changed) {
      return null;
    }
    return value.file ? saveLogo(value.file) : deleteLogo();
  }

  async function save(): Promise<void> {
    const textToSave = pageTextToSave(pageText);
    const appearanceToSave = pageAppearanceToSave(pageAppearance);
    const monogramToSave = monogramLogoToSave(monogramLogo);
    const signInBlockToSaveNow = signInBlockToSave(signInBlock);
    const ssoSignInToSaveNow = ssoSignInToSave(ssoSignIn);
    const alternateSignInToSaveNow = alternateSignInToSave(alternateSignIn);
    const footerToSaveNow = footerToSave(footer);
    if (
      !textToSave ||
      !appearanceToSave ||
      !monogramToSave ||
      !signInBlockToSaveNow ||
      !ssoSignInToSaveNow ||
      !alternateSignInToSaveNow ||
      !footerToSaveNow
    ) {
      setSaveState('invalid');
      return;
    }
    if (!isValidSlug(urlConfiguration.slug)) {
      setSaveState('invalidUrl');
      return;
    }
    const logoToSave = logo;
    setSaveState('saving');
    try {
      await Promise.all([
        saveVanitySection('page-text', textToSave),
        saveVanitySection('page-appearance', appearanceToSave),
        saveVanitySection('monogram-logo', monogramToSave),
        saveLogoChange(logoToSave),
        saveVanitySection('sign-in-block', signInBlockToSaveNow),
        saveVanitySection('sso-sign-in', ssoSignInToSaveNow),
        saveVanitySection('alternate-sign-in', alternateSignInToSaveNow),
        saveVanitySection('footer', footerToSaveNow),
        saveVanitySection('url-configuration', urlConfiguration),
      ]);
      // A logo chosen while saving is still waiting to be uploaded, so it stays marked as changed.
      setLogo((current) => (current === logoToSave ? { ...current, file: null, changed: false } : current));
      setSaveState('saved');
    } catch (error) {
      // The other sections may still have saved. Only the URL needs choosing again.
      setSaveState(error instanceof ApiError && error.status === 409 ? 'urlTaken' : 'failed');
    }
  }

  // Saving before the user's settings have loaded would overwrite them with the defaults.
  const canSave = loadState === 'loaded' && saveState !== 'saving';
  const statusMessage = loadState === 'failed' ? 'Could not load your saved settings.' : SAVE_MESSAGES[saveState];

  const panels: Record<string, ReactNode> = {
    'URL Configuration': <UrlConfigurationSection value={urlConfiguration} onChange={changeUrlConfiguration} />,
    'Page Appearance': <PageAppearanceSection value={pageAppearance} onChange={changePageAppearance} />,
    'Monogram & Logo': (
      <MonogramLogoSection
        value={monogramLogo}
        logo={logo}
        districtName={districtName.text}
        onChange={changeMonogramLogo}
        onLogoChange={changeLogo}
      />
    ),
    'Page Text': <PageTextSection value={pageText} onChange={changePageText} />,
    'Sign-in Block': <SignInBlockSection value={signInBlock} onChange={changeSignInBlock} />,
    'SSO Sign In Options': <SsoSignInSection value={ssoSignIn} onChange={changeSsoSignIn} />,
    'Alternate Sign-in Options': <AlternateSignInSection value={alternateSignIn} onChange={changeAlternateSignIn} />,
    Footer: <FooterSection value={footer} districtName={districtName.text} onChange={changeFooter} />,
  };

  return (
    <div className="settings">
      <header className="page-header">
        <h1 className="page-header__title">Vanity Page Configuration</h1>
        <div className="page-header__actions">
          {statusMessage && <span className="page-header__status">{statusMessage}</span>}
          <button className="button button--secondary" type="button" disabled={!canSave} onClick={save}>
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

          <div className="preview" style={{ background: pageBackground }}>
            {urlConfiguration.slug && isValidSlug(urlConfiguration.slug) && (
              <p className="preview__address">
                {VANITY_BASE_URL}
                {urlConfiguration.slug}
              </p>
            )}
            <div className="preview__page" style={{ background: cardBackground }}>
              <div className="preview__body">
                {showLogo ? (
                  <img className="preview__logo" src={logo.url ?? undefined} alt="Logo" />
                ) : (
                  <span className="preview__monogram" style={{ background: monogram.background, color: monogram.color }}>
                    {monogram.letters}
                  </span>
                )}
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

                <div className="sign-in" style={signInCardStyle}>
                  {signInBlock.heading.show && (
                    <h3 className="sign-in__title" style={{ color: signInHeading.color }}>
                      {signInHeading.text}
                    </h3>
                  )}
                  {ssoSignIn.google.show && (
                    <button
                      className="sign-in__option sign-in__option--google"
                      type="button"
                      style={{ borderRadius: buttonRadius, color: googleButton.color }}
                    >
                      <GoogleIcon />
                      {googleButton.text}
                    </button>
                  )}
                  {ssoSignIn.google.show && showAlternateOptions && (
                    <p className="sign-in__divider">
                      <span>or</span>
                    </p>
                  )}
                  {alternateSignIn.email.show && (
                    <button
                      className="sign-in__option"
                      type="button"
                      style={{ borderRadius: buttonRadius, color: emailButton.color }}
                    >
                      {emailButton.text}
                    </button>
                  )}
                  {alternateSignIn.guest.show && (
                    <button
                      className="sign-in__option sign-in__option--guest"
                      type="button"
                      style={{ borderRadius: buttonRadius, color: guestButton.color }}
                    >
                      {guestButton.text}
                    </button>
                  )}
                </div>
              </div>

              {(footer.copyright.show || footer.showPoweredBy) && (
                <footer className="preview__footer" style={{ background: footerBackground }}>
                  {footer.copyright.show && <span style={{ color: copyright.color }}>{copyright.text}</span>}
                  {footer.showPoweredBy && (
                    <span className="preview__powered">
                      Powered by <strong className="preview__brand">onflo</strong>
                    </span>
                  )}
                </footer>
              )}
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
                    {panels[section] ?? `${section} settings will go here.`}
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
