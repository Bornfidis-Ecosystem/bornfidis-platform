'use client'

import { useState, useEffect } from 'react'
import { getAllUsers, updateUserRole } from './actions'
import { UserRole } from '@prisma/client'

interface User {
  id: string
  name: string | null
  email: string | null
  role: UserRole | null
  createdAt: string
}

/**
 * Phase 4: User Management Client Component
 * Allows ADMIN to view and update user roles
 */
export default function UserManagementClient() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const result = await getAllUsers()
      if (result.success && result.users) {
        setUsers(result.users)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId)
    try {
      const result = await updateUserRole(userId, newRole)
      if (result.success) {
        await loadUsers()
      } else {
        alert(result.error || 'Failed to update role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('An error occurred')
    } finally {
      setUpdatingId(null)
    }
  }

  if (isLoading) {
    return <div className="text-center text-gray-500 py-8">Loading users...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-navy mb-2">All Users</h2>
        <p className="text-sm text-gray-600">
          Manage user roles and permissions. Changes take effect immediately.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-navy text-white text-sm">
              <th className="border p-3 text-left">Name</th>
              <th className="border p-3 text-left">Email</th>
              <th className="border p-3 text-left">Role</th>
              <th className="border p-3 text-left">Created</th>
              <th className="border p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="border p-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border p-3">{user.name || '—'}</td>
                  <td className="border p-3">{user.email || '—'}</td>
                  <td className="border p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'STAFF' || user.role === 'COORDINATOR' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'PARTNER' ? 'bg-indigo-100 text-indigo-800' :
                      user.role === 'USER' ? 'bg-gray-100 text-gray-800' :
                      user.role === 'CHEF' ? 'bg-green-100 text-green-800' :
                      user.role === 'FARMER' ? 'bg-yellow-100 text-yellow-800' :
                      user.role === 'VOLUNTEER' ? 'bg-gray-100 text-gray-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {user.role || 'USER'}
                    </span>
                  </td>
                  <td className="border p-3 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="border p-3">
                    <select
                      value={user.role || 'USER'}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      disabled={updatingId === user.id}
                      className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-navy focus:border-transparent disabled:opacity-50"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="STAFF">STAFF</option>
                      <option value="PARTNER">PARTNER</option>
                      <option value="USER">USER</option>
                      <option value="COORDINATOR">COORDINATOR</option>
                      <option value="CHEF">CHEF</option>
                      <option value="FARMER">FARMER</option>
                      <option value="VOLUNTEER">VOLUNTEER</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Role Permissions</h3>
        <div className="text-xs text-blue-800 space-y-1">
          <div><strong>ADMIN:</strong> Full access to all features and settings</div>
          <div><strong>COORDINATOR:</strong> Manage bookings, timelines, prep, assign farmers, send updates</div>
          <div><strong>CHEF:</strong> View assigned events, manage prep items</div>
          <div><strong>FARMER:</strong> View assigned events, confirm availability</div>
          <div><strong>VOLUNTEER:</strong> View assigned prep tasks, mark complete</div>
        </div>
      </div>
    </div>
  )
}

