'use client'

import { useState } from 'react'
import { ReplicationRegion } from '@/types/replication'

interface PublicReplicationData {
  totalRegions: number
  activeRegions: number
  launchingRegions: number
  regions: ReplicationRegion[]
}

interface PublicReplicationClientProps {
  data: PublicReplicationData
}

export default function PublicReplicationClient({ data }: PublicReplicationClientProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'leader' | 'investor'>('overview')

  return (
    <div className="space-y-12">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#1a5f3f] to-[#154a32] rounded-lg shadow-lg p-8 text-white text-center">
          <div className="text-5xl font-bold text-[#FFBC00] mb-2">{data.totalRegions}</div>
          <div className="text-lg font-semibold mb-1">Regions</div>
          <div className="text-sm text-green-100">Global reach</div>
        </div>
        <div className="bg-gradient-to-br from-[#FFBC00] to-[#e6a500] rounded-lg shadow-lg p-8 text-[#1a5f3f] text-center">
          <div className="text-5xl font-bold mb-2">{data.activeRegions}</div>
          <div className="text-lg font-semibold mb-1">Active Hubs</div>
          <div className="text-sm">Operational hubs</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-8 text-white text-center">
          <div className="text-5xl font-bold mb-2">{data.launchingRegions}</div>
          <div className="text-lg font-semibold mb-1">Launching</div>
          <div className="text-sm text-green-100">In development</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-2 border-[#1a5f3f] rounded-lg shadow-sm">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveSection('overview')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
              activeSection === 'overview'
                ? 'bg-[#1a5f3f] text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection('leader')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
              activeSection === 'leader'
                ? 'bg-[#1a5f3f] text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Apply as Region Leader
          </button>
          <button
            onClick={() => setActiveSection('investor')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
              activeSection === 'investor'
                ? 'bg-[#1a5f3f] text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Impact Investor Portal
          </button>
        </div>

        <div className="p-8">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#1a5f3f]">The Replication Model</h2>
              <div className="h-1 w-24 bg-[#FFBC00] mb-6"></div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Bornfidis Provisions is more than a business—it's a replicable model for regenerative food systems.
                  We've created a comprehensive system that can be launched anywhere in the world.
                </p>
                <h3 className="text-xl font-semibold text-[#1a5f3f] mt-6">What You Get</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Replication Kits:</strong> Step-by-step guides for chef networks, farmer networks, markets, housing, and education</li>
                  <li><strong>Technology Platform:</strong> Full access to the booking, payment, and cooperative systems</li>
                  <li><strong>Training & Support:</strong> Comprehensive training for your team</li>
                  <li><strong>Network Access:</strong> Connect with other regional hubs globally</li>
                  <li><strong>Impact Tracking:</strong> Tools to measure and report your regenerative impact</li>
                </ul>
                <h3 className="text-xl font-semibold text-[#1a5f3f] mt-6">The Process</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Submit your application as a region leader</li>
                  <li>Get approved and access replication kits</li>
                  <li>Complete required kits and training</li>
                  <li>Launch your regional hub</li>
                  <li>Join the global cooperative network</li>
                </ol>
              </div>
            </div>
          )}

          {/* Region Leader Application */}
          {activeSection === 'leader' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#1a5f3f]">Apply as Region Leader</h2>
              <div className="h-1 w-24 bg-[#FFBC00] mb-6"></div>
              <p className="text-gray-700 leading-relaxed">
                Are you called to launch a regenerative food hub in your region? We're looking for leaders
                who share our values of faith, regeneration, and community.
              </p>
              <a
                href="/replicate/apply-leader"
                className="inline-block px-8 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition"
              >
                Start Your Application
              </a>
            </div>
          )}

          {/* Investor Portal */}
          {activeSection === 'investor' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#1a5f3f]">Impact Investor Portal</h2>
              <div className="h-1 w-24 bg-[#FFBC00] mb-6"></div>
              <p className="text-gray-700 leading-relaxed">
                Support the global replication of regenerative food systems. Your investment helps launch
                new hubs, train leaders, and create lasting impact in communities worldwide.
              </p>
              <a
                href="/replicate/invest"
                className="inline-block px-8 py-3 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-opacity-90 transition"
              >
                Become an Impact Investor
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Active Regions */}
      {data.regions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-[#1a5f3f] mb-4">Active & Launching Regions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.regions.map((region) => (
              <div key={region.id} className="border border-gray-200 rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-1">{region.name}</div>
                <div className="text-sm text-gray-600">{region.city || region.country}</div>
                {region.launch_date && (
                  <div className="text-xs text-gray-500 mt-1">
                    Launch: {new Date(region.launch_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-[#FFBC00] rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-3xl font-bold text-[#1a5f3f] mb-4">Ready to Replicate?</h2>
        <p className="text-[#1a5f3f] mb-6 max-w-2xl mx-auto">
          Join the global movement. Launch a regenerative food hub in your region and be part of
          transforming food systems worldwide.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/replicate/apply-leader"
            className="px-8 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition"
          >
            Apply as Leader
          </a>
          <a
            href="/replicate/invest"
            className="px-8 py-3 bg-white text-[#1a5f3f] rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Invest in Impact
          </a>
        </div>
      </div>

      {/* Scripture */}
      <div className="text-center text-gray-500 text-sm italic">
        <p>"Go into all the world and make disciples of all nations."</p>
        <p className="mt-2 font-semibold">— Matthew 28:19</p>
      </div>
    </div>
  )
}
