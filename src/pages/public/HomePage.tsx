import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { VenueList } from '@/components/venue/VenueList';
import { useVenues } from '@/hooks/useVenues';

export function HomePage() {
  const { venues, isLoading } = useVenues();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/10 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-4 py-24 relative">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="text-brand-500">Bar</span>WeThereYet
              <span className="text-brand-400">?</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Real-time crowd levels at your favorite bars.
              Scan, check in, and know before you go.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/explore">
                <Button size="lg">Explore Venues</Button>
              </Link>
              <Link to="/admin/venue/new">
                <Button variant="secondary" size="lg">List Your Bar</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-white mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { emoji: '📱', title: 'Scan QR Code', desc: 'Find a QR code at any participating bar' },
            { emoji: '✅', title: 'Check In', desc: 'One tap to let others know the vibe' },
            { emoji: '📊', title: 'See the Crowd', desc: 'Real-time crowd levels before you head out' },
          ].map(step => (
            <div key={step.title} className="text-center space-y-3">
              <div className="text-5xl">{step.emoji}</div>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured venues */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Featured Venues</h2>
          <Link to="/explore" className="text-sm text-brand-400 hover:text-brand-300">
            View all &rarr;
          </Link>
        </div>
        <VenueList venues={venues.slice(0, 6)} isLoading={isLoading} />
      </section>

      {/* CTA for bar owners */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-brand-600/20 to-brand-900/20 border border-brand-500/20 rounded-3xl p-8 md:p-12 text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">Own a Bar?</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Get real-time analytics, manage QR codes, and set up loyalty rewards for your customers.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link to="/signup">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link to="/login" state={{ from: { pathname: '/admin' } }}>
              <Button variant="secondary" size="lg">Log In</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
