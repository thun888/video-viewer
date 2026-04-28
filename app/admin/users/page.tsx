'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'

interface User {
  id: number
  username: string
  nickname: string
  isAdmin: boolean
  createdAt: string
}

export default function UserManagementPage() {
  const [userList, setUserList] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    username: '',
    nickname: '',
    password: '',
    isAdmin: false,
  })

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    nickname: '',
    password: '',
    isAdmin: false,
  })

  const fetchUsers = useCallback(() => {
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

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!createForm.username || !createForm.password) {
      setError('用户名和密码为必填项')
      return
    }
    if (createForm.password.length < 6) {
      setError('密码至少6位')
      return
    }

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm),
    })

    if (res.ok) {
      setCreateOpen(false)
      setCreateForm({ username: '', nickname: '', password: '', isAdmin: false })
      setError('')
      fetchUsers()
    } else {
      const data = await res.json()
      setError(data.error || '创建失败')
    }
  }

  function openEditDialog(user: User) {
    setEditingUser(user)
    setEditForm({
      nickname: user.nickname || '',
      password: '',
      isAdmin: user.isAdmin,
    })
    setEditOpen(true)
    setError('')
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return

    const body: Record<string, unknown> = {}
    if (editForm.nickname !== editingUser.nickname) {
      body.nickname = editForm.nickname
    }
    if (editForm.password) {
      body.password = editForm.password
    }
    if (editForm.isAdmin !== editingUser.isAdmin) {
      body.isAdmin = editForm.isAdmin
    }

    if (Object.keys(body).length === 0) {
      setEditOpen(false)
      return
    }

    const res = await fetch(`/api/users/${editingUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      setEditOpen(false)
      setEditingUser(null)
      setError('')
      fetchUsers()
    } else {
      const data = await res.json()
      setError(data.error || '更新失败')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <Button onClick={() => setCreateOpen(true)}>创建用户</Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建用户</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="c-username">用户名 *</Label>
                <Input
                  id="c-username"
                  value={createForm.username}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-nickname">昵称</Label>
                <Input
                  id="c-nickname"
                  value={createForm.nickname}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, nickname: e.target.value })
                  }
                  placeholder="留空则使用用户名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-password">密码 *</Label>
                <Input
                  id="c-password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                  required
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createForm.isAdmin}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, isAdmin: e.target.checked })
                  }
                />
                <span className="text-sm">管理员权限</span>
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <DialogClose
                  render={<Button type="button" variant="outline" />}
                >
                  取消
                </DialogClose>
                <Button type="submit">创建</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>昵称</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>注册日期</TableHead>
              <TableHead className="w-32">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  加载中...
                </TableCell>
              </TableRow>
            ) : userList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  暂无用户
                </TableCell>
              </TableRow>
            ) : (
              userList.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.nickname || '-'}</TableCell>
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
                      onClick={() => openEditDialog(user)}
                    >
                      编辑
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              编辑用户 - {editingUser?.username}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="e-nickname">昵称</Label>
              <Input
                id="e-nickname"
                value={editForm.nickname}
                onChange={(e) =>
                  setEditForm({ ...editForm, nickname: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-password">新密码</Label>
              <Input
                id="e-password"
                type="password"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm({ ...editForm, password: e.target.value })
                }
                placeholder="留空不修改密码"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editForm.isAdmin}
                onChange={(e) =>
                  setEditForm({ ...editForm, isAdmin: e.target.checked })
                }
              />
              <span className="text-sm">管理员权限</span>
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <DialogClose
                render={<Button type="button" variant="outline" />}
              >
                取消
              </DialogClose>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
