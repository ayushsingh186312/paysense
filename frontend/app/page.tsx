"use client"

import { useEffect, useRef } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCards } from "@/components/stats-cards"
import { PaymentTabs } from "@/components/payment-tabs"
import { PaymentCalendar } from "@/components/payment-calendar"
import { RecentTransactions } from "@/components/recent-transactions" 
import { usePaymentStore } from "@/store/payment-store"

import { PieChart } from "lucide-react"


export default function Home() {
  const { backendConnected, initialized, loading } = usePaymentStore()
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      usePaymentStore.getState().initializeStore()
    }
  }, [])

  if (!initialized || loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100 dark:from-pink-900 dark:via-orange-800 dark:to-yellow-800 flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-200 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment data...</p>
        </div>
      </div>
    )
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100 dark:from-pink-900 dark:via-orange-800 dark:to-yellow-800">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <DashboardHeader />
        
        <StatsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            <PaymentTabs />
           
          </div>
          
          <div className="space-y-6">
            <PaymentCalendar />
            <RecentTransactions />
            
          </div>
     
        </div>
      </div>
    </div>
  )
}