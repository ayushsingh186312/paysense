"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Charts from "@/components/charts"



export function Graphics() {
  return (
    <Tabs defaultValue="success" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="success">Success</TabsTrigger>
        <TabsTrigger value="failed">Failed</TabsTrigger>
      </TabsList>
      <TabsContent value="pending" className="mt-4">
        <Charts status="pending" />
      </TabsContent>
      <TabsContent value="success" className="mt-4">
        <Charts status="success" />
      </TabsContent>
      <TabsContent value="failed" className="mt-4">
        <Charts status="failed" />
      </TabsContent>
    </Tabs>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"