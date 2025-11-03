"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChequeList } from "./cheque-list"
import { CashList } from "./cash-list"
import { OnlineList } from "./online-list"


export function PaymentTabs() {
  return (
    <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border-white/20 dark:border-slate-800/50 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Payment Management
        </CardTitle>
        
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cheques" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="cheques">Cheques</TabsTrigger>
            <TabsTrigger value="cash">Cash</TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
          </TabsList>
          <TabsContent value="cheques" className="mt-4">
            <ChequeList />
          </TabsContent>
          <TabsContent value="cash" className="mt-4">
            <CashList />
          </TabsContent>
          <TabsContent value="online" className="mt-4">
            <OnlineList />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"