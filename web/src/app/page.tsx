"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import dynamic from "next/dynamic";
import { LayoutDashboard, Users, Truck, Settings, BarChart3, Bell } from "lucide-react";

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/dashboard/map-view"), { 
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center bg-gray-100 rounded-lg">Loading Map...</div>
});

const stats = [
  { label: "Total Tasks", value: "24", icon: LayoutDashboard, color: "text-blue-600" },
  { label: "Active Trips", value: "8", icon: Truck, color: "text-green-600" },
  { label: "Matches Found", value: "12", icon: BarChart3, color: "text-purple-600" },
  { label: "Users Online", value: "45", icon: Users, color: "text-orange-600" },
];

export default function AdminDashboard() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main className="flex h-screen bg-gray-50 overflow-hidden font-sans">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-black text-blue-600 tracking-tight">EcoRoute Sync</h1>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">Admin Portal</p>
            </div>
            
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {[
                { label: "Dashboard", icon: LayoutDashboard, active: true },
                { label: "Live Monitoring", icon: Truck },
                { label: "Organizers", icon: Users },
                { label: "Analytics", icon: BarChart3 },
                { label: "Notifications", icon: Bell },
                { label: "Settings", icon: Settings },
              ].map((item) => (
                <button 
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${item.active ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-200 bg-gray-50/50">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                  {user?.signInDetails?.loginId?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.signInDetails?.loginId}</p>
                  <p className="text-xs text-gray-500 truncate">Administrator</p>
                </div>
              </div>
              <button 
                onClick={signOut}
                className="w-full py-2 px-4 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm uppercase tracking-wider"
              >
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <section className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800">Operational Overview</h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full text-green-700 text-xs font-bold border border-green-100">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live Sync Active
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                </button>
              </div>
            </header>

            {/* Dashboard Scroll Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gray-50 ${stat.color}`}>
                        <stat.icon size={24} />
                      </div>
                      <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">+12%</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Map & List Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Map View */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Logistics Visualization</h3>
                      <p className="text-sm text-gray-500">Real-time status of all active tasks and trips</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select className="text-xs font-bold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>All Regions</option>
                        <option>Tunis Center</option>
                        <option>La Marsa</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-100 shadow-inner">
                    <MapView />
                  </div>
                </div>

                {/* Match Suggestions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">AI Match Radar</h3>
                    <button className="text-blue-600 text-xs font-bold hover:underline">View All</button>
                  </div>
                  <div className="space-y-4 flex-1 overflow-y-auto">
                    {[
                      { from: "Ahmed's Commute", to: "Pickup: Small Pkg", score: "94%", reason: "95% route overlap detected" },
                      { from: "Ines's Trip", to: "Drop-off: Groceries", score: "88%", reason: "Driver has 3 units capacity" },
                      { from: "Khaled's Commute", to: "Pickup: Books", score: "82%", reason: "3 min detour required" },
                    ].map((match, i) => (
                      <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Match Score: {match.score}</span>
                          <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:animate-ping" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">{match.from}</p>
                        <p className="text-xs text-gray-500 mb-3">Matches {match.to}</p>
                        <p className="text-[11px] leading-relaxed text-gray-400 bg-white p-2 rounded-lg border border-gray-100 italic">"{match.reason}"</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-black hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 uppercase tracking-widest">
                    Notify All Matches
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </Authenticator>
  );
}
