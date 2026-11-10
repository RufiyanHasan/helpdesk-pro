import { lazy, Suspense } from 'react';
import { useNavigation } from './lib/navigation';
import TicketDetails from './pages/TicketDetails';
import TicketList from './pages/TicketList';

// The New ticket page includes CKEditor, so it's loaded only when someone opens it.
const NewTicket = lazy(() => import('./pages/NewTicket'));

// Picks the page from the path the shell passes in: '' is the list, 'new' is the form,
// and anything else is a ticket ID.
export default function App() {
  const { path } = useNavigation();

  let page;
  if (path === '') {
    page = <TicketList />;
  } else if (path === 'new') {
    page = (
      <Suspense fallback={<p className="message">Loading...</p>}>
        <NewTicket />
      </Suspense>
    );
  } else {
    const id = decodeURIComponent(path);
    page = <TicketDetails id={id} key={id} />;
  }

  return <div className="tickets-app">{page}</div>;
}
