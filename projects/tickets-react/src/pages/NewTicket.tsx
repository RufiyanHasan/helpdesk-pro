import { useState, type FormEvent } from 'react';
import { createTicket } from '../api/tickets';
import { Link, useNavigation } from '../lib/navigation';
import { PRIORITIES, TOPICS } from '../lib/ticket-options';
import type { NewTicketRequest } from '../types';
import RichTextEditor from './RichTextEditor';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ARTICLES = [
  'How to reset your password',
  'Setting up single sign-on',
  'Why am I asked for a verification code?',
];

export default function NewTicket() {
  const { navigate } = useNavigation();

  const [values, setValues] = useState<NewTicketRequest>({
    requesterEmail: '',
    topic: TOPICS[0],
    subject: '',
    description: '',
    priority: 'Medium',
  });
  // Errors only show once a field has been left, or after trying to submit.
  const [touched, setTouched] = useState({ requesterEmail: false, subject: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);

  const emailError = !values.requesterEmail
    ? 'Requester email is required.'
    : EMAIL_PATTERN.test(values.requesterEmail)
      ? ''
      : 'Enter a valid email address.';
  const subjectError = values.subject.trim() ? '' : 'Subject is required.';

  function change<K extends keyof NewTicketRequest>(key: K, value: NewTicketRequest[K]): void {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (emailError || subjectError) {
      setTouched({ requesterEmail: true, subject: true });
      return;
    }

    setIsSubmitting(true);
    setSubmitFailed(false);

    try {
      await createTicket(values);
      navigate('');
    } catch {
      setIsSubmitting(false);
      setSubmitFailed(true);
    }
  }

  return (
    <div className="new-ticket-page">
      <Link className="back-link" to="">
        ← Back to tickets
      </Link>
      <h1 className="title">New ticket</h1>

      <div className="layout">
        <form className="card form" noValidate onSubmit={onSubmit}>
          <div className="form__row">
            <div className="field">
              <label className="field__label" htmlFor="requester-email">
                Requester email
              </label>
              <input
                className="field__input"
                id="requester-email"
                type="email"
                placeholder="name@company.com"
                value={values.requesterEmail}
                onChange={(event) => change('requesterEmail', event.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, requesterEmail: true }))}
              />
              {touched.requesterEmail && emailError && <p className="field__error">{emailError}</p>}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="topic">
                Topic
              </label>
              <select
                className="field__input"
                id="topic"
                value={values.topic}
                onChange={(event) => change('topic', event.target.value)}
              >
                {TOPICS.map((topic) => (
                  <option value={topic} key={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="subject">
              Subject
            </label>
            <input
              className="field__input"
              id="subject"
              type="text"
              placeholder="Short summary of the issue"
              value={values.subject}
              onChange={(event) => change('subject', event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, subject: true }))}
            />
            {touched.subject && subjectError && <p className="field__error">{subjectError}</p>}
          </div>

          <div className="field">
            <span className="field__label">Description</span>
            <RichTextEditor
              label="Description"
              placeholder="What happened, and what did you expect?"
              value={values.description}
              onChange={(description) => change('description', description)}
            />
          </div>

          <fieldset className="priority">
            <legend className="field__label">Priority</legend>
            {PRIORITIES.map((priority) => (
              <label className="priority__option" key={priority}>
                <input
                  type="radio"
                  name="priority"
                  value={priority}
                  checked={values.priority === priority}
                  onChange={() => change('priority', priority)}
                />
                {priority}
              </label>
            ))}
          </fieldset>

          <div className="form__actions">
            {submitFailed && <p className="field__error form__error">Could not create the ticket. Please try again.</p>}
            <Link className="button button--secondary" to="">
              Cancel
            </Link>
            <button className="button button--primary" type="submit" disabled={isSubmitting}>
              Create ticket
            </button>
          </div>
        </form>

        <aside className="card articles">
          <h2 className="articles__title">Similar articles</h2>
          {ARTICLES.map((article) => (
            <button className="articles__link" type="button" key={article}>
              {article}
            </button>
          ))}
        </aside>
      </div>
    </div>
  );
}
