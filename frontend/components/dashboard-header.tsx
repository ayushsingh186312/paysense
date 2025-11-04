"use client"

import { Moon, Sun, RefreshCw } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { usePaymentStore } from "@/store/payment-store"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { AddPaymentDialog } from "./add-payment-dialog"
import { Graphics } from "./graphics"

export function DashboardHeader() {
  const { theme, setTheme } = useTheme()
  const { refreshData, lastUpdated } = usePaymentStore()
  const { toast } = useToast()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshData()
      toast({
        title: "✅ Data Refreshed",
        description: "All payment data has been updated.",
      })
    } catch (error) {
      toast({
        title: "⚠️ Refresh Warning",
        description: "Using cached data. Backend connection failed.",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg p-6 rounded-2xl border border-white/20 dark:border-slate-800/50 shadow-xl">
        <div className="flex flex-row flex-nowrap justify-between items-center gap-4 w-full overflow-x-auto">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Payment Sense
            </h1>
            <p className="text-sm text-muted-foreground mt-1 truncate">
              Last updated: {lastUpdated}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white/50 dark:bg-slate-800/50 backdrop-blur"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="bg-white/50 dark:bg-slate-800/50 backdrop-blur relative"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <AddPaymentDialog />
          </div>
        </div>

        <div className="mt-4 w-full">
          <Graphics />
        </div>
      </div>
    </div>
  )
}