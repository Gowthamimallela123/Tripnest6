import React, { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'

const ADMIN = { name: 'TripNest Admin', email: 'admin@tripnest.com', password: 'Admin123', role: 'admin' }
const seedFlights = [
  { id: 'FL101', from: 'Hyderabad', to: 'Delhi', date: '2026-11-18', time: '06:20 AM', duration: '2h 15m', price: 4899, airline: 'IndiGo' },
  { id: 'FL102', from: 'Hyderabad', to: 'Mumbai', date: '2026-11-19', time: '10:45 AM', duration: '1h 35m', price: 3699, airline: 'Air India' },
  { id: 'FL103', from: 'Chennai', to: 'Bengaluru', date: '2026-11-20', time: '02:10 PM', duration: '1h 05m', price: 2299, airline: 'Akasa Air' },
  { id: 'FL104', from: 'Vijayawada', to: 'Hyderabad', date: '2026-11-21', time: '07:30 PM', duration: '1h 10m', price: 2799, airline: 'IndiGo' },
]
const seedHotels = [
  { id: 'HT201', name: 'The Palm Residency', city: 'Goa', rating: '4.8', price: 3200, tag: 'Beachside stay', emoji: '🏝️' },
  { id: 'HT202', name: 'Urban Nest Suites', city: 'Hyderabad', rating: '4.6', price: 2400, tag: 'City comfort', emoji: '🏙️' },
  { id: 'HT203', name: 'Mountain View Retreat', city: 'Ooty', rating: '4.9', price: 4100, tag: 'Nature escape', emoji: '⛰️' },
  { id: 'HT204', name: 'Royal Garden Hotel', city: 'Jaipur', rating: '4.7', price: 3600, tag: 'Heritage charm', emoji: '🏰' },
]
const seedCabs = [
  { id: 'CB301', name: 'Mini Hatchback', type: '4 seats · AC', price: 14, emoji: '🚕' },
  { id: 'CB302', name: 'Sedan', type: '4 seats · AC · Luggage', price: 18, emoji: '🚖' },
  { id: 'CB303', name: 'SUV', type: '6 seats · AC · Extra luggage', price: 24, emoji: '🚙' },
]

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const money = value => `₹${Number(value).toLocaleString('en-IN')}`
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value))

function App() {
  const [user, setUser] = useState(() => read('tn_session', null))
  const [users, setUsers] = useState(() => read('tn_users', []))
  const [bookings, setBookings] = useState(() => read('tn_bookings', []))
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()

  useEffect(() => { save('tn_users', users) }, [users])
  useEffect(() => { save('tn_bookings', bookings) }, [bookings])
  useEffect(() => { save('tn_session', user) }, [user])

  const notify = message => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2800)
  }
  const logout = () => {
    setUser(null)
    save('tn_session', null)
    navigate('/')
    notify('You have been logged out.')
  }
  const login = (email, password) => {
    if (email.toLowerCase() === ADMIN.email && password === ADMIN.password) {
      setUser(ADMIN); navigate('/admin'); return true
    }
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (!found) return false
    setUser(found); navigate('/dashboard'); return true
  }
  const signup = (name, email, password) => {
    if (email.toLowerCase() === ADMIN.email || users.some(u => u.email.toLowerCase() === email.toLowerCase())) return false
    const newUser = { id: `U${Date.now()}`, name, email, password, role: 'user' }
    setUsers(prev => [...prev, newUser])
    setUser(newUser)
    navigate('/dashboard')
    return true
  }
  const addBooking = booking => {
    const item = { ...booking, id: `TN${Date.now()}`, userId: user.id, userName: user.name, email: user.email, status: 'Confirmed', bookedAt: new Date().toLocaleDateString('en-IN') }
    setBookings(prev => [item, ...prev])
    navigate('/my-bookings')
    notify('Booking confirmed! Your trip is in My Bookings.')
  }
  const updateBooking = (id, status) => setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))

  return <>
    <Header user={user} logout={logout} />
    {notice && <div className="toast">{notice}</div>}
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Auth mode="login" onLogin={login} />} />
      <Route path="/signup" element={<Auth mode="signup" onSignup={signup} />} />
      <Route path="/dashboard" element={<Protected user={user}><Dashboard user={user} bookings={bookings} /></Protected>} />
      <Route path="/flights" element={<Protected user={user}><SearchPage kind="flight" items={seedFlights} onBook={addBooking} /></Protected>} />
      <Route path="/hotels" element={<Protected user={user}><SearchPage kind="hotel" items={seedHotels} onBook={addBooking} /></Protected>} />
      <Route path="/cabs" element={<Protected user={user}><SearchPage kind="cab" items={seedCabs} onBook={addBooking} /></Protected>} />
      <Route path="/my-bookings" element={<Protected user={user}><MyBookings user={user} bookings={bookings} onCancel={updateBooking} /></Protected>} />
      <Route path="/admin" element={<Protected user={user} admin><Admin bookings={bookings} users={users} onUpdate={updateBooking} /></Protected>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Footer />
  </>
}

function Header({ user, logout }) {
  return <header className="topbar">
    <div className="nav-wrap">
      <Link to="/" className="brand"><span className="brand-mark">✈</span> Trip<span>Nest</span></Link>
      <nav>
        {user?.role === 'admin' ? <><NavLink to="/admin">Admin panel</NavLink></> :
          user ? <><NavLink to="/dashboard">Dashboard</NavLink><NavLink to="/flights">Flights</NavLink><NavLink to="/hotels">Hotels</NavLink><NavLink to="/cabs">Cabs</NavLink><NavLink to="/my-bookings">My bookings</NavLink></> :
          <><NavLink to="/">Home</NavLink><a href="#explore">Explore</a></>}
      </nav>
      <div className="nav-actions">{user ? <><span className="welcome">Hi, {user.name.split(' ')[0]}</span><button className="btn btn-outline btn-small" onClick={logout}>Logout</button></> :
        <><Link className="login-link" to="/login">Log in</Link><Link className="btn btn-primary btn-small" to="/signup">Sign up</Link></>}</div>
    </div>
  </header>
}

function Home() {
  return <main>
    <section className="hero">
      <div className="hero-content">
        <div className="eyebrow light">YOUR NEXT ADVENTURE STARTS HERE</div>
        <h1>Make memories.<br /><span>We'll handle the journey.</span></h1>
        <p>Find flights, stays and rides in one simple place. Plan less, explore more.</p>
        <div className="hero-actions"><Link to="/signup" className="btn btn-accent">Start planning <span>→</span></Link><a href="#explore" className="text-link">Explore destinations ↓</a></div>
        <div className="hero-stats"><div><b>3-in-1</b><small>Travel services</small></div><div><b>Easy</b><small>Trip planning</small></div><div><b>24/7</b><small>Travel access</small></div></div>
      </div>
      <div className="hero-art"><div className="sun"></div><div className="mountain mountain-back"></div><div className="mountain mountain-front"></div><div className="floating-card"><span>✦</span><div><b>Your trip, your way</b><small>One place. Every journey.</small></div></div><div className="plane">✈</div></div>
    </section>
    <section className="service-strip" id="explore">
      <div className="section-heading"><div><div className="eyebrow">TRAVEL, SIMPLIFIED</div><h2>Everything you need to get there</h2></div><p>Choose a service and start building your next getaway.</p></div>
      <div className="service-grid">
        <ServiceCard icon="✈️" title="Flights" text="Compare routes and find a flight that fits your plans." to="/flights" />
        <ServiceCard icon="🏨" title="Hotels" text="Discover comfortable stays for every kind of trip." to="/hotels" />
        <ServiceCard icon="🚕" title="Cabs" text="Choose a ride for convenient point-to-point travel." to="/cabs" />
      </div>
    </section>
    <section className="bottom-cta"><div><div className="eyebrow light">READY WHEN YOU ARE</div><h2>The world is waiting.</h2><p>Create an account and keep all your travel plans together.</p></div><Link to="/signup" className="btn btn-accent">Create free account →</Link></section>
  </main>
}

function ServiceCard({ icon, title, text, to }) {
  return <Link to={to} className="service-card"><div className="service-icon">{icon}</div><h3>{title}</h3><p>{text}</p><span className="card-link">Explore {title.toLowerCase()} <b>→</b></span></Link>
}

function Footer() {
  return <footer><div className="footer-inner"><Link to="/" className="brand brand-footer">✈ Trip<span>Nest</span></Link><p>Travel made simple. Memories made everywhere.</p><small>© 2026 TripNest · Student project demo</small></div></footer>
}

function Protected({ user, admin = false, children }) {
  if (!user) return <div className="page-shell"><div className="empty-state"><h2>Please log in first</h2><p>You need an account to access this page.</p><Link className="btn btn-primary" to="/login">Go to login</Link></div></div>
  if (admin && user.role !== 'admin') return <div className="page-shell"><div className="empty-state"><h2>Admin access only</h2><Link className="btn btn-primary" to="/dashboard">Go to dashboard</Link></div></div>
  if (!admin && user.role === 'admin') return <div className="page-shell"><div className="empty-state"><h2>Welcome, Admin</h2><Link className="btn btn-primary" to="/admin">Open admin panel</Link></div></div>
  return children
}

function Auth({ mode, onLogin, onSignup }) {
  const isLogin = mode === 'login'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = e => {
    e.preventDefault(); setError('')
    const ok = isLogin ? onLogin(email.trim(), password) : onSignup(name.trim(), email.trim(), password)
    if (!ok) setError(isLogin ? 'Email or password is incorrect.' : 'This email is already registered.')
  }
  return <main className="auth-page">
    <div className="auth-aside"><div className="eyebrow light">WELCOME TO TRIPNEST</div><h2>{isLogin ? 'Your next trip is just a sign in away.' : 'A little planning. A lot of adventure.'}</h2><p>Keep your bookings and travel plans together, wherever you go.</p><div className="auth-illustration">🌍 ✈️ 🧳</div></div>
    <div className="auth-card"><div className="eyebrow">{isLogin ? 'WELCOME BACK' : 'GET STARTED'}</div><h1>{isLogin ? 'Log in to TripNest' : 'Create your account'}</h1><p className="muted">{isLogin ? 'Enter your details to continue your journey.' : 'Join TripNest and plan your next adventure.'}</p>
      <form onSubmit={submit}>
        {!isLogin && <label>Full name<input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" required /></label>}
        <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
        <label>Password<input type="password" minLength="6" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required /></label>
        {error && <div className="form-error">{error}</div>}
        <button className="btn btn-primary btn-full">{isLogin ? 'Log in →' : 'Create account →'}</button>
      </form>
      <div className="auth-switch">{isLogin ? "Don't have an account?" : 'Already have an account?'} <Link to={isLogin ? '/signup' : '/login'}>{isLogin ? 'Sign up' : 'Log in'}</Link></div>
      {isLogin && <div className="demo-credentials"><b>Admin demo login</b><span>admin@tripnest.com</span><span>Admin123</span></div>}
    </div>
  </main>
}

function Dashboard({ user, bookings }) {
  const mine = bookings.filter(b => b.userId === user.id)
  return <main className="page-shell">
    <div className="welcome-banner"><div><div className="eyebrow light">YOUR TRAVEL SPACE</div><h1>Welcome back, {user.name.split(' ')[0]}!</h1><p>Where would you like to go next?</p></div><div className="welcome-emoji">🧳</div></div>
    <div className="section-heading compact"><div><div className="eyebrow">START EXPLORING</div><h2>Book your next journey</h2></div></div>
    <div className="service-grid dashboard-services"><ServiceCard icon="✈️" title="Flights" text="Search available flight options." to="/flights" /><ServiceCard icon="🏨" title="Hotels" text="Find a place to stay." to="/hotels" /><ServiceCard icon="🚕" title="Cabs" text="Choose a ride for your journey." to="/cabs" /></div>
    <div className="stats-grid"><Stat label="Total bookings" value={mine.length} icon="🎫" /><Stat label="Confirmed trips" value={mine.filter(b => b.status === 'Confirmed').length} icon="✓" /><Stat label="Travel services" value="3" icon="✦" /></div>
    <div className="section-heading compact"><div><div className="eyebrow">YOUR ITINERARY</div><h2>Recent bookings</h2></div><Link className="card-link" to="/my-bookings">View all →</Link></div>
    <BookingTable bookings={mine.slice(0, 4)} />
  </main>
}
function Stat({ label, value, icon }) { return <div className="stat-card"><span>{icon}</span><div><b>{value}</b><small>{label}</small></div></div> }

function SearchPage({ kind, items, onBook }) {
  const title = kind === 'flight' ? 'Find your flight' : kind === 'hotel' ? 'Find your stay' : 'Find your ride'
  const [query, setQuery] = useState('')
  const [date, setDate] = useState('2026-11-18')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [selected, setSelected] = useState(null)
  const [passengers, setPassengers] = useState('1')
  const filtered = useMemo(() => items.filter(item => {
    const hay = Object.values(item).join(' ').toLowerCase()
    return hay.includes(query.toLowerCase()) && (kind !== 'flight' || (!from || item.from.toLowerCase().includes(from.toLowerCase())) && (!to || item.to.toLowerCase().includes(to.toLowerCase())))
  }), [items, query, from, to, kind])
  const book = item => {
    const amount = kind === 'cab' ? item.price * 12 : item.price
    setSelected({ item, amount })
  }
  const confirm = () => {
    if (!selected) return
    onBook({ type: kind, title: kind === 'flight' ? `${selected.item.airline} ${selected.item.from} → ${selected.item.to}` : kind === 'hotel' ? selected.item.name : selected.item.name, date, amount: selected.amount, details: kind === 'flight' ? `${selected.item.from} to ${selected.item.to} · ${selected.item.time}` : kind === 'hotel' ? `${selected.item.city} · ${selected.item.tag}` : `${selected.item.type} · estimated 12 km`, payment: 'Demo payment' })
  }
  return <main className="page-shell">
    <div className="page-title"><div><div className="eyebrow">EXPLORE TRIPNEST</div><h1>{title}</h1><p>Browse options and confirm your booking in a few steps.</p></div><span className="title-emoji">{kind === 'flight' ? '✈️' : kind === 'hotel' ? '🏨' : '🚕'}</span></div>
    <div className="search-panel">
      {kind === 'flight' ? <><label>From<input value={from} onChange={e => setFrom(e.target.value)} placeholder="e.g. Hyderabad" /></label><label>To<input value={to} onChange={e => setTo(e.target.value)} placeholder="e.g. Delhi" /></label><label>Departure date<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label><label>Passengers<select value={passengers} onChange={e => setPassengers(e.target.value)}><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></label></> :
      kind === 'hotel' ? <><label>Destination<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search city or hotel" /></label><label>Check-in<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label><label>Guests<select value={passengers} onChange={e => setPassengers(e.target.value)}><option>1</option><option>2</option><option>3</option><option>4</option></select></label></> :
      <><label>Pickup location<input value={from} onChange={e => setFrom(e.target.value)} placeholder="Enter pickup location" /></label><label>Drop location<input value={to} onChange={e => setTo(e.target.value)} placeholder="Enter drop location" /></label><label>Travel date<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label></>}
      <button className="btn btn-primary" onClick={() => setQuery(query.trim())}>Search options</button>
    </div>
    <div className="results-heading"><div><h2>Available {kind === 'flight' ? 'flights' : kind === 'hotel' ? 'stays' : 'rides'}</h2><p>{filtered.length} options found · Sample listings for project demonstration</p></div></div>
    <div className="result-list">{filtered.map(item => <div className="result-card" key={item.id}>
      <div className="result-symbol">{kind === 'flight' ? '✈️' : kind === 'hotel' ? item.emoji : item.emoji}</div>
      <div className="result-main"><h3>{item.name || item.airline}</h3><p>{kind === 'flight' ? `${item.from} → ${item.to} · ${item.time} · ${item.duration}` : kind === 'hotel' ? `${item.city} · ${item.tag} · ★ ${item.rating}` : item.type}</p><small>{item.id} · {kind === 'flight' ? item.date : kind === 'hotel' ? 'Per night' : 'Estimated per km'}</small></div>
      <div className="result-price"><b>{kind === 'cab' ? `₹${item.price}/km` : money(item.price)}</b><small>{kind === 'hotel' ? 'per night' : kind === 'cab' ? '12 km estimate at checkout' : 'per passenger'}</small><button className="btn btn-primary btn-small" onClick={() => book(item)}>Book now</button></div>
    </div>)}</div>
    {filtered.length === 0 && <div className="empty-state"><h3>No matching options</h3><p>Try another search term or destination.</p></div>}
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}>×</button><div className="eyebrow">BOOKING SUMMARY</div><h2>Confirm your {kind}</h2><p>{selected.item.name || selected.item.airline} {kind === 'flight' ? `· ${selected.item.from} to ${selected.item.to}` : ''}</p><div className="summary-line"><span>Travel date</span><b>{date}</b></div><div className="summary-line"><span>{kind === 'cab' ? 'Estimated fare (12 km)' : 'Total amount'}</span><b>{money(selected.amount)}</b></div><div className="demo-note">Demo checkout: no real payment will be collected.</div><button className="btn btn-primary btn-full" onClick={confirm}>Confirm booking →</button></div></div>}
  </main>
}

function MyBookings({ user, bookings, onCancel }) {
  const mine = bookings.filter(b => b.userId === user.id)
  return <main className="page-shell"><div className="page-title"><div><div className="eyebrow">YOUR TRAVEL PLANS</div><h1>My bookings</h1><p>All your confirmed and cancelled trips in one place.</p></div><span className="title-emoji">🎫</span></div><BookingTable bookings={mine} onCancel={onCancel} /></main>
}
function BookingTable({ bookings, onCancel }) {
  if (!bookings.length) return <div className="empty-state"><div className="empty-icon">🧭</div><h3>No bookings yet</h3><p>Your travel bookings will appear here after you confirm a trip.</p><Link to="/flights" className="btn btn-primary">Explore flights</Link></div>
  return <div className="table-wrap"><table><thead><tr><th>Booking</th><th>Service</th><th>Date</th><th>Amount</th><th>Status</th>{onCancel && <th>Action</th>}</tr></thead><tbody>{bookings.map(b => <tr key={b.id}><td><b>{b.id}</b><small>{b.bookedAt}</small></td><td><b>{b.type.toUpperCase()}</b><small>{b.title}</small></td><td>{b.date}</td><td>{money(b.amount)}</td><td><span className={`status ${b.status.toLowerCase()}`}>{b.status}</span></td>{onCancel && <td>{b.status === 'Confirmed' && <button className="link-button" onClick={() => onCancel(b.id, 'Cancelled')}>Cancel</button>}</td>}</tr>)}</tbody></table></div>
}

function Admin({ bookings, users, onUpdate }) {
  const [tab, setTab] = useState('bookings')
  return <main className="page-shell"><div className="welcome-banner admin-banner"><div><div className="eyebrow light">TRIPNEST CONTROL CENTER</div><h1>Admin dashboard</h1><p>Manage registered users and travel bookings.</p></div><div className="welcome-emoji">⚙️</div></div>
    <div className="stats-grid"><Stat label="Registered users" value={users.length} icon="👥" /><Stat label="Total bookings" value={bookings.length} icon="🎫" /><Stat label="Confirmed bookings" value={bookings.filter(b => b.status === 'Confirmed').length} icon="✓" /></div>
    <div className="tabs"><button className={tab === 'bookings' ? 'active' : ''} onClick={() => setTab('bookings')}>Manage bookings</button><button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Manage users</button></div>
    {tab === 'bookings' ? <><div className="section-heading compact"><div><h2>All bookings</h2><p>Review and update booking status.</p></div></div><AdminBookings bookings={bookings} onUpdate={onUpdate} /></> :
    <><div className="section-heading compact"><div><h2>Registered users</h2><p>Accounts created through the signup form.</p></div></div><div className="table-wrap"><table><thead><tr><th>User ID</th><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>{users.map(u => <tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td><span className="status confirmed">{u.role}</span></td></tr>)}</tbody></table>{!users.length && <p className="table-empty">No users have signed up yet.</p>}</div></>}
  </main>
}
function AdminBookings({ bookings, onUpdate }) {
  if (!bookings.length) return <div className="empty-state"><h3>No bookings to manage</h3><p>Customer bookings will be listed here.</p></div>
  return <div className="table-wrap"><table><thead><tr><th>Booking ID</th><th>Customer</th><th>Service</th><th>Amount</th><th>Status</th><th>Update</th></tr></thead><tbody>{bookings.map(b => <tr key={b.id}><td><b>{b.id}</b><small>{b.date}</small></td><td>{b.userName}<small>{b.email}</small></td><td>{b.type.toUpperCase()}<small>{b.title}</small></td><td>{money(b.amount)}</td><td><span className={`status ${b.status.toLowerCase()}`}>{b.status}</span></td><td><select className="status-select" value={b.status} onChange={e => onUpdate(b.id, e.target.value)}><option>Confirmed</option><option>Cancelled</option></select></td></tr>)}</tbody></table></div>
}
function NotFound() { return <main className="page-shell"><div className="empty-state"><h2>Page not found</h2><Link to="/" className="btn btn-primary">Back home</Link></div></main> }

export default App
