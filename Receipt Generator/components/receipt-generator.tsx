"use client"

import { useState, useEffect } from "react"
import { Logo } from "./logo"
import { products } from "../data/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ReceiptItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface Receipt {
  id: string
  customerName: string
  items: ReceiptItem[]
  total: number
  date: string
}

const generateReceiptNo = () => {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `FSE-${year}${month}${day}-${random}`
}

// In a real application, this should be stored securely and not in the client-side code
const ADMIN_PASSWORD = "admin123"

export function ReceiptGenerator() {
  const [items, setItems] = useState<ReceiptItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [receiptNo, setReceiptNo] = useState(generateReceiptNo())
  const [history, setHistory] = useState<Receipt[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")

  useEffect(() => {
    const savedHistory = localStorage.getItem("receiptHistory")
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const addItem = (productId: string) => {
    const product = products.find((p) => p.id === Number.parseInt(productId))
    if (!product) return

    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: number, quantity: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)))
  }

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const saveReceipt = () => {
    const newReceipt: Receipt = {
      id: receiptNo,
      customerName,
      items,
      total,
      date: new Date().toISOString(),
    }
    const updatedHistory = [...history, newReceipt]
    setHistory(updatedHistory)
    localStorage.setItem("receiptHistory", JSON.stringify(updatedHistory))

    // Reset for new receipt
    setItems([])
    setCustomerName("")
    setReceiptNo(generateReceiptNo())
  }

  const printReceipt = () => {
    saveReceipt()
    window.print()
  }

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true)
      setAdminPassword("")
    } else {
      alert("Incorrect password")
    }
  }

  const handleAdminLogout = () => {
    setIsAdmin(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white">
      <div className="mx-auto max-w-[105mm] bg-white shadow-lg rounded-lg print:shadow-none print:rounded-none">
        <div className="p-4 print:p-2">
          {/* Header */}
          <div className="flex flex-col items-center border-b pb-2 print:pb-1">
            <Logo />
            <div className="text-center mt-2 print:mt-1">
              <h1 className="text-2xl font-bold print:text-xl">Friends Solar Energy</h1>
              <p className="text-xs text-gray-600">No. 730 Kofar Nassarawa, Kano State</p>
              <p className="text-xs text-gray-600">Phone: 08034581414, 08133034914</p>
              <p className="text-xs text-gray-600">Email: mail.friendssolarenergy@yahoo.com</p>
            </div>
            <div className="w-full flex justify-end mt-2 print:mt-1">
              <div className="text-right">
                <p className="text-sm font-bold">
                  Receipt No:
                  <input
                    type="text"
                    value={receiptNo}
                    readOnly
                    className="border-none bg-transparent font-normal ml-1 text-sm"
                  />
                </p>
                <p className="text-xs text-gray-600">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mt-2 print:mt-1">
            <Input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="print:border-none text-sm"
            />
          </div>

          {/* Items Form - Hide in print */}
          <div className="mt-2 space-y-2 print:hidden">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-sm">Add Item</Label>
                <Select onValueChange={addItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - ₦{product.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-2 print:mt-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-1 text-left">Item</th>
                  <th className="py-1 text-right">Qty</th>
                  <th className="py-1 text-right">Price</th>
                  <th className="py-1 text-right">Total</th>
                  <th className="py-1 print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-1">{item.name}</td>
                    <td className="py-1 text-right">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value))}
                        className="w-8 border p-0 text-right print:border-none text-xs"
                      />
                    </td>
                    <td className="py-1 text-right">₦{item.price.toLocaleString()}</td>
                    <td className="py-1 text-right">₦{(item.price * item.quantity).toLocaleString()}</td>
                    <td className="py-1 text-right print:hidden">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-xs py-0 px-1"
                      >
                        X
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td className="py-1" colSpan={3}>
                    Total
                  </td>
                  <td className="py-1 text-right">₦{total.toLocaleString()}</td>
                  <td className="print:hidden"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Action Buttons - Hide in print */}
          <div className="mt-4 flex justify-between print:hidden">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  View History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Admin Authentication Required</AlertDialogTitle>
                  <AlertDialogDescription>
                    Please enter the admin password to view the receipt history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAdminLogin}>Login</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={printReceipt} size="sm" className="text-xs">
              Print Receipt
            </Button>
          </div>

          {/* Admin History View */}
          {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs mt-2">
                  View History (Admin)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Receipt History (Admin View)</DialogTitle>
                </DialogHeader>
                <div className="mt-2">
                  {history.map((receipt) => (
                    <div key={receipt.id} className="mb-2 p-2 border rounded text-xs">
                      <h3 className="font-bold">Receipt: {receipt.id}</h3>
                      <p>Customer: {receipt.customerName}</p>
                      <p>Date: {new Date(receipt.date).toLocaleString()}</p>
                      <p>Total: ₦{receipt.total.toLocaleString()}</p>
                      <details>
                        <summary className="cursor-pointer">Items</summary>
                        <ul>
                          {receipt.items.map((item, index) => (
                            <li key={index}>
                              {item.name} - Qty: {item.quantity}, Price: ₦{item.price.toLocaleString()}
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  ))}
                </div>
                <Button onClick={handleAdminLogout} size="sm" className="mt-4">
                  Logout
                </Button>
              </DialogContent>
            </Dialog>
          )}

          {/* Footer - Show in print */}
          <div className="mt-4 text-center text-xs text-gray-600 print:mt-2">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

