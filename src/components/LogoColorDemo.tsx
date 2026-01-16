import Logo from "@/components/Logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LogoColorDemo = () => {
  const colorModes = [
    { name: "Default Gradient", mode: "gradient" as const },
    { name: "Rainbow Cycle", mode: "rainbow" as const },
    { name: "Blue Theme", mode: "blue" as const },
    { name: "Red Theme", mode: "red" as const },
    { name: "Green Theme", mode: "green" as const },
    { name: "Purple Theme", mode: "purple" as const },
    { name: "Gold", mode: "gold" as const },
    { name: "Silver", mode: "silver" as const },
    { name: "Neon", mode: "neon" as const },
    { name: "Fire", mode: "fire" as const },
    { name: "Ocean", mode: "ocean" as const },
    { name: "Animated Gold", mode: "animated-gold" as const },
    { name: "Animated Silver", mode: "animated-silver" as const },
    { name: "Animated Neon", mode: "animated-neon" as const },
    { name: "Animated Fire", mode: "animated-fire" as const },
    { name: "Animated Ocean", mode: "animated-ocean" as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/5 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Logo Color Options
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {colorModes.map(({ name, mode }) => (
            <Card key={mode} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-center">{name}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center py-4">
                <Logo className="w-16 h-16" colorMode={mode} />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Usage Example</h2>
          <div className="bg-muted p-4 rounded-md">
            <code className="text-sm">
              {`<Logo colorMode="rainbow" className="w-10 h-10" />`}
            </code>
          </div>
          <p className="mt-2 text-muted-foreground">
            Available color modes: gradient, rainbow, blue, red, green, purple, gold, silver, neon, fire, ocean, animated-gold, animated-silver, animated-neon, animated-fire, animated-ocean
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoColorDemo;