import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function MainPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to CodeFusion</CardTitle>
          <CardDescription className="text-lg">
            The full-stack developer&apos;s workflow engine.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground text-lg">
            AI-powered full-stack developer&apos;s workflow engine.
          </p>
          
          <div className="text-center space-y-4">
            <Button size="lg">
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
