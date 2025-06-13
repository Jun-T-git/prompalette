import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@prompalette/ui';

export default function HomePage() {
  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <section className="py-12 text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          PromPalette
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your AI Prompts, Beautifully Organized
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle>🚀 Instant Access</CardTitle>
            <CardDescription>
              Launch with ⌘+⌘ (Mac) or Ctrl+Ctrl (Windows/Linux) from anywhere
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Quick access to your prompts without leaving your workflow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔌 Cross-Platform</CardTitle>
            <CardDescription>
              Works with ChatGPT, Claude, Gemini, and any AI tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Seamlessly integrate with all your favorite AI platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💾 Local-First</CardTitle>
            <CardDescription>
              Lightning fast with offline support, your data stays with you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Privacy-focused design with optional cloud sync
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}