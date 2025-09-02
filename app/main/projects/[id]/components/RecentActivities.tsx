"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VirtualScroll } from "@/components/ui/virtual-scroll"
import { ACTIVITY_TYPE_CONFIG } from "../config/constants"

interface Activity {
  id: string
  type: keyof typeof ACTIVITY_TYPE_CONFIG
  title: string
  metadata?: string
  userId: string
  user: {
    id: string
    name?: string
    email: string
    image?: string
  }
  createdAt: string
}

interface RecentActivitiesProps {
  activities: Activity[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  // 设置最大高度为 400px，单个项目高度为 80px
  const MAX_CONTAINER_HEIGHT = 400
  const ITEM_HEIGHT = 80
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "刚刚"
    if (diffInHours < 24) return `${diffInHours}小时前`
    if (diffInHours < 48) return "昨天"
    return date.toLocaleDateString()
  }

  // 为活动类型生成描述
  const getActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case 'PROJECT_CREATED':
        return '创建了项目'
      case 'MEMBER_ADDED':
        return '加入了项目'
      case 'MEMBER_REMOVED':
        return '离开了项目'
      case 'MEMBER_ROLE_CHANGED':
        return '角色发生了变更'
      case 'REPOSITORY_ADDED':
        return '添加了代码仓库'
      case 'REPOSITORY_REMOVED':
        return '删除了代码仓库'
      case 'DEPLOYMENT_STARTED':
        return '开始了部署'
      case 'DEPLOYMENT_SUCCESS':
        return '部署成功'
      case 'DEPLOYMENT_FAILED':
        return '部署失败'
      case 'CODE_REVIEW':
        return '进行了代码审查'
      case 'BRANCH_CREATED':
        return '创建了分支'
      case 'MERGE_REQUEST':
        return '创建了合并请求'
      case 'PROJECT_SETTINGS_CHANGED':
        return '更新了项目设置'
      default:
        return '进行了操作'
    }
  }

  // 渲染单个活动项 - 改进视觉清晰度
  const renderActivityItem = (activity: Activity, index: number) => {
    const activityConfig = ACTIVITY_TYPE_CONFIG[activity.type]
    
    // 如果找不到配置，使用默认配置
    if (!activityConfig) {
      console.warn(`Unknown activity type: ${activity.type}`)
      return null
    }

    const ActivityIcon = activityConfig.icon
    const bgColor = activityConfig.color.replace('text-', 'bg-').replace('-600', '-50')
    const isEven = index % 2 === 0
    
    return (
      <div 
        className={`
          flex items-center gap-4 px-4 py-3 
          ${isEven ? 'bg-gray-50/50 dark:bg-gray-800/30' : 'bg-white dark:bg-gray-900/50'}
          hover:bg-gray-100/80 dark:hover:bg-gray-700/50 
          transition-colors duration-200 
          border-b border-gray-100 dark:border-gray-800 last:border-b-0
        `} 
        style={{ height: ITEM_HEIGHT }}
      >
        {/* 图标区域 - 增强视觉效果 */}
        <div className={`
          p-2.5 rounded-xl ${bgColor} flex-shrink-0 
          shadow-md border border-white/30 dark:border-gray-600/30
          ring-1 ring-gray-200/20 dark:ring-gray-700/20
        `}>
          <ActivityIcon className={`h-4 w-4 ${activityConfig.color} drop-shadow-sm`} />
        </div>
        
        {/* 内容区域 - 改进层次结构 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate pr-2">
              {activity.title}
            </h4>
            <time className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 font-medium">
              {formatTime(activity.createdAt)}
            </time>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 line-clamp-1 font-medium">
            {getActivityDescription(activity)}
          </p>
          
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="truncate">
              by {activity.user.name || activity.user.email}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-800/50">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            </div>
            <div>
              <span className="text-gray-900 dark:text-gray-100 font-semibold">最近活动</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full font-medium">
                  {activities.length > 0 ? `${activities.length} 条记录` : '暂无记录'}
                </span>
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 text-gray-400 dark:text-gray-600">📋</div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">暂无活动记录</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">项目活动将在这里显示</p>
          </div>
        ) : (
          <div className="relative">
            <VirtualScroll
              items={activities}
              itemHeight={ITEM_HEIGHT}
              containerHeight={Math.min(MAX_CONTAINER_HEIGHT, activities.length * ITEM_HEIGHT)}
              renderItem={renderActivityItem}
              className="rounded-b-lg"
            />
            {/* 渐变遮罩，增加深度感 */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-gray-200/50 to-transparent dark:from-gray-700/50 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-t from-gray-200/50 to-transparent dark:from-gray-700/50 pointer-events-none"></div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
