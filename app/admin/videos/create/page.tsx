'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function generateShortId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function CreateVideoPage() {
  const router = useRouter()
  const [mediaType, setMediaType] = useState('video')
  const [error, setError] = useState('')
  const [shortId, setShortId] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        const form = formRef.current
        if (!form || !data.nickname) return
        ;(form.querySelector('[name="author"]') as HTMLInputElement).value =
          data.nickname
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(formData: FormData) {
    setError('')
    const title = formData.get('title') as string
    const mediaUrl = formData.get('mediaUrl') as string

    if (!title || !mediaUrl) {
      setError('标题和媒体文件链接为必填项')
      return
    }

    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: formData.get('description') || undefined,
        coverUrl: formData.get('coverUrl') || undefined,
        mediaType: formData.get('mediaType') || 'video',
        mediaUrl,
        isM3U8: formData.get('isM3U8') === 'on',
        lowLatencyMode: formData.get('lowLatencyMode') === 'on',
        shortId: formData.get('shortId') || undefined,
        author: formData.get('author') || '',
      }),
    })

    if (res.ok) {
      router.push('/admin/videos')
    } else {
      const data = await res.json()
      setError(data.error || '创建失败')
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">添加视频</h1>
      <Card>
        <CardHeader>
          <CardTitle>视频信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题 *</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">简介</Label>
              <Textarea id="description" name="description" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverUrl">封面图片外链</Label>
              <Input id="coverUrl" name="coverUrl" placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mediaType">媒体类型</Label>
                <Select
                  name="mediaType"
                  value={mediaType}
                  onValueChange={(v) => v && setMediaType(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">视频</SelectItem>
                    <SelectItem value="audio">音频</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">作者</Label>
                <Input id="author" name="author" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mediaUrl">媒体文件外链 *</Label>
              <Input id="mediaUrl" name="mediaUrl" required placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortId">短链接 ID</Label>
              <div className="flex gap-2">
                <Input
                  id="shortId"
                  name="shortId"
                  value={shortId}
                  onChange={(e) => setShortId(e.target.value)}
                  placeholder="留空不生成短链接"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShortId(generateShortId())}
                >
                  生成
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isM3U8" />
                <span className="text-sm">m3u8 切片</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="lowLatencyMode" />
                <span className="text-sm">低延迟模式</span>
              </label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-4">
              <Button type="submit">创建视频</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
