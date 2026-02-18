import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cross,
  BookOpen,
  Heart,
  Search,
  PenLine,
  HandHeart,
  ChevronRight,
  X,
  Check,
  Star,
  Sparkles,
  LogOut,
  Menu,
} from "lucide-react";
import { Id } from "../convex/_generated/dataModel";

// Types for our data
type Prayer = {
  _id: Id<"prayers">;
  _creationTime: number;
  userId: Id<"users">;
  title: string;
  content: string;
  prayerType: string;
  isAnswered: boolean;
  isPublic: boolean;
  createdAt: number;
};

type PrayerWallItem = {
  _id: Id<"prayerWall">;
  _creationTime: number;
  userId: Id<"users">;
  userName?: string;
  intention: string;
  prayerCount: number;
  createdAt: number;
};

type JournalEntry = {
  _id: Id<"journalEntries">;
  _creationTime: number;
  userId: Id<"users">;
  title: string;
  content: string;
  mood: string;
  createdAt: number;
};

type SearchHistoryItem = {
  _id: Id<"searchHistory">;
  _creationTime: number;
  userId: Id<"users">;
  query: string;
  response: string;
  createdAt: number;
};

// Analog Clock Component
function AnalogClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  const hourMarkers = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const x = 50 + 38 * Math.cos(angle);
    const y = 50 + 38 * Math.sin(angle);
    const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    return { x, y, num: romanNumerals[i] };
  });

  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto">
      {/* Outer ring with American flag pattern */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 shadow-2xl">
        {/* Stars ring */}
        <div className="absolute inset-2 rounded-full border-4 border-white/20">
          {[...Array(13)].map((_, i) => {
            const angle = (i * 27.69 - 90) * (Math.PI / 180);
            const x = 50 + 45 * Math.cos(angle);
            const y = 50 + 45 * Math.sin(angle);
            return (
              <Star
                key={i}
                className="absolute w-2 h-2 md:w-3 md:h-3 text-yellow-300 fill-yellow-300"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Clock face */}
      <div className="absolute inset-4 md:inset-6 rounded-full bg-gradient-to-br from-amber-50 via-white to-amber-100 shadow-inner">
        {/* Cross watermark */}
        <Cross className="absolute inset-0 m-auto w-12 h-12 md:w-16 md:h-16 text-red-800/10" />

        {/* Hour markers with Roman numerals */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {hourMarkers.map((marker, i) => (
            <text
              key={i}
              x={marker.x}
              y={marker.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-blue-900 font-serif text-[6px] md:text-[7px] font-bold"
            >
              {marker.num}
            </text>
          ))}
        </svg>

        {/* Clock hands */}
        <div className="absolute inset-0">
          {/* Hour hand */}
          <div
            className="absolute left-1/2 bottom-1/2 w-1 md:w-1.5 h-[25%] bg-gradient-to-t from-blue-900 to-blue-700 rounded-full origin-bottom shadow-lg"
            style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
          />
          {/* Minute hand */}
          <div
            className="absolute left-1/2 bottom-1/2 w-0.5 md:w-1 h-[35%] bg-gradient-to-t from-red-800 to-red-600 rounded-full origin-bottom shadow-lg"
            style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
          />
          {/* Second hand */}
          <div
            className="absolute left-1/2 bottom-1/2 w-0.5 h-[38%] bg-yellow-500 rounded-full origin-bottom"
            style={{ transform: `translateX(-50%) rotate(${secondDeg}deg)` }}
          />
          {/* Center cap */}
          <div className="absolute left-1/2 top-1/2 w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg border-2 border-yellow-300" />
        </div>
      </div>
    </div>
  );
}

// Auth Component
function AuthForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-amber-200">
        <div className="text-center mb-6">
          <Cross className="w-10 h-10 md:w-12 md:h-12 mx-auto text-red-800 mb-3" />
          <h2 className="font-serif text-2xl md:text-3xl text-blue-900 font-bold">
            {flow === "signIn" ? "Welcome Back" : "Join Our Community"}
          </h2>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            {flow === "signIn"
              ? "Continue your spiritual journey"
              : "Begin your path to righteousness"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email address"
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-blue-600 focus:outline-none transition-colors bg-amber-50/50 text-gray-800 placeholder-gray-500"
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-blue-600 focus:outline-none transition-colors bg-amber-50/50 text-gray-800 placeholder-gray-500"
            />
          </div>
          <input name="flow" type="hidden" value={flow} />

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-lg font-semibold hover:from-blue-900 hover:to-blue-950 transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? "..." : flow === "signIn" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            className="text-blue-700 hover:text-blue-900 font-medium text-sm"
          >
            {flow === "signIn"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-amber-200">
          <button
            onClick={() => signIn("anonymous")}
            className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Prayer Form Component
function PrayerForm({ onClose }: { onClose: () => void }) {
  const createPrayer = useMutation(api.prayers.create);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    await createPrayer({
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      prayerType: formData.get("type") as string,
      isPublic: formData.get("public") === "on",
    });
    setLoading(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-xl md:text-2xl text-blue-900 font-bold">New Prayer</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            placeholder="Prayer title"
            required
            className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-blue-600 focus:outline-none"
          />
          <textarea
            name="content"
            placeholder="Pour out your heart..."
            required
            rows={4}
            className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-blue-600 focus:outline-none resize-none"
          />
          <select
            name="type"
            className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-blue-600 focus:outline-none bg-white"
          >
            <option value="petition">Petition</option>
            <option value="gratitude">Gratitude</option>
            <option value="intercession">Intercession</option>
            <option value="confession">Confession</option>
            <option value="praise">Praise</option>
          </select>
          <label className="flex items-center gap-2 text-gray-700">
            <input name="public" type="checkbox" className="w-4 h-4" />
            <span className="text-sm">Share on community prayer wall</span>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-red-700 to-red-800 text-white rounded-lg font-semibold hover:from-red-800 hover:to-red-900 transition-all"
          >
            {loading ? "Saving..." : "Submit Prayer"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Prayer List Component
function PrayerList() {
  const prayers = useQuery(api.prayers.list);
  const markAnswered = useMutation(api.prayers.markAnswered);
  const removePrayer = useMutation(api.prayers.remove);

  if (!prayers) return <div className="text-center text-gray-500">Loading...</div>;
  if (prayers.length === 0)
    return (
      <div className="text-center text-gray-500 py-8">
        <HandHeart className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No prayers yet. Add your first prayer request.</p>
      </div>
    );

  const typeColors: Record<string, string> = {
    petition: "bg-blue-100 text-blue-800",
    gratitude: "bg-green-100 text-green-800",
    intercession: "bg-purple-100 text-purple-800",
    confession: "bg-amber-100 text-amber-800",
    praise: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-3">
      {prayers.map((prayer: Prayer) => (
        <motion.div
          key={prayer._id}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border-2 ${
            prayer.isAnswered
              ? "bg-green-50 border-green-300"
              : "bg-white border-amber-200"
          }`}
        >
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="font-semibold text-blue-900 truncate">{prayer.title}</h4>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    typeColors[prayer.prayerType] || "bg-gray-100"
                  }`}
                >
                  {prayer.prayerType}
                </span>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{prayer.content}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => markAnswered({ id: prayer._id })}
                className={`p-2 rounded-lg transition-colors ${
                  prayer.isAnswered
                    ? "bg-green-200 text-green-700"
                    : "bg-gray-100 text-gray-500 hover:bg-green-100"
                }`}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => removePrayer({ id: prayer._id })}
                className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Community Prayer Wall
function PrayerWall() {
  const prayers = useQuery(api.prayerWall.list);
  const addPrayer = useMutation(api.prayerWall.create);
  const incrementPrayer = useMutation(api.prayerWall.incrementPrayer);
  const [newPrayer, setNewPrayer] = useState("");
  const [userName, setUserName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayer.trim()) return;
    await addPrayer({
      intention: newPrayer,
      userName: userName || undefined,
    });
    setNewPrayer("");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full px-4 py-2 rounded-lg border-2 border-amber-200 focus:border-blue-600 focus:outline-none text-sm"
        />
        <div className="flex gap-2">
          <input
            value={newPrayer}
            onChange={(e) => setNewPrayer(e.target.value)}
            placeholder="Share a prayer intention..."
            className="flex-1 px-4 py-2 rounded-lg border-2 border-amber-200 focus:border-blue-600 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </form>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {prayers?.map((prayer: PrayerWallItem) => (
          <motion.div
            key={prayer._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-3 bg-amber-50 rounded-lg flex justify-between items-start gap-2"
          >
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 text-sm">{prayer.intention}</p>
              {prayer.userName && (
                <p className="text-gray-500 text-xs mt-1">— {prayer.userName}</p>
              )}
            </div>
            <button
              onClick={() => incrementPrayer({ id: prayer._id })}
              className="flex items-center gap-1 px-2 py-1 bg-white rounded-full text-red-700 hover:bg-red-50 transition-colors flex-shrink-0"
            >
              <Heart className="w-3 h-3 fill-current" />
              <span className="text-xs font-medium">{prayer.prayerCount}</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Journal Component
function JournalSection() {
  const entries = useQuery(api.journal.list);
  const createEntry = useMutation(api.journal.create);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    await createEntry({
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      mood: formData.get("mood") as string,
    });
    setLoading(false);
    setShowForm(false);
    form.reset();
  };

  const moodEmoji: Record<string, string> = {
    hopeful: "🌅",
    grateful: "🙏",
    struggling: "🌧️",
    peaceful: "🕊️",
    seeking: "🔍",
  };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-amber-300 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
        >
          <PenLine className="w-5 h-5" />
          Write in Journal
        </button>
      ) : (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleSubmit}
          className="space-y-3 p-4 bg-white rounded-xl border-2 border-amber-200"
        >
          <input
            name="title"
            placeholder="Title"
            required
            className="w-full px-3 py-2 rounded-lg border border-amber-200 focus:border-blue-600 focus:outline-none"
          />
          <textarea
            name="content"
            placeholder="Reflect on your day..."
            required
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-amber-200 focus:border-blue-600 focus:outline-none resize-none"
          />
          <select
            name="mood"
            className="w-full px-3 py-2 rounded-lg border border-amber-200 focus:border-blue-600 focus:outline-none bg-white"
          >
            <option value="hopeful">🌅 Hopeful</option>
            <option value="grateful">🙏 Grateful</option>
            <option value="peaceful">🕊️ Peaceful</option>
            <option value="seeking">🔍 Seeking</option>
            <option value="struggling">🌧️ Struggling</option>
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900"
            >
              {loading ? "..." : "Save"}
            </button>
          </div>
        </motion.form>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {entries?.map((entry: JournalEntry) => (
          <div
            key={entry._id}
            className="p-3 bg-white rounded-lg border border-amber-100"
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{moodEmoji[entry.mood] || "📝"}</span>
              <h4 className="font-medium text-blue-900 text-sm truncate">{entry.title}</h4>
            </div>
            <p className="text-gray-600 text-xs line-clamp-2">{entry.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Search Component with Grok
function SearchSection() {
  const searchWithGrok = useAction(api.search.searchWithGrok);
  const history = useQuery(api.search.getHistory);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiInput, setShowApiInput] = useState(true);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !apiKey) return;
    setLoading(true);
    setResponse("");
    try {
      const result = await searchWithGrok({ query, apiKey });
      setResponse(result);
    } catch (err) {
      setResponse(
        `Error: ${err instanceof Error ? err.message : "Failed to search"}`
      );
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {showApiInput && (
        <div className="p-3 bg-amber-50 rounded-lg">
          <p className="text-xs text-amber-800 mb-2">
            Enter your Grok API key to enable AI-powered spiritual guidance:
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="xai-..."
              className="flex-1 px-3 py-2 rounded-lg border border-amber-200 text-sm focus:border-blue-600 focus:outline-none"
            />
            <button
              onClick={() => apiKey && setShowApiInput(false)}
              className="px-3 py-2 bg-blue-800 text-white rounded-lg text-sm"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about faith, scripture, guidance..."
          className="flex-1 px-4 py-2 rounded-lg border-2 border-amber-200 focus:border-blue-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !apiKey}
          className="px-4 py-2 bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-lg hover:from-blue-900 hover:to-blue-950 disabled:opacity-50 transition-all"
        >
          <Search className="w-5 h-5" />
        </button>
      </form>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
          <span className="ml-2 text-blue-600">Seeking wisdom...</span>
        </div>
      )}

      {response && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white rounded-xl border-2 border-blue-200"
        >
          <div className="flex items-start gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{response}</p>
          </div>
        </motion.div>
      )}

      {history && history.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">Recent Searches</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {history.slice(0, 5).map((item: SearchHistoryItem) => (
              <button
                key={item._id}
                onClick={() => {
                  setQuery(item.query);
                  setResponse(item.response);
                }}
                className="w-full text-left p-2 text-sm text-gray-600 hover:bg-amber-50 rounded-lg truncate"
              >
                <ChevronRight className="w-3 h-3 inline mr-1" />
                {item.query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main Dashboard
function Dashboard() {
  const { signOut } = useAuthActions();
  const [activeTab, setActiveTab] = useState<"prayers" | "search" | "journal" | "community">("prayers");
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: "prayers", label: "My Prayers", icon: HandHeart },
    { id: "search", label: "Seek Wisdom", icon: Search },
    { id: "journal", label: "Journal", icon: PenLine },
    { id: "community", label: "Prayer Wall", icon: Heart },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-red-900">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-900/50 to-transparent" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/80 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1 px-3 py-1.5 text-white/80 hover:text-white text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>

          <AnalogClock />

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white font-bold mt-6 tracking-wide">
            Righteousness
          </h1>
          <p className="text-blue-200 mt-2 font-light text-sm md:text-base">
            "Draw near to God and He will draw near to you" — James 4:8
          </p>
        </motion.header>

        {/* Navigation */}
        <nav className={`mb-6 ${mobileMenuOpen ? "block" : "hidden"} md:block`}>
          <div className="flex flex-col md:flex-row gap-2 md:gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center md:flex-1 gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-blue-900 shadow-lg"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <motion.main
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-6"
        >
          {activeTab === "prayers" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="font-serif text-xl md:text-2xl text-blue-900 font-bold">
                  My Prayer Requests
                </h2>
                <button
                  onClick={() => setShowPrayerForm(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-700 to-red-800 text-white rounded-lg font-medium hover:from-red-800 hover:to-red-900 transition-all flex items-center justify-center gap-2"
                >
                  <Cross className="w-4 h-4" />
                  New Prayer
                </button>
              </div>
              <PrayerList />
            </div>
          )}

          {activeTab === "search" && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl md:text-2xl text-blue-900 font-bold">
                Seek Spiritual Wisdom
              </h2>
              <p className="text-gray-600 text-sm">
                Ask questions about scripture, faith, and Christian living.
                Powered by Grok AI.
              </p>
              <SearchSection />
            </div>
          )}

          {activeTab === "journal" && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl md:text-2xl text-blue-900 font-bold">
                Spiritual Journal
              </h2>
              <p className="text-gray-600 text-sm">
                Record your thoughts, prayers, and spiritual journey.
              </p>
              <JournalSection />
            </div>
          )}

          {activeTab === "community" && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl md:text-2xl text-blue-900 font-bold">
                Community Prayer Wall
              </h2>
              <p className="text-gray-600 text-sm">
                Pray for others and share your intentions with the community.
              </p>
              <PrayerWall />
            </div>
          )}
        </motion.main>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-white/40 text-xs">
            Requested by @stringer_kade · Built by @clonkbot
          </p>
        </footer>
      </div>

      {/* Prayer Form Modal */}
      <AnimatePresence>
        {showPrayerForm && <PrayerForm onClose={() => setShowPrayerForm(false)} />}
      </AnimatePresence>
    </div>
  );
}

// Main App
export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-red-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Cross className="w-12 h-12 text-white" />
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-red-900 flex flex-col items-center justify-center px-4 py-8">
        {/* Decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center mb-8"
        >
          <AnalogClock />
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-bold mt-6 tracking-wide">
            Righteousness
          </h1>
          <p className="text-blue-200 mt-3 font-light max-w-md mx-auto text-sm md:text-base">
            A sanctuary for your soul — track your prayers, seek wisdom, and
            grow in faith
          </p>
        </motion.div>

        <div className="relative z-10 w-full">
          <AuthForm />
        </div>

        <footer className="relative z-10 mt-8 text-center">
          <p className="text-white/40 text-xs">
            Requested by @stringer_kade · Built by @clonkbot
          </p>
        </footer>
      </div>
    );
  }

  return <Dashboard />;
}
