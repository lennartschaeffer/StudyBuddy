import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'


const FeatureCard = ({icon, title, description}: {icon: any, title: string, description: string}) => {
  return (
    <Card className="relative overflow-hidden group">
    <CardHeader className="space-y-1 pb-2">
      <div className="transition-transform duration-300 ease-in-out transform group-hover:scale-110">{icon}</div>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription>{description}</CardDescription>
    </CardContent>
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
  </Card>
  )
}

export default FeatureCard