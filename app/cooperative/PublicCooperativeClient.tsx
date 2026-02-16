'use client'

import { CooperativeMember } from '@/types/cooperative'

interface PublicCooperativeData {
  members: CooperativeMember[]
  totalMembers: number
  membersByRole: Record<string, number>
  regions: string[]
  regionCounts: Record<string, number>
}

interface PublicCooperativeClientProps {
  data: PublicCooperativeData
}

export default function PublicCooperativeClient({ data }: PublicCooperativeClientProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'farmer': return 'bg-green-100 text-green-800'
      case 'chef': return 'bg-blue-100 text-blue-800'
      case 'educator': return 'bg-purple-100 text-purple-800'
      case 'builder': return 'bg-yellow-100 text-yellow-800'
      case 'partner': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-12">
      {/* Vision Story */}
      <div className="bg-gradient-to-r from-[#1a5f3f] to-[#154a32] rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
        <div className="h-1 w-24 bg-gold mb-6"></div>
        <div className="space-y-4 text-green-100 leading-relaxed">
          <p>
            The Bornfidis Global Regenerative Cooperative is more than a network—it's a movement.
            We believe that food can be a force for regeneration, community, and faith.
          </p>
          <p>
            Our cooperative brings together:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Farmers</strong> practicing regenerative agriculture to heal the land</li>
            <li><strong>Chefs</strong> creating faith-anchored meals that nourish communities</li>
            <li><strong>Educators</strong> sharing knowledge and building capacity</li>
            <li><strong>Builders</strong> developing infrastructure for a regenerative future</li>
            <li><strong>Partners</strong> supporting the movement with resources and expertise</li>
          </ul>
          <p className="mt-4">
            Together, we're building a cooperative model where wealth is shared, impact is measured,
            and every member contributes to a regenerative future.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border-2 border-[#1a5f3f] rounded-lg shadow-sm p-6 text-center">
          <div className="text-4xl font-bold text-forestDark mb-2">{data.totalMembers}</div>
          <div className="text-gray-700 font-semibold">Total Members</div>
        </div>
        {Object.entries(data.membersByRole).map(([role, count]) => (
          <div key={role} className="bg-white border-2 border-[#FFBC00] rounded-lg shadow-sm p-6 text-center">
            <div className="text-4xl font-bold text-forestDark mb-2">{count}</div>
            <div className="text-gray-700 font-semibold capitalize">{role}s</div>
          </div>
        ))}
      </div>

      {/* Regions Map */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-forestDark mb-4">Global Reach</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.regions.map((region) => (
            <div key={region} className="border border-gray-200 rounded-lg p-4">
              <div className="font-semibold text-forestDark text-lg mb-1">{region}</div>
              <div className="text-gray-600">{data.regionCounts[region] || 0} member{data.regionCounts[region] !== 1 ? 's' : ''}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Join Section */}
      <div className="bg-gold rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-3xl font-bold text-forestDark mb-4">Join the Cooperative</h2>
        <p className="text-forestDark mb-6 max-w-2xl mx-auto">
          Are you a regenerative farmer, skilled chef, educator, builder, or partner?
          Join our global cooperative and be part of the regenerative movement.
        </p>
        <a
          href="/cooperative/join"
          className="inline-block px-8 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition"
        >
          Apply to Join
        </a>
      </div>

      {/* Featured Members */}
      {data.members.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-forestDark mb-4">Featured Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.members.slice(0, 6).map((member) => (
              <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getRoleBadgeColor(member.role)}`}>
                    {member.role}
                  </span>
                  <span className="text-xs text-gray-500">{member.region}</span>
                </div>
                <div className="font-semibold text-gray-900 mb-1">{member.name}</div>
                <div className="text-xs text-gray-600">Impact Score: {member.impact_score}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scripture */}
      <div className="text-center text-gray-500 text-sm italic">
        <p>"Two are better than one, because they have a good return for their labor."</p>
        <p className="mt-2 font-semibold">— Ecclesiastes 4:9</p>
      </div>
    </div>
  )
}

