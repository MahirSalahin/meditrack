import React from 'react'

export default function TitleHeader({ title, description }: { title: string, description?: string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold">{title}</h1>
      {
        description && <p className="text-muted-foreground">{description}</p>
      }
    </div>  
  )
}
