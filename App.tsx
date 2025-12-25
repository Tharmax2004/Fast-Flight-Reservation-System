
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plane, 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  CheckCircle2, 
  X,
  Loader2,
  ArrowRightLeft,
  Ticket,
  Clock,
  MessageCircle,
  Send,
  Sparkles,
  Bot,
  ThumbsUp,
  ThumbsDown,
  Bell,
  SlidersHorizontal,
  Briefcase,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Coffee,
  Wifi,
  Tv,
  Layers,
  ArrowRight,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  Settings,
  LogOut,
  TrendingUp,
  Map as MapIcon,
  Globe,
  Compass
} from 'lucide-react';
import { TripType, Flight, Booking, PriceAlert, PaymentMethod } from './types';
import { ReservationDatabase, FlightEngine, UserProfile } from './models';
import { getAIFlightSearch, getAIChatResponse } from './services/geminiService';

// --- Types ---
interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  suggestedFlights?: Flight[];
}

const TRENDING_DESTINATIONS = [
  { city: 'Tokyo', country: 'Japan', img: 'https://images.unsplash.com/photo-1540959733332-e94e270b4d82?q=80&w=800' },
  { city: 'Paris', country: 'France', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800' },
  { city: 'Dubai', country: 'UAE', img: 'https://images.unsplash.com/photo-1512453979798-5ea4a73a88d0?q=80&w=800' },
  { city: 'Maldives', country: 'South Asia', img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800' }
];

const App: React.FC = () => {
  const db = ReservationDatabase.getInstance();
  
  const [tripType, setTripType] = useState<TripType>('One Way');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [travelers, setTravelers] = useState('1');
  const [results, setResults] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Default to a moody airport image matching the user's photo
  const [heroImg, setHeroImg] = useState('https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?q=80&w=2000');
  
  const [showDashboard, setShowDashboard] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [compareList, setCompareList] = useState<Flight[]>([]);
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);
  
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [passengerName, setPassengerName] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('Credit Card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookedItem, setBookedItem] = useState<Booking | null>(null);
  
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    setIsLoading(true);
    
    // Update background to match destination feel using images.unsplash.com
    setHeroImg(`https://images.unsplash.com/photo-1436491865332-7a61a109c055?q=80&w=2000`);
    
    const flights = await getAIFlightSearch({ 
      origin, destination, tripType, departureDate, travelers: parseInt(travelers) 
    });
    setResults(flights);
    setIsLoading(false);
    db.updateAlerts(flights);
    
    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById('results-view')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBooking = () => {
    if (!selectedFlight || !passengerName) return;
    setIsProcessing(true);
    setTimeout(() => {
      const newBooking: Booking = {
        id: `FF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        flight: selectedFlight,
        passengerName,
        seatNumber: FlightEngine.generateSeat(),
        status: 'Confirmed',
        paymentMethod: selectedPayment,
        bookingDate: Date.now()
      };
      db.addBooking(newBooking);
      setBookedItem(newBooking);
      setIsProcessing(false);
      setShowBookingModal(false);
    }, 2000);
  };

  const toggleCompare = (e: React.MouseEvent, flight: Flight) => {
    e.stopPropagation();
    setCompareList(prev => 
      prev.find(f => f.id === flight.id) 
        ? prev.filter(f => f.id !== flight.id) 
        : (prev.length < 3 ? [...prev, flight] : prev)
    );
  };

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden">
      {/* Background Layer with Darker Overlay for better text visibility */}
      <div 
        className="fixed inset-0 -z-10 transition-all duration-1000 ease-in-out"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(15, 12, 41, 0.7), rgba(15, 12, 41, 0.95)), url('${heroImg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] px-8 py-6 flex justify-between items-center bg-black/20 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:rotate-12 transition-transform duration-500">
            <Plane className="text-white w-6 h-6 rotate-45" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">FAST FLIGHT</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setShowDashboard(true)} className="flex items-center gap-3 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full font-bold text-sm transition-all backdrop-blur-md">
            <Ticket className="w-4 h-4 text-orange-400" /> My Trips
          </button>
          <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-20 px-8 flex flex-col items-center text-center">
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            <Sparkles className="w-3 h-3 text-orange-400" /> Curated for the Elite Traveler
          </div>
          <h1 className="text-7xl md:text-[8rem] font-black text-white leading-[0.9] mb-8 drop-shadow-2xl tracking-tighter">
            YOUR WORLD, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500 animate-pulse">UNFOLDING</span>
          </h1>
          <p className="text-xl text-white/50 font-medium mb-16 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
            Navigating the globe with precision and style. Experience the pinnacle of aviation technology.
          </p>
          
          {/* Search Box */}
          <div className="glass-card p-4 rounded-[3.5rem] w-full max-w-5xl shadow-2xl border-white/10 bg-black/40 ring-1 ring-white/5">
            <div className="flex gap-2 mb-4 p-1.5 bg-white/5 rounded-2xl w-fit">
              {['One Way', 'Round Trip', 'Multi-City'].map(t => (
                <button 
                  key={t}
                  onClick={() => setTripType(t as TripType)}
                  className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${tripType === t ? 'bg-indigo-600 text-white shadow-xl' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2 text-left group">
                <label className="text-[10px] font-black uppercase text-white/40 ml-4 tracking-widest group-hover:text-indigo-400 transition-colors">Origin</label>
                <div className="bg-white/5 p-5 rounded-3xl border border-white/10 flex items-center gap-4 focus-within:ring-4 ring-indigo-500/20 focus-within:bg-white/10 transition-all shadow-sm">
                  <div className="p-2 bg-indigo-500/10 rounded-xl"><MapPin className="text-indigo-400 w-5 h-5" /></div>
                  <input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Leaving from..." className="bg-transparent outline-none font-bold w-full text-lg text-white placeholder:text-white/20" />
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl hidden md:flex border border-white/10 shadow-md -mb-1 cursor-pointer hover:rotate-180 transition-transform duration-700"><ArrowRightLeft className="w-5 h-5 text-white/40" /></div>
              <div className="flex-1 space-y-2 text-left group">
                <label className="text-[10px] font-black uppercase text-white/40 ml-4 tracking-widest group-hover:text-rose-400 transition-colors">Destination</label>
                <div className="bg-white/5 p-5 rounded-3xl border border-white/10 flex items-center gap-4 focus-within:ring-4 ring-rose-500/20 focus-within:bg-white/10 transition-all shadow-sm">
                  <div className="p-2 bg-rose-500/10 rounded-xl"><Compass className="text-rose-400 w-5 h-5" /></div>
                  <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Going to..." className="bg-transparent outline-none font-bold w-full text-lg text-white placeholder:text-white/20" />
                </div>
              </div>
              <div className="w-full md:w-56 space-y-2 text-left group">
                <label className="text-[10px] font-black uppercase text-white/40 ml-4 tracking-widest group-hover:text-indigo-400 transition-colors">Departure</label>
                <div className="bg-white/5 p-5 rounded-3xl border border-white/10 flex items-center gap-4 focus-within:ring-4 ring-indigo-500/20 focus-within:bg-white/10 transition-all shadow-sm">
                  <Calendar className="text-indigo-400 w-5 h-5" />
                  <input type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} className="bg-transparent outline-none font-bold w-full text-sm text-white [color-scheme:dark]" />
                </div>
              </div>
              <button disabled={isLoading} className="bg-indigo-600 text-white p-6 rounded-3xl hover:bg-indigo-500 active:scale-95 transition-all shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] disabled:opacity-50 flex items-center justify-center">
                {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Search className="w-7 h-7" />}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Results View */}
      <div id="results-view" />
      {results.length > 0 && (
        <section className="px-8 pb-32 max-w-6xl mx-auto animate-in slide-in-from-bottom-20 duration-700">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-5xl font-black text-white mb-3">Foundations of Travel</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <span className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl text-white/60 text-[10px] font-black uppercase border border-white/10">
                  {origin} → {destination}
                </span>
                <span className="px-4 py-2 bg-indigo-500/20 backdrop-blur-md rounded-xl text-indigo-400 text-[10px] font-black uppercase border border-indigo-500/30">
                  <Users className="w-3 h-3 inline mr-1" /> {travelers} Traveler
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <button className="flex items-center gap-3 px-8 py-4 bg-white/5 rounded-[1.5rem] text-white/60 border border-white/10 font-black text-xs uppercase tracking-widest shadow-xl hover:bg-white/10 transition-all">
                  <SlidersHorizontal className="w-4 h-4" /> Filter Boards
               </button>
            </div>
          </div>

          <div className="space-y-6">
            {results.map(f => {
              const engine = new FlightEngine(f);
              const isExpanded = expandedFlightId === f.id;
              const brandColor = f.airline.includes('Air India') ? 'rose-500' : 
                               f.airline.includes('Emirates') ? 'red-500' : 
                               f.airline.includes('Singapore') ? 'yellow-500' : 'indigo-500';

              return (
                <div key={f.id} className="group">
                  <div 
                    onClick={() => setExpandedFlightId(isExpanded ? null : f.id)}
                    className={`glass-card p-10 rounded-[3rem] flex flex-col lg:flex-row items-center gap-10 cursor-pointer transition-all hover:bg-white/10 border-white/10 bg-black/40 shadow-2xl ${isExpanded ? 'rounded-b-none border-b-transparent ring-2 ring-indigo-500/20' : ''}`}
                  >
                    <div className="w-full lg:w-1/4 flex items-center gap-6">
                       <button onClick={e => toggleCompare(e, f)} className={`p-4 rounded-2xl transition-all ${compareList.find(x => x.id === f.id) ? 'bg-white text-indigo-950' : 'bg-white/5 border border-white/10 text-white/20 hover:border-white/40'}`}>
                        <Layers className="w-5 h-5" />
                       </button>
                       <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl bg-${brandColor}/20 border border-${brandColor}/30 flex items-center justify-center text-${brandColor} shadow-[0_0_20px_rgba(255,255,255,0.05)]`}>
                            <Plane className="w-8 h-8" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{f.airline}</p>
                            <h3 className="text-2xl font-black text-white">{f.flightNumber}</h3>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex-1 flex justify-between items-center w-full px-4 text-white">
                       <div className="text-center md:text-left">
                          <p className="text-4xl font-black">{f.iataDepartureCode}</p>
                          <p className="text-[11px] font-extrabold text-white/40 mt-2 uppercase">{f.departureTime}</p>
                       </div>
                       
                       <div className="flex-1 px-12 flex flex-col items-center opacity-40 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-black uppercase mb-2 tracking-widest text-white/60">{f.duration}</span>
                          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent relative rounded-full overflow-hidden">
                            <div className="absolute inset-0 bg-indigo-500 animate-progress origin-left"></div>
                            <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-indigo-400" />
                          </div>
                          <span className="text-[9px] font-black uppercase mt-2 tracking-widest text-indigo-400/60">{f.stops === 0 ? 'Direct Boarding' : `${f.stops} Connection`}</span>
                       </div>

                       <div className="text-center md:text-right">
                          <p className="text-4xl font-black">{f.iataArrivalCode}</p>
                          <p className="text-[11px] font-extrabold text-white/40 mt-2 uppercase">{f.arrivalTime}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-10">
                       <div className="text-right">
                         <p className="text-xs font-black text-white/20 uppercase tracking-widest mb-1">Passage Fee</p>
                         <p className="text-4xl font-black text-white">{engine.getPriceFormatted()}</p>
                       </div>
                       <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedFlight(f); setShowBookingModal(true); }}
                        className="bg-white text-indigo-950 px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-400 hover:text-white transition-all shadow-2xl active:scale-95"
                       >
                        Book Now
                       </button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="glass-card rounded-b-[4rem] p-12 -mt-2 animate-in slide-in-from-top-4 border-t-0 shadow-3xl grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 border-white/10 bg-black/60 text-white/80">
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2"><Sparkles className="w-3 h-3 text-orange-400" /> Cabin Perks</h4>
                           <div className="flex gap-4">
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-sm"><Wifi className="w-6 h-6 text-indigo-400" /></div>
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-sm"><Coffee className="w-6 h-6 text-indigo-400" /></div>
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-sm"><Tv className="w-6 h-6 text-indigo-400" /></div>
                           </div>
                           <p className="text-xs font-medium leading-relaxed opacity-60">High-altitude luxury including star-rated catering and fully flat private suites.</p>
                        </div>
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2"><Briefcase className="w-3 h-3" /> Baggage Allowance</h4>
                           <div className="space-y-3">
                              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <span className="text-xs font-black uppercase tracking-widest">Cabin</span>
                                 <span className="text-xs font-black text-white">{f.baggageCabin}</span>
                              </div>
                              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <span className="text-xs font-black uppercase tracking-widest">Checked</span>
                                 <span className="text-xs font-black text-white">{f.baggageChecked}</span>
                              </div>
                           </div>
                        </div>
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Secure Flight</h4>
                           <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20">
                              <p className="text-sm font-black text-emerald-400 mb-2">Flexible Passage</p>
                              <p className="text-[10px] font-bold text-emerald-400/50 leading-relaxed uppercase tracking-wider">Verified journey with complimentary lounge entry.</p>
                           </div>
                        </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Booking Dashboard (Side Panel) */}
      {showDashboard && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowDashboard(false)}></div>
          <div className="relative bg-[#0f0c29] w-full max-w-2xl h-full shadow-2xl animate-in slide-in-from-right duration-700 flex flex-col border-l border-white/10">
            <div className="p-14 border-b border-white/10 flex justify-between items-center">
              <div>
                <h2 className="text-5xl font-black tracking-tighter text-white">Your Hangar</h2>
                <p className="text-[11px] font-black uppercase text-white/30 tracking-[0.4em] mt-2 flex items-center gap-2"><Globe className="w-3 h-3" /> Global Itinerary</p>
              </div>
              <button onClick={() => setShowDashboard(false)} className="p-5 hover:bg-white/5 rounded-[2rem] transition-all text-white/20 hover:text-white"><X className="w-10 h-10" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-14 space-y-8 bg-black/20">
              {db.getBookings().length === 0 ? (
                <div className="text-center py-32 opacity-10">
                  <Ticket className="w-32 h-32 mx-auto mb-10 text-white" />
                  <p className="text-2xl font-black tracking-tight text-white">No active flight plans</p>
                </div>
              ) : (
                db.getBookings().map(b => (
                  <div key={b.id} className="p-10 rounded-[3.5rem] bg-white/5 border border-white/10 relative group overflow-hidden shadow-xl hover:bg-white/10 transition-all">
                    <div className="relative z-10 text-white">
                      <div className="flex justify-between items-start mb-10">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Locator ID</span>
                          <span className="text-xl font-black tracking-[0.3em]">{b.id}</span>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm">Boarding Ready</span>
                      </div>
                      <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-8">
                           <div className="text-center">
                             <p className="text-3xl font-black">{b.flight.iataDepartureCode}</p>
                             <p className="text-[10px] font-bold text-white/40 uppercase">{b.flight.departureTime}</p>
                           </div>
                           <Plane className="w-6 h-6 text-white/10 rotate-90" />
                           <div className="text-center">
                             <p className="text-3xl font-black">{b.flight.iataArrivalCode}</p>
                             <p className="text-[10px] font-bold text-white/40 uppercase">{b.flight.arrivalTime}</p>
                           </div>
                        </div>
                        <p className="text-2xl font-black text-indigo-400">₹{b.flight.price.toLocaleString()}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-8 border-t border-white/10 pt-10 opacity-60">
                        <div><p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1">Explorer</p><p className="font-black text-sm truncate">{b.passengerName}</p></div>
                        <div><p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1">Seat</p><p className="font-black text-sm">{b.seatNumber}</p></div>
                        <div><p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1">Pass</p><p className="font-black text-sm text-indigo-400">PREMIUM</p></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal (Glass Overlay) */}
      {showBookingModal && selectedFlight && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => !isProcessing && setShowBookingModal(false)}></div>
          <div className="relative bg-[#1e1b4b] w-full max-w-xl rounded-[4rem] shadow-3xl p-14 animate-in zoom-in duration-500 border border-white/10 overflow-hidden">
            {isProcessing ? (
              <div className="text-center py-20 relative z-10 text-white">
                <div className="w-24 h-24 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-10"></div>
                <h3 className="text-4xl font-black mb-4 tracking-tighter">Issuing Ticket</h3>
                <p className="text-white/40 font-bold uppercase text-[11px] tracking-[0.3em]">Linking with Global Reservation Systems...</p>
              </div>
            ) : (
              <div className="relative z-10 text-white">
                <div className="flex justify-between items-center mb-10">
                   <h2 className="text-4xl font-black tracking-tighter">Reservation</h2>
                   <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-white/40">Passage Fee</p>
                      <p className="text-2xl font-black">₹{selectedFlight.price.toLocaleString()}</p>
                   </div>
                </div>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-4 tracking-[0.2em]">Passport Full Name</label>
                    <input value={passengerName} onChange={e => setPassengerName(e.target.value)} placeholder="Full legal name" className="w-full p-6 bg-white/5 rounded-[2rem] outline-none font-black text-lg text-white border-2 border-transparent focus:border-white/10 transition-all placeholder:text-white/10" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-4 tracking-[0.2em]">Settlement</label>
                    <div className="grid grid-cols-2 gap-4">
                      {['Credit Card', 'UPI', 'Net Banking', 'Corporate'].map(id => (
                        <button 
                          key={id}
                          onClick={() => setSelectedPayment(id as PaymentMethod)}
                          className={`flex items-center justify-center p-5 rounded-[2rem] border-2 transition-all ${selectedPayment === id ? 'bg-white text-indigo-950 border-white' : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20'}`}
                        >
                          <span className="text-[11px] font-black uppercase tracking-widest">{id}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    disabled={!passengerName}
                    onClick={handleBooking}
                    className="w-full bg-indigo-600 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-20 mt-6"
                  >
                    Confirm Passage
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success View */}
      {bookedItem && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl"></div>
          <div className="relative bg-white text-indigo-950 w-full max-w-xl rounded-[6rem] p-20 text-center animate-in zoom-in duration-700 shadow-3xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-orange-400 to-indigo-600"></div>
            <div className="w-32 h-32 bg-indigo-50 text-indigo-600 rounded-[4rem] flex items-center justify-center mx-auto mb-12 shadow-2xl border-8 border-white"><CheckCircle2 className="w-16 h-16" /></div>
            <h2 className="text-7xl font-black mb-4 tracking-tighter">SECURED</h2>
            <p className="text-indigo-950/40 font-bold uppercase text-[12px] tracking-[0.4em] mb-16">Locator ID: {bookedItem.id}</p>
            
            <div className="p-12 bg-indigo-50/50 rounded-[4rem] border-4 border-dashed border-indigo-100 text-left mb-16">
               <div className="flex justify-between items-center mb-10">
                  <div className="text-5xl font-black">{bookedItem.flight.iataDepartureCode}</div>
                  <Plane className="w-8 h-8 text-indigo-200 rotate-90" />
                  <div className="text-5xl font-black text-right">{bookedItem.flight.iataArrivalCode}</div>
               </div>
               <div className="flex justify-between font-black text-xs uppercase tracking-[0.2em]">
                  <div className="flex flex-col"><span className="text-[9px] text-indigo-300">Explorer</span>{bookedItem.passengerName}</div>
                  <div className="text-right flex flex-col"><span className="text-[9px] text-indigo-300">Seat</span>{bookedItem.seatNumber}</div>
               </div>
            </div>

            <button onClick={() => { setBookedItem(null); setResults([]); }} className="w-full bg-indigo-950 text-white py-8 rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.4em] shadow-2xl hover:scale-105 transition-all">Ready to Board</button>
          </div>
        </div>
      )}

      {/* AI Assistant FAB */}
      <button onClick={() => setShowChat(true)} className="fixed bottom-12 right-12 w-24 h-24 bg-indigo-600 text-white rounded-[2.5rem] shadow-[0_25px_60px_-12px_rgba(79,70,229,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[150] group">
        <Bot className="w-10 h-10 group-hover:rotate-12 transition-transform" />
      </button>

      {/* AI Concierge Drawer */}
      {showChat && (
        <div className="fixed inset-0 z-[250] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowChat(false)}></div>
          <div className="relative bg-[#0f0c29] w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-white/10 rounded-l-[4rem] overflow-hidden">
             <div className="p-12 bg-indigo-600 text-white flex justify-between items-center relative">
                <div className="flex items-center gap-6 relative z-10">
                   <Bot className="w-10 h-10" />
                   <div>
                      <h3 className="text-3xl font-black tracking-tight">Concierge</h3>
                      <p className="text-[9px] font-black uppercase text-white/40 tracking-[0.4em]">Personal Specialist</p>
                   </div>
                </div>
                <button onClick={() => setShowChat(false)} className="p-4 hover:bg-white/10 rounded-full transition-all relative z-10"><X className="w-8 h-8" /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-12 space-y-10 bg-black/20">
                {chatHistory.length === 0 && (
                  <div className="text-center py-24 opacity-20">
                    <Sparkles className="w-16 h-16 text-white mx-auto mb-6" />
                    <p className="text-white text-sm font-bold tracking-widest uppercase">Chart your next passage...</p>
                  </div>
                )}
                {chatHistory.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] p-8 rounded-[2.5rem] text-sm font-bold shadow-md ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white/5 border border-white/10 text-white/80 rounded-bl-none'}`}>
                      {m.parts[0].text}
                    </div>
                  </div>
                ))}
                {chatLoading && <div className="text-[9px] font-black text-indigo-400 uppercase animate-pulse ml-4 tracking-widest">Processing request...</div>}
                <div ref={chatEndRef} />
             </div>
             <form onSubmit={async (e) => {
               e.preventDefault();
               if (!chatMessage) return;
               const newHist: ChatMessage[] = [...chatHistory, { role: 'user', parts: [{ text: chatMessage }] }];
               setChatHistory(newHist);
               setChatMessage('');
               setChatLoading(true);
               const res = await getAIChatResponse(newHist);
               setChatHistory([...newHist, { role: 'model', parts: [{ text: res.text }], suggestedFlights: res.suggestedFlights }]);
               setChatLoading(false);
             }} className="p-12 border-t border-white/5 bg-black/20">
                <div className="relative">
                   <input value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Curate my travel plan..." className="w-full p-7 pr-24 bg-white/5 rounded-[2.5rem] outline-none font-black text-white focus:bg-white/10 border-2 border-transparent focus:border-white/10 transition-all placeholder:text-white/10" />
                   <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-5 rounded-[1.8rem] shadow-xl hover:bg-indigo-500 transition-all active:scale-95"><Send className="w-6 h-6" /></button>
                </div>
             </form>
          </div>
        </div>
      )}

      <footer className="py-24 text-center opacity-10 text-[10px] font-black uppercase tracking-[0.6em] text-white">
        © 2024 Fast Flight Reservation System | Global Hub
      </footer>
    </div>
  );
};

export default App;
