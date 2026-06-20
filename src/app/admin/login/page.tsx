"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Temporary mock login for development
    if (password === "admin123") {
      document.cookie = "admin_session=true; path=/; max-age=86400";
      router.push("/admin");
    } else {
      setError("Contraseña incorrecta");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-background to-gold/5 z-0" />
      
      <div className="w-full max-w-md p-8 glass rounded-3xl premium-shadow-dark z-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-gold to-red-600" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Image 
              src="/logo.png" 
              alt="El Vasco Shop" 
              width={160} 
              height={80} 
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Acceso Administrativo</h1>
          <p className="text-foreground/50 text-sm mt-2">Área restringida. Ingrese su contraseña.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm flex items-center mt-1">
                <ShieldAlert className="w-4 h-4 mr-1" /> {error}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl text-md font-bold bg-gold text-black hover:bg-gold-dark"
            disabled={isLoading}
          >
            {isLoading ? "Verificando..." : "Iniciar Sesión"}
          </Button>
        </form>
      </div>
    </div>
  );
}
