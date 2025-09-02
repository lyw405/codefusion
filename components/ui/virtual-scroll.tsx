"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface VirtualScrollProps {
  items: any[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: any, index: number) => React.ReactNode
  className?: string
  overscan?: number
}

export function VirtualScroll({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5
}: VirtualScrollProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  // 边界检查
  if (!items || items.length === 0) {
    return (
      <div 
        className={cn("overflow-auto", className)} 
        style={{ height: containerHeight }}
      >
        <div className="flex items-center justify-center h-full text-muted-foreground">
          暂无数据
        </div>
      </div>
    )
  }

  const totalHeight = items.length * itemHeight
  const viewportHeight = containerHeight
  
  // 计算可见范围
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan
  )

  // 可见项目
  const visibleItems = items.slice(startIndex, endIndex + 1)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)
    
    // 开发环境下的调试信息
    if (process.env.NODE_ENV === 'development') {
      console.debug('VirtualScroll:', {
        scrollTop: newScrollTop,
        startIndex,
        endIndex,
        visibleItems: visibleItems.length,
        totalItems: items.length
      })
    }
  }, [startIndex, endIndex, visibleItems.length, items.length])

  return (
    <div
      ref={scrollElementRef}
      className={cn(
        "overflow-auto",
        // 自定义滚动条样式
        "[&::-webkit-scrollbar]:w-2",
        "[&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:dark:bg-gray-800",
        "[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:dark:bg-gray-600",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        "[&::-webkit-scrollbar-thumb:hover]:bg-gray-400 [&::-webkit-scrollbar-thumb:hover]:dark:bg-gray-500",
        className
      )}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index
            return (
              <div
                key={`virtual-item-${actualIndex}`}
                style={{ height: itemHeight }}
                className="flex items-center"
              >
                {renderItem(item, actualIndex)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// 简化版虚拟滚动组件 - 只保留固定高度版本以确保稳定性
