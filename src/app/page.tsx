export default function Home() {
  return (
    <main className="screen">
      {/* HEADER */}
      <div className="header flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Bonjour 👋</p>
          <h1 className="text-lg font-bold text-[#59364A]">DJARA</h1>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#59364A]/10 flex items-center justify-center">
          <span className="text-[#59364A] text-sm font-bold">D</span>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6">

        {/* BARRE DE RECHERCHE */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un service..."
            className="input-field pl-10"
          />
          <span className="absolute left-3 top-3.5 text-gray-400 text-base">🔍</span>
        </div>

        {/* WILAYA */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">📍</span>
          <span className="text-sm font-medium text-[#59364A]">Alger</span>
          <span className="text-xs text-gray-400">· changer</span>
        </div>

        {/* CATEGORIES */}
        <div>
          <h2 className="section-title">Catégories</h2>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="card-flat flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-100 hover:border-[#59364A]/30 transition-all cursor-pointer">
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs text-center font-medium text-[#292929] leading-tight">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PRESTATAIRES PROCHES */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Près de vous</h2>
            <span className="text-xs text-[#C77D69] font-medium cursor-pointer">Voir tout</span>
          </div>
          <div className="space-y-3">
            {providers.map((p) => (
              <div key={p.id} className="card flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#59364A]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">{p.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#292929]">{p.name}</span>
                    {p.verified && <span className="badge-verified">✓ Vérifiée</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{p.service}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#C77D69] font-medium">⭐ {p.rating}</span>
                    <span className="text-xs text-gray-400">· {p.distance}</span>
                  </div>
                </div>
                <button className="btn-primary text-xs px-3 py-1.5">Contacter</button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* NAVIGATION BAS */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button key={item.id} className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${item.active ? 'text-[#59364A]' : 'text-gray-400'}`}>
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

const categories = [
  { id: 1, icon: '🍽️', name: 'Cuisine' },
  { id: 2, icon: '💇', name: 'Beauté' },
  { id: 3, icon: '📚', name: 'Éducation' },
  { id: 4, icon: '🧵', name: 'Couture' },
  { id: 5, icon: '💻', name: 'Digital' },
  { id: 6, icon: '🎉', name: 'Événements' },
];

const providers = [
  { id: 1, avatar: '👩', name: 'Amina B.', service: 'Cuisine traditionnelle · Pâtisserie', rating: '4.9', distance: '1.2 km', verified: true },
  { id: 2, avatar: '👩‍🦱', name: 'Sara M.', service: 'Coiffure · Soins capillaires', rating: '4.8', distance: '800 m', verified: true },
  { id: 3, avatar: '👩‍💼', name: 'Lina K.', service: 'Soutien scolaire · Langues', rating: '5.0', distance: '2.1 km', verified: false },
];

const navItems = [
  { id: 1, icon: '🏠', label: 'Accueil', active: true },
  { id: 2, icon: '🔍', label: 'Rechercher', active: false },
  { id: 3, icon: '➕', label: 'Publier', active: false },
  { id: 4, icon: '💬', label: 'Messages', active: false },
  { id: 5, icon: '👤', label: 'Profil', active: false },
];