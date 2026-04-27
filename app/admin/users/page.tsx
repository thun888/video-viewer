'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface User {
  id: number
  username: string
  isAdmin: boolean
  createdAt: string
}

export default function UserManagementPage() {
  const [userList, setUserList] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/users')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch')
        return r.json()
      })
      .then((data) => {
        setUserList(data)
        setLoading(false)
      })
      .catch(() => {
        setError('加载用户列表失败')
        setLoading(false)
      })
  }, [])

  async function toggleAdmin(userId: number, current: boolean) {
    if (current) {
      if (!confirm('确定移除该用户的管理员权限？')) return
    } else {
      if (!confirm('确定将该用户设为管理员？')) return
    }

    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin: !current }),
    })

    if (res.ok) {
      setUserList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isAdmin: !current } : u))
      )
    } else {
      const data = await res.json()
      alert(data.error || '操作失败')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">用户管理</h1>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>注册日期</TableHead>
              <TableHead className="w-32">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  加载中...
                </TableCell>
              </TableRow>
            ) : userList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  暂无用户
                </TableCell>
              </TableRow>
            ) : (
              userList.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <span
                      className={
                        user.isAdmin
                          ? 'text-primary font-medium'
                          : 'text-muted-foreground'
                      }
                    >
                      {user.isAdmin ? '管理员' : '普通用户'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAdmin(user.id, user.isAdmin)}
                    >
                      {user.isAdmin ? '取消管理' : '设为管理'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
