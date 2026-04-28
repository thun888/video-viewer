'use client'

import { useEffect, useRef, useState, use } from 'react'
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

export default function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [mediaType, setMediaType] = useState('video')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [shortId, setShortId] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    fetch(`/api/videos/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then((video) => {
        const form = formRef.current
        if (!form) return
        ;(form.querySelector('[name="title"]') as HTMLInputElement).value = video.title
        ;(form.querySelector('[name="description"]') as HTMLTextAreaElement).value =
          video.description || ''
        ;(form.querySelector('[name="coverUrl"]') as HTMLInputElement).value =
          video.coverUrl || ''
        ;(form.querySelector('[name="mediaUrl"]') as HTMLInputElement).value =
          video.mediaUrl
        ;(form.querySelector('[name="author"]') as HTMLInputElement).value =
          video.author || ''
        ;(form.querySelector('[name="isM3U8"]') as HTMLInputElement).checked =
          video.isM3U8
        ;(form.querySelector('[name="lowLatencyMode"]') as HTMLInputElement).checked =
          video.lowLatencyMode
        setShortId(video.shortId || '')
        setMediaType(video.mediaType)
        setLoading(false)
      })
      .catch(() => setError('视频不存在'))
  }, [id])

  async function handleSubmit(formData: FormData) {
    setError('')
    const title = formData.get('title') as string
    const mediaUrl = formData.get('mediaUrl') as string

    if (!title || !mediaUrl) {
      setError('标题和媒体文件链接为必填项')
      return
    }

    const res = await fetch(`/api/videos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: formData.get('description') || null,
        coverUrl: formData.get('coverUrl') || null,
        mediaType: formData.get('mediaType') || 'video',
        mediaUrl,
        isM3U8: formData.get('isM3U8') === 'on',
        lowLatencyMode: formData.get('lowLatencyMode') === 'on',
        shortId: formData.get('shortId') || null,
        author: formData.get('author') || '',
      }),
    })

    if (res.ok) {
      router.push('/admin/videos')
    } else {
      const data = await res.json()
      setError(data.error || '更新失败')
    }
  }

  async function handleDelete() {
    if (!confirm('确定删除此视频？')) return
    const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/videos')
    } else {
      const data = await res.json()
      setError(data.error || '删除失败')
    }
  }

  if (error === '视频不存在') {
    return <p className="text-destructive">视频不存在</p>
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">编辑视频</h1>
      <Card>
        <CardHeader>
          <CardTitle>视频信息 {loading && '(加载中...)'}</CardTitle>
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
                  placeholder="留空清除短链接"
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
              <Button type="submit">保存修改</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                取消
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="ml-auto"
              >
                删除
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
