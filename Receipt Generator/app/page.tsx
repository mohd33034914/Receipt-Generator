import { ReceiptGenerator } from "@/components/receipt-generator"

export default function Page() {
  return (
    <main className="container mx-auto p-4 print:p-0">
      <h1 className="text-3xl font-bold mb-6 text-center print:hidden">Friends Solar Energy Receipt Generator</h1>
      <ReceiptGenerator />
    </main>
  )
}

