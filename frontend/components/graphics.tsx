"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Charts from "@/components/charts"



export function Graphics() {
  return (
    <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border-white/20 dark:border-slate-800/50 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Payment Summary (Last 6 Months)
        </CardTitle>
        
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"